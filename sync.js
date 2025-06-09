// sync.js - Firebase Real-time Synchronization
let syncInterval;
let heartbeatInterval;
let roomRef;
let roomListener;

function sendHeartbeat() {
    if (gameState.userRole && gameState.roomCode) {
        const heartbeatPath = `heartbeats/${gameState.userRole}`;
        if (gameState.userRole === 'guest' && gameState.guestName) {
            roomRef.child(`heartbeats/guests/${gameState.guestName}`).set(Date.now());
        } else {
            roomRef.child(heartbeatPath).set(Date.now());
        }
    }
}

function syncRoomData() {
    if (!gameState.roomCode) return;
    
    try {
        updateUI();
        updatePlayerStatus();
        updateConnectionStatus(true);
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
    if (gameState.roomCode) {
        roomRef = database.ref(`rooms/${gameState.roomCode}`);
        
        roomListener = roomRef.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                roomData = data;
                updateUI();
                updatePlayerStatus();
            }
        });
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
        roomRef.off('value', roomListener);
    }
}