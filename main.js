// main.js - Application Initialization and Event Handlers (Updated for Guests)

// Initialize the application
function initializeApp() {
    // Initialize connection status
    updateConnectionStatus(false);
    
    // Setup event listeners
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    // Handle page unload
    window.addEventListener('beforeunload', () => {
        stopSync();
    });

    // Handle page visibility change (pause sync when tab is hidden)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopSync();
        } else if (gameState.roomCode) {
            startSync();
        }
    });

    // Handle room code input enter key
    const roomInput = document.getElementById('roomCodeInput');
    if (roomInput) {
        roomInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                joinRoom();
            }
        });
    }

    // Handle guest name input enter key
    const guestNameInput = document.getElementById('guestNameInput');
    if (guestNameInput) {
        guestNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                submitGuestName();
            }
        });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Application is ready
console.log('Wedding Quiz Game with Guest Support loaded successfully! 🌿💕🎉');