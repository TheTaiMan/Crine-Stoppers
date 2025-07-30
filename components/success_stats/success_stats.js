// Success Statistics Component - Animated Counters
function successStats() {
    return {
        // Counter values (these will animate from 0 to target)
        counters: {
            value1: 0,    // $150,000,000+
            value2: 0,    // 14,500 cases
            value3: 0,    // 1,275
            value4: 0,    // $49,200,000
            value5: 0,    // $1,304,000+
            value6: 0,    // 30
            value7: 0,    // 1,510
            value8: 0,    // 5,121
            value9: 0,    // $3,200,000
            value10: 0,   // 46
            value11: 0,   // $4,300,000
            value12: 0,   // 1,924
            value13: 0,   // 2,600
            value14: 0,   // $90,200,000
            value15: 0    // 7,070
        },
        
        // Target values (final numbers)
        targets: {
            value1: 150000000,    // $150,000,000+
            value2: 14500,        // 14,500 cases
            value3: 1275,         // 1,275
            value4: 49200000,     // $49,200,000
            value5: 1304000,      // $1,304,000+ (fixed from original typo)
            value6: 30,           // 30
            value7: 1510,         // 1,510
            value8: 5121,         // 5,121
            value9: 3200000,      // $3,200,000
            value10: 46,          // 46
            value11: 4300000,     // $4,300,000
            value12: 1924,        // 1,924
            value13: 2600,        // 2,600
            value14: 90200000,    // $90,200,000
            value15: 7070         // 7,070
        },
        
        // Animation state
        isAnimating: false,
        hasAnimated: false,
        observer: null,
        
        init() {
            console.log('Success Stats: Initializing...');
            console.log('Success Stats: Target values:', this.targets);
            console.log('Success Stats: Number of target values:', Object.keys(this.targets).length);
            
            // Set up intersection observer to trigger animation when component comes into view
            this.setupIntersectionObserver();
            
            // Add fallback for mobile Chrome issues
            this.setupMobileFallback();
        },
        
        setupIntersectionObserver() {
            // Check if IntersectionObserver is supported
            if (!window.IntersectionObserver) {
                console.log('Success Stats: IntersectionObserver not supported, using fallback');
                this.triggerAnimationWithDelay();
                return;
            }

            const options = {
                root: null, 
                rootMargin: '-50px 0px -50px 0px', // More lenient for mobile
                threshold: [0.1, 0.3, 0.5] // Multiple thresholds for better mobile detection
            };
            
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    console.log('Success Stats: Intersection observed', {
                        isIntersecting: entry.isIntersecting,
                        intersectionRatio: entry.intersectionRatio,
                        hasAnimated: this.hasAnimated,
                        isMobile: this.isMobileDevice()
                    });
                    
                    // More lenient conditions for mobile
                    const shouldAnimate = entry.isIntersecting && 
                                        (entry.intersectionRatio > 0.1) && 
                                        !this.hasAnimated;
                    
                    if (shouldAnimate) {
                        console.log('🎯 Success Stats: Component in view, starting animation...');
                        this.startCountAnimation();
                        this.hasAnimated = true;
                        
                        // Stop observing after first animation
                        this.observer.unobserve(entry.target);
                    }
                });
            }, options);
            
            // Enhanced initialization with mobile-specific timing
            this.$nextTick(() => {
                const delay = this.isMobileDevice() ? 500 : 100; // Longer delay for mobile
                setTimeout(() => {
                    if (this.$el) {
                        console.log('Success Stats: Starting to observe element for scroll animation');
                        this.observer.observe(this.$el);
                    }
                }, delay);
            });
        },
        
        isMobileDevice() {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                   (window.innerWidth <= 768) ||
                   ('ontouchstart' in window);
        },
        
        setupMobileFallback() {
            // For mobile Chrome, add additional trigger mechanisms
            if (this.isMobileDevice()) {
                console.log('Success Stats: Setting up mobile fallback mechanisms');
                
                // Fallback 1: Trigger on page scroll (with throttle)
                let scrollTimeout;
                const handleScroll = () => {
                    if (this.hasAnimated) return;
                    
                    clearTimeout(scrollTimeout);
                    scrollTimeout = setTimeout(() => {
                        if (this.isElementInViewport() && !this.hasAnimated) {
                            console.log('🎯 Success Stats: Mobile scroll fallback triggered');
                            this.startCountAnimation();
                            this.hasAnimated = true;
                            window.removeEventListener('scroll', handleScroll);
                        }
                    }, 150);
                };
                
                window.addEventListener('scroll', handleScroll, { passive: true });
                
                // Fallback 2: Trigger after longer delay if still not animated
                setTimeout(() => {
                    if (!this.hasAnimated && this.isElementInViewport()) {
                        console.log('🎯 Success Stats: Mobile timeout fallback triggered');
                        this.startCountAnimation();
                        this.hasAnimated = true;
                    }
                }, 3000);
                
                // Fallback 3: Trigger on touch events
                const handleTouch = () => {
                    if (this.hasAnimated) return;
                    
                    setTimeout(() => {
                        if (this.isElementInViewport() && !this.hasAnimated) {
                            console.log('🎯 Success Stats: Mobile touch fallback triggered');
                            this.startCountAnimation();
                            this.hasAnimated = true;
                            document.removeEventListener('touchstart', handleTouch);
                        }
                    }, 100);
                };
                
                document.addEventListener('touchstart', handleTouch, { passive: true });
            }
        },
        
        isElementInViewport() {
            if (!this.$el) return false;
            
            const rect = this.$el.getBoundingClientRect();
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;
            const windowWidth = window.innerWidth || document.documentElement.clientWidth;
            
            // Element is in viewport if any part is visible
            return (
                rect.top < windowHeight &&
                rect.bottom > 0 &&
                rect.left < windowWidth &&
                rect.right > 0
            );
        },
        
        triggerAnimationWithDelay() {
            // Immediate fallback for unsupported browsers
            setTimeout(() => {
                if (!this.hasAnimated) {
                    console.log('🎯 Success Stats: Fallback animation triggered');
                    this.startCountAnimation();
                    this.hasAnimated = true;
                }
            }, 1000);
        },
        
        startCountAnimation() {
            if (this.isAnimating) return;
            
            this.isAnimating = true;
            // Shorter duration for mobile for better performance
            const duration = this.isMobileDevice() ? 2000 : 2500;
            const steps = this.isMobileDevice() ? 60 : 80; // Fewer steps on mobile
            const stepDuration = duration / steps;
            
            console.log('🚀 Success Stats: Starting count animation...');
            
            // Calculate increment for each counter with easing
            const increments = {};
            Object.keys(this.targets).forEach(key => {
                increments[key] = this.targets[key] / steps;
            });
            
            let currentStep = 0;
            let startTime = performance.now();
            
            const animate = (timestamp) => {
                if (!startTime) startTime = timestamp;
                const elapsed = timestamp - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Apply easing function (ease-out)
                const easedProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
                
                // Update all counters
                Object.keys(this.targets).forEach(key => {
                    if (progress >= 1) {
                        // Final step - set to exact target
                        this.counters[key] = this.targets[key];
                    } else {
                        // Apply easing to make animation feel more natural
                        this.counters[key] = Math.floor(this.targets[key] * easedProgress);
                    }
                });
                
                if (progress < 1) {
                    // Use requestAnimationFrame for smoother animation on mobile
                    if (window.requestAnimationFrame) {
                        requestAnimationFrame(animate);
                    } else {
                        // Fallback for older browsers
                        setTimeout(() => animate(performance.now()), 16);
                    }
                } else {
                    this.isAnimating = false;
                    console.log('✅ Success Stats: Animation complete!');
                }
            };
            
            // Small delay before starting animation for better effect
            setTimeout(() => {
                if (window.requestAnimationFrame) {
                    requestAnimationFrame(animate);
                } else {
                    animate(performance.now());
                }
            }, 200);
        },
        
        formatNumber(num) {
            if (num === 0) return '0';
            
            // Handle large numbers with commas
            if (num >= 1000000) {
                // For millions, show in M format if over 10M, otherwise show with commas
                if (num >= 10000000) {
                    return (num / 1000000).toFixed(0) + 'M';
                } else {
                    return num.toLocaleString();
                }
            } else if (num >= 1000) {
                // Add commas for thousands
                return num.toLocaleString();
            } else {
                // Small numbers stay as is
                return num.toString();
            }
        },
        
        // Cleanup when component is destroyed
        destroy() {
            if (this.observer) {
                this.observer.disconnect();
            }
            
            // Clean up mobile fallback event listeners
            window.removeEventListener('scroll', this.handleScroll);
            document.removeEventListener('touchstart', this.handleTouch);
            
            console.log('Success Stats: Component destroyed');
        }
    }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (typeof Alpine !== 'undefined') {
        Alpine.data('successStats', successStats);
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { successStats };
}