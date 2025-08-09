// Services Showcase Component - Simple Width Control
function servicesShowcase() {
    return {
        currentIndex: 0,
        isPaused: false,
        isActive: false,
        timerInterval: null,
        progressInterval: null,
        pageCheckInterval: null,
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
        youtubeIsPlaying: false,
        youtubePlayers: new Map(),
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
                media: '<img src="assets/images/stolen_cars.jpg" alt="Hot Cars Logo" />'
            },
            {
                id: 'save-your-cat',
                title: 'Save Your Cat',
                description: 'Protect your vehicle from theft with The Program, a partnership between businesses, Winnipeg Crime Stoppers, and the Winnipeg Police. While your car\'s being serviced, we\'ll etch your vehicle identification number onto your catalytic converter and spray it with high-heat fluorescent paint, making it a clear deterrent to thieves. A window sticker will also mark your vehicle as protected, helping combat this growing issue that affected over 2200 motorists last year.',
                buttonText: 'Learn More',
                media: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/n6NFQm9NH5I?si=Bb8Nnh-dgUTY9Ahb&enablejsapi=1" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen style="border-radius: 16px; object-fit: contain;"></iframe>'
            }
        ],

        init() {
            console.log('Services Showcase: Checking if should initialize...');
            
            // Check if we're on the home page
            if (!this.isHomePage()) {
                console.log('❌ Not on home page - Services Showcase will not activate');
                return;
            }
            
            console.log('✅ On home page - Services Showcase initializing with simple width control...');
            
            // Mark component as active
            this.isActive = true;
            
            try {
                console.log('🔧 Setting up mobile interactions...');
                this.setupMobileInteractions();
                
                console.log('🔧 Loading YouTube API...');
                this.loadYouTubeAPI();
                
                console.log('🔧 Setting up nextTick callback...');
                this.$nextTick(() => {
                    console.log('🔧 Starting timer and video listeners...');
                    this.startTimer();
                    this.setupVideoEventListeners();
                    this.setupPageNavigationListeners();
                    console.log('Services Showcase: Timer started');
                });
            } catch (error) {
                console.error('❌ Error in init():', error);
            }
        },

        // =============== PAGE DETECTION ===============
        isHomePage() {
            // Check multiple ways to determine if we're on the home page
            const currentPath = window.location.pathname;
            const currentFile = window.location.pathname.split('/').pop();
            const currentHash = window.location.hash;
            
            // Check if we can access the app's currentPage directly
            const appElement = document.querySelector('[x-data*="app()"]');
            if (appElement && appElement.__x && appElement.__x.$data && appElement.__x.$data.currentPage) {
                const isHome = appElement.__x.$data.currentPage === 'home';
                console.log(`📍 Page detection via app.currentPage: ${appElement.__x.$data.currentPage}, IsHome: ${isHome}`);
                return isHome;
            }
            
            // Fallback to hash-based detection
            const isHomeByHash = !currentHash || currentHash === '#' || currentHash === '#home';
            console.log(`📍 Page detection via hash - Hash: ${currentHash}, IsHome: ${isHomeByHash}`);
            
            return isHomeByHash;
        },

        setupPageNavigationListeners() {
            console.log('🔧 Setting up page navigation listeners...');
            
            // Listen for page visibility changes
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    console.log('📄 Page hidden - pausing services showcase');
                    this.pauseTimer('page-hidden');
                } else {
                    console.log('📄 Page visible - checking if still on home page');
                    if (this.isHomePage()) {
                        this.resumeTimer('page-hidden');
                    } else {
                        console.log('❌ No longer on home page - destroying services showcase');
                        this.destroy();
                    }
                }
            });

            // Listen for beforeunload to cleanup
            window.addEventListener('beforeunload', () => {
                console.log('📄 Page unloading - cleaning up services showcase');
                this.destroy();
            });

            // Listen for hashchange (for single-page apps)
            window.addEventListener('hashchange', () => {
                console.log('📄 Hash changed - checking if still on home page');
                setTimeout(() => {
                    const newPageStatus = this.isHomePage();
                    console.log('📍 Hash change: isHomePage =', newPageStatus, 'isActive =', this.isActive);
                    
                    if (!newPageStatus && this.isActive) {
                        console.log('❌ No longer on home page - destroying services showcase');
                        this.destroy();
                    } else if (newPageStatus && !this.isActive) {
                        console.log('✅ Back on home page - reinitializing services showcase');
                        this.init();
                    }
                    // If still on home page and active, continue normally - don't restart
                }, 100); // Small delay to let app update
            });

            // Listen for popstate (browser back/forward)
            window.addEventListener('popstate', () => {
                console.log('📄 Popstate event - checking if still on home page');
                setTimeout(() => {
                    const newPageStatus = this.isHomePage();
                    console.log('📍 Popstate: isHomePage =', newPageStatus, 'isActive =', this.isActive);
                    
                    if (!newPageStatus && this.isActive) {
                        console.log('❌ No longer on home page - destroying services showcase');
                        this.destroy();
                    } else if (newPageStatus && !this.isActive) {
                        console.log('✅ Back on home page - reinitializing services showcase');
                        this.init();
                    }
                    // If still on home page and active, continue normally - don't restart
                }, 100); // Small delay to let app update
            });

            // Add a periodic check as a backup
            this.pageCheckInterval = setInterval(() => {
                if (this.isActive && !this.isHomePage()) {
                    console.log('🔍 Periodic check: No longer on home page - destroying services showcase');
                    this.destroy();
                }
            }, 1000); // Check every second
        },

        // =============== SIMPLE TIMER SYSTEM ===============
        startTimer() {
            // Don't start timer if component is not active
            if (!this.isActive) {
                console.log('⚠️ Component not active - skipping timer start');
                return;
            }
            
            this.clearTimers();
            this.startTime = Date.now();
            this.pausedTime = 0;
            
            console.log(`Starting timer for service ${this.currentIndex}`);
            
            // Main timer - switches services after 8 seconds
            this.timerInterval = setInterval(() => {
                if (!this.isActive) {
                    console.log('⚠️ Component no longer active - clearing timer');
                    this.clearTimers();
                    return;
                }
                if (!this.isPaused) {
                    const elapsedTime = Date.now() - this.startTime - this.pausedTime;
                    if (elapsedTime >= this.timerDuration) {
                        this.nextService();
                    }
                }
            }, 100);
            
            // Progress bar updater - updates every 50ms for smooth animation
            this.progressInterval = setInterval(() => {
                if (!this.isActive) {
                    console.log('⚠️ Component no longer active - clearing progress timer');
                    this.clearTimers();
                    return;
                }
                this.updateProgressBar();
            }, 50);
            
            this.updateProgressBar(); // Initial update
        },

        updateProgressBar() {
            if (!this.isActive || this.isPaused) {
                // Don't update width when not active or paused
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
            if (!this.isActive) return;
            
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
            if (!this.isActive) return;
            
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
            if (!this.isActive) return;
            
            if (index !== this.currentIndex) {
                console.log(`🔄 Switching from service ${this.currentIndex} to ${index}`);
                
                // Clear video-related pause reasons
                this.resumeTimer('video-playing');
                this.resumeTimer('youtube-interaction');
                this.resumeTimer('youtube-playing');
                
                // Reset YouTube state
                this.youtubeIsPlaying = false;
                
                // Reset progress width to full
                this.progressWidth = 100;
                
                // Update current index
                this.currentIndex = index;
                
                // Start new timer
                this.startTimer();
                this.scrollTabIntoView(index);
            }
        },

        nextService() {
            const nextIndex = (this.currentIndex + 1) % this.services.length;
            console.log(`⏭️ Auto-advancing to service: ${nextIndex}`);
            this.selectService(nextIndex);
        },

        // =============== YOUTUBE IFRAME API ===============
        loadYouTubeAPI() {
            console.log('🔍 loadYouTubeAPI called');
            console.log('🔍 window.YT exists:', !!window.YT);
            console.log('🔍 window.YT.Player exists:', !!(window.YT && window.YT.Player));
            console.log('🔍 window.onYouTubeIframeAPIReady exists:', !!window.onYouTubeIframeAPIReady);
            
            // Check if YouTube API is already loaded
            if (window.YT && window.YT.Player) {
                console.log('📺 YouTube API already loaded');
                this.setupYouTubePlayer();
                return;
            }
            
            // Check if API is already being loaded
            if (window.onYouTubeIframeAPIReady) {
                console.log('📺 YouTube API loading in progress - replacing callback');
            }
            
            console.log('📺 Loading YouTube IFrame API...');
            
            // Store reference to this component instance
            const componentInstance = this;
            
            // Set up the callback for when API is ready
            window.onYouTubeIframeAPIReady = function() {
                console.log('📺 YouTube API loaded successfully - callback fired!');
                componentInstance.setupYouTubePlayer();
            };
            
            // Load the YouTube API script
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            tag.onload = () => console.log('📺 YouTube API script loaded');
            tag.onerror = () => console.error('❌ Failed to load YouTube API script');
            
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            
            console.log('📺 YouTube API script tag added to DOM');
        },

        setupYouTubePlayer() {
            // Wait a bit for DOM to be ready
            setTimeout(() => {
                this.createYouTubePlayerInstances();
            }, 500);
        },

        createYouTubePlayerInstances() {
            console.log('📺 Setting up YouTube player instances...');
            
            // Find all YouTube iframes
            const youtubeIframes = this.$el.querySelectorAll('iframe[src*="youtube.com"]');
            console.log(`Found ${youtubeIframes.length} YouTube iframes`);
            
            youtubeIframes.forEach((iframe, index) => {
                // Give iframe an ID if it doesn't have one
                if (!iframe.id) {
                    iframe.id = `youtube-player-${index}`;
                }
                
                console.log(`📺 Creating YT.Player for iframe ID: ${iframe.id}`);
                
                try {
                    const player = new YT.Player(iframe.id, {
                        events: {
                            'onStateChange': (event) => this.onYouTubeStateChange(event, index)
                        }
                    });
                    
                    // Store player reference
                    if (!this.youtubePlayers) this.youtubePlayers = new Map();
                    this.youtubePlayers.set(iframe.id, player);
                    
                    console.log(`✅ YouTube player created successfully for ${iframe.id}`);
                } catch (error) {
                    console.error('❌ Failed to create YouTube player:', error);
                }
            });
        },

        onYouTubeStateChange(event, playerIndex) {
            console.log(`📺 YouTube player ${playerIndex} state changed:`, event.data);
            
            switch(event.data) {
                case YT.PlayerState.PLAYING:
                    if (!this.youtubeIsPlaying) {
                        this.youtubeIsPlaying = true;
                        console.log('📹 YouTube video started playing - PAUSING TIMER');
                        this.pauseTimer('youtube-playing');
                    }
                    break;
                    
                case YT.PlayerState.PAUSED:
                    if (this.youtubeIsPlaying) {
                        this.youtubeIsPlaying = false;
                        console.log('📹 YouTube video paused - RESUMING TIMER');
                        this.resumeTimer('youtube-playing');
                    }
                    break;
                    
                case YT.PlayerState.ENDED:
                    if (this.youtubeIsPlaying) {
                        this.youtubeIsPlaying = false;
                        console.log('📹 YouTube video ended - RESUMING TIMER');
                        this.resumeTimer('youtube-playing');
                    }
                    break;
                    
                case YT.PlayerState.BUFFERING:
                    console.log('📹 YouTube video buffering');
                    break;
                    
                case YT.PlayerState.CUED:
                    console.log('📹 YouTube video cued');
                    break;
                    
                case YT.PlayerState.UNSTARTED:
                    console.log('📹 YouTube video unstarted');
                    break;
            }
        },

        // =============== DIRECT VIDEO EVENT LISTENERS ===============
        setupVideoEventListeners() {
            // Wait for DOM to be fully ready
            setTimeout(() => {
                this.attachVideoListeners();
            }, 1000);
        },

        attachVideoListeners() {
            console.log('🎬 Setting up direct video event listeners...');
            
            // Find ALL videos and iframes in the component
            const allVideos = this.$el.querySelectorAll('video');
            const allIframes = this.$el.querySelectorAll('iframe[src*="youtube.com"]');
            
            console.log(`Found ${allVideos.length} HTML5 videos and ${allIframes.length} YouTube iframes`);
            
            // Attach listeners to HTML5 videos
            allVideos.forEach((video, index) => {
                console.log(`📽️ Attaching listeners to HTML5 video ${index}`);
                
                video.addEventListener('play', () => {
                    console.log(`📹 HTML5 video ${index} started playing - PAUSING TIMER`);
                    this.pauseTimer('video-playing');
                });
                
                video.addEventListener('pause', () => {
                    console.log(`📹 HTML5 video ${index} paused - RESUMING TIMER`);
                    this.resumeTimer('video-playing');
                });
                
                video.addEventListener('ended', () => {
                    console.log(`📹 HTML5 video ${index} ended - RESUMING TIMER`);
                    this.resumeTimer('video-playing');
                });
            });
            
            // For YouTube iframes, we'll use a different approach
            allIframes.forEach((iframe, index) => {
                console.log(`📺 Found YouTube iframe ${index}`);
                
                // Note: Hover pause/resume functionality removed per user request
            });
        },

        // =============== DESKTOP HOVER INTERACTIONS ===============
        handleTabHover(index, isEntering) {
            console.log(`🖱️ Tab hover: index=${index}, isEntering=${isEntering}, currentIndex=${this.currentIndex}, screenWidth=${window.innerWidth}`);
            if (window.innerWidth > 768) {
                if (isEntering && index === this.currentIndex) {
                    console.log('⏸️ Pausing timer due to tab hover');
                    this.pauseTimer('tab-hover');
                } else if (!isEntering) {
                    console.log('▶️ Resuming timer after tab hover');
                    this.resumeTimer('tab-hover');
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
            
            // Mark component as inactive
            this.isActive = false;
            
            this.clearTimers();
            
            // Clear page check interval
            if (this.pageCheckInterval) {
                clearInterval(this.pageCheckInterval);
                this.pageCheckInterval = null;
            }
            
            if (this.touchHoldTimeout) {
                clearTimeout(this.touchHoldTimeout);
                this.touchHoldTimeout = null;
            }
            
            if (this.lastVideoStates) {
                this.lastVideoStates.clear();
            }
            
            if (this.youtubePlayers) {
                this.youtubePlayers.clear();
            }
        }
    }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (typeof Alpine !== 'undefined') {
        // Wrap the component to add additional page checking
        Alpine.data('servicesShowcase', function() {
            const component = servicesShowcase();
            
            // Override init to add additional safety checks
            const originalInit = component.init;
            component.init = function() {
                console.log('🔧 Alpine.js initializing servicesShowcase component...');
                
                // Double-check if we should run
                if (!this.isHomePage()) {
                    console.log('❌ Alpine init: Not on home page - component will remain inactive');
                    return;
                }
                
                // Call original init
                return originalInit.call(this);
            };
            
            return component;
        });
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { servicesShowcase };
}