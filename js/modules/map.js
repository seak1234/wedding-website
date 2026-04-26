/**
 * Interactive Map Module (Google Maps Edition)
 * Initializes Google Map with custom markers and styles.
 */

function createMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    // Center between Windsor and Kingsville
    const center = { lat: 42.1707, lng: -82.8786 };

    // Map styling is now controlled via Google Cloud Console using the 'mapId' below.
    // This resolves the conflict where 'styles' cannot be set when 'mapId' is present.

    const map = new google.maps.Map(mapElement, {
        zoom: 10,
        center: center,
        mapId: 'ed62f22d16ae036db6c63b63',
        disableDefaultUI: true,
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP
        },
        gestureHandling: 'cooperative'
    });

    // Locations
    const locations = [
        {
            name: "Holy Trinity Church",
            lat: 42.3082,
            lng: -83.0239,
            address: "1035 Ellis St E, Windsor, ON",
            icon: "./assets/images/church-marker.svg"
        },
        {
            name: "Kingscoast Estate Winery",
            lat: 42.0333,
            lng: -82.7333,
            address: "1000 McCain Side Rd, Kingsville, ON",
            icon: "./assets/images/winery-marker.svg"
        }
    ];

    const infoWindow = new google.maps.InfoWindow();

    locations.forEach(loc => {
        const img = document.createElement('img');
        img.src = loc.icon;
        img.alt = loc.name;
        img.style.width = '40px';
        img.style.height = '50px';
        img.style.display = 'block';

        const marker = new google.maps.marker.AdvancedMarkerElement({
            position: { lat: loc.lat, lng: loc.lng },
            map: map,
            title: loc.name,
            content: img,
            gmpClickable: true
        });

        marker.addEventListener('gmp-click', () => {
            infoWindow.setContent(`
                <div style="padding: 10px; font-family: 'Inter', sans-serif;">
                    <strong style="display:block; margin-bottom: 5px;">${loc.name}</strong>
                    <span style="font-size: 13px; color: #555; display: block; margin-bottom: 8px;">${loc.address}</span>
                    <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.name + ' ' + loc.address)}" 
                       target="_blank" 
                       rel="noopener noreferrer"
                       style="color: #000; font-size: 12px; font-weight: 600; text-decoration: underline;">
                       View on Google Maps
                    </a>
                </div>
            `);
            infoWindow.open(map, marker);
        });
    });

    // Draw real Google Maps driving route between the two venues
    const calculateAndDisplayRoute = async () => {
        try {
            const { routes } = await google.maps.routes.Route.computeRoutes({
                origin: { lat: locations[0].lat, lng: locations[0].lng },
                destination: { lat: locations[1].lat, lng: locations[1].lng },
                travelMode: google.maps.TravelMode.DRIVING,
                routingPreference: 'TRAFFIC_AWARE',
                fields: ['routes.polyline.encodedPolyline', 'routes.duration']
            });

            if (routes && routes.length > 0) {
                const route = routes[0];

                // Render the Polyline with same styling as before
                if (route.polyline && route.polyline.encodedPolyline) {
                    const path = google.maps.geometry.encoding.decodePath(route.polyline.encodedPolyline);
                    const polyline = new google.maps.Polyline({
                        path: path,
                        map: map,
                        strokeColor: '#333',
                        strokeOpacity: 0.8,
                        strokeWeight: 4
                    });
                }
                
                // Keep the travel time badge in sync with the actual route.
                if (route.duration) {
                    const seconds = parseInt(route.duration, 10);
                    const mins = Math.round(seconds / 60);
                    const travelTimeEl = document.querySelector('.travel-time span');
                    if (travelTimeEl) {
                        travelTimeEl.textContent = `${mins} min drive`;
                    }
                }
            }
        } catch (error) {
            console.error('Routes request failed:', error);
        }
    };

    calculateAndDisplayRoute();

    // Handle Side Cards
    const cards = document.querySelectorAll('.map-location-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const lat = parseFloat(card.dataset.lat);
            const lng = parseFloat(card.dataset.lng);

            cards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');

            map.panTo({ lat, lng });
            map.setZoom(14);
        });
    });
}

// Register the internal initializer so the inline stub callback can invoke it
window._initMapInternal = createMap;

export function initMap() {
    // If Google Maps is already loaded (either via callback or cached), initialize now
    if (window._googleMapsReady || (window.google && window.google.maps)) {
        createMap();
    }
    // If Maps hasn't loaded yet, the inline stub will call createMap when ready
}
