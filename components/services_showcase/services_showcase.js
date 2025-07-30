// Services Showcase Component - Simple Width Control
function servicesShowcase() {
    return {
        currentIndex: 0,
        isPaused: false,
        timerInterval: null,
        progressInterval: null,
        timerDuration: 8000, // 8 seconds
        pauseReasons: new Set(),
        
        // Progress bar width (reactive Alpine.js property)
        progressWidth: 100,
        
        // Time tracking
        startTime: null,
        pausedTime: 0, // Total time spent paused
        
        // Touch handling
        touchStartTime: null,
        touchHoldTimeout: null,
        touchHoldThreshold: 500,
        
        // Video monitoring
        videoCheckInterval: null,
        lastVideoStates: new Map(),
        
        services: [
            {
                id: 'contraband-tobacco',
                title: 'Contraband Tobacco',
                description: 'Contraband tobacco fuels organized crime and costs Canada an estimated $1 billion in lost tax revenue annually, with Manitoba alone losing $0.30 per cigarette or $60.00 a carton. These illegal products are unregulated, may contain harmful ingredients, and undermine public health efforts. Knowing how to identify legal tobacco—by looking for the excise duty paid stamp, Health Canada warning labels, and warnings on each filter—helps protect our communities.',
                buttonText: 'Learn More',
                media: '<video controls width="100%" height="100%" style="border-radius: 16px; object-fit: contain;"><source src="assets/videos/contraband_tobacco.mp4" type="video/mp4">Your browser does not support the video tag.</video>'
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
            console.log('Services Showcase: Initializing with simple width control...');
            this.setupMobileInteractions();
            
            this.$nextTick(() => {
                this.startTimer();
                this.startVideoMonitoring();
                console.log('Services Showcase: Timer started');
            });
        },

        // =============== SIMPLE TIMER SYSTEM ===============
        startTimer() {
            this.clearTimers();
            this.startTime = Date.now();
            this.pausedTime = 0;
            
            console.log(`Starting timer for service ${this.currentIndex}`);
            
            // Main timer - switches services after 8 seconds
            this.timerInterval = setInterval(() => {
                if (!this.isPaused) {
                    const elapsedTime = Date.now() - this.startTime - this.pausedTime;
                    if (elapsedTime >= this.timerDuration) {
                        this.nextService();
                    }
                }
            }, 100);
            
            // Progress bar updater - updates every 50ms for smooth animation
            this.progressInterval = setInterval(() => {
                this.updateProgressBar();
            }, 50);
            
            this.updateProgressBar(); // Initial update
        },

        updateProgressBar() {
            if (this.isPaused) {
                // Don't update width when paused, just keep current state
                return;
            }
            
            const elapsedTime = Date.now() - this.startTime - this.pausedTime;
            const remainingTime = Math.max(0, this.timerDuration - elapsedTime);
            const progressPercentage = (remainingTime / this.timerDuration) * 100;
            
            // Update reactive Alpine.js property
            this.progressWidth = progressPercentage;
            
            // Debug logging
            const secondsRemaining = Math.ceil(remainingTime / 1000);
            if (elapsedTime % 1000 < 50) { // Log roughly every second
                console.log(`Service ${this.currentIndex}: ${secondsRemaining}s remaining (${progressPercentage.toFixed(1)}% width)`);
            }
        },

        clearTimers() {
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
            }
            if (this.progressInterval) {
                clearInterval(this.progressInterval);
                this.progressInterval = null;
            }
        },

        // =============== PAUSE/RESUME SYSTEM ===============
        pauseTimer(reason = 'unknown') {
            const wasAlreadyPaused = this.isPaused;
            this.pauseReasons.add(reason);
            
            if (!wasAlreadyPaused) {
                this.isPaused = true;
                this.pauseStartTime = Date.now();
                this.$el.classList.add('paused');
                console.log(`⏸️ Timer PAUSED for: ${reason}. Progress bar should freeze.`);
            }
        },

        resumeTimer(reason = 'unknown') {
            this.pauseReasons.delete(reason);
            
            if (this.pauseReasons.size === 0 && this.isPaused) {
                this.isPaused = false;
                // Add the paused duration to total paused time
                if (this.pauseStartTime) {
                    this.pausedTime += Date.now() - this.pauseStartTime;
                }
                this.$el.classList.remove('paused');
                console.log(`▶️ Timer RESUMED, removed: ${reason}. Progress bar should continue.`);
            }
        },

        forceResumeTimer() {
            this.pauseReasons.clear();
            if (this.isPaused && this.pauseStartTime) {
                this.pausedTime += Date.now() - this.pauseStartTime;
            }
            this.isPaused = false;
            this.$el.classList.remove('paused');
            console.log('🔄 Timer FORCE RESUMED');
        },

        // =============== SERVICE NAVIGATION ===============
        selectService(index) {
            if (index !== this.currentIndex) {
                console.log(`🔄 Switching from service ${this.currentIndex} to ${index}`);
                
                // Pause any videos in current service
                this.pauseCurrentVideos();
                
                // Clear video-related pause reasons
                this.resumeTimer('video-playing');
                
                // Reset progress width to full
                this.progressWidth = 100;
                
                // Update current index
                this.currentIndex = index;
                
                // Start new timer
                this.startTimer();
                this.scrollTabIntoView(index);
                
                // Check for videos in new service
                setTimeout(() => {
                    this.checkCurrentServiceVideos();
                }, 100);
            }
        },

        nextService() {
            const nextIndex = (this.currentIndex + 1) % this.services.length;
            console.log(`⏭️ Auto-advancing to service: ${nextIndex}`);
            this.selectService(nextIndex);
        },

        // =============== VIDEO MONITORING ===============
        startVideoMonitoring() {
            this.videoCheckInterval = setInterval(() => {
                this.checkCurrentServiceVideos();
            }, 500);
        },

        checkCurrentServiceVideos() {
            const videos = this.getCurrentServiceVideos();
            
            videos.forEach((video, videoIndex) => {
                const videoKey = `${this.currentIndex}-${videoIndex}`;
                const wasPlaying = this.lastVideoStates.get(videoKey) === 'playing';
                const isPlaying = !video.paused && !video.ended;
                
                if (!wasPlaying && isPlaying) {
                    console.log(`📹 Video started playing in service ${this.currentIndex}`);
                    this.pauseTimer('video-playing');
                    this.lastVideoStates.set(videoKey, 'playing');
                }
                else if (wasPlaying && !isPlaying) {
                    console.log(`📹 Video stopped playing in service ${this.currentIndex}`);
                    this.resumeTimer('video-playing');
                    this.lastVideoStates.set(videoKey, 'paused');
                }
            });
        },

        getCurrentServiceVideos() {
            const videos = [];
            try {
                const servicePanel = this.$el.querySelector(`.service-panel:nth-child(${this.currentIndex + 1})`);
                if (servicePanel) {
                    const videoElements = servicePanel.querySelectorAll('video');
                    videoElements.forEach(video => videos.push(video));
                }
            } catch (error) {
                console.warn('Error finding videos:', error);
            }
            return videos;
        },

        pauseCurrentVideos() {
            const videos = this.getCurrentServiceVideos();
            videos.forEach(video => {
                if (!video.paused) {
                    video.pause();
                }
            });
        },

        // =============== DESKTOP HOVER INTERACTIONS ===============
        handleTabHover(index, isEntering) {
            if (window.innerWidth > 768) {
                if (isEntering && index === this.currentIndex) {
                    this.pauseTimer('tab-hover');
                } else if (!isEntering) {
                    this.resumeTimer('tab-hover');
                }
            }
        },

        handleContentHover(isEntering) {
            if (window.innerWidth > 768) {
                if (isEntering) {
                    this.pauseTimer('content-hover');
                } else {
                    this.resumeTimer('content-hover');
                }
            }
        },

        // =============== MOBILE TOUCH INTERACTIONS ===============
        setupMobileInteractions() {
            this.$el.addEventListener('touchstart', (e) => this.handleTouchStart(e));
            this.$el.addEventListener('touchend', (e) => this.handleTouchEnd(e));
            this.$el.addEventListener('touchcancel', (e) => this.handleTouchEnd(e));
            this.$el.addEventListener('contextmenu', (e) => {
                if (this.touchStartTime) e.preventDefault();
            });
        },

        handleTouchStart(e) {
            const target = e.target.closest('.services-content, .service-tab');
            if (!target) return;

            this.touchStartTime = Date.now();
            
            this.touchHoldTimeout = setTimeout(() => {
                if (this.touchStartTime) {
                    this.pauseTimer('mobile-hold');
                    if (navigator.vibrate) navigator.vibrate(100);
                }
            }, this.touchHoldThreshold);
        },

        handleTouchEnd(e) {
            if (this.touchHoldTimeout) {
                clearTimeout(this.touchHoldTimeout);
                this.touchHoldTimeout = null;
            }

            if (this.touchStartTime) {
                const touchDuration = Date.now() - this.touchStartTime;
                
                if (touchDuration >= this.touchHoldThreshold) {
                    this.resumeTimer('mobile-hold');
                }
                
                this.touchStartTime = null;
            }
        },

        // =============== UTILITY METHODS ===============
        scrollTabIntoView(index) {
            if (window.innerWidth <= 768) {
                this.$nextTick(() => {
                    const tabsContainer = this.$refs.tabsContainer;
                    if (!tabsContainer || !tabsContainer.children[index]) return;
                    
                    const targetTab = tabsContainer.children[index];
                    const tabOffset = targetTab.offsetLeft;
                    
                    tabsContainer.scrollTo({
                        left: tabOffset,
                        behavior: 'smooth'
                    });
                });
            }
        },

        // =============== CLEANUP ===============
        destroy() {
            console.log('Services Showcase: Cleaning up...');
            
            this.clearTimers();
            
            if (this.videoCheckInterval) {
                clearInterval(this.videoCheckInterval);
                this.videoCheckInterval = null;
            }
            
            if (this.touchHoldTimeout) {
                clearTimeout(this.touchHoldTimeout);
                this.touchHoldTimeout = null;
            }
            
            this.lastVideoStates.clear();
        }
    }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (typeof Alpine !== 'undefined') {
        Alpine.data('servicesShowcase', servicesShowcase);
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { servicesShowcase };
}