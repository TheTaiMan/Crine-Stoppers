// Main Application Logic with SPA Routing
function app() {
    return {
        isLoading: false,
        pageContent: '',
        footerContent: '',
        currentPage: 'home',
        activeSection: '',
        pageCache: {},
        
        // Navigation configuration
        navigation: [
            {
                id: 'home',
                name: 'Home',
                path: '#home',
                icon: 'home_icon.svg',
                sections: [
                    { id: 'who-we-are', title: 'Who We Are' },
                    { id: 'how-it-works', title: 'How It Works' },
                    { id: 'contact-methods', title: 'Contact Methods' }
                ]
            },
            {
                id: 'about_us',
                name: 'About Us',
                path: '#about_us',
                icon: 'about_us_icon.svg',
                sections: []
            },
            {
                id: 'resources',
                name: 'Resources',
                path: '#resources',
                icon: 'resources_icon.svg',
                sections: [
                    { id: 'crime-prevention', title: 'Crime Prevention' },
                    { id: 'safety-tips', title: 'Safety Tips' },
                    { id: 'community-programs', title: 'Community Programs' }
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
            this.handleInitialRoute();
            this.setupHashChangeListener();
            this.setupScrollSpy();
            this.preloadCommonPages();
        },
        
        // Pre-load common pages for instant navigation
        async preloadCommonPages() {
            const commonPages = ['home', 'about_us', 'resources'];
            for (const pageId of commonPages) {
                if (!this.pageCache[pageId]) {
                    try {
                        const response = await fetch(`pages/${pageId}.html`);
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
            
            const page = this.navigation.find(nav => nav.path === hash);
            return page ? page.id : null;
        },
        
        // Convert page ID to hash
        getHashFromPageId(pageId) {
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
                    });
                    return;
                }
                
                // Load page from file if not cached
                const response = await fetch(`pages/${pageId}.html`);
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
                
                // Update URL hash
                window.history.replaceState(null, '', `${window.location.pathname}${window.location.hash}#${sectionId}`);
                
                // Update active section
                this.activeSection = sectionId;
            }
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
        }
    };
}