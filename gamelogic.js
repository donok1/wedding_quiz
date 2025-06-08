// gamelogic.js - Core Game Logic

// Global game state
let gameState = {
    roomCode: null,
    userRole: null,
    isConnected: false,
    lastHeartbeat: 0
};

let roomData = {};

// Room management functions
function saveRoomData() {
    if (gameState.roomCode) {
        // Update heartbeat
        if (gameState.userRole) {
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
            // Ensure heartbeats object exists
            if (!roomData.heartbeats) {
                roomData.heartbeats = { fanny: 0, nelson: 0, admin: 0 };
            }
        } else {
            roomData = initializeRoomData();
        }
    }
}

// Player connection management
function isPlayerConnected(player) {
    if (!roomData.heartbeats || !roomData.heartbeats[player]) return false;
    const lastHeartbeat = roomData.heartbeats[player];
    const now = Date.now();
    return (now - lastHeartbeat) < CONFIG.CONNECTION_TIMEOUT;
}

// Answer submission
function submitAnswer(answer) {
    const currentQ = roomData.currentQuestion;
    
    if (gameState.userRole === 'fanny') {
        roomData.fannyAnswers[currentQ] = answer;
    } else if (gameState.userRole === 'nelson') {
        roomData.nelsonAnswers[currentQ] = answer;
    }

    // Check for match and update count
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
    document.getElementById('setupScreen').style.display = 'none';
    
    if (role === 'admin') {
        // Apply admin mode styling
        document.getElementById('mainContainer').classList.add('admin-mode');
        document.getElementById('mainHeader').classList.add('admin-mode');
        document.getElementById('mainContent').classList.add('admin-mode');
        document.getElementById('mainTitle').classList.add('admin-mode');
        document.getElementById('mainSubtitle').classList.add('admin-mode');
        
        document.getElementById('adminScreen').style.display = 'flex';
        document.getElementById('adminScreen').classList.add('admin-mode');
        
        if (!roomData.gameStarted) {
            roomData.gameStarted = true;
            saveRoomData();
        }
    } else {
        document.getElementById('questionScreen').style.display = 'block';
    }
    
    updateUI();
}

// Game restart
function restartQuiz() {
    roomData = initializeRoomData();
    saveRoomData();
    location.reload();
}