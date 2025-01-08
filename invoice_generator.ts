// Required dependencies
import express from 'express';
import twilio from 'twilio';
import { twiml } from 'twilio';
const MessagingResponse = twiml.MessagingResponse;
import PDFDocument from 'pdfkit';
import crypto from 'crypto';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Twilio client
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const app = express();
app.use(express.urlencoded({ extended: true }));

// In-memory storage for temporary PDFs
const tempPDFs = new Map();

// Clean up PDFs older than 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, data] of tempPDFs.entries()) {
    if (now - data.timestamp > 5 * 60 * 1000) {
      tempPDFs.delete(id);
    }
  }
}, 60 * 1000);

// Serve temporary PDFs
app.get('/temp/:id', (req, res) => {
  const pdfData = tempPDFs.get(req.params.id);
  if (!pdfData) {
    return res.status(404).send('PDF not found');
  }
  res.type('application/pdf');
  res.send(pdfData.buffer);
});

// Mock purchase order data
const mockPurchaseOrders = [
  {
    id: "PO-2024-001",
    date: "2024-08-01",
    description: "Software Development Services - Sprint 1",
    amount: 25000,
    status: "pending"
  },
  {
    id: "PO-2024-002",
    date: "2024-08-15",
    description: "Software Development Services - Sprint 2",
    amount: 30000,
    status: "pending"
  }
];

// Function to generate PDF invoice in memory
async function generateInvoice(purchaseOrder:any) {
  return new Promise((resolve, reject) => {
    const chunks:any = [];
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });
    
    // Collect PDF data chunks
    doc.on('data', chunks.push.bind(chunks));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      resolve(pdfBuffer);
    });

    // Register fonts
    doc.registerFont('Bold', 'Helvetica-Bold');
    doc.registerFont('Regular', 'Helvetica');
    
    // Colors
    const colors = {
      primary: '#2563eb',    // Blue
      secondary: '#475569',  // Slate
      accent: '#e2e8f0',    // Light gray
      text: '#1e293b',      // Dark slate
      lightText: '#64748b'  // Medium slate
    };

    // Header section
    doc.rect(0, 0, doc.page.width, 150)
       .fill(colors.accent);

    doc.fontSize(28)
       .fillColor(colors.primary)
       .font('Bold')
       .text('INVOICE', 50, 50);

    // Company details (right aligned)
    const companyDetails = [
      'Your Company Name',
      '123 Business Street',
      'City, State 12345',
      'contact@company.com',
      '+1 (555) 123-4567'
    ];

    doc.fontSize(10)
       .fillColor(colors.secondary);

    companyDetails.forEach((line, i) => {
      doc.text(line, 400, 50 + (i * 15), { align: 'right' });
    });

    // Invoice details
    doc.fontSize(12)
       .fillColor(colors.text)
       .font('Bold')
       .text('BILL TO:', 50, 180);

    doc.fontSize(10)
       .font('Regular')
       .text('Hitachi Svarapps', 50, 200)
       .text('Client Address Line 1', 50, 215)
       .text('Client Address Line 2', 50, 230);

    // Invoice metadata
    const metaData = [
      { label: 'Invoice Number:', value: `INV-${purchaseOrder.id}` },
      { label: 'Invoice Date:', value: purchaseOrder.date },
      { label: 'Purchase Order:', value: purchaseOrder.id },
      { label: 'Due Date:', value: '30 days from invoice date' }
    ];

    metaData.forEach((item, i) => {
      doc.font('Bold')
         .text(item.label, 300, 200 + (i * 15), { width: 100 })
         .font('Regular')
         .text(item.value, 400, 200 + (i * 15), { align: 'right' });
    });

    // Services Table
    const startY = 300;
    const tableTop = startY + 40;
    
    // Table headers
    doc.font('Bold')
       .fontSize(10)
       .fillColor(colors.primary);

    // Draw table header background
    doc.rect(50, startY, 495, 30)
       .fill(colors.accent);

    // Header texts
    const headers = ['Description', 'Rate', 'Quantity', 'Amount'];
    const colWidths = [250, 80, 80, 85];
    let xPos = 60;

    headers.forEach((header, i) => {
      doc.text(header, xPos, startY + 10);
      xPos += colWidths[i];
    });

    // Table row
    doc.font('Regular')
       .fillColor(colors.text);

    // Add row data
    const rowData = [
      purchaseOrder.description,
      '$500/day',
      '50 days',
      `${purchaseOrder.amount.toLocaleString()}`
    ];

    xPos = 60;
    rowData.forEach((text, i) => {
      doc.text(text, xPos, tableTop, {
        width: colWidths[i] - 20
      });
      xPos += colWidths[i];
    });

    // Draw table lines
    doc.lineWidth(1)
       .strokeColor(colors.accent);

    // Horizontal lines
    doc.moveTo(50, startY)
       .lineTo(545, startY)
       .stroke();
    doc.moveTo(50, startY + 30)
       .lineTo(545, startY + 30)
       .stroke();
    doc.moveTo(50, tableTop + 30)
       .lineTo(545, tableTop + 30)
       .stroke();

    // Vertical lines
    let lineX = 50;
    for (let i = 0; i <= colWidths.length; i++) {
      doc.moveTo(lineX, startY)
         .lineTo(lineX, tableTop + 30)
         .stroke();
      lineX += colWidths[i] || 0;
    }

    // Total section
    const totalY = tableTop + 50;
    doc.font('Bold')
       .fontSize(12)
       .fillColor(colors.primary)
       .text('Total Amount:', 350, totalY)
       .text(`${purchaseOrder.amount.toLocaleString()}`, 450, totalY, { align: 'right' });

    // Footer
    const footerY = doc.page.height - 100;
    doc.fontSize(10)
       .fillColor(colors.lightText)
       .text('Payment Terms: Net 30', 50, footerY)
       .text('Please include invoice number on your payment', 50, footerY + 15)
       .text('Thank you for your business!', 50, footerY + 30);

    doc.end();
  });
}

app.post('/webhook', async (req, res) => {
  const twiml = new MessagingResponse();
  const incomingMsg = req.body.Body.toLowerCase();
  const from = req.body.From;
  
  if (incomingMsg.includes('generate') && incomingMsg.includes('invoice')) {
    twiml.message('Fetching the latest purchase orders...');
    
    // Send first message
    res.type('text/xml').send(twiml.toString());
    
    // Prepare PO details message
    const poDetailsMsg = `I've found the following pending purchase orders:\n\n` +
      mockPurchaseOrders.map(po => 
        `Purchase Order: ${po.id}\n` +
        `Date: ${po.date}\n` +
        `Description: ${po.description}\n` +
        `Amount: $${po.amount}\n`
      ).join('\n');
    
    // Send PO details
    await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
      to: from,
      body: poDetailsMsg
    });
    
    // Generate PDFs
    try {
      const pdfBuffers = await Promise.all(
        mockPurchaseOrders.map(po => generateInvoice(po))
      );
      
      // Create temporary URLs for PDFs
      const pdfUrls = pdfBuffers.map(buffer => {
        const id = crypto.randomBytes(16).toString('hex');
        tempPDFs.set(id, {
          buffer,
          timestamp: Date.now()
        });
        return `${req.protocol}://${req.get('host')}/temp/${id}`;
      });
      
      // Send message with PDFs
      await client.messages.create({
        from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
        to: from,
        body: 'Here are your generated invoices!',
        mediaUrl: pdfUrls
      });
      
    } catch (error) {
      console.error('Error generating invoices:', error);
      await client.messages.create({
        from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
        to: from,
        body: 'Sorry, there was an error generating the invoices.'
      });
    }
    
  } else {
    twiml.message('Hello! I can help you generate invoices. Just say something like "Generate an invoice for..."');
    res.type('text/xml').send(twiml.toString());
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});