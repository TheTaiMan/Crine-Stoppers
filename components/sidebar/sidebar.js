// Sidebar Component Logic
function sidebar() {
    return {
        isOpen: true,
        isMobile: false,
        sidebarContent: '',
        
        initSidebar() {
            this.loadSidebarContent();
            
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