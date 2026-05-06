let retries = 0;

export function initParticles() {
    if (typeof tsParticles === 'undefined') {
        if (retries < 50) {
            retries++;
            setTimeout(initParticles, 50);
        } else {
            console.warn('tsParticles library not loaded.');
        }
        return;
    }

    const container = document.getElementById('tsparticles');
    if (!container) return;

    if (container.offsetWidth === 0 || container.offsetHeight === 0) {
        if (retries < 50) {
            retries++;
            setTimeout(initParticles, 50);
        }
        return;
    }

    tsParticles.load("tsparticles", {
        fullScreen: { enable: false }, // Constrain to the parent div
        fpsLimit: 80,
        particles: {
            number: {
                value: 30, // Fixed number for consistent bokeh appearance
                density: {
                    enable: false // Disable density to prevent particles from being removed on resize
                }
            },
            color: {
                value: "#ffffff"
            },
            shape: {
                type: "circle"
            },
            opacity: {
                value: { min: 0.3, max: 0.6 }, // Higher opacity to compensate for blur
                random: true,
                animation: {
                    enable: true,
                    speed: 0.5,
                    minimumValue: 0.3,
                    sync: false
                }
            },
            size: {
                value: { min: 8, max: 30 }, // Increased size for better bokeh effect
                random: true,
                animation: {
                    enable: true,
                    speed: 1,
                    minimumValue: 5,
                    sync: false
                }
            },
            move: {
                enable: true,
                speed: { min: 0.1, max: 0.8 }, // Very slow, lazy drift
                direction: "none", // Drift randomly
                random: true,
                straight: false,
                outModes: {
                    default: "bounce" // Keep particles within the hero section boundaries
                }
            }
        },
        interactivity: {
            events: {
                onHover: {
                    enable: true,
                    mode: "repulse"
                },
                resize: true
            },
            modes: {
                repulse: {
                    distance: 500, // Radius of the interaction (how close cursor needs to be)
                    duration: 100, // Smooth transition back to original position
                    factor: 0.5,   // Gentle push strength so it's not too violent
                    speed: 1       // Speed of the repulsion
                }
            }
        },
        detectRetina: true,
        responsive: [
            {
                maxWidth: 1050,
                options: {
                    particles: {
                        number: {
                            value: 22
                        },
                        opacity: {
                            value: { min: 0.6, max: 0.8}
                        },
                        size: {
                            value: { min: 1, max: 12 },
                            animation: {
                                minimumValue: 0.5
                            }
                        }
                    }
                }
            }
        ]
    });
}
