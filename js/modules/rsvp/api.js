import { rsvpState } from './state.js';

export async function submitRSVP(formData, recaptchaResponse) {
    try {
        const isDev = window.location.hostname.includes('dev') || window.location.port === '8080' || window.location.hostname === '5.252.55.202';
        const submissionData = {
            'form-name': 'rsvp',
            'g-recaptcha-response': recaptchaResponse,
            'full_name': formData.fullName,
            'email': formData.email,
            'attending_wedding': formData.attendingWedding,
            'wedding_guest_count': formData.attendingWedding === 'yes' ? formData.weddingGuestsCount : 0,
            'wedding_guest_names': formData.attendingWedding === 'yes' ? formData.weddingGuestNames.filter(n => n && n.trim() !== '').join(', ') : '',
            'attending_party': formData.attendingParty,
            'party_guest_count': formData.attendingParty === 'yes' ? formData.partyGuestsCount : 0,
            'party_guest_names': formData.attendingParty === 'yes' ? formData.partyGuestNames.filter(n => n && n.trim() !== '').join(', ') : '',
            'dietary_notes': formData.dietaryNotes,
            'message': formData.message,
            'submission_date': formData.submissionDate
        };

        const body = Object.keys(submissionData)
            .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(submissionData[key]))
            .join('&');

        // Post to /rsvp (form-handler) for both dev and prod. Form-handler verifies reCAPTCHA and forwards to Make.com.
        const endpoint = '/rsvp';
        const response = await fetch(endpoint, {
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

