// swipe.js - Tinder-like Swipe Functionality

class SwipeHandler {
    constructor() {
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.swipeThreshold = 80; // Minimum distance for a valid swipe
        this.card = null;
        this.answered = false;
        this.isTouchDevice = this.detectTouchDevice();
        console.log('Touch device detected:', this.isTouchDevice); // Debug log
    }

    detectTouchDevice() {
        // More comprehensive touch detection
        return (
            ('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0) ||
            (navigator.msMaxTouchPoints > 0) ||
            (window.DocumentTouch && document instanceof DocumentTouch)
        );
    }

    init() {
        console.log('SwipeHandler init - Touch device:', this.isTouchDevice); // Debug log
        
        // Always create the interfaces
        this.createSwipeCard();
        
        if (this.isTouchDevice) {
            console.log('Setting up touch interface'); // Debug log
            this.attachEventListeners();
            this.showSwipeInterface();
        } else {
            console.log('Setting up button interface'); // Debug log
            this.showButtonInterface();
        }
    }

    createSwipeCard() {
        const questionScreen = document.getElementById('questionScreen');
        if (!questionScreen) {
            console.log('Question screen not found'); // Debug log
            return;
        }

        // Find or create swipe container
        let swipeContainer = questionScreen.querySelector('.swipe-container');
        if (!swipeContainer) {
            swipeContainer = document.createElement('div');
            swipeContainer.className = 'swipe-container';
            
            // Insert after question text
            const questionText = questionScreen.querySelector('.question');
            if (questionText) {
                questionText.parentNode.insertBefore(swipeContainer, questionText.nextSibling);
            } else {
                questionScreen.appendChild(swipeContainer);
            }
        }

        // Get current question text
        const questionTextElement = document.getElementById('questionText');
        const currentQuestion = questionTextElement ? questionTextElement.textContent : 'Question';

        // Create swipe card with question content
        swipeContainer.innerHTML = `
            <div class="swipe-card" id="swipeCard">
                <div class="card-content">
                    <div class="card-question">${currentQuestion}</div>
                    <div class="card-instruction">👈 Je n'aime pas &nbsp;&nbsp;&nbsp;&nbsp; J'aime 👉</div>
                </div>
                <div class="swipe-indicators">
                    <div class="swipe-hint dislike-hint">
                        <span>👈</span>
                        <span>Non</span>
                    </div>
                    <div class="swipe-hint like-hint">
                        <span>Oui</span>
                        <span>👉</span>
                    </div>
                </div>
            </div>
        `;

        this.card = document.getElementById('swipeCard');
        console.log('Swipe card created:', this.card); // Debug log
    }

    showSwipeInterface() {
        console.log('Showing swipe interface'); // Debug log
        
        // Hide the original question text and show swipe interface
        const questionText = document.getElementById('questionText');
        const swipeContainer = document.querySelector('.swipe-container');
        const answerButtons = document.getElementById('answerButtons');
        
        if (questionText) {
            questionText.style.display = 'none';
            console.log('Hidden question text'); // Debug log
        }
        if (swipeContainer) {
            swipeContainer.style.display = 'block';
            console.log('Shown swipe container'); // Debug log
        }
        if (answerButtons) {
            answerButtons.style.display = 'none';
            console.log('Hidden answer buttons'); // Debug log
        }
    }

    showButtonInterface() {
        console.log('Showing button interface'); // Debug log
        
        // Show traditional buttons and hide swipe interface
        const questionText = document.getElementById('questionText');
        const swipeContainer = document.querySelector('.swipe-container');
        const answerButtons = document.getElementById('answerButtons');
        
        if (questionText) {
            questionText.style.display = 'block';
            console.log('Shown question text'); // Debug log
        }
        if (swipeContainer) {
            swipeContainer.style.display = 'none';
            console.log('Hidden swipe container'); // Debug log
        }
        if (answerButtons) {
            answerButtons.style.display = 'flex';
            console.log('Shown answer buttons'); // Debug log
        }
    }

    attachEventListeners() {
        if (!this.card) {
            console.log('No card to attach listeners to'); // Debug log
            return;
        }

        console.log('Attaching event listeners to card'); // Debug log

        // Touch events (primary for mobile)
        this.card.addEventListener('touchstart', this.handleStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.handleMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleEnd.bind(this));

        // Mouse events (for testing on desktop with touch simulation)
        this.card.addEventListener('mousedown', this.handleStart.bind(this));
        document.addEventListener('mousemove', this.handleMove.bind(this));
        document.addEventListener('mouseup', this.handleEnd.bind(this));

        // Prevent default drag behavior
        this.card.addEventListener('dragstart', (e) => e.preventDefault());
    }

    handleStart(e) {
        if (this.answered) return;

        console.log('Swipe start:', e.type); // Debug log
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

        // Calculate rotation based on horizontal movement
        const rotation = deltaX * 0.1;
        const opacity = Math.max(0.7, 1 - Math.abs(deltaX) / 300);

        // Apply transform
        this.card.style.transform = `translateX(${deltaX}px) translateY(${deltaY}px) rotate(${rotation}deg)`;
        this.card.style.opacity = opacity;

        // Update preview state
        this.updatePreviewState(deltaX);

        e.preventDefault();
    }

    handleEnd(e) {
        if (!this.isDragging || this.answered) return;

        console.log('Swipe end'); // Debug log
        this.isDragging = false;
        this.card.classList.remove('swiping');

        const deltaX = this.currentX - this.startX;
        const deltaY = this.currentY - this.startY;

        // Check if swipe threshold is met
        if (Math.abs(deltaX) > this.swipeThreshold) {
            const isLike = deltaX > 0;
            console.log('Swipe completed:', isLike ? 'like' : 'dislike'); // Debug log
            this.completeSwipe(isLike);
        } else {
            console.log('Swipe cancelled - not enough distance'); // Debug log
            // Reset card position
            this.resetCard();
        }
    }

    updatePreviewState(deltaX) {
        this.card.classList.remove('like-preview', 'dislike-preview');

        if (Math.abs(deltaX) > this.swipeThreshold / 2) {
            if (deltaX > 0) {
                this.card.classList.add('like-preview');
            } else {
                this.card.classList.add('dislike-preview');
            }
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

        // Submit answer after animation
        setTimeout(() => {
            this.submitAnswer(isLike);
        }, 300);

        // Show feedback
        this.showSwipeFeedback(isLike);
    }

    resetCard() {
        this.card.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
        this.card.style.transform = 'translateX(0px) translateY(0px) rotate(0deg)';
        this.card.style.opacity = '1';
        this.card.classList.remove('like-preview', 'dislike-preview');

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
        console.log('Submitting answer:', answer); // Debug log
        // Call the existing submitAnswer function from gamelogic.js
        if (typeof submitAnswer === 'function') {
            submitAnswer(answer);
        } else {
            console.error('submitAnswer function not found');
        }
    }

    updateCard(questionText) {
        console.log('Updating card with question:', questionText); // Debug log
        
        if (!this.card) {
            console.log('No card to update, creating new one'); // Debug log
            this.createSwipeCard();
        }

        // Reset card state
        this.answered = false;
        if (this.card) {
            this.card.style.transform = '';
            this.card.style.opacity = '';
            this.card.style.transition = '';
            this.card.classList.remove('swiping', 'like-preview', 'dislike-preview');

            // Update card content with new question
            const cardQuestion = this.card.querySelector('.card-question');
            if (cardQuestion && questionText) {
                cardQuestion.textContent = questionText;
            }
        }

        // Show appropriate interface based on device
        if (this.isTouchDevice) {
            this.showSwipeInterface();
        } else {
            this.showButtonInterface();
        }
    }

    hideCard() {
        console.log('Hiding card'); // Debug log
        const swipeContainer = document.querySelector('.swipe-container');
        const answerButtons = document.getElementById('answerButtons');
        
        if (swipeContainer) {
            swipeContainer.style.display = 'none';
        }
        if (answerButtons) {
            answerButtons.style.display = 'none';
        }
    }

    showCard() {
        console.log('Showing card'); // Debug log
        
        if (this.isTouchDevice) {
            const swipeContainer = document.querySelector('.swipe-container');
            if (swipeContainer) {
                swipeContainer.style.display = 'block';
            }
            this.showSwipeInterface();
        } else {
            this.showButtonInterface();
        }
    }

    destroy() {
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

// Initialize swipe functionality when DOM is ready
function initializeSwipe() {
    console.log('Initializing swipe functionality'); // Debug log
    if (swipeHandler) {
        swipeHandler.destroy();
    }
    swipeHandler = new SwipeHandler();
    swipeHandler.init();
}

// Update swipe card for new question
function updateSwipeCard(questionText) {
    console.log('updateSwipeCard called with:', questionText); // Debug log
    if (swipeHandler) {
        swipeHandler.updateCard(questionText);
    } else {
        console.log('No swipe handler available'); // Debug log
    }
}

// Hide swipe card (for waiting state)
function hideSwipeCard() {
    console.log('hideSwipeCard called'); // Debug log
    if (swipeHandler) {
        swipeHandler.hideCard();
    }
}

// Show swipe card
function showSwipeCard() {
    console.log('showSwipeCard called'); // Debug log
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
        // Call the existing submitAnswer function from gamelogic.js
        if (typeof submitAnswer === 'function') {
            submitAnswer(answer);
        } else {
            console.error('submitAnswer function not found');
        }
    }

    updateCard(questionText) {
        if (!this.card) return;

        // Reset card state
        this.answered = false;
        this.card.style.transform = '';
        this.card.style.opacity = '';
        this.card.style.transition = '';
        this.card.classList.remove('swiping', 'like-preview', 'dislike-preview');

        // Update card content if needed
        const cardText = this.card.querySelector('.card-text');
        if (cardText) {
            cardText.textContent = 'Glissez pour répondre';
        }

        const cardIcon = this.card.querySelector('.card-icon');
        if (cardIcon) {
            cardIcon.textContent = '🤔';
        }
    }

    hideCard() {
        if (this.card) {
            this.card.style.display = 'none';
        }
    }

    showCard() {
        if (this.card) {
            this.card.style.display = 'flex';
            this.updateCard();
        }
    }

    destroy() {
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

// Initialize swipe functionality when DOM is ready
function initializeSwipe() {
    if (swipeHandler) {
        swipeHandler.destroy();
    }
    swipeHandler = new SwipeHandler();
    swipeHandler.init();
}

// Update swipe card for new question
function updateSwipeCard(questionText) {
    if (swipeHandler) {
        swipeHandler.updateCard(questionText);
    }
}

// Hide swipe card (for waiting state)
function hideSwipeCard() {
    if (swipeHandler) {
        swipeHandler.hideCard();
    }
}

// Show swipe card
function showSwipeCard() {
    if (swipeHandler) {
        swipeHandler.showCard();
    }
}

// Export functions for use in other files
window.initializeSwipe = initializeSwipe;
window.updateSwipeCard = updateSwipeCard;
window.hideSwipeCard = hideSwipeCard;
window.showSwipeCard = showSwipeCard;
