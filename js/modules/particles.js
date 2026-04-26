export function initParticles() {
    if (typeof tsParticles === 'undefined') {
        console.warn('tsParticles library not loaded.');
        return;
    }

    tsParticles.load("tsparticles", {
        fullScreen: { enable: false }, // Constrain to the parent div
        fpsLimit: 60,
        particles: {
            number: {
                value: 40, // Fixed number for consistent bokeh appearance
                density: {
                    enable: false // Disable density to prevent particles from being removed on resize
                }
            },
            color: {
                value: ["#ffffff", "#f8fafc", "#f1f5f9"] // Bright whites and very soft light greys
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
                value: { min: 10, max: 40 }, // Increased size for better bokeh effect
                random: true,
                animation: {
                    enable: true,
                    speed: 1,
                    minimumValue: 15,
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
                    distance: 300, // Radius of the interaction (how close cursor needs to be)
                    duration: 2, // Smooth transition back to original position
                    factor: 2,   // Gentle push strength so it's not too violent
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
                        opacity: {
                            value: { min: 0.6, max: 0.8}
                        },
                        size: {
                            value: { min: 5, max: 20 },
                            animation: {
                                minimumValue: 7.5
                            }
                        }
                    }
                }
            }
        ]
    });
}
