import axios from "axios";
import { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { create } from "node:domain";
import { config } from "../config/config";
// import { SoloFormData, SoloRegistrationResponse, TeamFormData } from '../types/types';

// export class PaymentService {
//     private static readonly SOLO_API_URL = 'https://cyberia-node-server.vercel.app/api/user/registerSoloUser';
//     private static readonly TEAM_API_URL = 'https://cyberia-node-server.vercel.app/api/user/registerTeamUser';

//     static async processSoloPayment(data: SoloFormData): Promise<SoloRegistrationResponse> {
//         try {
//             const response = await axios.post(this.SOLO_API_URL, {
//                 fullName: data.fullName,
//                 stream: data.stream,
//                 email: data.email,
//                 contactNo: data.contactNo.replace(/\D/g, ''),  // Remove non-digits
//                 contactNo2: data.contactNo2.replace(/\D/g, ''), // Remove non-digits
//                 institute: data.institute,
//                 year: data.year,
//                 level: data.level,
//                 events: data.events.join(', '), // Convert array to comma-separated string
//                 age: data.age
//             });

//             return {data: response.data, events: data.events.join(', '), gender:data.gender, message: response.data.message};
//         } catch (error) {
//             console.error('Error processing solo payment:', error);
//             throw error;
//         }
//     }

//     static async processTeamPayment(data: TeamFormData) {
//         try {
//             const response = await axios.post(this.TEAM_API_URL, data, {
//                 headers: { 'Content-Type': 'application/json' }
//             });
//             return response.data;
//         } catch (error) {
//             console.error('Error processing team payment:', error);
//             throw error;
//         }
//     }
// }
export async function createPaymentLink(customerDetails: any, amount: number) {
  //   console.log("====================================");
  //   console.log(customerDetails);
  //   console.log("====================================");

  const uniqueLink = randomUUID();
  const options = {
    method: "POST",
    headers: {
      "x-client-id": `${config.cashfreeClientId}`,
      "x-client-secret": `${config.cashfreeClientSecret}`,
      "x-api-version": "2023-08-01",
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      customer_details: customerDetails,
      link_amount: amount,
      link_currency: "INR",
      link_id: uniqueLink,
      link_purpose: "Payment for tech fest",
      link_notify: {
        send_email: true,
        send_sms: true,
      },
      link_meta: {
        notify_url:
          "https://b4d7-2409-40c1-5009-9b43-99ee-1992-5e21-582c.ngrok-free.app/api/webhook/cashfree",
      },
    }),
  };

  const response = await fetch(
    "https://sandbox.cashfree.com/pg/links",
    options
  );
  const data = await response.json();

  console.log(data);
  if (!response.ok) {
    console.log(response);
    throw new Error(
      `Failed to create payment link: ${data.message || "Unknown error"}`
    );
  }

  return data.link_url; // Assuming the API returns a `payment_link` in the response
}
