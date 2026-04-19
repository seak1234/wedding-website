import { rsvpState, setStep, setSubmitted } from './state.js';
import { updateView, renderGuestInputs } from './ui.js';
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
            rsvpState.formData.fullName = e.target.value;
            updateView();
        });
    }

    if (inputEmail) {
        inputEmail.addEventListener('input', (e) => {
            rsvpState.formData.email = e.target.value;
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
            let newCount = action === 'plus' ? currentCount + 1 : Math.max(1, currentCount - 1);
            
            rsvpState.formData[countField] = newCount;
            
            if (action === 'plus') {
                rsvpState.formData[namesField].push('');
            } else if (newCount < currentCount) {
                rsvpState.formData[namesField].pop();
            }

            renderGuestInputs(target);
        });
    });

    if (btnNext1) btnNext1.addEventListener('click', () => { setStep(2); updateView(); });
    if (btnNext2) btnNext2.addEventListener('click', () => { setStep(3); updateView(); });
    if (btnPrev2) btnPrev2.addEventListener('click', () => { setStep(1); updateView(); });
    if (btnPrev3) btnPrev3.addEventListener('click', () => { setStep(2); updateView(); });

    if (btnEditResponse) {
        btnEditResponse.addEventListener('click', () => {
            setSubmitted(false);
            updateView();
        });
    }

    if (rsvpForm) {
        rsvpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btnSubmit = document.getElementById('btnSubmit');
            const origHtml = btnSubmit.innerHTML;
            btnSubmit.innerHTML = 'Sending...';
            btnSubmit.disabled = true;

            await submitRSVP(rsvpState.formData);

            setSubmitted(true);
            btnSubmit.innerHTML = origHtml;
            btnSubmit.disabled = false;
            updateView();
        });
    }
}
