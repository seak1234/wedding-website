export const rsvpState = {
    step: 1,
    submitted: false,
    formData: {
        fullName: '',
        email: '',
        attendingWedding: '',
        attendingParty: '',
        weddingGuestsCount: 1,
        partyGuestsCount: 1,
        weddingGuestNames: [''], 
        partyGuestNames: [''],   
        dietaryNotes: '',
        message: ''
    }
};

export function setStep(newStep) {
    rsvpState.step = newStep;
}

export function setSubmitted(status) {
    rsvpState.submitted = status;
}
