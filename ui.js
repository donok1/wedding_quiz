// ui.js - User Interface Management (Updated for Guests and Swipe) - FIXED WITH GUEST RESULTS

// View mode for admin final screen: 'couple' or 'guest'
let adminFinalResultView = 'couple';

// Main UI update dispatcher
function updateUI() {
    if (
        gameState.userRole === 'admin' &&
        roomData &&
        roomData.gameCompleted &&
        adminFinalResultView === 'guest'
    ) {
        return; // Don't overwrite guest matching result view
    }
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
        userAnswers = roomData.fannyAnswers || [];
        hasAnswered = userAnswers[currentQ] !== undefined;
    } else if (gameState.userRole === 'nelson') {
        userAnswers = roomData.nelsonAnswers || [];
        hasAnswered = userAnswers[currentQ] !== undefined;
    } else if (gameState.userRole === 'guest' && gameState.guestName) {
        userAnswers = (roomData.guestAnswers && roomData.guestAnswers[gameState.guestName]) || [];
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

// Helper function to get guests who match a specific answer for current question
function getGuestsWithAnswer(answer) {
    const currentQ = roomData.currentQuestion || 0;
    const matchingGuests = [];
    
    if (!roomData.guestAnswers) return matchingGuests;
    
    for (const guestName in roomData.guestAnswers) {
        if (roomData.guestAnswers[guestName] && 
            roomData.guestAnswers[guestName][currentQ] === answer) {
            matchingGuests.push(guestName);
        }
    }
    
    return matchingGuests;
}

// Helper function to format guest list
function formatGuestList(guests) {
    if (!guests || guests.length === 0) {
        return '<div class="no-guests">Aucun invité</div>';
    }
    
    return guests.map(name => `<div class="guest-name-item">${name}</div>`).join('');
}

// Update UI for admin screen
function updateAdminUI() {
    // SAFETY CHECKS - Ensure roomData and arrays exist
    if (!roomData) {
        console.warn('roomData is undefined');
        return;
    }

    if (roomData && roomData.gameCompleted && adminFinalResultView === 'guest') {
        // Don't overwrite the permanent guest score view
        return;
    }

    // Initialize arrays if they don't exist
    if (!roomData.fannyAnswers) {
        roomData.fannyAnswers = [];
    }
    if (!roomData.nelsonAnswers) {
        roomData.nelsonAnswers = [];
    }
    if (!roomData.guestAnswers) {
        roomData.guestAnswers = {};
    }
    if (!roomData.guestNames) {
        roomData.guestNames = [];
    }

    const currentQ = roomData.currentQuestion || 0;
    
    if (currentQ >= CONFIG.TOTAL_QUESTIONS || roomData.gameCompleted) {
        showFinalResults();
        return;
    }

    document.getElementById('adminQuestionNumber').textContent = currentQ + 1;
    document.getElementById('adminQuestionText').textContent = questions[currentQ] || '';

    // SAFE ARRAY ACCESS
    const hasFanny = roomData.fannyAnswers[currentQ] !== undefined;
    const hasNelson = roomData.nelsonAnswers[currentQ] !== undefined;

    if (hasFanny && hasNelson) {
        document.getElementById('adminWaiting').style.display = 'none';
        
        // Prepare the answers for display
        const fannyAnswer = roomData.fannyAnswers[currentQ];
        const nelsonAnswer = roomData.nelsonAnswers[currentQ];
        
        document.getElementById('fannyAnswer').textContent = fannyAnswer ? "J'aime ! 🌟" : "Je n'aime pas 🚫";
        document.getElementById('fannyAnswer').className = `answer-display ${fannyAnswer ? 'like-answer' : 'dislike-answer'}`;
        
        document.getElementById('nelsonAnswer').textContent = nelsonAnswer ? "J'aime ! 🌟" : "Je n'aime pas 🚫";
        document.getElementById('nelsonAnswer').className = `answer-display ${nelsonAnswer ? 'like-answer' : 'dislike-answer'}`;
        
        const isMatch = fannyAnswer === nelsonAnswer;
        const matchElement = document.getElementById('matchResult');
        matchElement.textContent = isMatch ? "🎉 C'est un match !" : "💔 Pas d'accord";
        matchElement.className = `match-indicator ${isMatch ? 'match' : 'no-match'}`;
        
        // Check if answers have already been revealed for this question
        if (gameState.answersRevealed) {
            // Show revealed answers with guest information
            document.getElementById('revealSection').style.display = 'none';
            document.getElementById('adminResults').style.display = 'grid';
            document.getElementById('matchResult').style.display = 'block';
            document.getElementById('nextBtn').style.display = 'block';
            
            // Add guest results below
            addGuestResultsSection(fannyAnswer, nelsonAnswer);
        } else {
            // Show reveal button instead of immediately showing results
            document.getElementById('revealSection').style.display = 'block';
            document.getElementById('adminResults').style.display = 'none';
            document.getElementById('matchResult').style.display = 'none';
            document.getElementById('nextBtn').style.display = 'none';
            
            // Remove any existing guest results section
            removeGuestResultsSection();
        }
    } else {
        document.getElementById('adminWaiting').style.display = 'block';
        document.getElementById('revealSection').style.display = 'none';
        document.getElementById('adminResults').style.display = 'none';
        document.getElementById('matchResult').style.display = 'none';
        document.getElementById('nextBtn').style.display = 'none';
        
        // Remove any existing guest results section
        removeGuestResultsSection();
    }
}

// NEW: Add guest results section below the answer boxes
function addGuestResultsSection(fannyAnswer, nelsonAnswer) {
    // Remove any existing guest results section first
    removeGuestResultsSection();
    
    const isMatch = fannyAnswer === nelsonAnswer;
    
    // Create the guest results section
    const guestSection = document.createElement('div');
    guestSection.id = 'guestResultsSection';
    guestSection.className = 'guest-results-section';
    
    if (isMatch) {
        // When bride and groom match, show a single centered list
        guestSection.classList.add('match-layout');
        
        const matchingGuests = getGuestsWithAnswer(fannyAnswer);
        
        const matchColumn = document.createElement('div');
        matchColumn.className = 'guest-column match-column';
        matchColumn.innerHTML = `
            <div class="guest-column-header match-header">Invités qui sont d'accord avec le couple</div>
            <div class="guest-names-list horizontal">${formatGuestList(matchingGuests)}</div>
        `;
        
        guestSection.appendChild(matchColumn);
    } else {
        // When bride and groom don't match, show two columns
        const guestsLikeFanny = getGuestsWithAnswer(fannyAnswer);
        const guestsLikeNelson = getGuestsWithAnswer(nelsonAnswer);
        
        // Fanny's column
        const fannyColumn = document.createElement('div');
        fannyColumn.className = 'guest-column';
        fannyColumn.innerHTML = `
            <div class="guest-column-header">Invités comme Fanny</div>
            <div class="guest-names-list">${formatGuestList(guestsLikeFanny)}</div>
        `;
        
        // Nelson's column
        const nelsonColumn = document.createElement('div');
        nelsonColumn.className = 'guest-column';
        nelsonColumn.innerHTML = `
            <div class="guest-column-header">Invités comme Nelson</div>
            <div class="guest-names-list">${formatGuestList(guestsLikeNelson)}</div>
        `;
        
        guestSection.appendChild(fannyColumn);
        guestSection.appendChild(nelsonColumn);
    }
    
    // Insert the guest section into the admin screen
    const adminScreen = document.getElementById('adminScreen');
    adminScreen.appendChild(guestSection);
    
    // Adjust match indicator position if there are guests
    const matchElement = document.getElementById('matchResult');
    const hasGuests = isMatch ? getGuestsWithAnswer(fannyAnswer).length > 0 : 
                                (getGuestsWithAnswer(fannyAnswer).length > 0 || 
                                 getGuestsWithAnswer(nelsonAnswer).length > 0);
    
    if (hasGuests) {
        matchElement.classList.add('with-guests');
    } else {
        matchElement.classList.remove('with-guests');
    }
}

// NEW: Remove guest results section
function removeGuestResultsSection() {
    const existingSection = document.getElementById('guestResultsSection');
    if (existingSection) {
        existingSection.remove();
    }
    
    // Reset match indicator position
    const matchElement = document.getElementById('matchResult');
    if (matchElement) {
        matchElement.classList.remove('with-guests');
    }
}

// Update player connection and answer status
function updatePlayerStatus() {
    if (gameState.userRole !== 'admin') return;

    const fannyConnected = isPlayerConnected('fanny');
    const nelsonConnected = isPlayerConnected('nelson');

    const currentQ = roomData.currentQuestion || 0;
    
    // SAFE ARRAY ACCESS
    const fannyAnswered = (roomData.fannyAnswers && roomData.fannyAnswers[currentQ] !== undefined) || false;
    const nelsonAnswered = (roomData.nelsonAnswers && roomData.nelsonAnswers[currentQ] !== undefined) || false;

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
    const totalGuests = (roomData.guestNames && roomData.guestNames.length) || 0;
    
    let guestStatusText = connectedGuests > 0 ? '🟢' : '🔴';
    guestStatusText += ` ${answeredGuests}/${connectedGuests}`;
    
    document.getElementById('guestStatus').textContent = guestStatusText;
    document.getElementById('guestStatus').className = `status-indicator ${connectedGuests > 0 ? 'connected-status' : 'disconnected-status'}`;
}

// Show final results screen
function showFinalResults() {
    if (adminFinalResultView === 'guest') {
        showTopGuestMatchView();
        return;
    }

    const matches = roomData.matches || 0;
    const compatibility = Math.round((matches / CONFIG.TOTAL_QUESTIONS) * 100);

    document.getElementById('adminScreen').innerHTML = `
        <div class="final-results">
            <h2>🎉 Quiz Terminé ! 🎉</h2>
            <div class="compatibility-score">${compatibility}%</div>
            <p>Fanny et Nelson sont d'accord sur <strong>${matches}</strong> questions sur <strong>${CONFIG.TOTAL_QUESTIONS}</strong> !</p>
            <p>${getCompatibilityMessage(compatibility)}</p>
            <button class="next-btn" onclick="restartQuiz()">Nouveau Quiz</button>
            <button class="next-btn" style="margin-top:30px;" onclick="showTopGuestMatchView()">Révéler les scores invités 👑</button>
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

// --- Compute guest matching ratios ---
function getGuestMatchingRatios() {
    const guestRatios = [];
    const totalQuestions = CONFIG.TOTAL_QUESTIONS;
    const fanny = roomData.fannyAnswers || [];
    const nelson = roomData.nelsonAnswers || [];
    const guestAnswers = roomData.guestAnswers || {};
    const guestNames = roomData.guestNames || [];

    for (const name of guestNames) {
        const answers = guestAnswers[name] || [];
        let matchFanny = 0;
        let matchNelson = 0;
        let countAnswered = 0;
        for (let i = 0; i < totalQuestions; i++) {
            if (typeof answers[i] !== "undefined") {
                countAnswered++;
                if (typeof fanny[i] !== "undefined" && answers[i] === fanny[i]) matchFanny++;
                if (typeof nelson[i] !== "undefined" && answers[i] === nelson[i]) matchNelson++;
            }
        }
        // Avoid showing guests that didn't answer anything
        if (countAnswered > 0) {
            guestRatios.push({
                name,
                fannyScore: Math.round((matchFanny / totalQuestions) * 100),
                nelsonScore: Math.round((matchNelson / totalQuestions) * 100)
            });
        }
    }
    return guestRatios;
}

// --- Render the top 10 guests matching view ---
function showTopGuestMatchView() {
    adminFinalResultView = 'guest';

    const guestRatios = getGuestMatchingRatios();
    const topFanny = [...guestRatios].sort((a, b) => b.fannyScore - a.fannyScore).slice(0, 10);
    const topNelson = [...guestRatios].sort((a, b) => b.nelsonScore - a.nelsonScore).slice(0, 10);

    let fannyCol = '<div class="guest-match-col"><h3>👰‍♀️ Top 10 Fanny</h3>';
    fannyCol += '<ol class="guest-match-list">';
    for (const guest of topFanny) {
        fannyCol += `<li><strong>${guest.name}</strong> <span class="score">${guest.fannyScore}%</span></li>`;
    }
    fannyCol += '</ol></div>';

    let nelsonCol = '<div class="guest-match-col"><h3>🤵‍♂️ Top 10 Nelson</h3>';
    nelsonCol += '<ol class="guest-match-list">';
    for (const guest of topNelson) {
        nelsonCol += `<li><strong>${guest.name}</strong> <span class="score">${guest.nelsonScore}%</span></li>`;
    }
    nelsonCol += '</ol></div>';

    const html = `
        <div class="top-guest-matching-view">
            <h2>🏆 Meilleurs invités compatibles</h2>
            <div class="guest-match-columns">
                ${fannyCol}
                ${nelsonCol}
            </div>
            <button class="next-btn" style="position:static;margin-top:40px;" onclick="showAdminFinalResults()">Retour au score du couple</button>
        </div>
    `;
    document.getElementById('adminScreen').innerHTML = html;
}


// Helper to go back to normal results
function showAdminFinalResults() {
    adminFinalResultView = 'couple';
    showFinalResults();
}

// --- Insert styles for the new view ---
(function injectGuestMatchingStyles() {
    if (document.getElementById('guest-matching-styles')) return;
    const style = document.createElement('style');
    style.id = 'guest-matching-styles';
    style.innerHTML = `
    .top-guest-matching-view { padding:40px 0; text-align:center; color:#2E7D32; }
    .top-guest-matching-view h2 { font-size:2.3rem; margin-bottom:30px;}
    .guest-match-columns { display:flex; justify-content:center; gap:60px; margin-top:30px;}
    .guest-match-col { background:rgba(255,255,255,0.92); border-radius:15px; padding:28px 32px; min-width:300px; box-shadow:0 4px 20px #c8e6c980;}
    .guest-match-col h3 { margin-bottom:16px; font-size:1.3rem; color:#E91E63; }
    .guest-match-col:last-child h3 { color:#2196F3;}
    .guest-match-list { list-style:decimal; margin:0; padding:0 0 0 18px;}
    .guest-match-list li { font-size:1.15rem; margin-bottom:9px; display:flex; justify-content:space-between; align-items:center;}
    .score { font-weight:bold; color:#4CAF50; font-size:1.1em; margin-left:18px;}
    `;
    document.head.appendChild(style);
})();
