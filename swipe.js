// Enhanced swipe.js - Improved Tinder-like Swipe Functionality

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
        this.animationId = null;
        this.log('SwipeHandler initialized - Touch device:', this.isTouchDevice);
    }

    log(message) {
        console.log('[SwipeHandler] ' + message);
    }

    detectTouchDevice() {
        var hasTouch = false;
        
        if ('ontouchstart' in window) {
            hasTouch = true;
            this.log('Touch detected: ontouchstart in window');
        }
        
        if (navigator.maxTouchPoints > 0) {
            hasTouch = true;
            this.log('Touch detected: navigator.maxTouchPoints > 0');
        }
        
        if (navigator.msMaxTouchPoints > 0) {
            hasTouch = true;
            this.log('Touch detected: navigator.msMaxTouchPoints > 0');
        }
        
        this.log('Final touch detection result: ' + hasTouch);
        return hasTouch;
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
        var questionScreen = document.getElementById('questionScreen');
        if (!questionScreen) {
            this.log('Question screen not found');
            return;
        }

        var swipeContainer = questionScreen.querySelector('.swipe-container');
        if (!swipeContainer) {
            swipeContainer = document.createElement('div');
            swipeContainer.className = 'swipe-container hidden';
            swipeContainer.id = 'swipeContainer';
            
            var questionElement = questionScreen.querySelector('.question');
            if (questionElement) {
                questionElement.parentNode.insertBefore(swipeContainer, questionElement.nextSibling);
            } else {
                questionScreen.appendChild(swipeContainer);
            }
        }

        var questionTextElement = document.getElementById('questionText');
        var currentQuestion = questionTextElement ? questionTextElement.textContent : 'Question en cours...';

        swipeContainer.innerHTML = `
            <div class="swipe-card" id="swipeCard">
                <div class="card-content">
                    <div class="card-icon">❓</div>
                    <div class="card-question">${currentQuestion}</div>
                    <div class="card-instruction">👈 Je n'aime pas &nbsp;&nbsp;&nbsp;&nbsp; J'aime 👉</div>
                </div>
            </div>
        `;

        this.card = document.getElementById('swipeCard');
        this.log('Swipe card created: ' + (this.card ? 'success' : 'failed'));
        
        // Add card icon animation
        this.addCardIconAnimation();
    }

    addCardIconAnimation() {
        if (!this.card) return;
        
        const icon = this.card.querySelector('.card-icon');
        if (icon) {
            // Add CSS for icon animation if not exists
            if (!document.querySelector('#swipe-icon-styles')) {
                const style = document.createElement('style');
                style.id = 'swipe-icon-styles';
                style.textContent = `
                    .card-icon {
                        font-size: 4rem;
                        margin-bottom: 20px;
                        transition: transform 0.3s ease;
                        animation: iconFloat 3s ease-in-out infinite;
                    }
                    
                    @keyframes iconFloat {
                        0%, 100% { transform: translateY(0px); }
                        50% { transform: translateY(-10px); }
                    }
                    
                    .swipe-card.like-preview .card-icon {
                        transform: scale(1.2) rotate(10deg);
                        filter: drop-shadow(0 0 10px rgba(76, 175, 80, 0.6));
                    }
                    
                    .swipe-card.dislike-preview .card-icon {
                        transform: scale(1.2) rotate(-10deg);
                        filter: drop-shadow(0 0 10px rgba(244, 67, 54, 0.6));
                    }
                `;
                document.head.appendChild(style);
            }
        }
    }

    showSwipeInterface() {
        this.log('Showing swipe interface');
        
        var questionText = document.getElementById('questionText');
        var swipeContainer = document.getElementById('swipeContainer');
        var answerButtons = document.getElementById('answerButtons');
        
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
        
        var questionText = document.getElementById('questionText');
        var swipeContainer = document.getElementById('swipeContainer');
        var answerButtons = document.getElementById('answerButtons');
        
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
        var self = this;

        // Touch events
        this.card.addEventListener('touchstart', function(e) {
            self.handleStart(e);
        }, { passive: false });
        
        document.addEventListener('touchmove', function(e) {
            self.handleMove(e);
        }, { passive: false });
        
        document.addEventListener('touchend', function(e) {
            self.handleEnd(e);
        });

        // Mouse events for desktop testing
        this.card.addEventListener('mousedown', function(e) {
            self.handleStart(e);
        });
        
        document.addEventListener('mousemove', function(e) {
            self.handleMove(e);
        });
        
        document.addEventListener('mouseup', function(e) {
            self.handleEnd(e);
        });

        // Prevent default drag behavior
        this.card.addEventListener('dragstart', function(e) {
            e.preventDefault();
        });

        // Add keyboard support
        document.addEventListener('keydown', function(e) {
            if (self.card && !self.answered) {
                if (e.key === 'ArrowLeft') {
                    self.simulateSwipe(false);
                    e.preventDefault();
                } else if (e.key === 'ArrowRight') {
                    self.simulateSwipe(true);
                    e.preventDefault();
                }
            }
        });
    }

    simulateSwipe(isLike) {
        this.log('Simulating swipe: ' + (isLike ? 'LIKE' : 'DISLIKE'));
        this.completeSwipe(isLike);
    }

    handleStart(e) {
        if (this.answered) return;

        this.log('Swipe start: ' + e.type);
        this.isDragging = true;
        this.card.classList.add('swiping');

        var clientX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
        var clientY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;

        this.startX = clientX;
        this.startY = clientY;
        this.currentX = clientX;
        this.currentY = clientY;

        // Add haptic feedback on supported devices
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }

        e.preventDefault();
    }

    handleMove(e) {
        if (!this.isDragging || this.answered) return;

        var clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
        var clientY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;

        this.currentX = clientX;
        this.currentY = clientY;

        this.updateCardPosition();
        e.preventDefault();
    }

    updateCardPosition() {
        if (!this.card) return;

        var deltaX = this.currentX - this.startX;
        var deltaY = this.currentY - this.startY;

        var rotation = deltaX * 0.1;
        var scale = Math.max(0.95, 1 - Math.abs(deltaX) / 1000);
        var opacity = Math.max(0.8, 1 - Math.abs(deltaX) / 300);

        this.card.style.transform = `translateX(${deltaX}px) translateY(${deltaY}px) rotate(${rotation}deg) scale(${scale})`;
        this.card.style.opacity = opacity;

        // Visual feedback based on swipe direction
        if (Math.abs(deltaX) > this.swipeThreshold / 2) {
            if (deltaX > 0) {
                this.card.classList.add('like-preview');
                this.card.classList.remove('dislike-preview');
            } else {
                this.card.classList.add('dislike-preview');
                this.card.classList.remove('like-preview');
            }
        } else {
            this.card.classList.remove('like-preview', 'dislike-preview');
        }

    }

    handleEnd(e) {
        if (!this.isDragging || this.answered) return;

        this.log('Swipe end: ' + e.type);
        this.isDragging = false;
        this.card.classList.remove('swiping');

        var deltaX = this.currentX - this.startX;

        if (Math.abs(deltaX) > this.swipeThreshold) {
            var isLike = deltaX > 0;
            this.log('Swipe completed: ' + (isLike ? 'LIKE' : 'DISLIKE') + ' (distance: ' + Math.abs(deltaX) + 'px)');
            this.completeSwipe(isLike);
        } else {
            this.log('Swipe cancelled - insufficient distance: ' + Math.abs(deltaX) + 'px');
            this.resetCard();
        }
    }

    completeSwipe(isLike) {
        this.answered = true;
        
        var direction = isLike ? 1 : -1;
        var exitX = direction * (window.innerWidth + 200);
        var exitRotation = direction * 30;

        // Add haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate([50, 10, 50]);
        }

        this.card.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.4s ease-out';
        this.card.style.transform = `translateX(${exitX}px) rotate(${exitRotation}deg) scale(0.8)`;
        this.card.style.opacity = '0';

        this.showSwipeFeedback(isLike);

        var self = this;
        setTimeout(function() {
            self.submitAnswer(isLike);
        }, 400);
    }

    resetCard() {
        this.card.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        this.card.style.transform = 'translateX(0px) translateY(0px) rotate(0deg) scale(1)';
        this.card.style.opacity = '1';
        this.card.classList.remove('like-preview', 'dislike-preview');

        var self = this;
        setTimeout(function() {
            if (self.card) {
                self.card.style.transition = '';
            }
        }, 400);
    }

    showSwipeFeedback(isLike) {
        var feedback = document.createElement('div');
        feedback.className = 'swipe-feedback ' + (isLike ? 'like-feedback' : 'dislike-feedback');
        feedback.innerHTML = `
            <div class="feedback-icon">${isLike ? '✅' : '❌'}</div>
            <div class="feedback-text">${isLike ? 'J\'aime !' : 'Je n\'aime pas'}</div>
        `;

        // Add styles if not exists
        if (!document.querySelector('.swipe-feedback-styles')) {
            var style = document.createElement('style');
            style.className = 'swipe-feedback-styles';
            style.textContent = `
                .swipe-feedback {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(255, 255, 255, 0.98);
                    backdrop-filter: blur(20px);
                    border-radius: 20px;
                    padding: 40px;
                    text-align: center;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
                    z-index: 1000;
                    animation: feedbackPop 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
                    border: 3px solid;
                }
                
                .like-feedback {
                    border-color: #4CAF50;
                }
                
                .dislike-feedback {
                    border-color: #F44336;
                }
                
                .feedback-icon {
                    font-size: 4rem;
                    margin-bottom: 15px;
                    animation: iconBounce 0.6s ease-out;
                }
                
                .feedback-text {
                    font-size: 1.4rem;
                    font-weight: 600;
                    color: #2E7D32;
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
                
                @keyframes iconBounce {
                    0%, 20%, 60%, 100% {
                        transform: translateY(0);
                    }
                    40% {
                        transform: translateY(-20px);
                    }
                    80% {
                        transform: translateY(-10px);
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(feedback);

        setTimeout(function() {
            if (feedback.parentNode) {
                feedback.style.animation = 'feedbackPop 0.3s ease-in reverse';
                setTimeout(() => {
                    if (feedback.parentNode) {
                        feedback.parentNode.removeChild(feedback);
                    }
                }, 300);
            }
        }, 1500);
    }

    submitAnswer(answer) {
        this.log('Submitting answer: ' + answer);
        if (typeof submitAnswer === 'function') {
            submitAnswer(answer);
        } else {
            this.log('ERROR: submitAnswer function not found');
        }
    }

    updateCard(questionText) {
        this.log('Updating card with question: ' + questionText);
        
        if (!this.card) {
            this.createSwipeCard();
        }

        this.answered = false;
        if (this.card) {
            // Reset card state
            this.card.style.transform = '';
            this.card.style.opacity = '';
            this.card.style.transition = '';
            this.card.classList.remove('swiping', 'like-preview', 'dislike-preview');

            // Update question text
            var cardQuestion = this.card.querySelector('.card-question');
            if (cardQuestion && questionText) {
                cardQuestion.textContent = questionText;
                
                // Add entrance animation
                cardQuestion.style.animation = 'questionSlideIn 0.6s ease-out';
            }

            // Update card icon based on question content
            this.updateCardIcon(questionText);

        }

        if (this.isTouchDevice) {
            this.showSwipeInterface();
        } else {
            this.showButtonInterface();
        }
    }

    updateCardIcon(questionText) {
        const icon = this.card.querySelector('.card-icon');
        if (!icon) return;

        // Simple icon selection based on question content
        let newIcon = '❓';
        const text = questionText.toLowerCase();
        
        if (text.includes('ananas')) {
            newIcon = '🍍🍕';
        } else if (text.includes('musique') || text.includes('chanter')) {
            newIcon = '🎵';
        } else if (text.includes('Cuisiner')) {
            newIcon = '🔪';
        } else if (text.includes('Echanger')) {
            newIcon = '🔀'; 
        } else if (text.includes('société')) {
            newIcon = '♟️';
        } else if (text.includes('film') || text.includes('télé') || text.includes('regarder')) {
            newIcon = '🎬';
        } else if (text.includes('shopping') || text.includes('acheter')) {
            newIcon = '🛍️';
        } else if (text.includes('nature') || text.includes('camping') || text.includes('plein air')) {
            newIcon = '🌲';
        } else if (text.includes('fête') || text.includes('surprise') || text.includes('célébrer')) {
            newIcon = '🎉';
        } else if (text.includes('danser') ) {
            newIcon = '💃🕺';
        } else if (text.includes('photo') || text.includes('selfie')) {
            newIcon = '📸';
        } else if (text.includes('jeu') || text.includes('jouer')) {
            newIcon = '🎮';
        } else if (text.includes('dormir') || text.includes('pijama')) {
            newIcon = '😏';
        } else if (text.includes('douche') ) {
            newIcon = '🚿';
        }

        icon.textContent = newIcon;
        
        // Add icon change animation
        icon.style.animation = 'iconChange 0.5s ease-out';
        
        // Add keyframe if not exists
        if (!document.querySelector('#icon-change-animation')) {
            const style = document.createElement('style');
            style.id = 'icon-change-animation';
            style.textContent = `
                @keyframes iconChange {
                    0% { transform: scale(0.5) rotate(-180deg); opacity: 0; }
                    50% { transform: scale(1.2) rotate(-90deg); opacity: 0.7; }
                    100% { transform: scale(1) rotate(0deg); opacity: 1; }
                }
                
                @keyframes questionSlideIn {
                    0% { transform: translateY(20px); opacity: 0; }
                    100% { transform: translateY(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    hideCard() {
        this.log('Hiding all interfaces');
        
        var swipeContainer = document.getElementById('swipeContainer');
        var answerButtons = document.getElementById('answerButtons');
        
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
        
        // Cancel any ongoing animations
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Remove event listeners by cloning and replacing the card element
        if (this.card && this.card.parentNode) {
            const newCard = this.card.cloneNode(true);
            this.card.parentNode.replaceChild(newCard, this.card);
            this.card = newCard;
        }
    }

    // Add method to handle orientation changes
    handleOrientationChange() {
        this.log('Orientation changed, reinitializing...');
        setTimeout(() => {
            this.resetCard();
        }, 100);
    }
}

// Global swipe handler instance
var swipeHandler = null;

// Main initialization function
function initializeSwipe() {
    console.log('[Main] Initializing swipe functionality');
    if (swipeHandler) {
        swipeHandler.destroy();
    }
    swipeHandler = new SwipeHandler();
    swipeHandler.init();
    
    // Add orientation change listener
    window.addEventListener('orientationchange', function() {
        if (swipeHandler) {
            swipeHandler.handleOrientationChange();
        }
    });
}

// Update swipe card with new question
function updateSwipeCard(questionText) {
    console.log('[Main] updateSwipeCard called with: ' + questionText);
    if (swipeHandler) {
        swipeHandler.updateCard(questionText);
    } else {
        console.log('[Main] No swipe handler available, initializing...');
        initializeSwipe();
        if (swipeHandler) {
            swipeHandler.updateCard(questionText);
        }
    }
}

// Hide swipe card interface
function hideSwipeCard() {
    console.log('[Main] hideSwipeCard called');
    if (swipeHandler) {
        swipeHandler.hideCard();
    }
}

// Show swipe card interface
function showSwipeCard() {
    console.log('[Main] showSwipeCard called');
    if (swipeHandler) {
        swipeHandler.showCard();
    }
}

// Check if device supports touch
function isTouchDevice() {
    return swipeHandler ? swipeHandler.isTouchDevice : false;
}

// Export functions to global scope
window.initializeSwipe = initializeSwipe;
window.updateSwipeCard = updateSwipeCard;
window.hideSwipeCard = hideSwipeCard;
window.showSwipeCard = showSwipeCard;
window.isTouchDevice = isTouchDevice;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('[Swipe] DOM loaded, ready for initialization');
    });
} else {
    console.log('[Swipe] DOM already loaded, ready for initialization');
}