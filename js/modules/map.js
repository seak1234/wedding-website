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

    // Draw Animated Route
    const lineSymbol = {
        path: 'M 0,-1 0,1',
        strokeOpacity: 1,
        scale: 3,
        strokeColor: '#333'
    };

    const line = new google.maps.Polyline({
        path: [
            { lat: locations[0].lat, lng: locations[0].lng },
            { lat: locations[1].lat, lng: locations[1].lng }
        ],
        strokeOpacity: 0,
        icons: [{
            icon: lineSymbol,
            offset: '0',
            repeat: '20px'
        }],
        map: map
    });

    // Animation loop for the dashed line
    let count = 0;
    setInterval(() => {
        count = (count + 1) % 200;
        const icons = line.get('icons');
        icons[0].offset = (count / 2) + '%';
        line.set('icons', icons);
    }, 50);

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
