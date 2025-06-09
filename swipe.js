// swipe.js - Tinder-like Swipe Functionality (Clean Implementation)

class SwipeHandler {
    constructor() {
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.swipeThreshold = 80;
        this.card = null;
        this.answered = false;
        this.isTouchDevice = this.detectTouchDevice();
        this.log('SwipeHandler initialized - Touch device:', this.isTouchDevice);
    }

    log(message, ...args) {
        console.log(`[SwipeHandler] ${message}`, ...args);
    }

    detectTouchDevice() {
        const tests = {
            'ontouchstart in window': 'ontouchstart' in window,
            'navigator.maxTouchPoints > 0': navigator.maxTouchPoints > 0,
            'navigator.msMaxTouchPoints > 0': navigator.msMaxTouchPoints > 0,
            'window.DocumentTouch': window.DocumentTouch && document instanceof DocumentTouch
        };
        
        let isTouchDevice = false;
        for (const [test, result] of Object.entries(tests)) {
            this.log(`${test}: ${result}`);
            if (result) isTouchDevice = true;
        }
        
        return isTouchDevice;
    }

    init() {
        this.log('Initializing SwipeHandler');
        this.createSwipeCard();
        
        if (this.isTouchDevice) {
            this.log('Setting up touch interface');
            this.showSwipeInterface();
            this.attachEventListeners();
        } else {
            this.log('Setting up button interface');
            this.showButtonInterface();
        }
    }

    createSwipeCard() {
        const questionScreen = document.getElementById('questionScreen');
        if (!questionScreen) {
            this.log('Question screen not found');
            return;
        }

        // Find or create swipe container
        let swipeContainer = questionScreen.querySelector('.swipe-container');
        if (!swipeContainer) {
            swipeContainer = document.createElement('div');
            swipeContainer.className = 'swipe-container hidden';
            swipeContainer.id = 'swipeContainer';
            
            // Insert after question counter
            const questionCounter = questionScreen.querySelector('.question-counter');
            if (questionCounter) {
                questionCounter.parentNode.insertBefore(swipeContainer, questionCounter.nextSibling);
            } else {
                questionScreen.appendChild(swipeContainer);
            }
        }

        // Get current question text
        const questionTextElement = document.getElementById('questionText');
        const currentQuestion = questionTextElement ? questionTextElement.textContent : 'Question en cours...';

        // Create swipe card with question content
        swipeContainer.innerHTML = `
            <div class="swipe-card" id="swipeCard">
                <div class="card-content">
                    <div class="card-question">${currentQuestion}</div>
                    <div class="card-instruction">👈 Je n'aime pas &nbsp;&nbsp;&nbsp;&nbsp; J'aime 👉</div>
                </div>
            </div>
        `;

        this.card = document.getElementById('swipeCard');
        this.log('Swipe card created:', !!this.card);
    }

    showSwipeInterface() {
        this.log('Showing swipe interface');
        
        const questionText = document.getElementById('questionText');
        const swipeContainer = document.getElementById('swipeContainer');
        const answerButtons = document.getElementById('answerButtons');
        
        if (questionText) {
            questionText.classList.add('hidden');
            this.log('Hidden question text');
        }
        if (swipeContainer) {
            swipeContainer.classList.remove('hidden');
            swipeContainer.style.display = 'block';
            this.log('Shown swipe container');
        }
        if (answerButtons) {
            answerButtons.classList.add('hidden');
            answerButtons.style.display = 'none';
            this.log('Hidden answer buttons');
        }
    }

    showButtonInterface() {
        this.log('Showing button interface');
        
        const questionText = document.getElementById('questionText');
        const swipeContainer = document.getElementById('swipeContainer');
        const answerButtons = document.getElementById('answerButtons');
        
        if (questionText) {
            questionText.classList.remove('hidden');
            questionText.style.display = 'block';
            this.log('Shown question text');
        }
        if (swipeContainer) {
            swipeContainer.classList.add('hidden');
            swipeContainer.style.display = 'none';
            this.log('Hidden swipe container');
        }
        if (answerButtons) {
            answerButtons.classList.remove('hidden');
            answerButtons.style.display = 'flex';
            this.log('Shown answer buttons');
        }
    }

    attachEventListeners() {
        if (!this.card) {
            this.log('No card available for event listeners');
            return;
        }

        this.log('Attaching event listeners');

        // Touch events (primary for mobile)
        this.card.addEventListener('touchstart', this.handleStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.handleMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleEnd.bind(this));

        // Mouse events (for testing)
        this.card.addEventListener('mousedown', this.handleStart.bind(this));
        document.addEventListener('mousemove', this.handleMove.bind(this));
        document.addEventListener('mouseup', this.handleEnd.bind(this));

        // Prevent default drag behavior
        this.card.addEventListener('dragstart', (e) => e.preventDefault());
    }

    handleStart(e) {
        if (this.answered) return;

        this.log('Swipe start:', e.type);
        this.isDragging = true;
        this.card.classList.add('swiping');

        const clientX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
        const clientY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;

        this.startX = clientX;
        this.startY = clientY;
        this.currentX = clientX;
        this.currentY = clientY;

        e.preventDefault();
    }

    handleMove(e) {
        if (!this.isDragging || this.answered) return;

        const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
        const clientY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;

        this.currentX = clientX;
        this.currentY = clientY;

        const deltaX = this.currentX - this.startX;
        const deltaY = this.currentY - this.startY;

        // Calculate rotation and opacity
        const rotation = deltaX * 0.1;
        const opacity = Math.max(0.7, 1 - Math.abs(deltaX) / 300);

        // Apply transform
        this.card.style.transform = `translateX(${deltaX}px) translateY(${deltaY}px) rotate(${rotation}deg)`;
        this.card.style.opacity = opacity;

        // Visual feedback
        if (Math.abs(deltaX) > this.swipeThreshold / 2) {
            if (deltaX > 0) {
                this.card.style.borderColor = '#4CAF50';
                this.card.style.background = 'linear-gradient(135deg, #C8E6C9, #A5D6A7)';
            } else {
                this.card.style.borderColor = '#F44336';
                this.card.style.background = 'linear-gradient(135deg, #FFCDD2, #EF9A9A)';
            }
        } else {
            this.card.style.borderColor = 'rgba(76, 175, 80, 0.3)';
            this.card.style.background = 'linear-gradient(135deg, #E8F5E8, #C8E6C9)';
        }

        e.preventDefault();
    }

    handleEnd(e) {
        if (!this.isDragging || this.answered) return;

        this.log('Swipe end:', e.type);
        this.isDragging = false;
        this.card.classList.remove('swiping');

        const deltaX = this.currentX - this.startX;

        // Check if swipe threshold is met
        if (Math.abs(deltaX) > this.swipeThreshold) {
            const isLike = deltaX > 0;
            this.log('Swipe completed:', isLike ? 'LIKE' : 'DISLIKE', `(distance: ${Math.abs(deltaX)}px)`);
            this.completeSwipe(isLike);
        } else {
            this.log('Swipe cancelled - insufficient distance:', Math.abs(deltaX), 'px');
            this.resetCard();
        }
    }

    completeSwipe(isLike) {
        this.answered = true;
        
        // Animate card off screen
        const direction = isLike ? 1 : -1;
        const exitX = direction * (window.innerWidth + 100);
        const exitRotation = direction * 30;

        this.card.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
        this.card.style.transform = `translateX(${exitX}px) rotate(${exitRotation}deg)`;
        this.card.style.opacity = '0';

        // Show feedback
        this.showSwipeFeedback(isLike);

        // Submit answer after animation
        setTimeout(() => {
            this.submitAnswer(isLike);
        }, 300);
    }

    resetCard() {
        this.card.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out, background 0.3s ease-out, border-color 0.3s ease-out';
        this.card.style.transform = 'translateX(0px) translateY(0px) rotate(0deg)';
        this.card.style.opacity = '1';
        this.card.style.borderColor = 'rgba(76, 175, 80, 0.3)';
        this.card.style.background = 'linear-gradient(135deg, #E8F5E8, #C8E6C9)';

        // Remove transition after animation
        setTimeout(() => {
            this.card.style.transition = '';
        }, 300);
    }

    showSwipeFeedback(isLike) {
        const feedback = document.createElement('div');
        feedback.className = `swipe-feedback ${isLike ? 'like-feedback' : 'dislike-feedback'}`;
        feedback.innerHTML = `
            <div class="feedback-icon">${isLike ? '💚' : '💔'}</div>
            <div class="feedback-text">${isLike ? 'J\'aime !' : 'Je n\'aime pas'}</div>
        `;

        // Add feedback styles if not already added
        if (!document.querySelector('.swipe-feedback-styles')) {
            const style = document.createElement('style');
            style.className = 'swipe-feedback-styles';
            style.textContent = `
                .swipe-feedback {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(255, 255, 255, 0.95);
                    border-radius: 20px;
                    padding: 30px;
                    text-align: center;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
                    z-index: 1000;
                    animation: feedbackPop 0.6s ease-out forwards;
                }

                .feedback-icon {
                    font-size: 3rem;
                    margin-bottom: 10px;
                }

                .feedback-text {
                    font-size: 1.2rem;
                    font-weight: bold;
                    color: #2E7D32;
                }

                .like-feedback {
                    border: 3px solid #4CAF50;
                }

                .dislike-feedback {
                    border: 3px solid #F44336;
                }

                .dislike-feedback .feedback-text {
                    color: #D32F2F;
                }

                @keyframes feedbackPop {
                    0% {
                        transform: translate(-50%, -50%) scale(0.5);
                        opacity: 0;
                    }
                    50% {
                        transform: translate(-50%, -50%) scale(1.1);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(-50%, -50%) scale(1);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // Add feedback to page
        document.body.appendChild(feedback);

        // Remove feedback after delay
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 1500);
    }

    submitAnswer(answer) {
        this.log('Submitting answer:', answer);
        // Call the existing submitAnswer function from gamelogic.js
        if (typeof submitAnswer === 'function') {
            submitAnswer(answer);
        } else {
            this.log('ERROR: submitAnswer function not found');
        }
    }

    updateCard(questionText) {
        this.log('Updating card with question:', questionText);
        
        // Recreate card if it doesn't exist
        if (!this.card) {
            this.createSwipeCard();
        }

        // Reset card state
        this.answered = false;
        if (this.card) {
            this.card.style.transform = '';
            this.card.style.opacity = '';
            this.card.style.transition = '';
            this.card.style.borderColor = '';
            this.card.style.background = '';
            this.card.classList.remove('swiping');

            // Update card content with new question
            const cardQuestion = this.card.querySelector('.card-question');
            if (cardQuestion && questionText) {
                cardQuestion.textContent = questionText;
            }
        }

        // Show appropriate interface
        if (this.isTouchDevice) {
            this.showSwipeInterface();
        } else {
            this.showButtonInterface();
        }
    }

    hideCard() {
        this.log('Hiding all interfaces');
        
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
    }

    showCard() {
        this.log('Showing appropriate interface');
        
        if (this.isTouchDevice) {
            this.showSwipeInterface();
        } else {
            this.showButtonInterface();
        }
    }

    destroy() {
        this.log('Destroying SwipeHandler');
        if (this.card) {
            this.card.removeEventListener('mousedown', this.handleStart);
            this.card.removeEventListener('touchstart', this.handleStart);
        }
        document.removeEventListener('mousemove', this.handleMove);
        document.removeEventListener('mouseup', this.handleEnd);
        document.removeEventListener('touchmove', this.handleMove);
        document.removeEventListener('touchend', this.handleEnd);
    }
}

// Global swipe handler instance
let swipeHandler = null;

// Initialize swipe functionality
function initializeSwipe() {
    console.log('[Main] Initializing swipe functionality');
    if (swipeHandler) {
        swipeHandler.destroy();
    }
    swipeHandler = new SwipeHandler();
    swipeHandler.init();
}

// Update swipe card for new question
function updateSwipeCard(questionText) {
    console.log('[Main] updateSwipeCard called with:', questionText);
    if (swipeHandler) {
        swipeHandler.updateCard(questionText);
    } else {
        console.log('[Main] No swipe handler available');
    }
}

// Hide swipe card (for waiting state)
function hideSwipeCard() {
    console.log('[Main] hideSwipeCard called');
    if (swipeHandler) {
        swipeHandler.hideCard();
    }
}

// Show swipe card
function showSwipeCard() {
    console.log('[Main] showSwipeCard called');
    if (swipeHandler) {
        swipeHandler.showCard();
    }
}

// Check if using touch interface
function isTouchDevice() {
    return swipeHandler ? swipeHandler.isTouchDevice : false;
}

// Export functions for use in other files
window.initializeSwipe = initializeSwipe;
window.updateSwipeCard = updateSwipeCard;
window.hideSwipeCard = hideSwipeCard;
window.showSwipeCard = showSwipeCard;
window.isTouchDevice = isTouchDevice;
