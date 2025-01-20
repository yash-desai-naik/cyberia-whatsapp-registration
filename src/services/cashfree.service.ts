import {config} from "../config/config";
import crypto from "crypto";

import {WhatsAppService} from './whatsapp.service'

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

        // send whatsapp messae


        await WhatsAppService.sendMessage(to, messageBody);

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