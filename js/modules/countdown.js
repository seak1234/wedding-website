/**
 * Countdown Module
 * Handles the logic for the wedding countdown timer.
 */

export function initCountdown() {
    // Set the wedding date: August 15, 2026, 2:30 PM (14:30)
    const weddingDate = new Date('August 15, 2026 14:30:00').getTime();

    const updateCountdown = () => {
        const now = new Date().getTime();
        const distance = weddingDate - now;

        // Time calculations
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Update UI
        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');

        if (daysEl) daysEl.innerText = String(days).padStart(2, '0');
        if (hoursEl) hoursEl.innerText = String(hours).padStart(2, '0');
        if (minutesEl) minutesEl.innerText = String(minutes).padStart(2, '0');
        if (secondsEl) secondsEl.innerText = String(seconds).padStart(2, '0');

        // If the countdown is over, display a message
        if (distance < 0) {
            clearInterval(interval);
            const grid = document.querySelector('.countdown-grid');
            if (grid) grid.innerHTML = '<h3 class="wedding-started">The Celebration Has Begun!</h3>';
        }
    };

    // Initial call
    updateCountdown();
    // Update every second
    const interval = setInterval(updateCountdown, 1000);
}
