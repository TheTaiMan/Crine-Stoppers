// Sidebar Component Logic
function sidebar() {
    return {
        isOpen: true,
        isMobile: false,
        mobileNavOpen: false,
        sidebarContent: '',
        
        initSidebar() {
            this.loadSidebarContent();
            
            // Clean up any leftover mobile nav classes
            document.body.classList.remove('mobile-nav-open');
            
            // Listen for window resize
            window.addEventListener('resize', () => {
                this.checkMobile();
            });
            
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
            } else {
                this.isOpen = true;
                // Close mobile nav and restore scroll when switching to desktop
                if (this.mobileNavOpen) {
                    this.closeMobileNav();
                }
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
                document.body.classList.add('mobile-nav-open');
            } else {
                document.body.classList.remove('mobile-nav-open');
            }
        },
        
        openMobileNav() {
            this.mobileNavOpen = true;
            // Ensure body scroll is disabled
            document.body.classList.add('mobile-nav-open');
        },
        
        closeMobileNav() {
            this.mobileNavOpen = false;
            // Ensure body scroll is restored
            document.body.classList.remove('mobile-nav-open');
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