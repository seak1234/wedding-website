/**
 * Global state object for the RSVP form.
 * Holds the current step, submission status, and all form data collected from the user inputs.
 */
export const rsvpState = {
    /** @type {number} The current step of the multi-step RSVP form (1, 2, or 3) */
    step: 1,
    
    /** @type {boolean} Indicates whether the RSVP has been successfully submitted to the server */
    submitted: false,
    
    /** 
     * Structured form data collected from the user across all steps.
     * @type {Object}
     */
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
        message: '',
        submissionDate: ''
    }
};

/**
 * Updates the current step of the RSVP form.
 * 
 * @param {number} newStep - The step number to navigate to (expected: 1, 2, or 3).
 */
export function setStep(newStep) {
    rsvpState.step = newStep;
}

/**
 * Updates the submission status of the RSVP form.
 * 
 * @param {boolean} status - True if successfully submitted, false otherwise.
 */
export function setSubmitted(status) {
    rsvpState.submitted = status;
}
