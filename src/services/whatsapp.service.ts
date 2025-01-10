// src/services/whatsapp.service.ts
import twilio from 'twilio';
import { config } from '../config/config';
import { MessageParser } from '../utils/messageParser';
import { PaymentService } from './payment.service';
import { SoloRegistrationResponse } from '../types/types';

const client = twilio(config.twilioAccountSid, config.twilioAuthToken);

export class WhatsAppService {
    static async sendMessage(to: string, body: string) {
        try {
            const message = await client.messages.create({
                from: `whatsapp:${config.twilioPhoneNumber}`,
                to: `whatsapp:${to}`,
                body
            });
            return message;
        } catch (error) {
            console.error('Error sending WhatsApp message:', error);
            throw error;
        }
    }
    static formatRegistrationResponse(response: SoloRegistrationResponse): string {
        const { data, message, gender } = response;
        //         return `🎉 Registration Successful! 

        // Name: ${SoloData.fullName}
        // Events: ${SoloData.events}
        // Institute: ${SoloData.institute}

        // Your ticket has been generated. You can download it here:
        // ${SoloData.ticket}

        // QR Code ID: ${SoloData.qrString}
        // Please keep this QR code handy for the event.

        // See you at the event! 🚀`;




        const {
            fullName,
            stream,
            email,
            contactNo,
            contactNo2,
            institute,
            year,
            level,
            events,
            age,

        } = data;

        console.log('Data:', data);
        console.log('Events:', events);
        const payment_url = `https://www.msudcacyberia.in/chatbot?fullName=${
            fullName
        }&email=${email}&contactNo=${contactNo}&contactNo2=${contactNo2}&institute=${institute}&year=${year}&level=${level}&age=${age}&gender=${gender}&stream=${stream}&events=${events}`;

        // make url using query builder
        // const payment_url = new URL('https://www.msudcacyberia.in/chatbot');
        // payment_url.searchParams.append('fullName', fullName);
        // payment_url.searchParams.append('email', email);
        // payment_url.searchParams.append('contactNo', contactNo.toString());
        // payment_url.searchParams.append('contactNo2', contactNo2.toString());
        // payment_url.searchParams.append('institute', institute);
        // payment_url.searchParams.append('year', year);
        // payment_url.searchParams.append('level', level);
        // payment_url.searchParams.append('age', age);
        // payment_url.searchParams.append('stream', stream);
        // payment_url.searchParams.append('events', events);

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
                    // const registrationResponse = await PaymentService.processSoloPayment(soloData);
                    // const formattedResponse = this.formatRegistrationResponse(registrationResponse);
                    // await this.sendMessage(from, formattedResponse);
                    console.log('Solo data: ######', soloData);
                    const {
                        fullName,
                        stream,
                        email,
                        contactNo,
                        contactNo2,
                        institute,
                        year,
                        level,
                        events,
                        age,
                        gender,
                        price
                    } = soloData;
                    // const payment_url = `https://www.msudcacyberia.in/chatbot?fullName=${
                    //     fullName
                    // }&email=${email}&contactNo=${contactNo}&contactNo2=${contactNo2}&institute=${institute}&year=${year}&level=${level}&age=${age}&gender=${gender}&stream=${stream}&events=${events.join(',')}`;

                    const payment_url = new URL('https://www.msudcacyberia.in/chatbot');
                    payment_url.searchParams.append('fullName', fullName);
                    payment_url.searchParams.append('email', email);
                    payment_url.searchParams.append('contactNo', contactNo.toString());
                    payment_url.searchParams.append('contactNo2', contactNo2.toString());
                    payment_url.searchParams.append('institute', institute);
                    payment_url.searchParams.append('year', year);
                    payment_url.searchParams.append('level', level);
                    payment_url.searchParams.append('gender', gender);
                    payment_url.searchParams.append('age', age);
                    payment_url.searchParams.append('stream', stream);
                    payment_url.searchParams.append('events', events.join(','));

                //    const response  =  await fetch(payment_url);
                //      const data = await response.json();
                //         console.log('data:', data);
                    await this.sendMessage(from, `🎉 Registration Successful!
                    To download your ticket, click here: ${payment_url}`);

                } catch (error) {
                    await this.sendMessage(from,
                        "Sorry, there was an error processing your registration. Please try again or contact support."
                    );
                }
                return;
            }

            // Handle team form submission
            const teamData = MessageParser.parseTeamForm(body);
            if (teamData) {
                await PaymentService.processTeamPayment(teamData);
                await this.sendMessage(from,
                    'Thank you for your team registration! Your payment is being processed.'
                );
                return;
            }

            console.log('Unrecognized message format:', body);

            // Handle unrecognized messages
            if (!body.toLowerCase().endsWith('.pdf')) {
                await this.sendMessage(from,
                    'Sorry, I could not process your message. Please make sure you\'re using the correct form.'
                );
            }

        } catch (error) {
            console.error('Error handling message:', error);
            throw error;
        }
    }
}