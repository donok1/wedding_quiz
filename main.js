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

document.addEventListener('keydown', function(e) {
  // Example: use F key for fullscreen
  if (e.key === 'f' || e.key === 'F') {
    const el = document.documentElement;
    if (!document.fullscreenElement) {
      if (el.requestFullscreen) el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen(); // Safari
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
  }
});

// Activate presenter view
document.addEventListener('keydown', function (e) {
  // Only react if we're in the login/role selection phase
  // Replace with your actual check for login screen visibility/active step
  const roleSection = document.getElementById('roleSelection');
  if (roleSection && roleSection.style.display !== 'none') {
    if (e.key.toLowerCase() === 'a') {
      selectRole('admin'); // Call the same function as the button
    }
  }
});

// Application is ready
console.log('Wedding Quiz Game with Guest Support loaded successfully! 🌿💕🎉');