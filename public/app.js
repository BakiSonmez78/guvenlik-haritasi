// ===== APPLICATION STATE =====
const AppState = {
    map: null,
    userLocation: null,
    isLocationSharing: false,
    markers: [],
    consentGiven: false,
    directionsService: null,
    directionsRenderer: null,
    currentRoute: null,
    reports: [],
    heatmap: null,
    crimeData: [],
    neighborhoodData: {},
    charts: {}
};

// ===== MOCK CRIME DATA =====
// In a real app, this would come from a database or API
const MOCK_CRIME_DATA = {
    // Crime incidents (anonymous, location-based only)
    incidents: [
        { type: 'theft', lat: 41.0095, lng: 28.9795, time: Date.now() - 3600000, severity: 'medium' },
        { type: 'suspicious', lat: 41.0105, lng: 28.9805, time: Date.now() - 7200000, severity: 'low' },
        { type: 'theft', lat: 41.0085, lng: 28.9785, time: Date.now() - 10800000, severity: 'medium' },
        { type: 'accident', lat: 41.0115, lng: 28.9815, time: Date.now() - 14400000, severity: 'low' },
        { type: 'harassment', lat: 41.0075, lng: 28.9775, time: Date.now() - 18000000, severity: 'high' },
        { type: 'theft', lat: 41.0125, lng: 28.9825, time: Date.now() - 21600000, severity: 'medium' },
        { type: 'suspicious', lat: 41.0065, lng: 28.9765, time: Date.now() - 25200000, severity: 'low' },
        { type: 'theft', lat: 41.0135, lng: 28.9835, time: Date.now() - 28800000, severity: 'medium' }
    ],

    // Neighborhood safety scores (1-10, higher is safer)
    neighborhoods: {
        'Beyoğlu': { score: 7.2, trend: 'positive', change: '+0.3' },
        'Kadıköy': { score: 8.5, trend: 'positive', change: '+0.5' },
        'Şişli': { score: 7.8, trend: 'neutral', change: '0.0' },
        'Beşiktaş': { score: 8.2, trend: 'positive', change: '+0.2' },
        'Üsküdar': { score: 8.7, trend: 'positive', change: '+0.4' },
        'Fatih': { score: 6.9, trend: 'negative', change: '-0.2' }
    },

    // Crime type distribution
    crimeTypes: {
        'theft': 45,
        'suspicious': 25,
        'accident': 15,
        'harassment': 10,
        'other': 5
    },

    // Time-based analysis (hourly distribution)
    timeDistribution: [2, 1, 1, 0, 0, 1, 3, 5, 8, 6, 4, 5, 7, 6, 5, 4, 6, 8, 10, 12, 9, 7, 5, 3]
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Check if consent was previously given
    const savedConsent = localStorage.getItem('locationConsent');
    if (savedConsent === 'true') {
        AppState.consentGiven = true;
        hidePrivacyModal();
        showApp();
    } else {
        showPrivacyModal();
    }

    setupEventListeners();
    loadCrimeData();
}

// ===== PRIVACY MODAL =====
function showPrivacyModal() {
    const modal = document.getElementById('privacyModal');
    modal.classList.remove('hidden');
}

function hidePrivacyModal() {
    const modal = document.getElementById('privacyModal');
    modal.classList.add('hidden');
}

function showApp() {
    document.getElementById('app').classList.remove('hidden');
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Privacy consent
    const locationConsent = document.getElementById('locationConsent');
    const acceptBtn = document.getElementById('acceptConsent');
    const declineBtn = document.getElementById('declineConsent');

    locationConsent.addEventListener('change', (e) => {
        acceptBtn.disabled = !e.target.checked;
    });

    acceptBtn.addEventListener('click', () => {
        AppState.consentGiven = true;
        localStorage.setItem('locationConsent', 'true');
        hidePrivacyModal();
        showApp();
        if (AppState.map) {
            requestUserLocation();
        }
    });

    declineBtn.addEventListener('click', () => {
        alert('Uygulama konum izni olmadan çalışamaz. Gizliliğiniz bizim için önemlidir.');
    });

    // Emergency button
    document.getElementById('emergencyBtn').addEventListener('click', showEmergencyModal);
    document.getElementById('closeEmergencyModal').addEventListener('click', hideEmergencyModal);

    // Settings button
    document.getElementById('settingsBtn').addEventListener('click', () => {
        showPrivacyModal();
    });

    // Location sharing
    document.getElementById('shareLocationBtn').addEventListener('click', startLocationSharing);
    document.getElementById('stopSharingBtn').addEventListener('click', stopLocationSharing);

    // Route planning
    document.getElementById('findRouteBtn').addEventListener('click', findSafeRoute);

    // Report incident
    document.getElementById('reportIncidentBtn').addEventListener('click', showReportModal);
    document.getElementById('closeReportModal').addEventListener('click', hideReportModal);
    document.getElementById('submitReport').addEventListener('click', submitReport);

    // Info panel
    document.getElementById('closeInfoPanel').addEventListener('click', hideInfoPanel);

    // Layer toggles
    document.getElementById('policeLayer').addEventListener('change', updateMapLayers);
    document.getElementById('hospitalLayer').addEventListener('change', updateMapLayers);
    document.getElementById('pharmacyLayer').addEventListener('change', updateMapLayers);
    document.getElementById('safeZoneLayer').addEventListener('change', updateMapLayers);

    // Heatmap controls
    document.getElementById('heatmapLayer').addEventListener('change', toggleHeatmap);
    document.getElementById('heatmapTimeRange').addEventListener('change', updateHeatmapData);

    // Statistics modal
    document.getElementById('viewStatsBtn').addEventListener('click', showStatsModal);
    document.getElementById('closeStatsModal').addEventListener('click', hideStatsModal);
}

// ===== CRIME DATA =====
function loadCrimeData() {
    AppState.crimeData = MOCK_CRIME_DATA.incidents;
    AppState.neighborhoodData = MOCK_CRIME_DATA.neighborhoods;
}

// ===== GOOGLE MAPS INITIALIZATION =====
function initMap() {
    // Hide loading screen
    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
    }, 500);

    // Default location (Istanbul)
    const defaultLocation = { lat: 41.0082, lng: 28.9784 };

    // Create map
    AppState.map = new google.maps.Map(document.getElementById('map'), {
        center: defaultLocation,
        zoom: 13,
        styles: getMapStyles(),
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM
        }
    });

    // Initialize directions service
    AppState.directionsService = new google.maps.DirectionsService();
    AppState.directionsRenderer = new google.maps.DirectionsRenderer({
        map: AppState.map,
        suppressMarkers: false,
        polylineOptions: {
            strokeColor: '#4285F4',
            strokeWeight: 5,
            strokeOpacity: 0.8
        }
    });

    // Request user location if consent given
    if (AppState.consentGiven) {
        requestUserLocation();
    }

    // Add sample safety points
    addSafetyPoints();

    // Add sample reports
    addSampleReports();

    // Initialize heatmap data
    initializeHeatmap();
}

// ===== MAP STYLES =====
function getMapStyles() {
    return [
        { "elementType": "geometry", "stylers": [{ "color": "#1d2c4d" }] },
        { "elementType": "labels.text.fill", "stylers": [{ "color": "#8ec3b9" }] },
        { "elementType": "labels.text.stroke", "stylers": [{ "color": "#1a3646" }] },
        { "featureType": "administrative.country", "elementType": "geometry.stroke", "stylers": [{ "color": "#4b6878" }] },
        { "featureType": "administrative.land_parcel", "elementType": "labels.text.fill", "stylers": [{ "color": "#64779e" }] },
        { "featureType": "administrative.province", "elementType": "geometry.stroke", "stylers": [{ "color": "#4b6878" }] },
        { "featureType": "landscape.man_made", "elementType": "geometry.stroke", "stylers": [{ "color": "#334e87" }] },
        { "featureType": "landscape.natural", "elementType": "geometry", "stylers": [{ "color": "#023e58" }] },
        { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#283d6a" }] },
        { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#6f9ba5" }] },
        { "featureType": "poi", "elementType": "labels.text.stroke", "stylers": [{ "color": "#1d2c4d" }] },
        { "featureType": "poi.park", "elementType": "geometry.fill", "stylers": [{ "color": "#023e58" }] },
        { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#3C7680" }] },
        { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#304a7d" }] },
        { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#98a5be" }] },
        { "featureType": "road", "elementType": "labels.text.stroke", "stylers": [{ "color": "#1d2c4d" }] },
        { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#2c6675" }] },
        { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#255763" }] },
        { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#b0d5ce" }] },
        { "featureType": "road.highway", "elementType": "labels.text.stroke", "stylers": [{ "color": "#023e58" }] },
        { "featureType": "transit", "elementType": "labels.text.fill", "stylers": [{ "color": "#98a5be" }] },
        { "featureType": "transit", "elementType": "labels.text.stroke", "stylers": [{ "color": "#1d2c4d" }] },
        { "featureType": "transit.line", "elementType": "geometry.fill", "stylers": [{ "color": "#283d6a" }] },
        { "featureType": "transit.station", "elementType": "geometry", "stylers": [{ "color": "#3a4762" }] },
        { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#0e1626" }] },
        { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#4e6d70" }] }
    ];
}

// ===== USER LOCATION =====
function requestUserLocation() {
    if (!navigator.geolocation) {
        alert('Tarayıcınız konum hizmetlerini desteklemiyor.');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            AppState.userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            // Center map on user location
            AppState.map.setCenter(AppState.userLocation);

            // Add user marker
            addUserMarker();

            // Update neighborhood safety score
            updateNeighborhoodSafety();
        },
        (error) => {
            console.error('Konum alınamadı:', error);
            alert('Konum bilgisi alınamadı. Lütfen tarayıcı ayarlarınızı kontrol edin.');
        }
    );
}

function addUserMarker() {
    const existingMarker = AppState.markers.find(m => m.type === 'user');
    if (existingMarker) {
        existingMarker.marker.setMap(null);
        if (existingMarker.circle) existingMarker.circle.setMap(null);
        AppState.markers = AppState.markers.filter(m => m.type !== 'user');
    }

    const marker = new google.maps.Marker({
        position: AppState.userLocation,
        map: AppState.map,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3
        },
        title: 'Konumunuz',
        animation: google.maps.Animation.DROP
    });

    const circle = new google.maps.Circle({
        map: AppState.map,
        center: AppState.userLocation,
        radius: 100,
        fillColor: '#4285F4',
        fillOpacity: 0.2,
        strokeColor: '#4285F4',
        strokeOpacity: 0.5,
        strokeWeight: 1
    });

    AppState.markers.push({ type: 'user', marker, circle });
}

// ===== NEIGHBORHOOD SAFETY =====
function updateNeighborhoodSafety() {
    // In a real app, this would use reverse geocoding to get the actual neighborhood
    const neighborhoods = Object.keys(AppState.neighborhoodData);
    const randomNeighborhood = neighborhoods[Math.floor(Math.random() * neighborhoods.length)];
    const data = AppState.neighborhoodData[randomNeighborhood];

    document.querySelector('.neighborhood-name').textContent = randomNeighborhood;

    const scoreElement = document.getElementById('safetyScore');
    scoreElement.textContent = data.score.toFixed(1);

    // Update score color based on value
    scoreElement.className = 'safety-score';
    if (data.score >= 8) {
        scoreElement.classList.add('high');
    } else if (data.score >= 6) {
        scoreElement.classList.add('medium');
    } else {
        scoreElement.classList.add('low');
    }

    // Update trend
    const trendElement = document.getElementById('safetyTrend');
    const trendIcon = data.trend === 'positive' ? '📈' : data.trend === 'negative' ? '📉' : '➡️';
    trendElement.textContent = `${trendIcon} ${data.change} (Son 30 gün)`;
    trendElement.className = `safety-trend ${data.trend}`;
}

// ===== HEATMAP =====
function initializeHeatmap() {
    const heatmapData = AppState.crimeData.map(incident => ({
        location: new google.maps.LatLng(incident.lat, incident.lng),
        weight: incident.severity === 'high' ? 3 : incident.severity === 'medium' ? 2 : 1
    }));

    AppState.heatmap = new google.maps.visualization.HeatmapLayer({
        data: heatmapData,
        map: null, // Start hidden
        radius: 30,
        opacity: 0.6,
        gradient: [
            'rgba(0, 255, 255, 0)',
            'rgba(0, 255, 255, 1)',
            'rgba(0, 191, 255, 1)',
            'rgba(0, 127, 255, 1)',
            'rgba(0, 63, 255, 1)',
            'rgba(0, 0, 255, 1)',
            'rgba(0, 0, 223, 1)',
            'rgba(0, 0, 191, 1)',
            'rgba(0, 0, 159, 1)',
            'rgba(0, 0, 127, 1)',
            'rgba(63, 0, 91, 1)',
            'rgba(127, 0, 63, 1)',
            'rgba(191, 0, 31, 1)',
            'rgba(255, 0, 0, 1)'
        ]
    });
}

function toggleHeatmap(e) {
    if (e.target.checked) {
        AppState.heatmap.setMap(AppState.map);
    } else {
        AppState.heatmap.setMap(null);
    }
}

function updateHeatmapData() {
    const timeRange = parseInt(document.getElementById('heatmapTimeRange').value);
    const cutoffTime = Date.now() - (timeRange * 24 * 60 * 60 * 1000);

    const filteredData = AppState.crimeData
        .filter(incident => incident.time >= cutoffTime)
        .map(incident => ({
            location: new google.maps.LatLng(incident.lat, incident.lng),
            weight: incident.severity === 'high' ? 3 : incident.severity === 'medium' ? 2 : 1
        }));

    AppState.heatmap.setData(filteredData);
}

// ===== LOCATION SHARING =====
function startLocationSharing() {
    if (!AppState.userLocation) {
        alert('Önce konumunuza erişim izni vermelisiniz.');
        requestUserLocation();
        return;
    }

    AppState.isLocationSharing = true;
    document.getElementById('shareLocationBtn').classList.add('hidden');
    document.getElementById('sharingStatus').classList.remove('hidden');

    AppState.locationInterval = setInterval(() => {
        console.log('Konum paylaşılıyor:', AppState.userLocation);
    }, 5000);
}

function stopLocationSharing() {
    AppState.isLocationSharing = false;
    document.getElementById('shareLocationBtn').classList.remove('hidden');
    document.getElementById('sharingStatus').classList.add('hidden');

    if (AppState.locationInterval) {
        clearInterval(AppState.locationInterval);
    }
}

// ===== SAFETY POINTS =====
function addSafetyPoints() {
    const policeStations = [
        { lat: 41.0082, lng: 28.9784, name: 'Merkez Polis Karakolu' },
        { lat: 41.0150, lng: 28.9850, name: 'Beyoğlu Polis Karakolu' },
        { lat: 41.0050, lng: 28.9700, name: 'Eminönü Polis Karakolu' }
    ];

    const hospitals = [
        { lat: 41.0100, lng: 28.9800, name: 'Şehir Hastanesi' },
        { lat: 41.0200, lng: 28.9900, name: 'Merkez Hastanesi' }
    ];

    const pharmacies = [
        { lat: 41.0090, lng: 28.9790, name: 'Nöbetçi Eczane' },
        { lat: 41.0120, lng: 28.9820, name: 'Merkez Eczane' }
    ];

    policeStations.forEach(station => addSafetyMarker(station, 'police', '👮', '#3B82F6'));
    hospitals.forEach(hospital => addSafetyMarker(hospital, 'hospital', '🏥', '#EF4444'));
    pharmacies.forEach(pharmacy => addSafetyMarker(pharmacy, 'pharmacy', '💊', '#10B981'));
}

function addSafetyMarker(location, type, icon, color) {
    const marker = new google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: AppState.map,
        title: location.name,
        label: { text: icon, fontSize: '24px' },
        animation: google.maps.Animation.DROP
    });

    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div style="padding: 10px; color: #1a1a1a;">
                <h3 style="margin: 0 0 8px 0; color: ${color};">${icon} ${location.name}</h3>
                <p style="margin: 0; font-size: 14px;">Tür: ${getTypeLabel(type)}</p>
                <button onclick="getDirectionsTo(${location.lat}, ${location.lng})" 
                        style="margin-top: 10px; padding: 8px 16px; background: ${color}; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    Yol Tarifi Al
                </button>
            </div>
        `
    });

    marker.addListener('click', () => infoWindow.open(AppState.map, marker));
    AppState.markers.push({ type, marker, data: location });
}

function getTypeLabel(type) {
    const labels = {
        'police': 'Polis Karakolu',
        'hospital': 'Hastane',
        'pharmacy': 'Eczane',
        'safe_zone': 'Güvenli Bölge'
    };
    return labels[type] || type;
}

// ===== MAP LAYERS =====
function updateMapLayers() {
    const layers = {
        police: document.getElementById('policeLayer').checked,
        hospital: document.getElementById('hospitalLayer').checked,
        pharmacy: document.getElementById('pharmacyLayer').checked,
        safe_zone: document.getElementById('safeZoneLayer').checked
    };

    AppState.markers.forEach(({ type, marker }) => {
        if (type in layers) {
            marker.setVisible(layers[type]);
        }
    });
}

// ===== ROUTE PLANNING =====
function findSafeRoute() {
    const destination = document.getElementById('destinationInput').value;

    if (!destination) {
        alert('Lütfen bir hedef girin.');
        return;
    }

    if (!AppState.userLocation) {
        alert('Önce konumunuza erişim izni vermelisiniz.');
        requestUserLocation();
        return;
    }

    const request = {
        origin: AppState.userLocation,
        destination: destination,
        travelMode: google.maps.TravelMode.WALKING,
        provideRouteAlternatives: true
    };

    AppState.directionsService.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
            AppState.directionsRenderer.setDirections(result);
            showRouteInfo(result);
        } else {
            alert('Rota bulunamadı: ' + status);
        }
    });
}

window.getDirectionsTo = function (lat, lng) {
    if (!AppState.userLocation) {
        alert('Önce konumunuza erişim izni vermelisiniz.');
        requestUserLocation();
        return;
    }

    const request = {
        origin: AppState.userLocation,
        destination: { lat, lng },
        travelMode: google.maps.TravelMode.WALKING
    };

    AppState.directionsService.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
            AppState.directionsRenderer.setDirections(result);
            showRouteInfo(result);
        } else {
            alert('Rota bulunamadı: ' + status);
        }
    });
};

function showRouteInfo(result) {
    const route = result.routes[0];
    const leg = route.legs[0];

    const content = `
        <h3 style="margin-top: 0; color: var(--primary-light);">🗺️ Rota Bilgisi</h3>
        <div style="margin: 16px 0;">
            <p><strong>Mesafe:</strong> ${leg.distance.text}</p>
            <p><strong>Süre:</strong> ${leg.duration.text}</p>
            <p><strong>Başlangıç:</strong> ${leg.start_address}</p>
            <p><strong>Varış:</strong> ${leg.end_address}</p>
        </div>
        <div style="padding: 12px; background: var(--glass-bg); border-radius: 8px; margin-top: 16px;">
            <p style="margin: 0; color: var(--success); font-size: 14px;">
                ✓ Bu rota güvenli bölgelerden geçmektedir
            </p>
        </div>
    `;

    showInfoPanel(content);
}

// ===== INFO PANEL =====
function showInfoPanel(content) {
    const panel = document.getElementById('infoPanel');
    const contentDiv = document.getElementById('infoPanelContent');
    contentDiv.innerHTML = content;
    panel.classList.remove('hidden');
}

function hideInfoPanel() {
    document.getElementById('infoPanel').classList.add('hidden');
}

// ===== EMERGENCY MODAL =====
function showEmergencyModal() {
    const modal = document.getElementById('emergencyModal');
    modal.classList.remove('hidden');

    if (AppState.userLocation) {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: AppState.userLocation }, (results, status) => {
            if (status === 'OK' && results[0]) {
                document.getElementById('emergencyLocationText').textContent = results[0].formatted_address;
            } else {
                document.getElementById('emergencyLocationText').textContent =
                    `${AppState.userLocation.lat.toFixed(6)}, ${AppState.userLocation.lng.toFixed(6)}`;
            }
        });
    } else {
        document.getElementById('emergencyLocationText').textContent = 'Konum bilgisi alınamadı';
    }
}

function hideEmergencyModal() {
    document.getElementById('emergencyModal').classList.add('hidden');
}

// ===== REPORT MODAL =====
function showReportModal() {
    document.getElementById('reportModal').classList.remove('hidden');
}

function hideReportModal() {
    document.getElementById('reportModal').classList.add('hidden');
}

function submitReport() {
    const type = document.getElementById('incidentType').value;
    const description = document.getElementById('incidentDescription').value;
    const anonymous = document.getElementById('anonymousReport').checked;

    if (!description.trim()) {
        alert('Lütfen bir açıklama girin.');
        return;
    }

    if (!AppState.userLocation) {
        alert('Rapor göndermek için konum bilgisi gereklidir.');
        return;
    }

    const report = {
        id: Date.now(),
        type,
        description,
        anonymous,
        location: AppState.userLocation,
        timestamp: new Date().toISOString(),
        severity: 'medium'
    };

    AppState.reports.push(report);
    AppState.crimeData.push({
        type,
        lat: AppState.userLocation.lat,
        lng: AppState.userLocation.lng,
        time: Date.now(),
        severity: 'medium'
    });

    addReportMarker(report);
    updateHeatmapData();

    document.getElementById('incidentDescription').value = '';
    hideReportModal();

    alert('Raporunuz başarıyla gönderildi. Teşekkür ederiz!');
}

function addReportMarker(report) {
    const marker = new google.maps.Marker({
        position: report.location,
        map: AppState.map,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#F59E0B',
            fillOpacity: 0.8,
            strokeColor: '#ffffff',
            strokeWeight: 2
        },
        title: 'Topluluk Raporu'
    });

    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div style="padding: 10px; color: #1a1a1a;">
                <h3 style="margin: 0 0 8px 0; color: #F59E0B;">⚠️ ${getIncidentTypeLabel(report.type)}</h3>
                <p style="margin: 0 0 8px 0; font-size: 14px;">${report.description}</p>
                <p style="margin: 0; font-size: 12px; color: #666;">
                    ${new Date(report.timestamp).toLocaleString('tr-TR')}
                </p>
            </div>
        `
    });

    marker.addListener('click', () => infoWindow.open(AppState.map, marker));
    AppState.markers.push({ type: 'report', marker, data: report });
}

function getIncidentTypeLabel(type) {
    const labels = {
        'suspicious': 'Şüpheli Aktivite',
        'theft': 'Hırsızlık',
        'accident': 'Kaza',
        'harassment': 'Taciz',
        'other': 'Diğer'
    };
    return labels[type] || type;
}

function addSampleReports() {
    const sampleReports = [
        {
            id: 1,
            type: 'suspicious',
            description: 'Şüpheli bir araç park halinde',
            anonymous: true,
            location: { lat: 41.0095, lng: 28.9795 },
            timestamp: new Date(Date.now() - 3600000).toISOString()
        }
    ];

    sampleReports.forEach(report => {
        AppState.reports.push(report);
        addReportMarker(report);
    });
}

// ===== STATISTICS MODAL =====
function showStatsModal() {
    document.getElementById('statsModal').classList.remove('hidden');

    // Wait for modal to be visible before creating charts
    setTimeout(() => {
        createCrimeTypeChart();
        createTimeAnalysisChart();
        renderNeighborhoodComparison();
        renderRecentIncidents();
        renderSafetyTips();
    }, 100);
}

function hideStatsModal() {
    document.getElementById('statsModal').classList.add('hidden');
}

function createCrimeTypeChart() {
    const ctx = document.getElementById('crimeTypeChart');
    if (!ctx) return;

    if (AppState.charts.crimeType) {
        AppState.charts.crimeType.destroy();
    }

    AppState.charts.crimeType = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Hırsızlık', 'Şüpheli Aktivite', 'Kaza', 'Taciz', 'Diğer'],
            datasets: [{
                data: [
                    MOCK_CRIME_DATA.crimeTypes.theft,
                    MOCK_CRIME_DATA.crimeTypes.suspicious,
                    MOCK_CRIME_DATA.crimeTypes.accident,
                    MOCK_CRIME_DATA.crimeTypes.harassment,
                    MOCK_CRIME_DATA.crimeTypes.other
                ],
                backgroundColor: [
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(168, 85, 247, 0.8)',
                    'rgba(107, 114, 128, 0.8)'
                ],
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#e5e7eb', padding: 15 }
                }
            }
        }
    });
}

function createTimeAnalysisChart() {
    const ctx = document.getElementById('timeAnalysisChart');
    if (!ctx) return;

    if (AppState.charts.timeAnalysis) {
        AppState.charts.timeAnalysis.destroy();
    }

    const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);

    AppState.charts.timeAnalysis = new Chart(ctx, {
        type: 'line',
        data: {
            labels: hours,
            datasets: [{
                label: 'Olay Sayısı',
                data: MOCK_CRIME_DATA.timeDistribution,
                borderColor: 'rgba(59, 130, 246, 1)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#9ca3af' },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                },
                x: {
                    ticks: { color: '#9ca3af', maxRotation: 45 },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                }
            }
        }
    });
}

function renderNeighborhoodComparison() {
    const container = document.getElementById('neighborhoodComparison');
    if (!container) return;

    const neighborhoods = Object.entries(AppState.neighborhoodData)
        .sort((a, b) => b[1].score - a[1].score);

    container.innerHTML = neighborhoods.map(([name, data]) => {
        const scoreClass = data.score >= 8 ? 'high' : data.score >= 6 ? 'medium' : 'low';
        const percentage = (data.score / 10) * 100;

        return `
            <div class="comparison-item">
                <div class="comparison-name">${name}</div>
                <div class="comparison-bar">
                    <div class="comparison-bar-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="comparison-score ${scoreClass}">${data.score.toFixed(1)}</div>
            </div>
        `;
    }).join('');
}

function renderRecentIncidents() {
    const container = document.getElementById('recentIncidents');
    if (!container) return;

    const recentIncidents = AppState.crimeData
        .sort((a, b) => b.time - a.time)
        .slice(0, 5);

    if (recentIncidents.length === 0) {
        container.innerHTML = '<p style="color: #9ca3af; text-align: center;">Henüz olay raporu yok</p>';
        return;
    }

    container.innerHTML = recentIncidents.map(incident => {
        const timeAgo = getTimeAgo(incident.time);
        return `
            <div class="incident-item">
                <div class="incident-header">
                    <span class="incident-type">${getIncidentTypeLabel(incident.type)}</span>
                    <span class="incident-time">${timeAgo}</span>
                </div>
                <div class="incident-description">
                    Anonim rapor - ${incident.type === 'theft' ? 'Hırsızlık olayı bildirildi' :
                incident.type === 'suspicious' ? 'Şüpheli aktivite gözlemlendi' :
                    incident.type === 'accident' ? 'Trafik kazası meydana geldi' :
                        'Olay bildirildi'}
                </div>
                <div class="incident-location">📍 Konum gizli (Gizlilik koruması)</div>
            </div>
        `;
    }).join('');
}

function renderSafetyTips() {
    const container = document.getElementById('safetyTips');
    if (!container) return;

    const tips = [
        {
            icon: '🌙',
            title: 'Gece Güvenliği',
            text: 'Gece saatlerinde aydınlık ve kalabalık yolları tercih edin.'
        },
        {
            icon: '📱',
            title: 'İletişim',
            text: 'Telefonunuzun şarjlı olduğundan ve acil numaraları kaydettiğinizden emin olun.'
        },
        {
            icon: '👥',
            title: 'Grup Halinde',
            text: 'Mümkün olduğunca grup halinde hareket edin, özellikle gece saatlerinde.'
        },
        {
            icon: '🎒',
            title: 'Değerli Eşyalar',
            text: 'Değerli eşyalarınızı göze çarpmayacak şekilde taşıyın.'
        },
        {
            icon: '🚶',
            title: 'Çevrenize Dikkat',
            text: 'Yürürken kulaklık kullanmayın, çevrenizin farkında olun.'
        }
    ];

    container.innerHTML = tips.map(tip => `
        <div class="safety-tip">
            <div class="safety-tip-icon">${tip.icon}</div>
            <div class="safety-tip-content">
                <div class="safety-tip-title">${tip.title}</div>
                <div class="safety-tip-text">${tip.text}</div>
            </div>
        </div>
    `).join('');
}

// ===== UTILITY FUNCTIONS =====
function getTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return 'Az önce';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} dakika önce`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} saat önce`;
    return `${Math.floor(seconds / 86400)} gün önce`;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 16px 24px;
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-md);
        color: var(--text-primary);
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
