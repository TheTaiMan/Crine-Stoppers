// Main Application Logic with SPA Routing
function app() {
    return {
        isLoading: false,
        pageContent: '',
        footerContent: '',
        underConstructionContent: '',
        currentPage: 'home',
        activeSection: '',
        pageCache: {},
        isBannerInView: true,
        showSidebarTipButton: false, // Initialize as false since banner starts in view (desktop sidebar)
        showMobileTipButton: window.innerWidth <= 768, // Set initial state based on screen size
        
        // Update tip button visibility based on banner state
        updateTipButtonVisibility() {
            console.log('updateTipButtonVisibility called - currentPage:', this.currentPage, 'isBannerInView:', this.isBannerInView, 'window width:', window.innerWidth);
            
            const isMobile = window.innerWidth <= 768;
            
            // Mobile tip button logic - always visible on mobile
            if (isMobile) {
                console.log('Mobile screen detected, always showing mobile button');
                this.showMobileTipButton = true;
            } else {
                // On desktop, mobile tip button is never shown (mobile nav not visible)
                this.showMobileTipButton = false;
            }
            
            // Desktop sidebar tip button logic
            if (isMobile) {
                // On mobile screens, hide desktop sidebar button (sidebar not visible)
                this.showSidebarTipButton = false;
            } else {
                // Desktop logic: Always show on non-home pages
                if (this.currentPage !== 'home') {
                    console.log('Desktop - Not home page, showing sidebar button');
                    this.showSidebarTipButton = true;
                } else {
                    // On desktop home page, hide sidebar button when banner is in view
                    // Show sidebar button when banner is out of view (scrolled past)
                    const shouldShow = !this.isBannerInView;
                    console.log('Desktop home page - shouldShow:', shouldShow);
                    this.showSidebarTipButton = shouldShow;
                }
            }
        },
        
        // Navigation configuration
        navigation: [
            {
                id: 'home',
                name: 'Home',
                path: '#home',
                icon: 'home_icon.svg',
                sections: [
                    { id: 'who-we-are', title: 'Who We Are' },
                    { id: 'services', title: 'Services' },
                    { id: 'our-successes', title: 'Our Successes' }
                ]
            },
            {
                id: 'about_us',
                name: 'About Us',
                path: '#about_us',
                icon: 'about_us_icon.svg',
                sections: [
                    { id: 'crime-prevention', title: 'Anonymity' },
                    { id: 'safety-tips', title: 'How it works' },
                    { id: 'community-programs', title: 'Faq' },
                    { id: 'community-program1s', title: 'In Memory Of' }
                ]
            },
            {
                id: 'resources',
                name: 'Resources',
                path: '#resources',
                icon: 'resources_icon.svg',
                sections: [
                    { id: 'resources-wanted', title: 'Wanted' },
                    { id: 'resources-contraband-tobacco', title: 'Countraband Tobacco' },
                    { id: 'resources-important-numbers', title: 'Important Numbers' },
                    { id: 'resources-links', title: 'Links' }
                ]
            },
            {
                id: 'news',
                name: 'News',
                path: '#news',
                icon: 'news_icon.svg',
                sections: []
            },
            {
                id: 'volunteer',
                name: 'Volunteer',
                path: '#volunteer',
                icon: 'volunteer_icon.svg',
                sections: [
                    { id: 'opportunities', title: 'Opportunities' },
                    { id: 'application', title: 'Application Process' },
                    { id: 'benefits', title: 'Benefits' }
                ]
            },
            {
                id: 'events',
                name: 'Events',
                path: '#events',
                icon: 'events_icon.svg',
                sections: []
            },
            {
                id: 'sponsors',
                name: 'Sponsors',
                path: '#sponsors',
                icon: 'sponsors_icon.svg',
                sections: []
            }
        ],
        
        // Initialize the application
        init() {
            this.loadFooter();
            this.loadUnderConstructionComponent();
            this.handleInitialRoute();
            this.setupHashChangeListener();
            this.setupScrollSpy();
            this.preloadCommonPages();
            
            // Initialize tip button visibility
            this.updateTipButtonVisibility();
            
            // Add window resize listener for immediate tip button updates
            window.addEventListener('resize', () => {
                // Immediate update during resize to prevent button disappearing
                this.updateTipButtonVisibility();
            });
        },
        
        // Pre-load common pages for instant navigation
        async preloadCommonPages() {
            const commonPages = ['home', 'about_us', 'resources'];
            for (const pageId of commonPages) {
                if (!this.pageCache[pageId]) {
                    try {
                        const response = await fetch(`pages/${pageId}/${pageId}.html`);
                        if (response.ok) {
                            this.pageCache[pageId] = await response.text();
                        }
                    } catch (error) {
                        console.log(`Could not preload ${pageId}:`, error);
                    }
                }
            }
        },
        
        // Handle initial page load routing
        handleInitialRoute() {
            const hash = window.location.hash || '#home';
            const pageId = this.getPageIdFromHash(hash);
            if (pageId) {
                this.currentPage = pageId;
                this.loadPage(pageId);
            } else {
                // Default to home page
                this.navigateTo('#home');
            }
        },
        
        // Convert hash to page ID
        getPageIdFromHash(hash) {
            if (!hash || hash === '#' || hash === '#home') return 'home';
            
            // Special case for donate page (not in navigation but still a valid page)
            if (hash === '#donate') return 'donate';
            
            // Special case for submit_tip page (not in navigation but still a valid page)
            if (hash === '#submit_tip') return 'submit_tip';
            
            const page = this.navigation.find(nav => nav.path === hash);
            return page ? page.id : null;
        },
        
        // Convert page ID to hash
        getHashFromPageId(pageId) {
            // Special case for donate page
            if (pageId === 'donate') return '#donate';
            
            // Special case for submit_tip page
            if (pageId === 'submit_tip') return '#submit_tip';
            
            const page = this.navigation.find(nav => nav.id === pageId);
            return page ? page.path : '#home';
        },
        
        // Main navigation function
        async navigateTo(hash) {
            const pageId = this.getPageIdFromHash(hash);
            if (!pageId) {
                console.error('Page not found:', hash);
                return;
            }
            
            // Only show loading for uncached pages
            const showLoading = !this.pageCache[pageId];
            if (showLoading) {
                this.isLoading = true;
            }
            
            try {
                // Update URL hash
                if (window.location.hash !== hash) {
                    window.location.hash = hash;
                }
                
                // Update current page
                this.currentPage = pageId;
                
                // Load page content
                await this.loadPage(pageId);
                
                // Reset active section
                this.activeSection = '';
                
                // Handle banner visibility state based on page
                if (pageId !== 'home') {
                    this.isBannerInView = false; // Always show tip button on non-home pages
                    // Clean up banner observer when leaving home page
                    if (this.bannerObserver) {
                        this.bannerObserver.disconnect();
                        this.bannerObserver = null;
                    }
                } else {
                    // Reset to true when entering home page (banner is initially visible)
                    this.isBannerInView = true;
                }
                
                // Update tip button visibility after page change
                this.updateTipButtonVisibility();
                
                // Scroll to top
                window.scrollTo(0, 0);
                
            } catch (error) {
                console.error('Navigation error:', error);
                this.pageContent = '<div class="error">Error loading page content</div>';
            } finally {
                if (showLoading) {
                    this.isLoading = false;
                }
            }
        },
        
        // Load page content from HTML file with caching
        async loadPage(pageId) {
            try {
                // Check if page is already cached
                if (this.pageCache[pageId]) {
                    this.pageContent = this.pageCache[pageId];
                    this.updatePageTitle(pageId);
                    this.$nextTick(() => {
                        this.setupScrollSpy();
                        
                        // Load banner component if this is the home page
                        if (pageId === 'home') {
                            this.loadBannerComponent();
                            this.loadServicesShowcaseComponent();
                            this.loadSuccessStatsComponent();
                            // Set up banner visibility observer after banner loads
                            // Use multiple strategies to ensure banner observer is set up
                            setTimeout(() => {
                                this.setupBannerVisibilityObserver();
                            }, 300);
                            
                            // Backup attempt in case the first one fails
                            setTimeout(() => {
                                if (!this.bannerObserver && this.currentPage === 'home') {
                                    this.setupBannerVisibilityObserver();
                                }
                            }, 1000);
                        }
                        
                        // Initialize submit tip copy buttons if this is the submit_tip page
                        if (pageId === 'submit_tip') {
                            setTimeout(() => {
                                if (window.initSubmitTipButtons) {
                                    window.initSubmitTipButtons();
                                }
                            }, 100);
                        }
                    });
                    return;
                }
                
                // Load page from file if not cached
                const response = await fetch(`pages/${pageId}/${pageId}.html`);
                if (!response.ok) {
                    throw new Error(`Failed to load page: ${response.status}`);
                }
                
                const content = await response.text();
                
                // Cache the content
                this.pageCache[pageId] = content;
                this.pageContent = content;
                
                // Update page title
                this.updatePageTitle(pageId);
                
                // Setup scroll spy for this page
                this.$nextTick(() => {
                    this.setupScrollSpy();
                    
                    // Load banner component if this is the home page
                    if (pageId === 'home') {
                        this.loadBannerComponent();
                        this.loadServicesShowcaseComponent();
                        this.loadSuccessStatsComponent();
                        // Set up banner visibility observer after banner loads
                        // Use multiple strategies to ensure banner observer is set up
                        setTimeout(() => {
                            this.setupBannerVisibilityObserver();
                        }, 300);
                        
                        // Backup attempt in case the first one fails
                        setTimeout(() => {
                            if (!this.bannerObserver && this.currentPage === 'home') {
                                this.setupBannerVisibilityObserver();
                            }
                        }, 1000);
                    }
                    
                    // Initialize submit tip copy buttons if this is the submit_tip page
                    if (pageId === 'submit_tip') {
                        setTimeout(() => {
                            if (window.initSubmitTipButtons) {
                                window.initSubmitTipButtons();
                            }
                        }, 100);
                    }
                });
                
            } catch (error) {
                console.error('Error loading page:', error);
                const errorContent = `
                    <div class="section">
                        <h2>Page Not Found</h2>
                        <p>Sorry, the requested page could not be loaded.</p>
                        <button onclick="window.location.reload()" class="btn btn-primary">
                            Refresh Page
                        </button>
                    </div>
                `;
                this.pageCache[pageId] = errorContent;
                this.pageContent = errorContent;
            }
        },
        
        // Load footer content
        async loadFooter() {
            try {
                const response = await fetch('components/footer/footer.html');
                this.footerContent = await response.text();
            } catch (error) {
                console.error('Error loading footer:', error);
                this.footerContent = '<div class="error">Unable to load footer</div>';
            }
        },

        // Load under construction component content
        async loadUnderConstructionComponent() {
            try {
                const response = await fetch('components/under_construction/under_construction.html');
                this.underConstructionContent = await response.text();
            } catch (error) {
                console.error('Error loading under construction component:', error);
                this.underConstructionContent = '<div class="error">Unable to load under construction banner</div>';
            }
        },

        // Load Services Showcase component
        async loadServicesShowcaseComponent() {
            try {
                const response = await fetch('components/services_showcase/services_showcase.html');
                const showcaseHTML = await response.text();
                const showcaseContainer = document.getElementById('services-showcase-component');
                if (showcaseContainer) {
                    showcaseContainer.innerHTML = showcaseHTML;
                }
            } catch (error) {
                console.error('Error loading services showcase:', error);
                const showcaseContainer = document.getElementById('services-showcase-component');
                if (showcaseContainer) {
                    showcaseContainer.innerHTML = '<div class="error">Unable to load services showcase</div>';
                }
            }
        },

        // Load Success Statistics component
        async loadSuccessStatsComponent() {
            try {
                const response = await fetch('components/success_stats/success_stats.html');
                const statsHTML = await response.text();
                const statsContainer = document.getElementById('success-stats-component');
                if (statsContainer) {
                    statsContainer.innerHTML = statsHTML;
                }
            } catch (error) {
                console.error('Error loading success stats:', error);
                const statsContainer = document.getElementById('success-stats-component');
                if (statsContainer) {
                    statsContainer.innerHTML = '<div class="error">Unable to load success statistics</div>';
                }
            }
        },

        // Load banner component
        async loadBannerComponent() {
            try {
                const response = await fetch('components/banner/banner.html');
                const bannerHTML = await response.text();
                const bannerContainer = document.getElementById('banner-component');
                if (bannerContainer) {
                    bannerContainer.innerHTML = bannerHTML;
                    // Initialize banner copy buttons after HTML is loaded
                    setTimeout(() => {
                        if (window.initBannerButtons) {
                            window.initBannerButtons();
                        }
                    }, 100);
                }
            } catch (error) {
                console.error('Error loading banner:', error);
                const bannerContainer = document.getElementById('banner-component');
                if (bannerContainer) {
                    bannerContainer.innerHTML = '<div class="error">Unable to load banner</div>';
                }
            }
        },
        
        // Update page title
        updatePageTitle(pageId) {
            const page = this.navigation.find(nav => nav.id === pageId);
            const pageTitle = page ? page.name : 'Page';
            document.title = `${pageTitle} - Crime Stoppers Winnipeg`;
        },
        
        // Handle hash changes for navigation
        setupHashChangeListener() {
            window.addEventListener('hashchange', () => {
                const hash = window.location.hash || '#home';
                const pageId = this.getPageIdFromHash(hash);
                if (pageId && pageId !== this.currentPage) {
                    this.currentPage = pageId;
                    this.loadPage(pageId);
                    this.activeSection = '';
                    window.scrollTo(0, 0);
                }
            });
        },
        
        // Scroll to specific section within a page
        scrollToSection(sectionId) {
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update URL hash properly - don't append to existing hash
                const currentPageHash = this.getHashFromPageId(this.currentPage);
                window.history.replaceState(null, '', `${window.location.pathname}${currentPageHash}`);
                
                // Update active section
                this.activeSection = sectionId;
            }
        },

        // Navigate to a page and then scroll to a specific section
        async navigateToSection(pageId, sectionId) {
            // If we're already on the target page, just scroll to the section
            if (this.currentPage === pageId) {
                this.scrollToSection(sectionId);
                return;
            }
            
            // Find the page data
            const page = this.navigation.find(nav => nav.id === pageId);
            if (!page) {
                console.error('Page not found:', pageId);
                return;
            }
            
            // Navigate to the page first
            await this.navigateTo(page.path);
            
            // Wait for the page to load and then scroll to the section
            this.$nextTick(() => {
                setTimeout(() => {
                    this.scrollToSection(sectionId);
                }, 100); // Small delay to ensure DOM is ready
            });
        },
        
        // Setup scroll spy functionality
        setupScrollSpy() {
            const currentPageData = this.navigation.find(nav => nav.id === this.currentPage);
            
            if (!currentPageData || !currentPageData.sections || currentPageData.sections.length === 0) {
                return;
            }
            
            // Create intersection observer
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.activeSection = entry.target.id;
                        }
                    });
                },
                {
                    rootMargin: '-20% 0px -80% 0px',
                    threshold: 0
                }
            );
            
            // Observe all sections on the current page
            currentPageData.sections.forEach(section => {
                const element = document.getElementById(section.id);
                if (element) {
                    observer.observe(element);
                }
            });
            
            // Store observer for cleanup
            this.scrollSpyObserver = observer;
        },
        
        // Get current page navigation data
        getCurrentPageData() {
            return this.navigation.find(nav => nav.id === this.currentPage);
        },
        
        // Check if sidebar tip button should be visible
        shouldShowSidebarTipButton() {
            // Always show on non-home pages
            if (this.currentPage !== 'home') {
                return true;
            }
            
            // On home page, hide sidebar button when banner is in view
            // Show sidebar button when banner is out of view (scrolled past)
            return !this.isBannerInView;
        },
        
        // Setup banner visibility observer for tip button
        setupBannerVisibilityObserver() {
            // Only set up on home page
            if (this.currentPage !== 'home') {
                return;
            }
            
            // Clean up existing observer
            if (this.bannerObserver) {
                this.bannerObserver.disconnect();
            }
            
            // Find the banner submit tip button element specifically
            const bannerTipButton = document.querySelector('.banner-tip-submit');
            if (!bannerTipButton) {
                // Fallback to banner if tip button not found
                const banner = document.querySelector('.banner');
                if (!banner) {
                    return;
                }
                
                // Create intersection observer for banner (fallback)
                this.bannerObserver = new IntersectionObserver(
                    (entries) => {
                        entries.forEach(entry => {
                            this.isBannerInView = entry.isIntersecting;
                            console.log('Banner (fallback) visibility changed:', entry.isIntersecting);
                            
                            // Update tip button visibility
                            this.updateTipButtonVisibility();
                        });
                    },
                    {
                        root: null,
                        rootMargin: '0px',
                        threshold: 0.1 // Trigger when 10% of banner is visible
                    }
                );
                
                this.bannerObserver.observe(banner);
                return;
            }
            
            // Create intersection observer for the submit tip button specifically
            this.bannerObserver = new IntersectionObserver(
                (entries) => {
                    entries.forEach(entry => {
                        this.isBannerInView = entry.isIntersecting;
                        console.log('Banner tip button visibility changed:', entry.isIntersecting);
                        
                        // Update tip button visibility
                        this.updateTipButtonVisibility();
                    });
                },
                {
                    root: null,
                    rootMargin: '0px',
                    threshold: 0.1 // Trigger when 10% of submit tip button is visible
                }
            );
            
            // Start observing the banner submit tip button
            this.bannerObserver.observe(bannerTipButton);
        },
        
        // Force re-check banner visibility (useful when transitioning from mobile to desktop)
        recheckBannerVisibility() {
            if (this.currentPage === 'home') {
                // Check the specific submit tip button first
                const bannerTipButton = document.querySelector('.banner-tip-submit');
                if (bannerTipButton) {
                    const rect = bannerTipButton.getBoundingClientRect();
                    const isIntersecting = rect.top < window.innerHeight && rect.bottom > 0;
                    this.isBannerInView = isIntersecting;
                } else {
                    // Fallback to banner element
                    const banner = document.querySelector('.banner');
                    if (banner) {
                        const rect = banner.getBoundingClientRect();
                        const isIntersecting = rect.top < window.innerHeight && rect.bottom > 0;
                        this.isBannerInView = isIntersecting;
                    }
                }
                
                // Update tip button visibility after manual check
                this.updateTipButtonVisibility();
            }
        }
    };
}

// Make navigateTo available globally
window.navigateTo = function(hash) {
    console.log('Global navigateTo called with hash:', hash);
    const appElement = document.querySelector('[x-data*="app()"]');
    console.log('App element found:', !!appElement);
    if (appElement && appElement.__x && appElement.__x.$data) {
        console.log('App data found, calling navigateTo');
        return appElement.__x.$data.navigateTo(hash);
    } else {
        console.error('App instance not found for navigation');
        // Fallback: try to find the app element differently
        const bodyElement = document.querySelector('body[x-data]');
        if (bodyElement && bodyElement.__x && bodyElement.__x.$data && bodyElement.__x.$data.navigateTo) {
            console.log('Using body element fallback');
            return bodyElement.__x.$data.navigateTo(hash);
        } else {
            console.error('No app instance found anywhere');
        }
    }
};

// Make navigateToSection available globally for mobile navigation
window.navigateToSection = function(pageId, sectionId) {
    const appElement = document.querySelector('[x-data*="app()"]');
    if (appElement && appElement.__x && appElement.__x.$data) {
        return appElement.__x.$data.navigateToSection(pageId, sectionId);
    } else {
        console.error('App instance not found for navigation');
    }
};

// Make recheckBannerVisibility available globally for sidebar
window.recheckBannerVisibility = function() {
    const appElement = document.querySelector('[x-data*="app()"]');
    if (appElement && appElement.__x && appElement.__x.$data) {
        return appElement.__x.$data.recheckBannerVisibility();
    } else {
        console.error('App instance not found for banner visibility check');
    }
};

// Make shouldShowSidebarTipButton available globally
window.shouldShowSidebarTipButton = function() {
    const appElement = document.querySelector('body[x-data]');
    if (appElement && appElement.__x && appElement.__x.$data) {
        return appElement.__x.$data.shouldShowSidebarTipButton();
    } else {
        console.error('App instance not found for shouldShowSidebarTipButton check');
        return true; // Default to showing the button if function is not accessible
    }
};