import { Router } from 'express';
import { WhatsAppService } from '../services/whatsapp.service';
import {Request, Response} from "express";

const router = Router();

router.post('/webhook/whatsapp', async (req:Request, res:Response) => {
    try {
        const { text, from } = req.body;
        if (!text || !from) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        await WhatsAppService.handleMessage(text, from);

        return res.status(200).send('OK');
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;