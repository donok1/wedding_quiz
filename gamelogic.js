// gamelogic.js - Core Game Logic (Updated for Guests and Swipe)

// Global game state
let gameState = {
    roomCode: null,
    userRole: null,
    guestName: null,       // For guest users
    isConnected: false,
    lastHeartbeat: 0
};

let roomData = {};

// Room management functions
function saveRoomData() {
    if (gameState.roomCode) {
        // Update heartbeat
        if (gameState.userRole === 'guest' && gameState.guestName) {
            if (!roomData.heartbeats.guests) roomData.heartbeats.guests = {};
            roomData.heartbeats.guests[gameState.guestName] = Date.now();
        } else if (gameState.userRole && gameState.userRole !== 'guest') {
            roomData.heartbeats[gameState.userRole] = Date.now();
        }
        localStorage.setItem(`weddingQuiz_${gameState.roomCode}`, JSON.stringify(roomData));
    }
}

function loadRoomData() {
    if (gameState.roomCode) {
        const saved = localStorage.getItem(`weddingQuiz_${gameState.roomCode}`);
        if (saved) {
            roomData = JSON.parse(saved);
            // Ensure all required objects exist
            if (!roomData.heartbeats) {
                roomData.heartbeats = { fanny: 0, nelson: 0, admin: 0, guests: {} };
            }
            if (!roomData.heartbeats.guests) {
                roomData.heartbeats.guests = {};
            }
            if (!roomData.guestAnswers) {
                roomData.guestAnswers = {};
            }
            if (!roomData.guestNames) {
                roomData.guestNames = [];
            }
        } else {
            roomData = initializeRoomData();
        }
    }
}

// Player connection management
function isPlayerConnected(player) {
    if (!roomData.heartbeats) return false;
    
    let lastHeartbeat;
    if (player === 'guest') {
        // For guests, check if any guest is connected
        if (!roomData.heartbeats.guests) return false;
        const guestHeartbeats = Object.values(roomData.heartbeats.guests);
        if (guestHeartbeats.length === 0) return false;
        lastHeartbeat = Math.max(...guestHeartbeats);
    } else {
        if (!roomData.heartbeats[player]) return false;
        lastHeartbeat = roomData.heartbeats[player];
    }
    
    const now = Date.now();
    return (now - lastHeartbeat) < CONFIG.CONNECTION_TIMEOUT;
}

function isGuestConnected(guestName) {
    if (!roomData.heartbeats || !roomData.heartbeats.guests || !roomData.heartbeats.guests[guestName]) {
        return false;
    }
    const lastHeartbeat = roomData.heartbeats.guests[guestName];
    const now = Date.now();
    return (now - lastHeartbeat) < CONFIG.CONNECTION_TIMEOUT;
}

// Get connected guests count
function getConnectedGuestsCount() {
    if (!roomData.heartbeats || !roomData.heartbeats.guests) return 0;
    
    let count = 0;
    for (const guestName in roomData.heartbeats.guests) {
        if (isGuestConnected(guestName)) {
            count++;
        }
    }
    return count;
}

// Get guests who answered current question
function getGuestsAnsweredCount() {
    if (!roomData.guestAnswers) return 0;
    
    const currentQ = roomData.currentQuestion;
    let count = 0;
    
    for (const guestName in roomData.guestAnswers) {
        if (roomData.guestAnswers[guestName] && roomData.guestAnswers[guestName][currentQ] !== undefined) {
            count++;
        }
    }
    return count;
}

// Guest name registration
function registerGuestName(name) {
    const trimmedName = name.trim();
    if (!trimmedName) {
        showError('Veuillez entrer votre nom');
        return false;
    }
    
    // Check if name is already taken
    if (roomData.guestNames.includes(trimmedName)) {
        showError('Ce nom est déjà pris. Veuillez choisir un autre nom.');
        return false;
    }
    
    // Register the guest
    gameState.guestName = trimmedName;
    if (!roomData.guestNames.includes(trimmedName)) {
        roomData.guestNames.push(trimmedName);
    }
    if (!roomData.guestAnswers[trimmedName]) {
        roomData.guestAnswers[trimmedName] = [];
    }
    
    saveRoomData();
    return true;
}

// Answer submission
function submitAnswer(answer) {
    const currentQ = roomData.currentQuestion;
    
    if (gameState.userRole === 'fanny') {
        roomData.fannyAnswers[currentQ] = answer;
    } else if (gameState.userRole === 'nelson') {
        roomData.nelsonAnswers[currentQ] = answer;
    } else if (gameState.userRole === 'guest' && gameState.guestName) {
        if (!roomData.guestAnswers[gameState.guestName]) {
            roomData.guestAnswers[gameState.guestName] = [];
        }
        roomData.guestAnswers[gameState.guestName][currentQ] = answer;
    }

    // Check for match between Fanny and Nelson and update count
    if (roomData.fannyAnswers[currentQ] !== undefined && roomData.nelsonAnswers[currentQ] !== undefined) {
        if (roomData.fannyAnswers[currentQ] === roomData.nelsonAnswers[currentQ]) {
            // Recalculate total matches to prevent double counting
            let matchCount = 0;
            for (let i = 0; i <= currentQ; i++) {
                if (roomData.fannyAnswers[i] !== undefined && roomData.nelsonAnswers[i] !== undefined) {
                    if (roomData.fannyAnswers[i] === roomData.nelsonAnswers[i]) {
                        matchCount++;
                    }
                }
            }
            roomData.matches = matchCount;
        }
    }

    saveRoomData();
    updateUI();
}

// Progress to next question
function nextQuestion() {
    roomData.currentQuestion++;
    
    if (roomData.currentQuestion >= CONFIG.TOTAL_QUESTIONS) {
        roomData.gameCompleted = true;
    }
    
    saveRoomData();
    updateUI();
}

// Room creation and joining
function joinRoom() {
    const roomCode = document.getElementById('roomCodeInput').value.trim().toUpperCase();
    if (!roomCode) {
        showError('Veuillez entrer un code de salle');
        return;
    }

    gameState.roomCode = roomCode;
    loadRoomData();
    saveRoomData();
    
    document.getElementById('roleSelection').style.display = 'block';
    updateRoomIndicator();
    startSync();
    updateConnectionStatus(true);
}

// Role selection
function selectRole(role) {
    gameState.userRole = role;
    
    if (role === 'guest') {
        // Show guest name input
        document.getElementById('guestNameSection').style.display = 'block';
        return;
    }
    
    // Hide setup screen for non-guest roles
    document.getElementById('setupScreen').style.display = 'none';
    
    // Hide subtitle for all roles
    const subtitle = document.getElementById('mainSubtitle');
    if (subtitle) subtitle.style.display = 'none';
    
    if (role === 'admin') {
        // Apply admin mode styling
        document.getElementById('mainContainer').classList.add('admin-mode');
        document.getElementById('mainHeader').classList.add('admin-mode');
        document.getElementById('mainContent').classList.add('admin-mode');
        document.getElementById('mainTitle').classList.add('admin-mode');
        
        document.getElementById('adminScreen').style.display = 'flex';
        document.getElementById('adminScreen').classList.add('admin-mode');
        
        if (!roomData.gameStarted) {
            roomData.gameStarted = true;
            saveRoomData();
        }
    } else {
        // Player role (fanny or nelson)
        document.getElementById('questionScreen').style.display = 'block';
        
        // Initialize swipe functionality for players
        setTimeout(() => {
            if (typeof initializeSwipe === 'function') {
                initializeSwipe();
            }
        }, 100);
    }
    
    updateUI();
}

// Guest name submission
function submitGuestName() {
    const nameInput = document.getElementById('guestNameInput');
    const name = nameInput.value.trim();
    
    if (registerGuestName(name)) {
        // Successfully registered, proceed to game
        document.getElementById('setupScreen').style.display = 'none';
        document.getElementById('questionScreen').style.display = 'block';
        
        // Hide subtitle
        const subtitle = document.getElementById('mainSubtitle');
        if (subtitle) subtitle.style.display = 'none';
        
        // Initialize swipe functionality for guests
        setTimeout(() => {
            if (typeof initializeSwipe === 'function') {
                initializeSwipe();
            }
        }, 100);
        
        updateUI();
    }
}

// Game restart
function restartQuiz() {
    roomData = initializeRoomData();
    saveRoomData();
    location.reload();
}