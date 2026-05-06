import { rsvpState, setStep, setSubmitted } from './state.js';
import { updateView, renderGuestInputs, showRSVPError } from './ui.js';
import { submitRSVP } from './api.js';

let recaptchaWidgetId = null;

/**
 * Initializes the invisible Google reCAPTCHA v2 widget on the page.
 * Hooks up success, expired, and error callbacks to handle the reCAPTCHA lifecycle.
 */
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

/**
 * Callback triggered upon successful reCAPTCHA verification.
 * 
 * @param {string} token - The generated reCAPTCHA token.
 */
function onRecaptchaSuccess(token) {
    // Token is automatically handled, but we can store it if needed
    console.log('reCAPTCHA verified');
}

/**
 * Callback triggered if the reCAPTCHA verification expires.
 */
function onRecaptchaExpired() {
    console.warn('reCAPTCHA token expired');
}

/**
 * Callback triggered if the reCAPTCHA verification encounters an error.
 * 
 * @param {Error} error - The reCAPTCHA error details.
 */
function onRecaptchaError(error) {
    console.error('reCAPTCHA error:', error);
}

/**
 * Retrieves the reCAPTCHA verification token.
 * If an invisible widget is initialized, it will execute the check to get a fresh token.
 * Falls back to obtaining a previously generated response if available.
 * 
 * @returns {Promise<string>} A promise resolving to the reCAPTCHA token string.
 */
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

/**
 * Main entry point to initialize all event listeners for the RSVP form interactions.
 * Binds inputs, attendance toggles, counters, and navigation components.
 */
export function initRSVPEvents() {
    const rsvpForm = document.getElementById('rsvpForm');
    if (!rsvpForm) return;

    setupInputHandlers();
    setupAttendanceHandlers();
    setupCounterHandlers();
    setupNavigationHandlers(rsvpForm);
    setupSubmitHandler(rsvpForm);
}

/**
 * Polls an input element to detect browser autofill changes.
 * Some browsers do not fire 'input' or 'change' events when autofilling.
 * 
 * @param {HTMLElement} inputElement - The input DOM element to poll.
 * @param {Function} stateValueGetter - Function returning the current state value for comparison.
 * @param {Function} changeHandler - Function to invoke when a change is detected.
 */
function setupAutofillPolling(inputElement, stateValueGetter, changeHandler) {
    if (!inputElement) return;

    if (inputElement.value) {
        changeHandler(inputElement.value);
    }
    
    const checkAutoFill = setInterval(() => {
        if (inputElement.value && stateValueGetter() !== inputElement.value) {
            changeHandler(inputElement.value);
            clearInterval(checkAutoFill);
        }
    }, 200);

    setTimeout(() => clearInterval(checkAutoFill), 5000);
}

/**
 * Sets up event listeners for standard text inputs (name, email, dietary notes, messages).
 * Synchronizes input changes with the central rsvpState.
 */
function setupInputHandlers() {
    const inputName = document.getElementById('rsvpFullName');
    const inputEmail = document.getElementById('rsvpEmail');
    const dietaryNotes = document.getElementById('rsvpDietary');
    const messageTxt = document.getElementById('rsvpMessageTxt');

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
        setupAutofillPolling(inputName, () => rsvpState.formData.fullName, handleNameChange);
    }

    if (inputEmail) {
        const handleEmailChange = (val) => {
            rsvpState.formData.email = val;
            updateView();
        };

        inputEmail.addEventListener('input', (e) => handleEmailChange(e.target.value));
        inputEmail.addEventListener('change', (e) => handleEmailChange(e.target.value));
        setupAutofillPolling(inputEmail, () => rsvpState.formData.email, handleEmailChange);
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
}

/**
 * Sets up click listeners for the attendance toggle buttons (e.g., 'yes'/'no' for wedding and party).
 */
function setupAttendanceHandlers() {
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
}

/**
 * Sets up click listeners for the guest counter increment/decrement buttons (+ / -).
 * Adjusts the guest count in state and triggers a re-render of guest inputs.
 */
function setupCounterHandlers() {
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
}

/**
 * Sets up click listeners for the previous and next step navigation buttons.
 * Enforces form validation before moving from step 1 to step 2.
 * 
 * @param {HTMLFormElement} rsvpForm - The main form element reference.
 */
function setupNavigationHandlers(rsvpForm) {
    const btnNext1 = document.getElementById('btnNext1');
    const btnNext2 = document.getElementById('btnNext2');
    const btnPrev2 = document.getElementById('btnPrev2');
    const btnPrev3 = document.getElementById('btnPrev3');

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
}

/**
 * Attaches the main submit event listener to the RSVP form.
 * Orchestrates final validation, token retrieval, submission status changes, and network API calls.
 * 
 * @param {HTMLFormElement} rsvpForm - The main form element reference.
 */
function setupSubmitHandler(rsvpForm) {
    rsvpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Only allow submission on the final step (Step 3)
        if (rsvpState.step < 3) {
            const btnNext1 = document.getElementById('btnNext1');
            const btnNext2 = document.getElementById('btnNext2');
            if (rsvpState.step === 1 && btnNext1 && !btnNext1.disabled) {
                setStep(2);
                updateView();
            } else if (rsvpState.step === 2 && btnNext2 && !btnNext2.disabled) {
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

        // Get reCAPTCHA token (async for invisible widget)
        let recaptchaResponse = '';
        if (typeof grecaptcha !== 'undefined' && recaptchaWidgetId !== null) {
            recaptchaResponse = await getRecaptchaToken();
        } else if (typeof grecaptcha !== 'undefined') {
            // Fallback for non-invisible or Netlify case
            recaptchaResponse = grecaptcha.getResponse() || '';
        }

        if (!recaptchaResponse) {
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
