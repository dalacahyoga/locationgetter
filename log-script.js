// Elements
const logsContainer = document.getElementById('logsContainer');
const emptyState = document.getElementById('emptyState');
const totalLogsEl = document.getElementById('totalLogs');
const latestUpdateEl = document.getElementById('latestUpdate');
const refreshBtn = document.getElementById('refreshBtn');
const exportBtn = document.getElementById('exportBtn');
const clearBtn = document.getElementById('clearBtn');

// Load logs on page load
document.addEventListener('DOMContentLoaded', loadLogs);

// Event listeners
refreshBtn.addEventListener('click', () => {
    refreshBtn.style.animation = 'spin 0.5s ease';
    setTimeout(() => {
        refreshBtn.style.animation = '';
        loadLogs();
    }, 500);
});

exportBtn.addEventListener('click', exportLogs);
clearBtn.addEventListener('click', clearLogs);

async function loadLogs() {
    try {
        // Try to load from server first
        const response = await fetch('/.netlify/functions/save-location', {
            method: 'GET'
        });

        let logs = [];
        
        if (response.ok) {
            const result = await response.json();
            logs = result.data || [];
            console.log('✅ Loaded logs from server:', logs.length);
        } else {
            // Fallback to localStorage
            console.log('⚠️ Loading from localStorage (fallback)');
            logs = JSON.parse(localStorage.getItem('locationLogs') || '[]');
        }
        
        if (logs.length === 0) {
            emptyState.classList.remove('hidden');
            logsContainer.innerHTML = '';
            totalLogsEl.textContent = '0';
            latestUpdateEl.textContent = '-';
            return;
        }

        emptyState.classList.add('hidden');
        totalLogsEl.textContent = logs.length;
        
        // Latest update
        if (logs[0]) {
            const latestDate = new Date(logs[0].timestamp);
            latestUpdateEl.textContent = formatRelativeTime(latestDate);
        }

        // Render logs
        logsContainer.innerHTML = logs.map((log, index) => createLogCard(log, index)).join('');

    } catch (error) {
        console.error('Failed to load logs:', error);
        // Fallback to localStorage
        try {
            const logs = JSON.parse(localStorage.getItem('locationLogs') || '[]');
            if (logs.length > 0) {
                emptyState.classList.add('hidden');
                totalLogsEl.textContent = logs.length;
                if (logs[0]) {
                    const latestDate = new Date(logs[0].timestamp);
                    latestUpdateEl.textContent = formatRelativeTime(latestDate);
                }
                logsContainer.innerHTML = logs.map((log, index) => createLogCard(log, index)).join('');
            } else {
                emptyState.classList.remove('hidden');
                logsContainer.innerHTML = '';
            }
        } catch (e) {
            emptyState.classList.remove('hidden');
            logsContainer.innerHTML = '';
        }
    }
}

function createLogCard(log, index) {
    const date = new Date(log.timestamp);
    const formattedDate = date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    const formattedTime = date.toLocaleTimeString('id-ID');
    
    // Parse user agent for better display
    const deviceInfo = parseUserAgent(log.userAgent);
    
    return `
        <div class="log-card">
            <div class="log-header">
                <div class="log-time">
                    <div class="log-date">${formattedDate}</div>
                    <div class="log-timestamp">${formattedTime}</div>
                </div>
                <div class="log-actions">
                    <a href="https://www.google.com/maps?q=${log.latitude},${log.longitude}" 
                       target="_blank" 
                       rel="noopener noreferrer"
                       class="btn-small btn-primary">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                        Maps
                    </a>
                    <button onclick="copyCoordinates(${log.latitude}, ${log.longitude}, ${index})" 
                            class="btn-small btn-secondary"
                            id="copyBtn${index}">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        Copy
                    </button>
                    <button onclick="deleteLog(${log.id})" class="btn-small btn-secondary">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            </div>
            
            <div class="log-grid">
                <div class="log-item">
                    <div class="log-label">Latitude</div>
                    <div class="log-value">${log.latitude.toFixed(6)}</div>
                </div>
                <div class="log-item">
                    <div class="log-label">Longitude</div>
                    <div class="log-value">${log.longitude.toFixed(6)}</div>
                </div>
                <div class="log-item">
                    <div class="log-label">Akurasi</div>
                    <div class="log-value">±${Math.round(log.accuracy)} meter</div>
                </div>
                <div class="log-item">
                    <div class="log-label">Platform</div>
                    <div class="log-value">${log.platform || 'Unknown'}</div>
                </div>
            </div>
            
            <div class="log-device">
                <strong>Device:</strong> ${deviceInfo}
            </div>
        </div>
    `;
}

function parseUserAgent(ua) {
    if (!ua) return 'Unknown Device';
    
    // Simple parsing
    if (ua.includes('Mobile') || ua.includes('Android')) {
        if (ua.includes('Chrome')) return 'Mobile Chrome';
        if (ua.includes('Safari')) return 'Mobile Safari';
        if (ua.includes('Firefox')) return 'Mobile Firefox';
        return 'Mobile Browser';
    }
    
    if (ua.includes('Chrome')) return 'Desktop Chrome';
    if (ua.includes('Safari')) return 'Desktop Safari';
    if (ua.includes('Firefox')) return 'Desktop Firefox';
    if (ua.includes('Edge')) return 'Desktop Edge';
    
    return 'Desktop Browser';
}

function formatRelativeTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays < 7) return `${diffDays} hari yang lalu`;
    
    return date.toLocaleDateString('id-ID');
}

function copyCoordinates(lat, lng, index) {
    const coordinates = `${lat}, ${lng}`;
    const btn = document.getElementById(`copyBtn${index}`);
    
    navigator.clipboard.writeText(coordinates).then(() => {
        const originalHTML = btn.innerHTML;
        btn.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Copied!
        `;
        btn.style.background = '#10b981';
        btn.style.color = 'white';
        
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.background = '';
            btn.style.color = '';
        }, 2000);
    });
}

async function deleteLog(logId) {
    if (!confirm('Hapus log ini?')) return;
    
    try {
        // Delete from server
        const response = await fetch('/.netlify/functions/delete-location', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: logId })
        });

        if (response.ok) {
            console.log('✅ Log deleted from server');
        }
        
        // Also delete from localStorage
        let logs = JSON.parse(localStorage.getItem('locationLogs') || '[]');
        logs = logs.filter(log => log.id !== logId);
        localStorage.setItem('locationLogs', JSON.stringify(logs));
        
        loadLogs();
    } catch (error) {
        console.error('Failed to delete log:', error);
        alert('Gagal menghapus log');
    }
}

async function exportLogs() {
    try {
        // Try to get from server first
        const response = await fetch('/.netlify/functions/save-location', {
            method: 'GET'
        });

        let logs = [];
        if (response.ok) {
            const result = await response.json();
            logs = result.data || [];
        } else {
            // Fallback to localStorage
            logs = JSON.parse(localStorage.getItem('locationLogs') || '[]');
        }

        const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `location-logs-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Failed to export logs:', error);
        alert('Gagal export logs');
    }
}

async function clearLogs() {
    if (!confirm('Hapus semua log? Tindakan ini tidak dapat dibatalkan.')) return;
    
    try {
        // Clear from server
        const response = await fetch('/.netlify/functions/delete-location', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ clearAll: true })
        });

        if (response.ok) {
            console.log('✅ All logs cleared from server');
        }
        
        // Also clear localStorage
        localStorage.removeItem('locationLogs');
        
        loadLogs();
    } catch (error) {
        console.error('Failed to clear logs:', error);
        alert('Gagal menghapus logs');
    }
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

