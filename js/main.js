import { initNavigation } from './modules/navigation.js';
import { initAnimations } from './modules/animations.js';
import { initUIElements, updateView } from './modules/rsvp/ui.js';
import { initRSVPEvents } from './modules/rsvp/events.js';
import { initCountdown } from './modules/countdown.js';
import { initMap } from './modules/map.js';
import { initParticles } from './modules/particles.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Site-Wide Scripts
    initNavigation();
    initAnimations();
    initCountdown();
    initMap();
    initParticles();

    // 2. Initialize RSVP Form Logic
    const rsvpForm = document.getElementById('rsvpForm');
    if (rsvpForm) {
        initUIElements();
        initRSVPEvents();
        updateView();
    }
});
