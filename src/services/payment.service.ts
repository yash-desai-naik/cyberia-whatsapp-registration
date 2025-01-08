import axios from 'axios';
import { SoloFormData, SoloRegistrationResponse, TeamFormData } from '../types/types';

export class PaymentService {
    private static readonly SOLO_API_URL = 'https://cyberia-node-server.vercel.app/api/user/registerSoloUser';
    private static readonly TEAM_API_URL = 'https://cyberia-node-server.vercel.app/api/user/registerTeamUser';

    static async processSoloPayment(data: SoloFormData): Promise<SoloRegistrationResponse> {
        try {
            const response = await axios.post(this.SOLO_API_URL, {
                fullName: data.fullName,
                stream: data.stream,
                email: data.email,
                contactNo: data.contactNo.replace(/\D/g, ''),  // Remove non-digits
                contactNo2: data.contactNo2.replace(/\D/g, ''), // Remove non-digits
                institute: data.institute,
                year: data.year,
                level: data.level,
                events: data.events.join(', '), // Convert array to comma-separated string
                age: data.age
            });

            return {data: response.data, events: data.events.join(', '), gender:data.gender, message: response.data.message};
        } catch (error) {
            console.error('Error processing solo payment:', error);
            throw error;
        }
    }

    static async processTeamPayment(data: TeamFormData) {
        try {
            const response = await axios.post(this.TEAM_API_URL, data, {
                headers: { 'Content-Type': 'application/json' }
            });
            return response.data;
        } catch (error) {
            console.error('Error processing team payment:', error);
            throw error;
        }
    }
}