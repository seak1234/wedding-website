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
    };
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
        if (dom.btnNext1) dom.btnNext1.disabled = rsvpState.formData.fullName.trim() === '';
    } else if (rsvpState.step === 2) {
        if (dom.btnNext2) dom.btnNext2.disabled = !rsvpState.formData.attendingWedding || !rsvpState.formData.attendingParty;
        
        // Sync the name if empty
        rsvpState.formData.weddingGuestNames[0] = rsvpState.formData.fullName;
        rsvpState.formData.partyGuestNames[0] = rsvpState.formData.fullName;
    } else if (rsvpState.step === 3) {
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
    if (container) container.innerHTML = ''; 
    
    if (!isAttending) return; 

    for (let i = 0; i < count; i++) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
            <p style="font-size: 0.7rem; font-weight: 700; color: var(--clr-text-light); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.2rem;">${i === 0 ? 'Your Name' : `Guest ${i+1} Name`}</p>
            <div style="position: relative; width: 100%;">
                <span style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: var(--clr-text-light); font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 1rem; pointer-events: none;">
                    ${i + 1}.
                </span>
                <input type="text" data-type="${type}" data-index="${i}" value="${namesArray[i] || ''}" placeholder="${i === 0 ? 'Your Name' : `Guest ${i+1} Name`}" required 
                       style="width: 100%; padding: 0.8rem 1rem 0.8rem 2.8rem; border-radius: 8px; border: 1px solid rgba(0,0,0,0.1); background: var(--clr-bg); font-family: 'Inter', sans-serif; font-size: 1rem; transition: border-color 0.3s;" />
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
