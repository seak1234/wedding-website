import { rsvpState } from './state.js';

let dom = {};

export function initUIElements() {
    dom = {
        steps: [
            document.getElementById('rsvpStep1'),
            document.getElementById('rsvpStep2'),
            document.getElementById('rsvpStep3'),
            document.getElementById('rsvpSuccess')
        ],
        progressBar: document.getElementById('rsvpProgressBar'),
        btnNext1: document.getElementById('btnNext1'),
        btnNext2: document.getElementById('btnNext2'),
        secWedding: document.getElementById('weddingGuestsSection'),
        secParty: document.getElementById('partyGuestsSection'),
        secNone: document.getElementById('noAttendanceSection'),
        containerWedding: document.getElementById('weddingGuestNamesContainer'),
        containerParty: document.getElementById('partyGuestNamesContainer'),
        lblCountWedding: document.getElementById('weddingGuestCount'),
        lblCountParty: document.getElementById('partyGuestCount'),
        errorMsg: document.getElementById('rsvpErrorMsg'),
        rsvpForm: document.getElementById('rsvpForm'),
        inputName: document.getElementById('rsvpFullName'),
        inputEmail: document.getElementById('rsvpEmail'),
    };
}

export function showRSVPError(message) {
    if (!dom.errorMsg) {
        // Create it if it doesn't exist
        const errorDiv = document.createElement('div');
        errorDiv.id = 'rsvpErrorMsg';
        errorDiv.className = 'rsvp-error-message hidden';
        const form = document.querySelector('.rsvp-form');
        form.insertBefore(errorDiv, form.firstChild);
        dom.errorMsg = errorDiv;
    }
    
    dom.errorMsg.innerText = message;
    dom.errorMsg.classList.remove('hidden');
    
    // Scroll to error
    dom.errorMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

export function updateView() {
    if (!dom.steps[0]) return; // form missing

    // Success State
    if (rsvpState.submitted) {
        dom.steps[0].classList.add('hidden');
        dom.steps[1].classList.add('hidden');
        dom.steps[2].classList.add('hidden');
        dom.steps[3].classList.remove('hidden');
        if (dom.progressBar) {
            dom.progressBar.parentElement.style.display = 'none';
        }
        updateSuccessMessage();
        return;
    } else {
        if (dom.progressBar) {
            dom.progressBar.parentElement.style.display = 'block';
        }
        dom.steps[3].classList.add('hidden');
    }

    // Progress Bar (out of 3 steps)
    if (dom.progressBar) {
        dom.progressBar.style.width = `${(rsvpState.step / 3) * 100}%`;
    }

    // Steps
    dom.steps.forEach((el, index) => {
        if (index < 3) {
            if (index + 1 === rsvpState.step) {
                el.classList.remove('hidden');
            } else {
                el.classList.add('hidden');
            }
        }
    });

    // Validation logic to enable Next buttons
    if (rsvpState.step === 1) {
        // Sync inputs from state if they differ
        if (dom.inputName && dom.inputName.value !== rsvpState.formData.fullName) {
            dom.inputName.value = rsvpState.formData.fullName;
        }
        if (dom.inputEmail && dom.inputEmail.value !== rsvpState.formData.email) {
            dom.inputEmail.value = rsvpState.formData.email;
        }

        if (dom.btnNext1) {
            const isNameValid = rsvpState.formData.fullName.trim() !== '';
            const isEmailValid = dom.inputEmail ? dom.inputEmail.checkValidity() : true;
            dom.btnNext1.disabled = !isNameValid || !isEmailValid;
        }
    } else if (rsvpState.step === 2) {
        // Sync attendance buttons active state
        document.querySelectorAll('.attendance-btn').forEach(btn => {
            const type = btn.getAttribute('data-type');
            const val = btn.getAttribute('data-val');
            const stateVal = type === 'wedding' ? rsvpState.formData.attendingWedding : rsvpState.formData.attendingParty;
            
            if (stateVal === val) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        if (dom.btnNext2) dom.btnNext2.disabled = !rsvpState.formData.attendingWedding || !rsvpState.formData.attendingParty;
    } else if (rsvpState.step === 3) {
        // Sync dietary and message from state
        const dietaryNotes = document.getElementById('rsvpDietary');
        const messageTxt = document.getElementById('rsvpMessageTxt');
        if (dietaryNotes && dietaryNotes.value !== rsvpState.formData.dietaryNotes) {
            dietaryNotes.value = rsvpState.formData.dietaryNotes;
        }
        if (messageTxt && messageTxt.value !== rsvpState.formData.message) {
            messageTxt.value = rsvpState.formData.message;
        }

        updateStep3Displays();
        renderGuestInputs('wedding');
        renderGuestInputs('party');
    }
}

function updateStep3Displays() {
    const aW = rsvpState.formData.attendingWedding === 'yes';
    const aP = rsvpState.formData.attendingParty === 'yes';
    
    const step3Title = document.querySelector('#rsvpStep3 .step-title');
    const step3Subtitle = document.querySelector('#rsvpStep3 .step-subtitle');
    const dietaryField = document.querySelector('#rsvpDietary')?.parentElement;

    if (aW) dom.secWedding.classList.remove('hidden'); else dom.secWedding.classList.add('hidden');
    if (aP) dom.secParty.classList.remove('hidden'); else dom.secParty.classList.add('hidden');
    
    if (!aW && !aP) {
        dom.secNone.classList.remove('hidden');
        if (step3Title) step3Title.innerText = 'Almost Done';
        if (step3Subtitle) step3Subtitle.innerText = 'We\'re sorry you can\'t make it, but we\'d still love to hear from you.';
        if (dietaryField) dietaryField.classList.add('hidden');
    } else {
        dom.secNone.classList.add('hidden');
        if (step3Title) step3Title.innerText = 'Guest List';
        if (step3Subtitle) step3Subtitle.innerText = 'Please provide the names for each guest.';
        if (dietaryField) dietaryField.classList.remove('hidden');
    }
}

function updateSuccessMessage() {
    const aW = rsvpState.formData.attendingWedding === 'yes';
    const aP = rsvpState.formData.attendingParty === 'yes';
    const successTitle = document.querySelector('#rsvpSuccess h2');
    const successMsg = document.querySelector('#rsvpSuccess p');

    if (!aW && !aP) {
        if (successTitle) successTitle.innerText = 'Thank You';
        if (successMsg) successMsg.innerText = 'We\'ve received your response. We\'re sorry you won\'t be able to join us, but we truly appreciate you letting us know!';
    } else {
        if (successTitle) successTitle.innerText = 'Thank You!';
        if (successMsg) successMsg.innerText = 'Your RSVP has been successfully received. We are so excited to celebrate these special moments with you and your guests.';
    }
}

export function renderGuestInputs(type) {
    const container = type === 'wedding' ? dom.containerWedding : dom.containerParty;
    const count = type === 'wedding' ? rsvpState.formData.weddingGuestsCount : rsvpState.formData.partyGuestsCount;
    const namesArray = type === 'wedding' ? rsvpState.formData.weddingGuestNames : rsvpState.formData.partyGuestNames;
    const lblCount = type === 'wedding' ? dom.lblCountWedding : dom.lblCountParty;
    const isAttending = type === 'wedding' ? rsvpState.formData.attendingWedding === 'yes' : rsvpState.formData.attendingParty === 'yes';
    
    if (lblCount) lblCount.innerText = count;
    
    if (!isAttending) {
        if (container) container.innerHTML = '';
        return;
    }

    if (!container) return;

    // To prevent focus loss, we check if the number of inputs matches.
    // If it matches, we just update values of existing inputs if they differ.
    // If it doesn't match, we re-render (this happens on +/- buttons).
    const existingInputs = container.querySelectorAll('input');
    if (existingInputs.length === count) {
        existingInputs.forEach((input, i) => {
            if (input.value !== namesArray[i]) {
                input.value = namesArray[i] || '';
            }
        });
        return;
    }

    container.innerHTML = ''; 
    for (let i = 0; i < count; i++) {
        const wrapper = document.createElement('div');
        wrapper.className = 'guest-input-wrapper';
        wrapper.innerHTML = `
            <label class="guest-input-label" for="guest-${type}-${i}">${i === 0 ? 'Your Name' : `Guest ${i+1} Name`}</label>
            <div class="guest-input-relative">
                <span class="guest-input-number">
                    ${i + 1}.
                </span>
                <input type="text" id="guest-${type}-${i}" data-type="${type}" data-index="${i}" value="${namesArray[i] || ''}" placeholder="${i === 0 ? 'Your Name' : `Guest ${i+1} Name`}" 
                       autocomplete="name" required class="guest-field" />
            </div>
        `;
        const input = wrapper.querySelector('input');
        input.addEventListener('input', (e) => {
            if (type === 'wedding') rsvpState.formData.weddingGuestNames[i] = e.target.value;
            else rsvpState.formData.partyGuestNames[i] = e.target.value;
        });
        container.appendChild(wrapper);
    }
}
