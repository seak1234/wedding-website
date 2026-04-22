/**
 * Interactive Map Module (Google Maps Edition)
 * Initializes Google Map with custom markers and styles.
 */

export function initMap() {
    // We attach the initialization to the window so the Google Maps Callback can find it
    window.initGoogleMap = () => {
        const mapElement = document.getElementById('map');
        if (!mapElement) return;

        // Center between Windsor and Kingsville
        const center = { lat: 42.1707, lng: -82.8786 };
        
        // Custom Styled Map (Muted/Premium Look)
        const mapStyles = [
            { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#e9e9e9" }, { "lightness": 17 }] },
            { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }, { "lightness": 20 }] },
            { "featureType": "road.highway", "elementType": "geometry.fill", "stylers": [{ "color": "#ffffff" }, { "lightness": 17 }] },
            { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#ffffff" }, { "lightness": 29 }, { "weight": 0.2 }] },
            { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }, { "lightness": 18 }] },
            { "featureType": "road.local", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }, { "lightness": 16 }] },
            { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }, { "lightness": 21 }] },
            { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#dedede" }, { "lightness": 21 }] },
            { "elementType": "labels.text.stroke", "stylers": [{ "visibility": "on" }, { "color": "#ffffff" }, { "lightness": 16 }] },
            { "elementType": "labels.text.fill", "stylers": [{ "saturation": 36 }, { "color": "#333333" }, { "lightness": 40 }] },
            { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
            { "featureType": "transit", "elementType": "geometry", "stylers": [{ "color": "#f2f2f2" }, { "lightness": 19 }] },
            { "featureType": "administrative", "elementType": "geometry.fill", "stylers": [{ "color": "#fefefe" }, { "lightness": 20 }] },
            { "featureType": "administrative", "elementType": "geometry.stroke", "stylers": [{ "color": "#fefefe" }, { "lightness": 17 }, { "weight": 1.2 }] }
        ];

        const map = new google.maps.Map(mapElement, {
            zoom: 10,
            center: center,
            styles: mapStyles,
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
                address: "1035 Ellis St E, Windsor, ON"
            },
            {
                name: "Kingscoast Estate Winery",
                lat: 42.0333,
                lng: -82.7333,
                address: "1000 McCain Side Rd, Kingsville, ON"
            }
        ];

        const markers = [];
        const infoWindow = new google.maps.InfoWindow();

        locations.forEach(loc => {
            const marker = new google.maps.Marker({
                position: { lat: loc.lat, lng: loc.lng },
                map: map,
                title: loc.name,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    fillColor: '#000000',
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: '#FFFFFF',
                    scale: 10
                }
            });

            marker.addListener('click', () => {
                infoWindow.setContent(`
                    <div style="padding: 10px; font-family: 'Inter', sans-serif;">
                        <strong style="display:block; margin-bottom: 5px;">${loc.name}</strong>
                        <span style="font-size: 13px; color: #555;">${loc.address}</span>
                    </div>
                `);
                infoWindow.open(map, marker);
            });

            markers.push(marker);
        });

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
    };

    // If google maps is already loaded (e.g. navigation back/forth), call it manually
    if (window.google && window.google.maps) {
        window.initGoogleMap();
    }
}
