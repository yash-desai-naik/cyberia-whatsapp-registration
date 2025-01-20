// src/routes/webhook.routes.ts
import {Router} from "express";
import {WhatsAppService} from "../services/whatsapp.service";
import {CashfreeService} from "../services/cashfree.service";


const router = Router();

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
