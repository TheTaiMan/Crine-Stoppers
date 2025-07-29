// Banner Component JavaScript

class BannerComponent {
  constructor() {
    this.initCopyButtons();
    this.setupObserver();
  }

  initCopyButtons() {
    // Get all copy buttons in the banner
    const copyButtons = document.querySelectorAll('.banner-copy-button');
    
    copyButtons.forEach(button => {
      // Remove existing listeners to prevent duplicates
      button.removeEventListener('click', this.handleButtonClick);
      // Add new listener
      button.addEventListener('click', this.handleButtonClick.bind(this));
    });
  }

  handleButtonClick(e) {
    e.preventDefault();
    this.handleCopyClick(e.target.closest('.banner-copy-button'));
  }

  setupObserver() {
    // Watch for banner component being added to DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.classList && node.classList.contains('banner')) {
                // Banner was added, reinitialize buttons
                setTimeout(() => this.initCopyButtons(), 100);
              } else if (node.querySelector && node.querySelector('.banner')) {
                // Banner was added inside this node
                setTimeout(() => this.initCopyButtons(), 100);
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  async handleCopyClick(button) {
    const phoneNumber = button.getAttribute('data-phone');
    const copyText = button.querySelector('.banner-copy-text');
    const copyIcon = button.querySelector('.banner-copy-icon');
    
    if (!phoneNumber) return;

    try {
      // Copy to clipboard
      await navigator.clipboard.writeText(phoneNumber);
      
      // Show copied state
      this.showCopiedState(button, copyText, copyIcon);
      
    } catch (err) {
      // Fallback for older browsers
      this.fallbackCopyToClipboard(phoneNumber);
      this.showCopiedState(button, copyText, copyIcon);
    }
  }

  showCopiedState(button, textElement, iconElement) {
    // Store original values if not already stored
    if (!button.dataset.originalText) {
      button.dataset.originalText = textElement.textContent;
      button.dataset.originalIconSrc = iconElement.src;
    }
    
    // Update to copied state
    button.classList.add('copied');
    textElement.textContent = 'Copied';
    iconElement.src = 'assets/icons/paste_icon.svg';
    
    // Reset after 2 seconds
    setTimeout(() => {
      button.classList.remove('copied');
      textElement.textContent = button.dataset.originalText;
      iconElement.src = button.dataset.originalIconSrc;
    }, 2000);
  }

  fallbackCopyToClipboard(text) {
    // Create temporary textarea element
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Fallback copy failed:', err);
    }
    
    document.body.removeChild(textArea);
  }
}

// Global banner instance
let bannerComponentInstance = null;

// Initialize banner component
function initBannerComponent() {
  if (!bannerComponentInstance) {
    bannerComponentInstance = new BannerComponent();
  }
  return bannerComponentInstance;
}

// Global function to reinitialize banner (called from app.js)
window.initBannerButtons = function() {
  if (bannerComponentInstance) {
    bannerComponentInstance.initCopyButtons();
  } else {
    initBannerComponent();
  }
};

// Initialize banner component when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initBannerComponent();
});

// Also initialize if script is loaded after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initBannerComponent();
  });
} else {
  initBannerComponent();
}