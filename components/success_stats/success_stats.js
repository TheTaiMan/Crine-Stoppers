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
        },
        
        setupIntersectionObserver() {
            const options = {
                root: null, 
                rootMargin: '-100px 0px -100px 0px', // Trigger when component is well into view
                threshold: 0.5 // Trigger when 50% of component is visible
            };
            
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    console.log('Success Stats: Intersection observed', {
                        isIntersecting: entry.isIntersecting,
                        intersectionRatio: entry.intersectionRatio,
                        hasAnimated: this.hasAnimated
                    });
                    
                    if (entry.isIntersecting && !this.hasAnimated) {
                        console.log('🎯 Success Stats: Component in view, starting animation...');
                        this.startCountAnimation();
                        this.hasAnimated = true;
                        
                        // Stop observing after first animation
                        this.observer.unobserve(entry.target);
                    }
                });
            }, options);
            
            // Start observing the component after a short delay
            this.$nextTick(() => {
                setTimeout(() => {
                    if (this.$el) {
                        console.log('Success Stats: Starting to observe element for scroll animation');
                        this.observer.observe(this.$el);
                    }
                }, 100);
            });
        },
        
        startCountAnimation() {
            if (this.isAnimating) return;
            
            this.isAnimating = true;
            const duration = 2500; // 2.5 seconds for better visibility
            const steps = 80; // More steps for smoother animation
            const stepDuration = duration / steps;
            
            console.log('🚀 Success Stats: Starting count animation...');
            
            // Calculate increment for each counter with easing
            const increments = {};
            Object.keys(this.targets).forEach(key => {
                increments[key] = this.targets[key] / steps;
            });
            
            let currentStep = 0;
            
            const animate = () => {
                currentStep++;
                
                // Apply easing function (ease-out)
                const progress = currentStep / steps;
                const easedProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
                
                // Update all counters
                Object.keys(this.targets).forEach(key => {
                    if (currentStep >= steps) {
                        // Final step - set to exact target
                        this.counters[key] = this.targets[key];
                    } else {
                        // Apply easing to make animation feel more natural
                        this.counters[key] = Math.floor(this.targets[key] * easedProgress);
                    }
                });
                
                if (currentStep < steps) {
                    setTimeout(animate, stepDuration);
                } else {
                    this.isAnimating = false;
                    console.log('✅ Success Stats: Animation complete!');
                }
            };
            
            // Small delay before starting animation for better effect
            setTimeout(() => {
                animate();
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