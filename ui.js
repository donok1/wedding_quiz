// Enhanced ui.js - User Interface Management with Improved Visual Feedback

// View mode for admin final screen: 'couple' or 'guest'
let adminFinalResultView = 'couple';

// Animation state tracking
let currentAnimations = new Set();

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

// Enhanced animation helper functions
function addAnimation(element, animationName, duration = 600) {
    if (!element) return;
    
    const animationId = Math.random().toString(36).substr(2, 9);
    currentAnimations.add(animationId);
    
    element.style.animation = `${animationName} ${duration}ms ease-out forwards`;
    
    setTimeout(() => {
        if (currentAnimations.has(animationId)) {
            element.style.animation = '';
            currentAnimations.delete(animationId);
        }
    }, duration);
    
    return animationId;
}

function createProgressBar(current, total) {
    const percentage = Math.round((current / total) * 100);
    return `
        <div class="progress-container" style="margin: 10px 0;">
            <div class="progress-bar" style="
                width: 100%;
                height: 8px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 4px;
                overflow: hidden;
            ">
                <div class="progress-fill" style="
                    width: ${percentage}%;
                    height: 100%;
                    background: linear-gradient(90deg, #4CAF50, #66BB6A);
                    border-radius: 4px;
                    transition: width 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                "></div>
            </div>
            <div style="text-align: center; margin-top: 5px; font-size: 0.9rem; opacity: 0.9;">
                ${current} / ${total}
            </div>
        </div>
    `;
}

// Enhanced partner UI with better animations
function updatePartnerUI() {
    if (roomData.gameCompleted) {
        showCompletionMessage();
        return;
    }

    const currentQ = roomData.currentQuestion;
    if (currentQ >= CONFIG.TOTAL_QUESTIONS) return;

    // Update question counter with animation
    const questionNumberEl = document.getElementById('questionNumber');
    if (questionNumberEl && questionNumberEl.textContent !== (currentQ + 1).toString()) {
        questionNumberEl.style.transform = 'scale(1.2)';
        questionNumberEl.textContent = currentQ + 1;
        setTimeout(() => {
            questionNumberEl.style.transform = 'scale(1)';
        }, 200);
    }
    
    // Update question counter Total with animation
    const questionTotalEl = document.getElementById('questionTotal');
	if (questionTotalEl) questionTotalEl.textContent = questions.length;

    // Update question text with slide animation
    const questionTextEl = document.getElementById('questionText');
    if (questionTextEl && questionTextEl.textContent !== questions[currentQ]) {
        questionTextEl.style.opacity = '0';
        questionTextEl.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            questionTextEl.textContent = questions[currentQ];
            questionTextEl.style.opacity = '1';
            questionTextEl.style.transform = 'translateY(0)';
        }, 150);
    }

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
        // Hide input interfaces and show enhanced waiting message
        hideInputInterfaces();
        showWaitingMessage();
    } else {
        // Show appropriate interface and hide waiting message
        showInputInterfaces(currentQ);
        if (waitingMsg) waitingMsg.style.display = 'none';
    }
}

function hideInputInterfaces() {
    const swipeContainer = document.getElementById('swipeContainer');
    const answerButtons = document.getElementById('answerButtons');
    
    if (swipeContainer) {
        swipeContainer.style.display = 'none';
        swipeContainer.classList.add('hidden');
    }
    if (answerButtons) {
        answerButtons.style.display = 'none';
        answerButtons.classList.add('hidden');
    }
    if (typeof hideSwipeCard === 'function') {
        hideSwipeCard();
    }
}

function showInputInterfaces(currentQ) {
    if (typeof updateSwipeCard === 'function') {
        updateSwipeCard(questions[currentQ]);
    }
    
    if (typeof showSwipeCard === 'function') {
        showSwipeCard();
    }
}

function showWaitingMessage() {
    const waitingMsg = document.getElementById('waitingMessage');
    if (!waitingMsg) return;

    let content;
    if (gameState.userRole === 'guest') {
        content = `
            <div style="text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 15px; animation: bounce 2s infinite;">✅</div>
                <h3 style="color: #4CAF50; margin-bottom: 15px;">Réponse enregistrée !</h3>
                <p style="color: #2E7D32;">En attente de la prochaine question...</p>
                ${createProgressBar(roomData.currentQuestion, CONFIG.TOTAL_QUESTIONS)}
            </div>
        `;
    } else {
        content = `
            <div style="text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 15px; animation: pulse 2s infinite;">⏳</div>
                <h3>En attente de votre partenaire...</h3>
                <p>Veuillez patienter pendant que votre partenaire répond à la question.</p>
                ${createProgressBar(roomData.currentQuestion, CONFIG.TOTAL_QUESTIONS)}
            </div>
        `;
    }

    waitingMsg.innerHTML = content;
    waitingMsg.style.display = 'block';
    
    // Add animation if not already visible
    if (!waitingMsg.classList.contains('animated')) {
        addAnimation(waitingMsg, 'fadeInUp');
        waitingMsg.classList.add('animated');
    }

    // Add CSS animations if not exists
    addWaitingAnimations();
}

function addWaitingAnimations() {
    if (document.querySelector('#waiting-animations')) return;
    
    const style = document.createElement('style');
    style.id = 'waiting-animations';
    style.textContent = `
        @keyframes bounce {
            0%, 20%, 60%, 100% { transform: translateY(0); }
            40% { transform: translateY(-20px); }
            80% { transform: translateY(-10px); }
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.7; }
        }
        
        @keyframes fadeInUp {
            0% { opacity: 0; transform: translateY(30px); }
            100% { opacity: 1; transform: translateY(0); }
        }
        
        .animated {
            transition: all 0.3s ease;
        }
    `;
    document.head.appendChild(style);
}

function showCompletionMessage() {
    const message = gameState.userRole === 'guest' 
        ? "Merci d'avoir participé ! 🎉" 
        : "Quiz Terminé ! 🎉";
    
    const questionScreen = document.getElementById('questionScreen');
    if (!questionScreen) return;

    questionScreen.innerHTML = `
        <div class="final-results" style="
            background: linear-gradient(135deg, #66BB6A 0%, #4CAF50 100%);
            color: white;
            border-radius: 20px;
            padding: 60px 40px;
            text-align: center;
            animation: celebrationPop 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        ">
            <div style="font-size: 4rem; margin-bottom: 20px; animation: confetti 2s infinite;">🎉</div>
            <h2 style="font-size: 2.5rem; margin-bottom: 30px; font-weight: 700;">${message}</h2>
            <p style="font-size: 1.4rem; margin: 20px 0; opacity: 0.95;">
                Consultez l'écran d'affichage pour les résultats finaux !
            </p>
            ${createProgressBar(CONFIG.TOTAL_QUESTIONS, CONFIG.TOTAL_QUESTIONS)}
            <button onclick="location.reload()" style="
                background: rgba(255, 255, 255, 0.2);
                color: white;
                border: 2px solid white;
                padding: 15px 30px;
                border-radius: 15px;
                font-size: 1.2rem;
                font-weight: 600;
                cursor: pointer;
                margin-top: 30px;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
            " onmouseover="this.style.background='rgba(255,255,255,0.3)'" 
               onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                🔄 Nouveau Jeu
            </button>
        </div>
    `;

    // Add celebration animation
    addCelebrationAnimations();
}

function addCelebrationAnimations() {
    if (document.querySelector('#celebration-animations')) return;
    
    const style = document.createElement('style');
    style.id = 'celebration-animations';
    style.textContent = `
        @keyframes celebrationPop {
            0% {
                transform: scale(0.8);
                opacity: 0;
            }
            50% {
                transform: scale(1.05);
                opacity: 1;
            }
            100% {
                transform: scale(1);
                opacity: 1;
            }
        }
        
        @keyframes confetti {
            0%, 100% { transform: rotate(0deg) scale(1); }
            25% { transform: rotate(-10deg) scale(1.1); }
            75% { transform: rotate(10deg) scale(1.1); }
        }
    `;
    document.head.appendChild(style);
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

// Helper function to format guest list with enhanced styling
function formatGuestList(guests) {
    if (!guests || guests.length === 0) {
        return '<div class="no-guests" style="opacity: 0.6; font-style: italic;">Aucun invité</div>';
    }
    
    return guests.map(name => `
        <div class="guest-name-item" style="
            background: rgba(255, 255, 255, 0.9);
            padding: 8px 15px;
            border-radius: 15px;
            font-size: 0.9rem;
            color: #2E7D32;
            border: 1px solid rgba(76, 175, 80, 0.3);
            margin: 3px;
            transition: all 0.3s ease;
            cursor: default;
        " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'"
           onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
            ${name}
        </div>
    `).join('');
}

// Enhanced admin UI with better visual feedback
function updateAdminUI() {
    // Safety checks - ensure roomData and arrays exist
    if (!roomData) {
        console.warn('roomData is undefined');
        return;
    }

    if (roomData && roomData.gameCompleted && adminFinalResultView === 'guest') {
        return; // Don't overwrite the permanent guest score view
    }

    // Initialize arrays if they don't exist
    ensureArraysExist();

    const currentQ = roomData.currentQuestion || 0;
    
    if (currentQ >= CONFIG.TOTAL_QUESTIONS || roomData.gameCompleted) {
        showFinalResults();
        return;
    }

    // Update question display with animation
    updateAdminQuestionDisplay(currentQ);

    // Check if both partners have answered
    const hasFanny = roomData.fannyAnswers[currentQ] !== undefined;
    const hasNelson = roomData.nelsonAnswers[currentQ] !== undefined;

    if (hasFanny && hasNelson) {
        handleBothAnswered(currentQ);
    } else {
        handleWaitingForAnswers();
    }
}

function ensureArraysExist() {
    if (!roomData.fannyAnswers) roomData.fannyAnswers = [];
    if (!roomData.nelsonAnswers) roomData.nelsonAnswers = [];
    if (!roomData.guestAnswers) roomData.guestAnswers = {};
    if (!roomData.guestNames) roomData.guestNames = [];
}

function updateAdminQuestionDisplay(currentQ) {
    const adminQuestionNumber = document.getElementById('adminQuestionNumber');
    const adminQuestionText = document.getElementById('adminQuestionText');
    
    if (adminQuestionNumber && adminQuestionNumber.textContent !== (currentQ + 1).toString()) {
        addAnimation(adminQuestionNumber, 'numberPulse', 400);
        adminQuestionNumber.textContent = currentQ + 1;
    }
    
    const adminQuestionTotalEl = document.getElementById('adminQuestionTotal');
	if (adminQuestionTotalEl) adminQuestionTotalEl.textContent = questions.length;
    
    if (adminQuestionText && adminQuestionText.textContent !== (questions[currentQ] || '')) {
        adminQuestionText.style.transform = 'translateY(-10px)';
        adminQuestionText.style.opacity = '0.7';
        
        setTimeout(() => {
            adminQuestionText.textContent = questions[currentQ] || '';
            adminQuestionText.style.transform = 'translateY(0)';
            adminQuestionText.style.opacity = '1';
        }, 200);
    }
}

function handleBothAnswered(currentQ) {
    document.getElementById('adminWaiting').style.display = 'none';
    
    const fannyAnswer = roomData.fannyAnswers[currentQ];
    const nelsonAnswer = roomData.nelsonAnswers[currentQ];
    
    // Update answer displays with enhanced styling
    updateAnswerDisplay('fannyAnswer', fannyAnswer);
    updateAnswerDisplay('nelsonAnswer', nelsonAnswer);
    
    const isMatch = fannyAnswer === nelsonAnswer;
    updateMatchIndicator(isMatch);
    
    if (gameState.answersRevealed) {
        showRevealedAnswers(fannyAnswer, nelsonAnswer);
    } else {
        showRevealButton();
    }
}

function updateAnswerDisplay(elementId, answer) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const text = answer ? "J'aime ! ✅" : "Je n'aime pas ❌";
    const className = `answer-display ${answer ? 'like-answer' : 'dislike-answer'}`;
    
    if (element.textContent !== text) {
        element.style.transform = 'scale(0.9)';
        element.style.opacity = '0.7';
        
        setTimeout(() => {
            element.textContent = text;
            element.className = className;
            element.style.transform = 'scale(1)';
            element.style.opacity = '1';
        }, 150);
    }
}

function updateMatchIndicator(isMatch) {
    const matchElement = document.getElementById('matchResult');
    if (!matchElement) return;
    
    const text = isMatch ? "🎉 C'est un match !" : "💔 Pas d'accord";
    const className = `match-indicator ${isMatch ? 'match' : 'no-match'}`;
    
    if (matchElement.textContent !== text) {
        matchElement.textContent = text;
        matchElement.className = className;
        
        if (isMatch) {
            addAnimation(matchElement, 'matchCelebration', 800);
        }
    }
}

function showRevealedAnswers(fannyAnswer, nelsonAnswer) {
    document.getElementById('revealSection').style.display = 'none';
    document.getElementById('adminResults').style.display = 'grid';
    document.getElementById('matchResult').style.display = 'block';
    document.getElementById('nextBtn').style.display = 'block';
    
    // addGuestResultsSection(fannyAnswer, nelsonAnswer);
}

function showRevealButton() {
    document.getElementById('revealSection').style.display = 'block';
    document.getElementById('adminResults').style.display = 'none';
    document.getElementById('matchResult').style.display = 'none';
    document.getElementById('nextBtn').style.display = 'none';
    
    removeGuestResultsSection();
}

function handleWaitingForAnswers() {
    document.getElementById('adminWaiting').style.display = 'block';
    document.getElementById('revealSection').style.display = 'none';
    document.getElementById('adminResults').style.display = 'none';
    document.getElementById('matchResult').style.display = 'none';
    document.getElementById('nextBtn').style.display = 'none';
    
    removeGuestResultsSection();
}

// Add guest results section with enhanced styling
function addGuestResultsSection(fannyAnswer, nelsonAnswer) {
    removeGuestResultsSection();
    
    const isMatch = fannyAnswer === nelsonAnswer;
    const guestSection = document.createElement('div');
    guestSection.id = 'guestResultsSection';
    guestSection.className = 'guest-results-section';
    guestSection.style.animation = 'slideInUp 0.6s ease-out';
    
    if (isMatch) {
        guestSection.classList.add('match-layout');
        const matchingGuests = getGuestsWithAnswer(fannyAnswer);
        
        const matchColumn = document.createElement('div');
        matchColumn.className = 'guest-column match-column';
        matchColumn.innerHTML = `
            <div class="guest-column-header match-header" style="
                background: linear-gradient(135deg, #4CAF50, #66BB6A);
                color: white;
                padding: 10px;
                border-radius: 10px;
                margin-bottom: 15px;
                font-weight: 600;
            ">
                🤝 Invités qui sont d'accord avec le couple
            </div>
            <div class="guest-names-list horizontal" style="
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: 8px;
            ">${formatGuestList(matchingGuests)}</div>
        `;
        
        guestSection.appendChild(matchColumn);
    } else {
        const guestsLikeFanny = getGuestsWithAnswer(fannyAnswer);
        const guestsLikeNelson = getGuestsWithAnswer(nelsonAnswer);
        
        // Fanny's column
        const fannyColumn = document.createElement('div');
        fannyColumn.className = 'guest-column';
        fannyColumn.innerHTML = `
            <div class="guest-column-header" style="
                background: linear-gradient(135deg, #E91E63, #F06292);
                color: white;
                border-radius: 8px;
                font-weight: 600;
                text-align: center;
            ">
                👰‍♀️ Team Fanny
            </div>
            <div class="guest-names-list" style="
                display: flex;
                flex-direction: column;
                gap: 6px;
            ">${formatGuestList(guestsLikeFanny)}</div>
        `;
        
        // Nelson's column
        const nelsonColumn = document.createElement('div');
        nelsonColumn.className = 'guest-column';
        nelsonColumn.innerHTML = `
            <div class="guest-column-header" style="
                background: linear-gradient(135deg, #2196F3, #64B5F6);
                color: white;
                border-radius: 8px;
                font-weight: 600;
                text-align: center;
            ">
                🤵‍♂️ Team Nelson
            </div>
            <div class="guest-names-list" style="
                display: flex;
                flex-direction: column;
                gap: 6px;
            ">${formatGuestList(guestsLikeNelson)}</div>
        `;
        
        guestSection.appendChild(fannyColumn);
        guestSection.appendChild(nelsonColumn);
    }
    
    // Insert with animation
    const adminScreen = document.getElementById('adminScreen');
    adminScreen.appendChild(guestSection);
    
    // Adjust match indicator position
    adjustMatchIndicatorPosition(isMatch, fannyAnswer, nelsonAnswer);
    
    // Add slide animation if not exists
    addSlideAnimations();
}

function adjustMatchIndicatorPosition(isMatch, fannyAnswer, nelsonAnswer) {
    const matchElement = document.getElementById('matchResult');
    if (!matchElement) return;
    
    const hasGuests = isMatch ? 
        getGuestsWithAnswer(fannyAnswer).length > 0 : 
        (getGuestsWithAnswer(fannyAnswer).length > 0 || getGuestsWithAnswer(nelsonAnswer).length > 0);
    
    if (hasGuests) {
        matchElement.classList.add('with-guests');
        matchElement.style.background = 'rgba(255, 255, 255, 0.95)';
        matchElement.style.backdropFilter = 'blur(10px)';
        matchElement.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
    } else {
        matchElement.classList.remove('with-guests');
    }
}

function addSlideAnimations() {
    if (document.querySelector('#slide-animations')) return;
    
    const style = document.createElement('style');
    style.id = 'slide-animations';
    style.textContent = `
        @keyframes slideInUp {
            0% {
                opacity: 0;
                transform: translateY(30px);
            }
            100% {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes numberPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.2); }
        }
        
        @keyframes matchCelebration {
            0%, 100% { transform: scale(1); }
            25% { transform: scale(1.1) rotate(-2deg); }
            75% { transform: scale(1.1) rotate(2deg); }
        }
    `;
    document.head.appendChild(style);
}

// Remove guest results section
function removeGuestResultsSection() {
    const existingSection = document.getElementById('guestResultsSection');
    if (existingSection) {
        existingSection.style.animation = 'slideOutDown 0.3s ease-in';
        setTimeout(() => {
            if (existingSection.parentNode) {
                existingSection.remove();
            }
        }, 300);
    }
    
    // Reset match indicator position
    const matchElement = document.getElementById('matchResult');
    if (matchElement) {
        matchElement.classList.remove('with-guests');
    }
}

// Enhanced player status update with visual indicators
function updatePlayerStatus() {
    if (gameState.userRole !== 'admin') return;

    const fannyConnected = isPlayerConnected('fanny');
    const nelsonConnected = isPlayerConnected('nelson');
    const currentQ = roomData.currentQuestion || 0;
    
    const fannyAnswered = (roomData.fannyAnswers && roomData.fannyAnswers[currentQ] !== undefined) || false;
    const nelsonAnswered = (roomData.nelsonAnswers && roomData.nelsonAnswers[currentQ] !== undefined) || false;

    // Update Fanny status with enhanced indicators
    updatePlayerStatusIndicator('fannyStatus', fannyConnected, fannyAnswered, 'fanny');
    
    // Update Nelson status with enhanced indicators
    updatePlayerStatusIndicator('nelsonStatus', nelsonConnected, nelsonAnswered, 'nelson');

    // Update guest status with detailed info
    updateGuestStatusIndicator();
}

function updatePlayerStatusIndicator(elementId, connected, answered, playerName) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    let statusIcon = connected ? '🟢' : '🔴';
    let actionIcon = answered ? '✅' : '⏳';
    let statusText = `${statusIcon} ${actionIcon}`;
    
    if (element.textContent !== statusText) {
        element.textContent = statusText;
        
        // Add visual feedback
        if (answered && !element.classList.contains('answered')) {
            element.classList.add('answered');
            addAnimation(element, 'statusComplete', 500);
        } else if (!answered) {
            element.classList.remove('answered');
        }
        
        element.className = `status-indicator ${connected ? 'connected-status' : 'disconnected-status'}`;
        
        if (answered) {
            element.style.background = '#DCEDC8';
            element.style.color = '#33691E';
            element.style.fontWeight = 'bold';
        }
    }
}

function updateGuestStatusIndicator() {
    const element = document.getElementById('guestStatus');
    if (!element) return;
    
    const connectedGuests = getConnectedGuestsCount();
    const answeredGuests = getGuestsAnsweredCount();
    
    let statusIcon = connectedGuests > 0 ? '🟢' : '🔴';
    let statusText = `${statusIcon} ${answeredGuests}/${connectedGuests}`;
    
    if (element.textContent !== statusText) {
        element.textContent = statusText;
        element.className = `status-indicator ${connectedGuests > 0 ? 'connected-status' : 'disconnected-status'}`;
        
        // Add progress indicator for guests
        if (connectedGuests > 0) {
            const progressPercent = Math.round((answeredGuests / connectedGuests) * 100);
            element.style.background = `linear-gradient(90deg, #DCEDC8 ${progressPercent}%, #FFF9C4 ${progressPercent}%)`;
        }
    }
}

// Enhanced final results with better animations
function showFinalResults() {
    if (adminFinalResultView === 'guest') {
        showTopGuestMatchView();
        return;
    }

    const matches = roomData.matches || 0;
    const compatibility = Math.round((matches / CONFIG.TOTAL_QUESTIONS) * 100);

    const adminScreen = document.getElementById('adminScreen');
    adminScreen.innerHTML = `
        <div class="final-results" style="
            background: linear-gradient(135deg, #66BB6A 0%, #4CAF50 100%);
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: white;
            text-align: center;
            padding: 60px 40px;
            animation: finalReveal 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        ">
            <div style="font-size: 4rem; margin-bottom: 30px; animation: confettiCelebration 2s infinite;">🎉</div>
            <h2 style="font-size: 3.5rem; margin-bottom: 40px; font-weight: 700; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);">
                Quiz Terminé !
            </h2>
            <div style="
                font-size: 6rem; 
                font-weight: bold; 
                margin: 40px 0; 
                text-shadow: 3px 3px 6px rgba(0,0,0,0.3);
                animation: scoreReveal 1.5s ease-out 0.5s both;
            ">${compatibility}%</div>
            <p style="font-size: 1.8rem; margin: 25px 0; opacity: 0.95; max-width: 600px; line-height: 1.4;">
                Fanny et Nelson sont d'accord sur <strong>${matches}</strong> questions sur <strong>${CONFIG.TOTAL_QUESTIONS}</strong> !
            </p>
            <div style="display: flex; gap: 20px; margin-top: 40px; flex-wrap: wrap; justify-content: center;">
                <button onclick="showTopGuestMatchView()" style="
                    background: linear-gradient(135deg, #FF9800, #FFB74D);
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 15px;
                    font-size: 1.2rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 8px 25px rgba(255, 152, 0, 0.4);
                    min-width: 180px;
                " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 12px 35px rgba(255, 152, 0, 0.5)'" 
                   onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 25px rgba(255, 152, 0, 0.4)'">
                    👑 Scores Invités
                </button>
            </div>
        </div>
    `;

    // Add final animations
    addFinalAnimations();
}

function addFinalAnimations() {
    if (document.querySelector('#final-animations')) return;
    
    const style = document.createElement('style');
    style.id = 'final-animations';
    style.textContent = `
        @keyframes finalReveal {
            0% {
                opacity: 0;
                transform: scale(0.9);
            }
            100% {
                opacity: 1;
                transform: scale(1);
            }
        }
        
        @keyframes scoreReveal {
            0% {
                opacity: 0;
                transform: scale(0.5) rotate(-10deg);
            }
            60% {
                opacity: 1;
                transform: scale(1.1) rotate(5deg);
            }
            100% {
                opacity: 1;
                transform: scale(1) rotate(0deg);
            }
        }
        
        @keyframes confettiCelebration {
            0%, 100% { 
                transform: rotate(0deg) scale(1); 
                filter: hue-rotate(0deg);
            }
            25% { 
                transform: rotate(-15deg) scale(1.1); 
                filter: hue-rotate(90deg);
            }
            75% { 
                transform: rotate(15deg) scale(1.1); 
                filter: hue-rotate(180deg);
            }
        }
        
        @keyframes statusComplete {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); background: #4CAF50; }
            100% { transform: scale(1); }
        }
        
        @keyframes slideOutDown {
            0% {
                opacity: 1;
                transform: translateY(0);
            }
            100% {
                opacity: 0;
                transform: translateY(30px);
            }
        }
    `;
    document.head.appendChild(style);
}

// Enhanced connection status with better visual feedback
function updateConnectionStatus(connected) {
    gameState.isConnected = connected;
    const statusEl = document.getElementById('connectionStatus');
    if (!statusEl) return;
    
    const wasConnected = statusEl.classList.contains('connected');
    
    if (connected) {
        statusEl.textContent = '🟢 Connecté';
        statusEl.className = 'connection-status connected';
        
        if (!wasConnected) {
            addAnimation(statusEl, 'connectionEstablished', 600);
        }
    } else {
        statusEl.textContent = '🔴 Déconnecté';
        statusEl.className = 'connection-status disconnected';
        
        if (wasConnected) {
            addAnimation(statusEl, 'connectionLost', 600);
        }
    }
}

// Enhanced room indicator
function updateRoomIndicator() {
    const indicator = document.getElementById('roomIndicator');
    if (!indicator || !gameState.roomCode) return;
    
    indicator.textContent = `Salle: ${gameState.roomCode}`;
    indicator.style.display = 'block';
    addAnimation(indicator, 'indicatorSlideIn', 500);
}

// Enhanced error message with better styling
function showError(message) {
    const errorEl = document.getElementById('errorMessage');
    if (!errorEl) return;
    
    errorEl.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.5rem;">⚠️</span>
            <span>${message}</span>
        </div>
    `;
    errorEl.style.display = 'block';
    addAnimation(errorEl, 'errorShake', 500);
    
    setTimeout(() => {
        errorEl.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            errorEl.style.display = 'none';
            errorEl.style.animation = '';
        }, 300);
    }, 5000);
}

// Compute guest matching ratios (existing function, no changes needed)
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

// Enhanced top guest matching view
function showTopGuestMatchView() {
    adminFinalResultView = 'guest';

    const guestRatios = getGuestMatchingRatios();
    const topFanny = [...guestRatios].sort((a, b) => b.fannyScore - a.fannyScore).slice(0, 10);
    const topNelson = [...guestRatios].sort((a, b) => b.nelsonScore - a.nelsonScore).slice(0, 10);

    let fannyCol = `
        <div class="guest-match-col" style="
            background: linear-gradient(135deg, rgba(233, 30, 99, 0.1), rgba(240, 98, 146, 0.1));
            border: 2px solid #E91E63;
        ">
            <h3 style="color: #E91E63; text-align: center; margin-bottom: 20px; font-size: 1.4rem;">
                👰‍♀️ Top 10 - Team Fanny
            </h3>
            <ol class="guest-match-list">`;
    
    for (const guest of topFanny) {
        fannyCol += `
            <li style="
                display: flex; 
                justify-content: space-between; 
                align-items: center; 
                padding: 1px 0; 
                border-bottom: 1px solid rgba(233, 30, 99, 0.1);
                transition: all 0.3s ease;
            " onmouseover="this.style.background='rgba(233, 30, 99, 0.05)'; this.style.transform='translateX(5px)'"
               onmouseout="this.style.background='transparent'; this.style.transform='translateX(0)'">
                <strong>${guest.name}</strong>
                <span class="score" style="
                    background: linear-gradient(135deg, #E91E63, #F06292);
                    color: white;
                    padding: 4px 12px;
                    border-radius: 15px;
                    font-weight: bold;
                    font-size: 0.9rem;
                ">${guest.fannyScore}%</span>
            </li>`;
    }
    fannyCol += '</ol></div>';

    let nelsonCol = `
        <div class="guest-match-col" style="
            background: linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(100, 181, 246, 0.1));
            border: 2px solid #2196F3;
        ">
            <h3 style="color: #2196F3; text-align: center; margin-bottom: 20px; font-size: 1.4rem;">
                🤵‍♂️ Top 10 - Team Nelson
            </h3>
            <ol class="guest-match-list">`;
    
    for (const guest of topNelson) {
        nelsonCol += `
            <li style="
                display: flex; 
                justify-content: space-between; 
                align-items: center; 
                padding: 1px 0; 
                border-bottom: 1px solid rgba(33, 150, 243, 0.1);
                transition: all 0.3s ease;
            " onmouseover="this.style.background='rgba(33, 150, 243, 0.05)'; this.style.transform='translateX(5px)'"
               onmouseout="this.style.background='transparent'; this.style.transform='translateX(0)'">
                <strong>${guest.name}</strong>
                <span class="score" style="
                    background: linear-gradient(135deg, #2196F3, #64B5F6);
                    color: white;
                    padding: 4px 12px;
                    border-radius: 15px;
                    font-weight: bold;
                    font-size: 0.9rem;
                ">${guest.nelsonScore}%</span>
            </li>`;
    }
    nelsonCol += '</ol></div>';

    const html = `
        <div class="top-guest-matching-view" style="
            padding: 40px 20px;
            text-align: center;
            color: #2E7D32;
            animation: guestViewSlideIn 0.8s ease-out;
        ">
            <h2 style="
                font-size: 2.8rem;
                margin-bottom: 40px;
                font-weight: 700;
                background: linear-gradient(135deg, #4CAF50, #66BB6A);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            ">🏆 Meilleurs invités compatibles</h2>
            <div class="guest-match-columns" style="
                display: flex;
                justify-content: center;
                gap: 60px;
                margin-top: 30px;
                flex-wrap: wrap;
            ">
                ${fannyCol}
                ${nelsonCol}
            </div>
            <button onclick="showAdminFinalResults()" style="
                background: linear-gradient(135deg, #66BB6A, #4CAF50);
                color: white;
                border: none;
                padding: 15px 40px;
                border-radius: 15px;
                font-size: 1.2rem;
                font-weight: 600;
                cursor: pointer;
                margin-top: 40px;
                transition: all 0.3s ease;
                box-shadow: 0 8px 25px rgba(76, 175, 80, 0.3);
            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 12px 35px rgba(76, 175, 80, 0.4)'"
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 25px rgba(76, 175, 80, 0.3)'">
                ← Retour au score du couple
            </button>
        </div>
    `;
    
    document.getElementById('adminScreen').innerHTML = html;
    
    // Add guest view animations
    addGuestViewAnimations();
}

function addGuestViewAnimations() {
    if (document.querySelector('#guest-view-animations')) return;
    
    const style = document.createElement('style');
    style.id = 'guest-view-animations';
    style.textContent = `
        @keyframes guestViewSlideIn {
            0% {
                opacity: 0;
                transform: translateX(100px);
            }
            100% {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes indicatorSlideIn {
            0% {
                opacity: 0;
                transform: translateX(-50%) translateY(-20px);
            }
            100% {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        }
        
        @keyframes connectionEstablished {
            0% { background: rgba(255, 205, 210, 0.9); transform: scale(0.9); }
            50% { background: rgba(200, 230, 201, 1); transform: scale(1.05); }
            100% { background: rgba(200, 230, 201, 0.9); transform: scale(1); }
        }
        
        @keyframes connectionLost {
            0% { background: rgba(200, 230, 201, 0.9); transform: scale(1); }
            50% { background: rgba(255, 205, 210, 1); transform: scale(1.05); }
            100% { background: rgba(255, 205, 210, 0.9); transform: scale(1); }
        }
        
        @keyframes fadeOut {
            0% { opacity: 1; }
            100% { opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// Helper to go back to normal results
function showAdminFinalResults() {
    adminFinalResultView = 'couple';
    showFinalResults();
}