// src/services/whatsapp.service.ts
import axios from 'axios';
import { MessageParser } from '../utils/messageParser';
import { PaymentService } from './payment.service';
import { SoloRegistrationResponse } from '../types/types';

const WHATSAPP_API_BASE_URL = process.env.WHATSAPP_API_BASE_URL;
const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN;

export class WhatsAppService {
    /**
     * Send a WhatsApp message using the WhatsApp Cloud API.
     */
    static async sendMessage(to: string, body: string) {
        try {
            const response = await axios.post(
                `${WHATSAPP_API_BASE_URL}`,
                {
                    messaging_product: 'whatsapp',
                    to,
                    text: {
                        body
                    }
                },
                {
                    headers: {
                        Authorization: `Bearer ${WHATSAPP_API_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error sending WhatsApp message:', error.response?.data || error.message);
            } else {
                console.error('Unexpected error sending WhatsApp message:', error);
            }
            throw error;
        }
    }

    /**
     * Format registration response message.
     */
    static formatRegistrationResponse(response: SoloRegistrationResponse): string {
        const { data,  gender } = response;

        const payment_url = new URL('https://www.msudcacyberia.in/chatbot');
        // Add query parameters
        payment_url.searchParams.append('fullName', data.fullName);
        payment_url.searchParams.append('email', data.email);
        payment_url.searchParams.append('contactNo', data.contactNo.toString());
        payment_url.searchParams.append('contactNo2', data.contactNo2.toString());
        payment_url.searchParams.append('institute', data.institute);
        payment_url.searchParams.append('year', data.year);
        payment_url.searchParams.append('level', data.level);
        payment_url.searchParams.append('age', data.age);
        payment_url.searchParams.append('gender', gender);
        payment_url.searchParams.append('stream', data.stream);
        payment_url.searchParams.append('events', data.events);

        // Return formatted message
        return `🎉 Registration Successful!
        To continue with the payment, click here: ${payment_url}
        
        After the payment, you will receive your ticket URL.`;
    }

    static async handleMessage(body: string, from: string) {
        try {
            // Handle initial greeting
            if (body.toLowerCase() === 'hi') {
                const response = `Welcome! Please choose your registration type:

Solo Registration: https://whatsform.com/g0Zd92
Team Registration: https://whatsform.com/aplTii`;

                await this.sendMessage(from, response);
                return;
            }

            // Handle solo form submission
            const soloData = MessageParser.parseSoloForm(body);
            if (soloData) {
                try {
                    console.log('Solo data:', soloData);
                    const registrationResponse = await PaymentService.processSoloPayment(soloData);
                    const formattedResponse = this.formatRegistrationResponse(registrationResponse);
                    await this.sendMessage(from, formattedResponse);
                } catch (error) {
                    await this.sendMessage(
                        from,
                        'Sorry, there was an error processing your registration. Please try again or contact support.'
                    );
                }
                return;
            }

            // Handle team form submission
            const teamData = MessageParser.parseTeamForm(body);
            if (teamData) {
                try {
                    await PaymentService.processTeamPayment(teamData);
                    await this.sendMessage(
                        from,
                        'Thank you for your team registration! Your payment is being processed.'
                    );
                } catch (error) {
                    await this.sendMessage(from, 'There was an error with your team registration.');
                }
                return;
            }

            // Handle unrecognized messages
            console.log('Unrecognized message format:', body);
            await this.sendMessage(
                from,
                'Sorry, I could not process your message. Please make sure you are using the correct form.'
            );
        } catch (error) {
            console.error('Error handling message:', error);
            throw error;
        }
    }
}