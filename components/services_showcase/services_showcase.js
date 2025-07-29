// Services Showcase Component
function servicesShowcase() {
    return {
        currentIndex: 0,
        isPaused: false,
        timerInterval: null,
        timerDuration: 8000, // 8 seconds
        
        services: [
            {
                id: 'contraband-tobacco',
                title: 'Contraband Tobacco',
                description: 'Contraband tobacco fuels organized crime and costs Canada an estimated $1 billion in lost tax revenue annually, with Manitoba alone losing $0.30 per cigarette or $60.00 a carton. These illegal products are unregulated, may contain harmful ingredients, and undermine public health efforts. Knowing how to identify legal tobacco—by looking for the excise duty paid stamp, Health Canada warning labels, and warnings on each filter—helps protect our communities.',
                buttonText: 'Learn More',
                media: '<div class="video-placeholder"><img src="assets/icons/play-button.svg" alt="Play Video" /></div>'
            },
            {
                id: 'stolen-vehicle',
                title: 'Stolen Vehicle',
                description: 'If you see a suspected stolen vehicle, do not approach or engage with anyone in it. Your safety is paramount. Instead, make the right call and report it to Crime Stoppers. Your tip remains anonymous and helps keep our community safe. You can also view a list of recently reported stolen vehicles in Winnipeg:',
                buttonText: 'Click Here',
                media: '<img src="assets/images/logo-hot-cars-placeholder.svg" alt="Hot Cars Logo" />'
            },
            {
                id: 'save-your-cat',
                title: 'Save Your Cat',
                description: 'Protect your vehicle from theft with The Program, a partnership between businesses, Winnipeg Crime Stoppers, and the Winnipeg Police. While your car\'s being serviced, we\'ll etch your vehicle identification number onto your catalytic converter and spray it with high-heat fluorescent paint, making it a clear deterrent to thieves. A window sticker will also mark your vehicle as protected, helping combat this growing issue that affected over 2200 motorists last year.',
                buttonText: 'Learn More',
                media: '<img src="assets/images/save-your-cat-placeholder.svg" alt="Save Your Cat Program" />'
            }
        ],

        init() {
            this.resetTimerAnimation();
            this.startTimer();
        },

        selectService(index) {
            if (index !== this.currentIndex) {
                this.currentIndex = index;
                this.resetTimerAnimation();
                this.resetTimer();
                this.scrollTabIntoView(index);
            }
        },

        nextService() {
            this.currentIndex = (this.currentIndex + 1) % this.services.length;
            console.log('Next service:', this.currentIndex, this.services[this.currentIndex].title);
            this.resetTimerAnimation();
            this.scrollTabIntoView(this.currentIndex);
        },

        startTimer() {
            this.clearTimer();
            
            this.timerInterval = setInterval(() => {
                if (!this.isPaused) {
                    this.nextService();
                }
            }, this.timerDuration);
        },

        resetTimer() {
            this.clearTimer();
            this.startTimer();
        },

        clearTimer() {
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
            }
        },

        resetTimerAnimation() {
            // Reset all timer bars first
            this.services.forEach((_, index) => {
                const timerBar = this.$refs[`timer-${index}`];
                if (timerBar) {
                    timerBar.classList.remove('active');
                }
            });
            
            // Force reflow
            this.$nextTick(() => {
                // Activate current timer bar
                const currentTimer = this.$refs[`timer-${this.currentIndex}`];
                if (currentTimer) {
                    currentTimer.classList.add('active');
                }
            });
        },

        pauseTimer() {
            this.isPaused = true;
            this.$el.classList.add('paused');
        },

        resumeTimer() {
            this.isPaused = false;
            this.$el.classList.remove('paused');
        },

        scrollTabIntoView(index) {
            // Mobile horizontal scroll behavior
            if (window.innerWidth <= 768) {
                this.$nextTick(() => {
                    const tabsContainer = this.$refs.tabsContainer;
                    if (!tabsContainer || !tabsContainer.children[index]) return;
                    
                    const targetTab = tabsContainer.children[index];
                    
                    // Simple approach: scroll to tab's offset position
                    const tabOffset = targetTab.offsetLeft;
                    tabsContainer.scrollTo({
                        left: tabOffset,
                        behavior: 'smooth'
                    });
                });
            }
        },

        // Cleanup when component is destroyed
        destroy() {
            this.clearTimer();
        }
    }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Register the component globally for Alpine.js
    if (typeof Alpine !== 'undefined') {
        Alpine.data('servicesShowcase', servicesShowcase);
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { servicesShowcase };
}