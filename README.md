# Wedding Website

A modern, responsive wedding website built with HTML, CSS, and Vanilla JavaScript. 

## Features

*   **Responsive Design**: Adapts beautifully to mobile, tablet, and desktop screens.
*   **Dynamic Particles Background**: Uses `tsParticles` to create an elegant hero section animation.
*   **RSVP System**: An interactive RSVP form with state management and validation.
*   **Google Maps Integration**: Displays the event venue location.

## Technologies Used

*   **HTML5**
*   **CSS3**
*   **Vanilla JavaScript (ES6+ Modules)**
*   **tsParticles** (for the dynamic background)
*   **Google Maps API**
*   **reCAPTCHA**

## Getting Started

### Prerequisites

To run this project locally, you **must use a local development server**. Opening the `index.html` file directly in your browser (via the `file://` protocol) will result in CORS errors and block JavaScript ES6 modules from loading, causing features like the particle background and RSVP form to break.

*   Recommended: **Live Server** extension for VS Code.
*   Alternative: Node.js `http-server` or Python's `http.server`.

### Running Locally

1.  Clone the repository.
2.  Open the project folder in your code editor (e.g., VS Code).
3.  Start your local development server.
    *   *If using Live Server in VS Code, click "Go Live" in the status bar.*
4.  The website will open automatically at `http://localhost:5500` (or your configured port).

## Project Structure

```text
.
├── assets/         # Images, icons, and other static assets
├── css/            # Stylesheets
│   ├── index.css   # Main stylesheet
│   └── ...
├── js/             # JavaScript source files
│   ├── main.js     # Entry point for the application
│   ├── modules/    # ES6 Modules
│   │   ├── rsvp/   # RSVP form logic (UI, API, State)
│   │   └── particles.js # tsParticles initialization
│   └── vendor/     # Third-party libraries
├── index.html      # Main HTML document
└── README.md       # Project documentation
```

## Agent Guidelines

For AI agents assisting with this repository:
*   Always use local development servers for testing; avoid `file://`.
*   Maintain the modular architecture inside `/js/modules/`.
*   Follow the existing conventions for ES6 modules and vanilla CSS.
*   Check the state management logic in `js/modules/rsvp/` when debugging RSVP issues.
