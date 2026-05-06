import { rsvpState, setStep, setSubmitted } from './state.js';
import { updateView, renderGuestInputs, showRSVPError } from './ui.js';
import { submitRSVP } from './api.js';

let recaptchaWidgetId = null;

function initRecaptcha() {
    const container = document.getElementById('recaptcha-container');
    if (!container || typeof grecaptcha === 'undefined') return;
    
    const sitekey = '6Lf9RdwsAAAAAOCULFTRqu0u87F3jNzl_EgP8qED'; // Hardcoded for dev environment
    if (!sitekey) return;
    
    // Render reCAPTCHA v2 invisible widget
    recaptchaWidgetId = grecaptcha.render(container, {
        sitekey: sitekey,
        size: 'invisible',
        badge: 'inline', // inline badge so it doesn't overlay other elements
        callback: onRecaptchaSuccess,
        'expired-callback': onRecaptchaExpired,
        'error-callback': onRecaptchaError
    });
}

function onRecaptchaSuccess(token) {
    // Token is automatically handled, but we can store it if needed
    console.log('reCAPTCHA verified');
}

function onRecaptchaExpired() {
    console.warn('reCAPTCHA token expired');
}

function onRecaptchaError(error) {
    console.error('reCAPTCHA error:', error);
}

function getRecaptchaToken() {
    return new Promise((resolve) => {
        if (typeof grecaptcha === 'undefined') {
            resolve('');
            return;
        }
        
        // If we have a rendered widget, execute it to get a fresh token
        if (recaptchaWidgetId !== null) {
            grecaptcha.execute(recaptchaWidgetId, { action: 'rsvp' }).then(resolve).catch((err) => {
                console.warn('reCAPTCHA execute failed, trying getResponse:', err);
                // Fallback to getResponse for non-invisible or already-verified tokens
                resolve(grecaptcha.getResponse(recaptchaWidgetId) || '');
            });
        } else {
            // Fallback: try to get any available response
            resolve(grecaptcha.getResponse() || '');
        }
    });
}

// Initialize reCAPTCHA when the script loads
window.recaptchaOnLoad = function() {
    initRecaptcha();
};

// Also expose initRecaptcha globally for external callers (like the inline onload)
window.initRecaptchaGlobal = initRecaptcha;

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
        const handleNameChange = (val) => {
            const oldName = rsvpState.formData.fullName;
            const newName = val;
            rsvpState.formData.fullName = newName;
            
            if (rsvpState.formData.weddingGuestNames[0] === oldName || !rsvpState.formData.weddingGuestNames[0]) {
                rsvpState.formData.weddingGuestNames[0] = newName;
            }
            if (rsvpState.formData.partyGuestNames[0] === oldName || !rsvpState.formData.partyGuestNames[0]) {
                rsvpState.formData.partyGuestNames[0] = newName;
            }
            updateView();
        };

        inputName.addEventListener('input', (e) => handleNameChange(e.target.value));
        inputName.addEventListener('change', (e) => handleNameChange(e.target.value));
        
        // Handle browser autofill/restoration on reload
        if (inputName.value) {
            handleNameChange(inputName.value);
        }
    }

    if (inputEmail) {
        const handleEmailChange = (val) => {
            rsvpState.formData.email = val;
            updateView();
        };

        inputEmail.addEventListener('input', (e) => handleEmailChange(e.target.value));
        inputEmail.addEventListener('change', (e) => handleEmailChange(e.target.value));

        if (inputEmail.value) {
            handleEmailChange(inputEmail.value);
        }
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

            const isDev = window.location.hostname.includes('dev') || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '5.252.55.202' || window.location.port === '3000' || window.location.port === '8080';

            // Get reCAPTCHA token (async for invisible widget)
            let recaptchaResponse = '';
            if (isDev && typeof grecaptcha !== 'undefined' && recaptchaWidgetId !== null) {
                recaptchaResponse = await getRecaptchaToken();
            } else if (typeof grecaptcha !== 'undefined') {
                // Fallback for non-invisible or Netlify case
                recaptchaResponse = grecaptcha.getResponse() || '';
            }

            if (!recaptchaResponse && !isDev) {
                showRSVPError('Please complete the security verification (CAPTCHA).');
                btnSubmit.innerHTML = origHtml;
                btnSubmit.disabled = false;
                return;
            }

            // Add submission date and time
            rsvpState.formData.submissionDate = new Date().toISOString();

            const result = await submitRSVP(rsvpState.formData, recaptchaResponse);

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
