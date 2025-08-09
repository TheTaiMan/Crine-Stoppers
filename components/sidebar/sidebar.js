// Sidebar Component Logic
function sidebar() {
    return {
        isOpen: true,
        isMobile: false,
        mobileNavOpen: false,
        sidebarContent: '',
        scrollPosition: 0, // Store scroll position when mobile nav opens
        
        initSidebar() {
            this.loadSidebarContent();
            
            // Clean up any leftover mobile nav classes
            document.body.classList.remove('mobile-nav-open');
            
            // Listen for window resize
            window.addEventListener('resize', () => {
                this.checkMobile();
            });
            
            // Simplified: CSS env() handles viewport changes automatically
            
            // Close sidebar when clicking outside on mobile
            document.addEventListener('click', (e) => {
                if (this.isMobile && this.isOpen && !e.target.closest('.sidebar') && !e.target.closest('.mobile-menu-toggle')) {
                    this.close();
                }
            });
        },
        
        checkMobile() {
            this.isMobile = window.innerWidth <= 768;
            if (this.isMobile) {
                this.isOpen = false;
                // CSS env() handles safe areas automatically
            } else {
                this.isOpen = true;
                // Close mobile nav and restore scroll when switching to desktop
                if (this.mobileNavOpen) {
                    this.closeMobileNav();
                }
                
                // Re-check banner visibility when switching from mobile to desktop
                setTimeout(() => {
                    if (window.recheckBannerVisibility) {
                        window.recheckBannerVisibility();
                    }
                }, 100);
            }
            
            // Update tip button visibility when screen size changes
            const appElement = document.querySelector('[x-data*="app()"]');
            if (appElement && appElement.__x && appElement.__x.$data && appElement.__x.$data.updateTipButtonVisibility) {
                appElement.__x.$data.updateTipButtonVisibility();
            }
        },
        
        toggle() {
            this.isOpen = !this.isOpen;
        },
        
        open() {
            this.isOpen = true;
        },
        
        close() {
            this.isOpen = false;
        },
        
        toggleMobileNav() {
            this.mobileNavOpen = !this.mobileNavOpen;
            // Ensure body scroll state matches mobile nav state
            if (this.mobileNavOpen) {
                // Store current scroll position before opening mobile nav
                this.scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
                document.body.classList.add('mobile-nav-open');
                // Apply the stored scroll position to prevent jump
                document.body.style.top = `-${this.scrollPosition}px`;
            } else {
                document.body.classList.remove('mobile-nav-open');
                // Restore scroll position
                document.body.style.top = '';
                window.scrollTo(0, this.scrollPosition);
            }
        },
        
        openMobileNav() {
            this.mobileNavOpen = true;
            // Store current scroll position before opening mobile nav
            this.scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
            // Ensure body scroll is disabled
            document.body.classList.add('mobile-nav-open');
            // Apply the stored scroll position to prevent jump
            document.body.style.top = `-${this.scrollPosition}px`;
        },
        
        closeMobileNav() {
            this.mobileNavOpen = false;
            // Ensure body scroll is restored
            document.body.classList.remove('mobile-nav-open');
            // Restore scroll position
            document.body.style.top = '';
            window.scrollTo(0, this.scrollPosition);
            
            // Re-check banner visibility when closing mobile nav (switching to desktop view)
            setTimeout(() => {
                if (window.recheckBannerVisibility) {
                    window.recheckBannerVisibility();
                }
            }, 100);
        },
        
        navigateToMobile(path) {
            this.closeMobileNav();
            // Use existing navigation logic from app.js
            if (window.navigateTo) {
                window.navigateTo(path);
            }
        },
        
        
        scrollToSectionMobile(sectionId) {
            this.closeMobileNav();
            // Use existing scroll logic from app.js
            if (window.scrollToSection) {
                window.scrollToSection(sectionId);
            }
        },
        
        openTipSubmission() {
            this.closeMobileNav();
            window.open('https://winnipegcrimestoppers.org/submit-tip', '_blank');
        },
        
        openDonation() {
            this.closeMobileNav();
            // Add donation URL when available
            console.log('Donation button clicked');
        },
        
        async loadSidebarContent() {
            try {
                const response = await fetch('components/sidebar/sidebar.html');
                this.sidebarContent = await response.text();
            } catch (error) {
                console.error('Error loading sidebar content:', error);
                this.sidebarContent = '<div class="error">Unable to load navigation</div>';
            }
        },
        
        showPlaceholderIcon(event) {
            // Replace missing icons with placeholder
            const placeholder = document.createElement('div');
            placeholder.className = 'nav-icon-placeholder';
            event.target.parentNode.replaceChild(placeholder, event.target);
        }
    };
}