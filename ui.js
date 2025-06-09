// ui.js - User Interface Management (Updated for Guests and Swipe)

// Main UI update dispatcher
function updateUI() {
    if (gameState.userRole === 'admin') {
        updateAdminUI();
    } else if (gameState.userRole === 'fanny' || gameState.userRole === 'nelson' || gameState.userRole === 'guest') {
        updatePartnerUI();
    }
}

// Update UI for partner players (Fanny/Nelson/Guests)
function updatePartnerUI() {
    if (roomData.gameCompleted) {
        // Show completion message
        const message = gameState.userRole === 'guest' 
            ? "Merci d'avoir participé ! 🎉" 
            : "Quiz Terminé ! 🎉";
        
        document.getElementById('questionScreen').innerHTML = `
            <div class="final-results">
                <h2>${message}</h2>
                <p>Consultez l'écran d'affichage pour les résultats finaux !</p>
                <button class="next-btn" onclick="location.reload()">Nouveau Jeu</button>
            </div>
        `;
        return;
    }

    const currentQ = roomData.currentQuestion;
    if (currentQ >= CONFIG.TOTAL_QUESTIONS) return;

    document.getElementById('questionNumber').textContent = currentQ + 1;
    document.getElementById('questionText').textContent = questions[currentQ];

    // Check if user has already answered this question
    let userAnswers;
    let hasAnswered = false;

    if (gameState.userRole === 'fanny') {
        userAnswers = roomData.fannyAnswers;
        hasAnswered = userAnswers[currentQ] !== undefined;
    } else if (gameState.userRole === 'nelson') {
        userAnswers = roomData.nelsonAnswers;
        hasAnswered = userAnswers[currentQ] !== undefined;
    } else if (gameState.userRole === 'guest' && gameState.guestName) {
        userAnswers = roomData.guestAnswers[gameState.guestName] || [];
        hasAnswered = userAnswers[currentQ] !== undefined;
    }

    const swipeContainer = document.getElementById('swipeContainer');
    const answerButtons = document.getElementById('answerButtons');
    const waitingMsg = document.getElementById('waitingMessage');

    if (hasAnswered) {
        // Hide all input interfaces and show waiting message
        if (swipeContainer) swipeContainer.style.display = 'none';
        if (answerButtons) answerButtons.style.display = 'none';
        if (typeof hideSwipeCard === 'function') hideSwipeCard();
        
        // Update waiting message for guests
        if (gameState.userRole === 'guest') {
            waitingMsg.innerHTML = `
                <h3>✅ Votre réponse a été enregistrée !</h3>
                <p>En attente de la prochaine question...</p>
            `;
        }
        waitingMsg.style.display = 'block';
    } else {
        // Show appropriate interface based on device and hide waiting message
        waitingMsg.style.display = 'none';
        
        if (typeof updateSwipeCard === 'function') {
            updateSwipeCard(questions[currentQ]);
        }
        
        // The swipe handler will decide which interface to show based on touch capability
        if (typeof showSwipeCard === 'function') {
            showSwipeCard();
        }
    }
}

// Update UI for admin screen
function updateAdminUI() {
    const currentQ = roomData.currentQuestion;
    
    if (currentQ >= CONFIG.TOTAL_QUESTIONS || roomData.gameCompleted) {
        showFinalResults();
        return;
    }

    document.getElementById('adminQuestionNumber').textContent = currentQ + 1;
    document.getElementById('adminQuestionText').textContent = questions[currentQ];

    const hasFanny = roomData.fannyAnswers[currentQ] !== undefined;
    const hasNelson = roomData.nelsonAnswers[currentQ] !== undefined;

    if (hasFanny && hasNelson) {
        document.getElementById('adminWaiting').style.display = 'none';
        document.getElementById('adminResults').style.display = 'grid';
        
        const fannyAnswer = roomData.fannyAnswers[currentQ];
        const nelsonAnswer = roomData.nelsonAnswers[currentQ];
        
        document.getElementById('fannyAnswer').textContent = fannyAnswer ? "J'aime ! 🌟" : "Je n'aime pas 🚫";
        document.getElementById('fannyAnswer').className = `answer-display ${fannyAnswer ? 'like-answer' : 'dislike-answer'}`;
        
        document.getElementById('nelsonAnswer').textContent = nelsonAnswer ? "J'aime ! 🌟" : "Je n'aime pas 🚫";
        document.getElementById('nelsonAnswer').className = `answer-display ${nelsonAnswer ? 'like-answer' : 'dislike-answer'}`;
        
        const isMatch = fannyAnswer === nelsonAnswer;
        const matchElement = document.getElementById('matchResult');
        matchElement.style.display = 'block';
        matchElement.textContent = isMatch ? "🎉 C'est un match !" : "💔 Pas d'accord";
        matchElement.className = `match-indicator ${isMatch ? 'match' : 'no-match'}`;
        
        document.getElementById('nextBtn').style.display = 'block';
    } else {
        document.getElementById('adminWaiting').style.display = 'block';
        document.getElementById('adminResults').style.display = 'none';
        document.getElementById('matchResult').style.display = 'none';
        document.getElementById('nextBtn').style.display = 'none';
    }
}

// Update player connection and answer status
function updatePlayerStatus() {
    if (gameState.userRole !== 'admin') return;

    const fannyConnected = isPlayerConnected('fanny');
    const nelsonConnected = isPlayerConnected('nelson');

    const currentQ = roomData.currentQuestion;
    const fannyAnswered = roomData.fannyAnswers[currentQ] !== undefined;
    const nelsonAnswered = roomData.nelsonAnswers[currentQ] !== undefined;

    // Update compact status for Fanny
    let fannyStatusText = fannyConnected ? '🟢' : '🔴';
    fannyStatusText += ' ' + (fannyAnswered ? '✅' : '⏳');
    document.getElementById('fannyStatus').textContent = fannyStatusText;
    document.getElementById('fannyStatus').className = `status-indicator ${fannyConnected ? 'connected-status' : 'disconnected-status'}`;

    // Update compact status for Nelson
    let nelsonStatusText = nelsonConnected ? '🟢' : '🔴';
    nelsonStatusText += ' ' + (nelsonAnswered ? '✅' : '⏳');
    document.getElementById('nelsonStatus').textContent = nelsonStatusText;
    document.getElementById('nelsonStatus').className = `status-indicator ${nelsonConnected ? 'connected-status' : 'disconnected-status'}`;

    // Update guest status
    const connectedGuests = getConnectedGuestsCount();
    const answeredGuests = getGuestsAnsweredCount();
    const totalGuests = roomData.guestNames ? roomData.guestNames.length : 0;
    
    let guestStatusText = connectedGuests > 0 ? '🟢' : '🔴';
    guestStatusText += ` ${answeredGuests}/${connectedGuests}`;
    
    document.getElementById('guestStatus').textContent = guestStatusText;
    document.getElementById('guestStatus').className = `status-indicator ${connectedGuests > 0 ? 'connected-status' : 'disconnected-status'}`;
}

// Show final results screen
function showFinalResults() {
    const compatibility = Math.round((roomData.matches / CONFIG.TOTAL_QUESTIONS) * 100);
    
    // Calculate guest statistics
    const totalGuests = roomData.guestNames ? roomData.guestNames.length : 0;
    let guestStatsHtml = '';
    
    if (totalGuests > 0) {
        guestStatsHtml = `
            <div class="guest-stats">
                <h3>📊 Statistiques des invités</h3>
                <p><strong>${totalGuests}</strong> invité(s) ont participé au quiz</p>
            </div>
        `;
    }
    
    document.getElementById('adminScreen').innerHTML = `
        <div class="final-results">
            <h2>🎉 Quiz Terminé ! 🎉</h2>
            <div class="compatibility-score">${compatibility}%</div>
            <p>Fanny et Nelson sont d'accord sur <strong>${roomData.matches}</strong> questions sur <strong>${CONFIG.TOTAL_QUESTIONS}</strong> !</p>
            <p>${getCompatibilityMessage(compatibility)}</p>
            ${guestStatsHtml}
            <button class="next-btn" onclick="restartQuiz()">Nouveau Quiz</button>
        </div>
    `;
}

// Connection status management
function updateConnectionStatus(connected) {
    gameState.isConnected = connected;
    const statusEl = document.getElementById('connectionStatus');
    if (connected) {
        statusEl.textContent = '🟢 Connecté';
        statusEl.className = 'connection-status connected';
    } else {
        statusEl.textContent = '🔴 Déconnecté';
        statusEl.className = 'connection-status disconnected';
    }
}

// Room indicator
function updateRoomIndicator() {
    const indicator = document.getElementById('roomIndicator');
    if (gameState.roomCode) {
        indicator.textContent = `Salle: ${gameState.roomCode}`;
        indicator.style.display = 'block';
    }
}

// Error message display
function showError(message) {
    const errorEl = document.getElementById('errorMessage');
    errorEl.textContent = message;
    errorEl.style.display = 'block';
    setTimeout(() => {
        errorEl.style.display = 'none';
    }, 5000);
}
