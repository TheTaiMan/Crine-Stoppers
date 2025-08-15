// Submit Tip Page JavaScript

class SubmitTipComponent {
  constructor() {
    this.initCopyButtons();
    this.setupObserver();
  }

  initCopyButtons() {
    // Get all copy buttons in the submit tip page
    const copyButtons = document.querySelectorAll('.submit-tip-copy-button');
    
    copyButtons.forEach(button => {
      // Remove existing listeners to prevent duplicates
      button.removeEventListener('click', this.handleButtonClick);
      // Add new listener
      button.addEventListener('click', this.handleButtonClick.bind(this));
    });
  }

  handleButtonClick(e) {
    e.preventDefault();
    this.handleCopyClick(e.target.closest('.submit-tip-copy-button'));
  }

  setupObserver() {
    // Watch for submit tip component being added to DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.classList && node.classList.contains('submit-tip-info-section')) {
                // Submit tip section was added, reinitialize buttons
                setTimeout(() => this.initCopyButtons(), 100);
              } else if (node.querySelector && node.querySelector('.submit-tip-info-section')) {
                // Submit tip section was added inside this node
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
    const copyText = button.querySelector('.submit-tip-copy-text');
    const copyIcon = button.querySelector('.submit-tip-copy-icon');
    
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

// Global submit tip instance
let submitTipComponentInstance = null;

// Initialize submit tip component
function initSubmitTipComponent() {
  if (!submitTipComponentInstance) {
    submitTipComponentInstance = new SubmitTipComponent();
  }
  return submitTipComponentInstance;
}

// Global function to reinitialize submit tip (called from app.js)
window.initSubmitTipButtons = function() {
  if (submitTipComponentInstance) {
    submitTipComponentInstance.initCopyButtons();
  } else {
    initSubmitTipComponent();
  }
};

// Initialize submit tip component when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initSubmitTipComponent();
});

// Also initialize if script is loaded after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initSubmitTipComponent();
  });
} else {
  initSubmitTipComponent();
}