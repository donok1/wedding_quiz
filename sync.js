// sync.js - Real-time Synchronization

// Sync intervals
let syncInterval;
let heartbeatInterval;

// Heartbeat management
function sendHeartbeat() {
    if (gameState.userRole && gameState.roomCode) {
        roomData.heartbeats[gameState.userRole] = Date.now();
        localStorage.setItem(`weddingQuiz_${gameState.roomCode}`, JSON.stringify(roomData));
    }
}

// Main synchronization function
function syncRoomData() {
    if (!gameState.roomCode) return;
    
    try {
        loadRoomData();
        updateUI();
        updatePlayerStatus();
        updateConnectionStatus(true);
    } catch (error) {
        console.error('Sync error:', error);
        updateConnectionStatus(false);
    }
}

// Start synchronization
function startSync() {
    if (syncInterval) clearInterval(syncInterval);
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    
    syncInterval = setInterval(syncRoomData, CONFIG.SYNC_INTERVAL);
    heartbeatInterval = setInterval(sendHeartbeat, CONFIG.HEARTBEAT_INTERVAL);
}

// Stop synchronization
function stopSync() {
    if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
    }
    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
    }
}