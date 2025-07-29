/**
 * Paragraph Block Component
 * Creates reusable paragraph blocks with vertical line, text content, and optional media
 */

class ParagraphBlock {
  constructor(options = {}) {
    this.options = {
      text: options.text || '',
      videoUrl: options.videoUrl || null,
      buttonText: options.buttonText || null,
      buttonUrl: options.buttonUrl || '#',
      reversed: options.reversed || false,
      mobile: options.mobile || false,
      container: options.container || null,
      ...options
    };
  }

  /**
   * Create and return the paragraph block element
   */
  createElement() {
    const block = document.createElement('div');
    block.className = 'paragraph-block';
    block.setAttribute('data-reversed', this.options.reversed);
    block.setAttribute('data-mobile', this.options.mobile);

    // Create the vertical line
    const line = document.createElement('div');
    line.className = 'paragraph-block-line';

    // Create the content container
    const content = document.createElement('div');
    content.className = 'paragraph-block-content';

    // Create text content
    const textContainer = document.createElement('div');
    textContainer.className = 'paragraph-block-text';
    
    const textElement = document.createElement('p');
    textElement.className = 'paragraph-text';
    textElement.innerHTML = this.options.text;
    textContainer.appendChild(textElement);

    // Add text to content
    content.appendChild(textContainer);

    // Create media content if provided
    if (this.options.videoUrl || this.options.buttonText) {
      const mediaContainer = document.createElement('div');
      mediaContainer.className = 'paragraph-block-media';

      if (this.options.videoUrl) {
        const video = this.createVideoElement();
        mediaContainer.appendChild(video);
      }

      if (this.options.buttonText) {
        const button = this.createButtonElement();
        mediaContainer.appendChild(button);
      }

      content.appendChild(mediaContainer);
    }

    // Assemble the block
    block.appendChild(line);
    block.appendChild(content);

    this.element = block;
    return block;
  }

  /**
   * Create video embed element
   */
  createVideoElement() {
    const videoContainer = document.createElement('div');
    videoContainer.className = 'paragraph-block-video';

    if (this.isYouTubeUrl(this.options.videoUrl)) {
      const iframe = document.createElement('iframe');
      iframe.src = this.getYouTubeEmbedUrl(this.options.videoUrl);
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allowfullscreen', '');
      iframe.style.width = '100%';
      iframe.style.height = '250px';
      videoContainer.appendChild(iframe);
    } else {
      // For other video types or placeholder
      const video = document.createElement('video');
      video.src = this.options.videoUrl;
      video.controls = true;
      video.style.width = '100%';
      video.style.height = '250px';
      videoContainer.appendChild(video);
    }

    return videoContainer;
  }

  /**
   * Create button element
   */
  createButtonElement() {
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'paragraph-block-button';

    const button = document.createElement('a');
    button.className = 'btn-learn-more';
    button.href = this.options.buttonUrl;

    const buttonText = document.createElement('span');
    buttonText.className = 'btn-text';
    buttonText.textContent = this.options.buttonText;

    const buttonCircle = document.createElement('div');
    buttonCircle.className = 'btn-circle';

    button.appendChild(buttonText);
    button.appendChild(buttonCircle);
    buttonContainer.appendChild(button);

    return buttonContainer;
  }

  /**
   * Check if URL is a YouTube URL
   */
  isYouTubeUrl(url) {
    return url && (url.includes('youtube.com') || url.includes('youtu.be'));
  }

  /**
   * Convert YouTube URL to embed URL
   */
  getYouTubeEmbedUrl(url) {
    let videoId = '';
    
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    }
    
    return `https://www.youtube.com/embed/${videoId}`;
  }

  /**
   * Render the block to a container
   */
  render(container) {
    const element = this.createElement();
    if (container) {
      container.appendChild(element);
    }
    return element;
  }

  /**
   * Update the text content
   */
  updateText(newText) {
    if (this.element) {
      const textElement = this.element.querySelector('.paragraph-text');
      if (textElement) {
        textElement.innerHTML = newText;
      }
    }
    this.options.text = newText;
  }

  /**
   * Toggle reversed layout
   */
  toggleReversed() {
    this.options.reversed = !this.options.reversed;
    if (this.element) {
      this.element.setAttribute('data-reversed', this.options.reversed);
    }
  }

  /**
   * Toggle mobile layout
   */
  toggleMobile() {
    this.options.mobile = !this.options.mobile;
    if (this.element) {
      this.element.setAttribute('data-mobile', this.options.mobile);
    }
  }
}

/**
 * Static method to create a paragraph block quickly
 */
ParagraphBlock.create = function(options) {
  const block = new ParagraphBlock(options);
  return block.createElement();
};

/**
 * Utility function to replace existing paragraph sections
 */
function replaceParagraphSections() {
  // Find existing white background paragraph blocks and replace them
  const existingBlocks = document.querySelectorAll('.paragraph-section, .text-block, .content-section');
  
  existingBlocks.forEach(block => {
    const text = block.textContent.trim();
    if (text) {
      const newBlock = new ParagraphBlock({ text });
      const element = newBlock.createElement();
      block.parentNode.replaceChild(element, block);
    }
  });
}

// Auto-replace on DOM content loaded if enabled
document.addEventListener('DOMContentLoaded', function() {
  // Check if auto-replacement is enabled
  if (document.body.hasAttribute('data-auto-replace-paragraphs')) {
    replaceParagraphSections();
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ParagraphBlock;
}

// Make available globally
window.ParagraphBlock = ParagraphBlock;