import { initNavigation } from './modules/navigation.js';
import { initAnimations } from './modules/animations.js';
import { initUIElements, updateView } from './modules/rsvp/ui.js';
import { initRSVPEvents } from './modules/rsvp/events.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Site-Wide Scripts
    initNavigation();
    initAnimations();

    // 2. Initialize RSVP Form Logic
    const rsvpForm = document.getElementById('rsvpForm');
    if (rsvpForm) {
        initUIElements();
        initRSVPEvents();
        updateView();
    }
});
