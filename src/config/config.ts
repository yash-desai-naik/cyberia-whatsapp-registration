import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: process.env.PORT || 8000,
    whatsappApiUrl: process.env.WHATSAPP_API_BASE_URL,
    whatsappApiToken: process.env.WHATSAPP_API_TOKEN,
};