// swipe.js - Tinder-like Swipe Functionality

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
            
            var questionCounter = questionScreen.querySelector('.question-counter');
            if (questionCounter) {
                questionCounter.parentNode.insertBefore(swipeContainer, questionCounter.nextSibling);
            } else {
                questionScreen.appendChild(swipeContainer);
            }
        }

        var questionTextElement = document.getElementById('questionText');
        var currentQuestion = questionTextElement ? questionTextElement.textContent : 'Question en cours...';

        swipeContainer.innerHTML = '<div class="swipe-card" id="swipeCard">' +
            '<div class="card-content">' +
            '<div class="card-question">' + currentQuestion + '</div>' +
            '<div class="card-instruction">👈 Je n\'aime pas &nbsp;&nbsp;&nbsp;&nbsp; J\'aime 👉</div>' +
            '</div>' +
            '</div>';

        this.card = document.getElementById('swipeCard');
        this.log('Swipe card created: ' + (this.card ? 'success' : 'failed'));
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

        this.card.addEventListener('touchstart', function(e) {
            self.handleStart(e);
        }, { passive: false });
        
        document.addEventListener('touchmove', function(e) {
            self.handleMove(e);
        }, { passive: false });
        
        document.addEventListener('touchend', function(e) {
            self.handleEnd(e);
        });

        this.card.addEventListener('mousedown', function(e) {
            self.handleStart(e);
        });
        
        document.addEventListener('mousemove', function(e) {
            self.handleMove(e);
        });
        
        document.addEventListener('mouseup', function(e) {
            self.handleEnd(e);
        });

        this.card.addEventListener('dragstart', function(e) {
            e.preventDefault();
        });
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

        e.preventDefault();
    }

    handleMove(e) {
        if (!this.isDragging || this.answered) return;

        var clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
        var clientY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;

        this.currentX = clientX;
        this.currentY = clientY;

        var deltaX = this.currentX - this.startX;
        var deltaY = this.currentY - this.startY;

        var rotation = deltaX * 0.1;
        var opacity = Math.max(0.7, 1 - Math.abs(deltaX) / 300);

        this.card.style.transform = 'translateX(' + deltaX + 'px) translateY(' + deltaY + 'px) rotate(' + rotation + 'deg)';
        this.card.style.opacity = opacity;

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
        var exitX = direction * (window.innerWidth + 100);
        var exitRotation = direction * 30;

        this.card.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
        this.card.style.transform = 'translateX(' + exitX + 'px) rotate(' + exitRotation + 'deg)';
        this.card.style.opacity = '0';

        this.showSwipeFeedback(isLike);

        var self = this;
        setTimeout(function() {
            self.submitAnswer(isLike);
        }, 300);
    }

    resetCard() {
        this.card.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out, background 0.3s ease-out, border-color 0.3s ease-out';
        this.card.style.transform = 'translateX(0px) translateY(0px) rotate(0deg)';
        this.card.style.opacity = '1';
        this.card.style.borderColor = 'rgba(76, 175, 80, 0.3)';
        this.card.style.background = 'linear-gradient(135deg, #E8F5E8, #C8E6C9)';

        var self = this;
        setTimeout(function() {
            self.card.style.transition = '';
        }, 300);
    }

    showSwipeFeedback(isLike) {
        var feedback = document.createElement('div');
        feedback.className = 'swipe-feedback ' + (isLike ? 'like-feedback' : 'dislike-feedback');
        feedback.innerHTML = '<div class="feedback-icon">' + (isLike ? '💚' : '💔') + '</div>' +
            '<div class="feedback-text">' + (isLike ? 'J\'aime !' : 'Je n\'aime pas') + '</div>';

        if (!document.querySelector('.swipe-feedback-styles')) {
            var style = document.createElement('style');
            style.className = 'swipe-feedback-styles';
            style.textContent = '.swipe-feedback { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(255, 255, 255, 0.95); border-radius: 20px; padding: 30px; text-align: center; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2); z-index: 1000; animation: feedbackPop 0.6s ease-out forwards; } .feedback-icon { font-size: 3rem; margin-bottom: 10px; } .feedback-text { font-size: 1.2rem; font-weight: bold; color: #2E7D32; } .like-feedback { border: 3px solid #4CAF50; } .dislike-feedback { border: 3px solid #F44336; } .dislike-feedback .feedback-text { color: #D32F2F; } @keyframes feedbackPop { 0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; } 50% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; } 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; } }';
            document.head.appendChild(style);
        }

        document.body.appendChild(feedback);

        setTimeout(function() {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
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
            this.card.style.transform = '';
            this.card.style.opacity = '';
            this.card.style.transition = '';
            this.card.style.borderColor = '';
            this.card.style.background = '';
            this.card.classList.remove('swiping');

            var cardQuestion = this.card.querySelector('.card-question');
            if (cardQuestion && questionText) {
                cardQuestion.textContent = questionText;
            }
        }

        if (this.isTouchDevice) {
            this.showSwipeInterface();
        } else {
            this.showButtonInterface();
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
        // Event listeners will be cleaned up automatically when elements are removed
    }
}

var swipeHandler = null;

function initializeSwipe() {
    console.log('[Main] Initializing swipe functionality');
    if (swipeHandler) {
        swipeHandler.destroy();
    }
    swipeHandler = new SwipeHandler();
    swipeHandler.init();
}

function updateSwipeCard(questionText) {
    console.log('[Main] updateSwipeCard called with: ' + questionText);
    if (swipeHandler) {
        swipeHandler.updateCard(questionText);
    } else {
        console.log('[Main] No swipe handler available');
    }
}

function hideSwipeCard() {
    console.log('[Main] hideSwipeCard called');
    if (swipeHandler) {
        swipeHandler.hideCard();
    }
}

function showSwipeCard() {
    console.log('[Main] showSwipeCard called');
    if (swipeHandler) {
        swipeHandler.showCard();
    }
}

function isTouchDevice() {
    return swipeHandler ? swipeHandler.isTouchDevice : false;
}

window.initializeSwipe = initializeSwipe;
window.updateSwipeCard = updateSwipeCard;
window.hideSwipeCard = hideSwipeCard;
window.showSwipeCard = showSwipeCard;
window.isTouchDevice = isTouchDevice;
