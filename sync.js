// sync.js - Firebase Real-time Synchronization - FIXED

let syncInterval;
let heartbeatInterval;
let roomRef;
let roomListener;

function sendHeartbeat() {
    if (gameState.userRole && gameState.roomCode && typeof database !== 'undefined' && database) {
        try {
            if (gameState.userRole === 'guest' && gameState.guestName) {
                database.ref(`rooms/${gameState.roomCode}/heartbeats/guests/${gameState.guestName}`).set(Date.now());
            } else {
                database.ref(`rooms/${gameState.roomCode}/heartbeats/${gameState.userRole}`).set(Date.now());
            }
        } catch (error) {
            console.error('Error sending heartbeat:', error);
            updateConnectionStatus(false);
        }
    }
}

function syncRoomData() {
    if (!gameState.roomCode) return;

    try {
        // If game is completed, do not update the admin status UI anymore
        if (roomData && roomData.gameCompleted) return;

        // Data is updated via Firebase listener - just update UI and status
        updateUI();
        updatePlayerStatus();
        updateConnectionStatus(true);
        
        // Add this line to update button visibility
        updateRoleButtonVisibility();
    } catch (error) {
        console.error('Sync error:', error);
        updateConnectionStatus(false);
    }
}

function startSync() {
    if (syncInterval) clearInterval(syncInterval);
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    
    syncInterval = setInterval(syncRoomData, CONFIG.SYNC_INTERVAL);
    heartbeatInterval = setInterval(sendHeartbeat, CONFIG.HEARTBEAT_INTERVAL);
    
    // Set up Firebase listener
    if (gameState.roomCode && typeof database !== 'undefined' && database) {
        roomRef = database.ref(`rooms/${gameState.roomCode}`);
        
        roomListener = roomRef.on('value', (snapshot) => {
            try {
                const data = snapshot.val();
                if (data) {
                    // SAFELY UPDATE ROOM DATA
                    roomData = data;
                    
                    // Ensure all required structures exist after receiving data
                    if (!roomData.fannyAnswers) roomData.fannyAnswers = [];
                    if (!roomData.nelsonAnswers) roomData.nelsonAnswers = [];
                    if (!roomData.guestAnswers) roomData.guestAnswers = {};
                    if (!roomData.guestNames) roomData.guestNames = [];
                    if (!roomData.heartbeats) roomData.heartbeats = { fanny: 0, nelson: 0, admin: 0, guests: {} };
                    if (!roomData.heartbeats.guests) roomData.heartbeats.guests = {};
                    if (typeof roomData.currentQuestion === 'undefined') roomData.currentQuestion = 0;
                    if (typeof roomData.matches === 'undefined') roomData.matches = 0;
                    if (typeof roomData.gameStarted === 'undefined') roomData.gameStarted = false;
                    if (typeof roomData.gameCompleted === 'undefined') roomData.gameCompleted = false;
                    
                    // Update UI safely
                    if (!(roomData && roomData.gameCompleted)) {
                        updateUI();
                        updatePlayerStatus();
                        // Add this line here too
                        updateRoleButtonVisibility();
                    }
                } else {
                    // No data exists yet, initialize
                    roomData = initializeRoomData();
                    if (typeof saveRoomData === 'function') {
                        saveRoomData();
                    }
                }
            } catch (error) {
                console.error('Error processing Firebase data:', error);
                updateConnectionStatus(false);
            }
        }, (error) => {
            console.error('Firebase listener error:', error);
            updateConnectionStatus(false);
        });
    } else {
        console.error('Cannot start sync: Firebase database not available or no room code');
    }
}

function stopSync() {
    if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
    }
    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
    }
    if (roomRef && roomListener) {
        try {
            roomRef.off('value', roomListener);
        } catch (error) {
            console.error('Error stopping Firebase listener:', error);
        }
        roomRef = null;
        roomListener = null;
    }
}