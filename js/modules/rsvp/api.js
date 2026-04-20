import { rsvpState } from './state.js';

export async function submitRSVP(formData) {
    try {
        // Prepare data for Netlify Form submission
        // Flatten guest name arrays into comma-separated strings for the backend
        const submissionData = {
            'form-name': 'rsvp',
            'full_name': formData.fullName,
            'email': formData.email,
            'attending_wedding': formData.attendingWedding,
            'wedding_guest_count': formData.weddingGuestsCount,
            'wedding_guest_names': formData.weddingGuestNames.filter(n => n.trim() !== '').join(', '),
            'attending_party': formData.attendingParty,
            'party_guest_count': formData.partyGuestsCount,
            'party_guest_names': formData.partyGuestNames.filter(n => n.trim() !== '').join(', '),
            'dietary_notes': formData.dietaryNotes,
            'message': formData.message
        };

        const body = Object.keys(submissionData)
            .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(submissionData[key]))
            .join('&');

        const response = await fetch('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body
        });

        if (response.ok) {
            console.log('RSVP Successfully submitted to Netlify');
            return { success: true };
        } else {
            console.error('RSVP submission failed:', response.statusText);
            throw new Error('Submission failed');
        }
    } catch (error) {
        console.error('Error submitting RSVP:', error);
        return { success: false, error: error.message };
    }
}

