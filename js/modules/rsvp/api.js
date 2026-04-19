import { rsvpState } from './state.js';

export async function submitRSVP(formData) {
    return new Promise((resolve) => {
        // Mock API call - Replace with actual fetch() later
        console.log('Sending RSVP Payload to server:', formData);
        
        setTimeout(() => {
            resolve({ success: true });
        }, 800);
    });
}
