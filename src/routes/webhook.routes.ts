// src/routes/webhook.routes.ts
import { Router } from 'express';
import { WhatsAppService } from '../services/whatsapp.service';

const router = Router();

router.post('/webhook/twilio', async (req, res) => {
    try {
        const { Body, From } = req.body;
        if (!Body || !From) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        await WhatsAppService.handleMessage(
            Body,
            From.replace('whatsapp:', '')
        );
        
        res.status(200).send('OK');
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;