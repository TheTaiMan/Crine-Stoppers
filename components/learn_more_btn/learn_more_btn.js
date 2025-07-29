class LearnMoreButton {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            text: 'Learn More',
            onClick: null,
            href: null,
            ...options
        };
        
        this.render();
    }
    
    render() {
        // Create button element
        const buttonElement = this.options.href ? 'a' : 'button';
        const button = document.createElement(buttonElement);
        
        button.className = 'btn-learn-more';
        
        if (this.options.href) {
            button.href = this.options.href;
        }
        
        // Create button content
        button.innerHTML = `
            <span class="btn-text">${this.options.text}</span>
            <div class="btn-circle">
                <img src="assets/icons/arrow.svg" alt="Arrow" class="btn-arrow">
            </div>
        `;
        
        // Add click handler if provided
        if (this.options.onClick) {
            button.addEventListener('click', this.options.onClick);
        }
        
        // Clear container and append button
        this.container.innerHTML = '';
        this.container.appendChild(button);
    }
    
    // Static method to create button from HTML
    static createFromHTML(html) {
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        return template.content.firstChild;
    }
    
    // Static method to load component HTML
    static async loadHTML() {
        try {
            const response = await fetch('components/learn_more_btn/learn_more_btn.html');
            return await response.text();
        } catch (error) {
            console.error('Failed to load Learn More button component:', error);
            return `<button class="btn-learn-more">
                <span class="btn-text">Learn More</span>
                <div class="btn-circle">
                    <img src="assets/icons/arrow.svg" alt="Arrow" class="btn-arrow">
                </div>
            </button>`;
        }
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LearnMoreButton;
}