import { rsvpState, setStep, setSubmitted } from './state.js';
import { updateView, renderGuestInputs, showRSVPError } from './ui.js';
import { submitRSVP } from './api.js';

export function initRSVPEvents() {
    const inputName = document.getElementById('rsvpFullName');
    const inputEmail = document.getElementById('rsvpEmail');
    const btnNext1 = document.getElementById('btnNext1');
    const btnNext2 = document.getElementById('btnNext2');
    const btnPrev2 = document.getElementById('btnPrev2');
    const btnPrev3 = document.getElementById('btnPrev3');
    const btnEditResponse = document.getElementById('btnEditResponse');
    const rsvpForm = document.getElementById('rsvpForm');
    const dietaryNotes = document.getElementById('rsvpDietary');
    const messageTxt = document.getElementById('rsvpMessageTxt');
    
    if (!rsvpForm) return;

    if (inputName) {
        inputName.addEventListener('input', (e) => {
            const oldName = rsvpState.formData.fullName;
            const newName = e.target.value;
            rsvpState.formData.fullName = newName;
            
            if (rsvpState.formData.weddingGuestNames[0] === oldName || !rsvpState.formData.weddingGuestNames[0]) {
                rsvpState.formData.weddingGuestNames[0] = newName;
            }
            if (rsvpState.formData.partyGuestNames[0] === oldName || !rsvpState.formData.partyGuestNames[0]) {
                rsvpState.formData.partyGuestNames[0] = newName;
            }
            updateView();
        });
    }

    if (inputEmail) {
        inputEmail.addEventListener('input', (e) => {
            rsvpState.formData.email = e.target.value;
            updateView();
        });
    }

    if (dietaryNotes) {
        dietaryNotes.addEventListener('input', (e) => {
            rsvpState.formData.dietaryNotes = e.target.value;
        });
    }

    if (messageTxt) {
        messageTxt.addEventListener('input', (e) => {
            rsvpState.formData.message = e.target.value;
        });
    }

    document.querySelectorAll('.attendance-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.getAttribute('data-type');
            const val = btn.getAttribute('data-val');
            
            if (type === 'wedding') rsvpState.formData.attendingWedding = val;
            if (type === 'party') rsvpState.formData.attendingParty = val;
            
            document.querySelectorAll(`.attendance-btn[data-type="${type}"]`).forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            updateView();
        });
    });

    document.querySelectorAll('.counter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            const action = btn.getAttribute('data-action');
            
            const countField = target === 'wedding' ? 'weddingGuestsCount' : 'partyGuestsCount';
            const namesField = target === 'wedding' ? 'weddingGuestNames' : 'partyGuestNames';
            
            let currentCount = rsvpState.formData[countField];
            const maxGuests = 10;
            let newCount = action === 'plus' ? Math.min(maxGuests, currentCount + 1) : Math.max(1, currentCount - 1);
            
            rsvpState.formData[countField] = newCount;
            
            if (newCount > currentCount) {
                rsvpState.formData[namesField].push('');
            } else if (newCount < currentCount) {
                rsvpState.formData[namesField].pop();
            }

            renderGuestInputs(target);
        });
    });

    if (btnNext1) btnNext1.addEventListener('click', () => {
        if (rsvpForm.checkValidity()) {
            setStep(2);
            updateView();
        } else {
            rsvpForm.reportValidity();
        }
    });
    if (btnNext2) btnNext2.addEventListener('click', () => { setStep(3); updateView(); });
    if (btnPrev2) btnPrev2.addEventListener('click', () => { setStep(1); updateView(); });
    if (btnPrev3) btnPrev3.addEventListener('click', () => { setStep(2); updateView(); });

    if (rsvpForm) {
        rsvpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Only allow submission on the final step (Step 3)
            if (rsvpState.step < 3) {
                if (rsvpState.step === 1 && !btnNext1.disabled) {
                    setStep(2);
                    updateView();
                } else if (rsvpState.step === 2 && !btnNext2.disabled) {
                    setStep(3);
                    updateView();
                }
                return;
            }

            const btnSubmit = document.getElementById('btnSubmit');
            const errorMsg = document.getElementById('rsvpErrorMsg');
            if (errorMsg) errorMsg.classList.add('hidden'); // Hide previous errors

            const origHtml = btnSubmit.innerHTML;
            btnSubmit.innerHTML = 'Sending...';
            btnSubmit.disabled = true;

            const recaptchaResponse = document.querySelector('[name="g-recaptcha-response"]')?.value;
            if (!recaptchaResponse) {
                showRSVPError('Please complete the reCAPTCHA verification.');
                btnSubmit.innerHTML = origHtml;
                btnSubmit.disabled = false;
                return;
            }

            const result = await submitRSVP(rsvpState.formData);

            if (result.success) {
                setSubmitted(true);
                updateView();
            } else {
                showRSVPError('Something went wrong. Please try again or contact us directly.');
            }
            
            btnSubmit.innerHTML = origHtml;
            btnSubmit.disabled = false;
        });
    }
}
