// src/utils/messageParser.ts
import { SoloFormData, TeamFormData, TeamMember } from '../types/types';

export class MessageParser {
    private static removeAsterisks(text: string): string {
        return text.replace(/\*/g, '');
    }

    static parseSoloForm(message: string): SoloFormData | null {
        try {
            // Remove asterisks from the entire message first
            const cleanMessage = this.removeAsterisks(message);
            
            // Check if message contains required identifiers
            if (!cleanMessage.includes('Registration Template') || 
                !cleanMessage.includes('Solo Registration') ||
                !cleanMessage.includes('Your Details')) {
                return null;
            }

            console.log('Starting to parse solo form...');
            const lines = cleanMessage.split('\n');
            const data: SoloFormData = {
                fullName: '',
                email: '',
                contactNo: '',
                contactNo2: '',
                institute: '',
                year: '',
                level: '',
                age: '',
                gender: '',
                stream: '',
                price: '100',  // Default price
                events: []     // Initialize empty array
            };

            for (const line of lines) {
                // Skip lines without ":"
                if (!line.includes(':')) continue;

                const [key, value] = line.split(':').map(str => str.trim());
                if (!key || !value) continue;

                console.log(`Processing line - Key: "${key}", Value: "${value}"`);

                switch (key) {
                    case 'Full name': data.fullName = value; break;
                    case 'Email address': data.email = value; break;
                    case 'Contact Info': data.contactNo = value; break;
                    case 'Contact Info 2': data.contactNo2 = value; break;
                    case 'Institute Name': data.institute = value; break;
                    case 'Standard': data.year = value; break;
                    case 'Level': data.level = value; break;
                    case 'Age': data.age = value; break;
                    case 'Gender': data.gender = value; break;
                    case 'Stream': data.stream = value; break;
                    case 'Choose Events': 
                        data.events = value.split(',').map(event => event.trim());
                        break;
                }
            }

            console.log('Parsed data:', data);

            // Check if all fields have values
            const hasAllFields = Object.entries(data).every(([key, value]) => {
                if (Array.isArray(value)) {
                    return value.length > 0;
                }
                return value !== '';
            });

            if (!hasAllFields) {
                console.log('Missing required fields:', 
                    Object.entries(data)
                        .filter(([key, value]) => 
                            Array.isArray(value) ? value.length === 0 : value === ''
                        )
                        .map(([key]) => key)
                );
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error parsing solo form:', error);
            return null;
        }
    }

    static parseTeamForm(message: string): TeamFormData | null {
        try {
            if (!message.includes('Team Form')) {
                return null;
            }

            const lines = message.split('\n');
            const data: Partial<TeamFormData> = {
                member: []
            };

            let currentMember: Partial<TeamMember> | null = null;

            for (const line of lines) {
                const [key, value] = line.split(':').map(str => str.trim());
                if (!key || !value) continue;

                if (key === 'Member Name') {
                    if (currentMember?.name && currentMember?.role) {
                        data.member?.push(currentMember as TeamMember);
                    }
                    currentMember = { name: value };
                } else if (key === 'Member Role' && currentMember) {
                    currentMember.role = value;
                    data.member?.push(currentMember as TeamMember);
                    currentMember = null;
                } else {
                    switch (key) {
                        case 'Team Name': data.teamName = value; break;
                        case 'Leader Name': 
                            data.fullName = value;
                            data.teamLeader = value;
                            break;
                        case 'Email': data.email = value; break;
                        case 'Contact Number': data.contactNo = value; break;
                        case 'Alternate Contact': data.contactNo2 = value; break;
                        case 'Institute': data.institute = value; break;
                        case 'Year': data.year = value; break;
                        case 'Level': data.level = value; break;
                        case 'Members Count': data.members = parseInt(value); break;
                        case 'Gender': data.gender = value; break;
                        case 'Age': data.age = value; break;
                        case 'Domain': data.domain = value; break;
                        case 'Stream': data.stream = value; break;
                        case 'Event': data.events = value; break;
                    }
                }
            }

            // Validate all required fields are present
            const requiredFields: (keyof TeamFormData)[] = [
                'fullName', 'teamName', 'email', 'contactNo', 'institute',
                'year', 'level', 'teamLeader', 'members', 'gender', 'age',
                'domain', 'stream', 'events'
            ];

            if (requiredFields.every(field => data[field]) && data.member?.length) {
                return data as TeamFormData;
            }

            return null;
        } catch (error) {
            console.error('Error parsing team form:', error);
            return null;
        }
    }
}