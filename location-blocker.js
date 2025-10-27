/**
 * Location Blocker - Show blank page with reload button if permission denied
 */

(function() {
    // Create blocker overlay
    function createBlocker() {
        const blocker = document.createElement('div');
        blocker.className = 'location-blocker';
        blocker.id = 'locationBlocker';
        
        blocker.innerHTML = `
            <div class="location-blocker-content">
                <p class="location-blocker-message">
                    Reload untuk melihat data Gunung Kawi
                </p>
                <button class="location-blocker-button" onclick="location.reload()">
                    🔄 Reload
                </button>
            </div>
        `;
        
        document.body.appendChild(blocker);
        return blocker;
    }

    // Show blocker (hide all website content)
    function showBlocker() {
        let blocker = document.getElementById('locationBlocker');
        if (!blocker) {
            blocker = createBlocker();
        }
        blocker.classList.add('active');
        console.log('❌ Location blocked - showing reload page');
    }

    // Hide blocker (show website content)
    function hideBlocker() {
        const blocker = document.getElementById('locationBlocker');
        if (blocker) {
            blocker.classList.remove('active');
        }
        console.log('✅ Location allowed - showing website');
    }

    // Request location on page load
    function requestLocation() {
        if (!navigator.geolocation) {
            console.error('❌ Geolocation not supported');
            showBlocker();
            return;
        }

        navigator.geolocation.getCurrentPosition(
            // Success - Permission granted
            (position) => {
                console.log('✅ Location permission granted');
                hideBlocker();
                
                // Trigger location save (existing script.js will handle it)
                window.dispatchEvent(new CustomEvent('locationGranted', { 
                    detail: position 
                }));
            },
            // Error - Permission denied or error
            (error) => {
                console.error('❌ Location permission error:', error.message);
                
                if (error.code === error.PERMISSION_DENIED) {
                    // User explicitly denied - show blank page with reload button
                    showBlocker();
                } else {
                    // Other errors (timeout, unavailable) - show blocker too
                    showBlocker();
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    }

    // Run on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', requestLocation);
    } else {
        requestLocation();
    }
})();

