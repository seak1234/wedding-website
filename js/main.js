import { initNavigation } from './modules/navigation.js';
import { initAnimations } from './modules/animations.js';
import { initUIElements, updateView } from './modules/rsvp/ui.js';
import { initRSVPEvents } from './modules/rsvp/events.js';
import { initCountdown } from './modules/countdown.js';
import { initMap } from './modules/map.js';
import { initParticles } from './modules/particles.js';

function safeInit(fn, name) {
    try {
        fn();
    } catch (e) {
        console.error(`Error initializing ${name}:`, e);
    }
}

function initAll() {
    // 1. Initialize Site-Wide Scripts
    safeInit(initNavigation, 'Navigation');
    safeInit(initAnimations, 'Animations');
    safeInit(initCountdown, 'Countdown');
    safeInit(initMap, 'Map');
    safeInit(initParticles, 'Particles');

    // 2. Initialize RSVP Form Logic
    const rsvpForm = document.getElementById('rsvpForm');
    if (rsvpForm) {
        safeInit(() => {
            initUIElements();
            initRSVPEvents();
            updateView();
        }, 'RSVP Logic');
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
} else {
    initAll();
}
