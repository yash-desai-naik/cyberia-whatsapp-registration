// src/routes/webhook.routes.ts
import { Router } from "express";
import { WhatsAppService } from "../services/whatsapp.service";
const bodyParser = require("body-parser");
const twilio = require("twilio");

const router = Router();

import crypto from "crypto";
import { config } from "../config/config";

export class CashfreeService {
  static async handlePaymentSuccess(data: any) {
    console.log("Handling PAYMENT_SUCCESS:", data);
    const to = data.customer_details.customer_phone; // WhatsApp number in format 'whatsapp:+1234567890'

    const messageBody = `
🎉 Congratulations! Your registration for Cyberia Tech Fest 2025 is confirmed! 🎉

📌 Here are your ticket details:
Event: Cyberia Tech Fest 2025
Dates: 27th, 28th February & 1st March
Venue: Maharaja Sayajirao University of Baroda

✅ Keep this ticket safe and present it at the event for entry.
If you have any questions or need further assistance, feel free to message here.

🚀 Get ready for an amazing tech experience—see you at Cyberia Tech Fest 2025! 🙌
`;

    // Update your database to mark payment as successful
    // Example: Save transaction ID and order status
    // const { orderId, transactionId, paymentMode } = data;
    // await OrderService.updatePaymentStatus(orderId, 'SUCCESS', transactionId, paymentMode);

    return true;
  }

  static async handlePaymentFailure(data: any) {
    console.log("Handling PAYMENT_FAILURE:", data);

    // Update your database to mark payment as failed
    // Example: Save error reason
    // const { orderId, errorMessage } = data;
    // await OrderService.updatePaymentStatus(orderId, 'FAILED', null, null, errorMessage);

    return true;
  }

  static async handleLinkCancelled(data: any) {
    console.log("Handling LINK_CANCELLED:", data);

    // Handle link cancellation, e.g., update your database
    // Example: const { linkId } = data;
    // await PaymentLinkService.markLinkAsCancelled(linkId);

    return true;
  }
  static verifyWebhookSignature(eventData: any, signature: string): boolean {
    const secretKey = `${config.cashfreeClientSecret}`; // Replace with your actual webhook secret key from Cashfree
    const payload = JSON.stringify(eventData);

    const computedSignature = crypto
      .createHmac("sha256", secretKey)
      .update(payload)
      .digest("base64");

    return computedSignature === signature;
  }
}

router.post("/webhook/twilio", async (req, res) => {
  try {
    const { Body, From } = req.body;
    if (!Body || !From) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    await WhatsAppService.handleMessage(Body, From.replace("whatsapp:", ""));

    res.status(200).send("OK");
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/webhook/cashfree", async (req, res) => {
  console.log("Cashfree webhook received");
  try {
    const signatureHeader = req.headers["x-webhook-signature"];

    console.log(signatureHeader);

    // Ensure the signature is a valid string
    const signature = Array.isArray(signatureHeader)
      ? signatureHeader[0] // Use the first string if it's an array
      : signatureHeader;

    if (!signature || typeof signature !== "string") {
      return res.status(400).json({ error: "Invalid signature format" });
    }

    const eventData = req.body;

    // Verify the webhook signature

    // console.log("SIG:", signature);
    // console.log("Event data:", eventData);
    const isValidSignature = CashfreeService.verifyWebhookSignature(
      eventData,
      signature
    );

    console.log(isValidSignature);

    if (isValidSignature) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    // Process the event
    const { event, data } = eventData;

    // console.log("Received event:", event);

    console.log("Received data:", data);
    switch (data.payment.payment_status) {
      case "SUCCESS":
        await CashfreeService.handlePaymentSuccess(data);
        break;
      case "FAILURE":
        await CashfreeService.handlePaymentFailure(data);
        break;
      case "LINK_CANCELLED":
        await CashfreeService.handleLinkCancelled(data);
        break;
      default:
        console.warn(`Unhandled event type: ${data}`);
    }

    res.status(200).send("Webhook received and processed");
  } catch (error) {
    console.error("Cashfree webhook error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
