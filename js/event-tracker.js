/**
 * Event Tracker Module
 * Captures and logs all user interactions (clicks and views) on the website
 */
const EventTracker = (function() {
  // Store tracked elements for pageview detection
  const trackedElements = [];
  
  // Intersection Observer for detecting when elements come into view
  let observer;
  
  // Element type mapping based on tags and classes
  const elementTypeMappings = {
    'A': 'link',
    'BUTTON': 'button',
    'IMG': 'image',
    'INPUT': function(element) {
      return element.type || 'input';
    },
    'SELECT': 'dropdown',
    'TEXTAREA': 'text area',
    'DIV': function(element) {
      if (element.classList.contains('notebook')) return 'text analyzer button';
      if (element.classList.contains('mug')) return 'CV button';
      if (element.classList.contains('screen')) return 'laptop screen';
      if (element.classList.contains('music-button')) return 'music button';
      if (element.classList.contains('social-icon')) return 'social media icon';
      if (element.classList.contains('sound-control')) return 'audio control';
      return 'div';
    },
    'P': 'text paragraph',
    'H1': 'heading',
    'H2': 'subheading',
    'H3': 'subheading',
    'UL': 'list',
    'LI': 'list item',
    'SPAN': 'text span',
    'IFRAME': 'embedded content'
  };
  
  /**
   * Determines the type of element based on tag name and attributes
   * @param {HTMLElement} element - The DOM element to analyze
   * @return {string} The element type description
   */
  function getElementType(element) {
    // Check if we have a mapping for this element type
    const mapping = elementTypeMappings[element.tagName];
    
    // If mapping is a function, call it with the element
    if (typeof mapping === 'function') {
      return mapping(element);
    }
    
    // If mapping exists, return it
    if (mapping) {
      return mapping;
    }
    
    // Check for specific element identifiers if no direct mapping
    if (element.id) {
      return `${element.tagName.toLowerCase()} #${element.id}`;
    }
    
    // For elements with classes
    if (element.classList && element.classList.length > 0) {
      return `${element.tagName.toLowerCase()} .${Array.from(element.classList).join('.')}`;
    }
    
    // Get inner text for text elements (limited to avoid huge logs)
    if (element.innerText && element.innerText.trim().length > 0) {
      const text = element.innerText.trim();
      return `${element.tagName.toLowerCase()} "${text.substring(0, 20)}${text.length > 20 ? '...' : ''}"`;
    }
    
    // Default to tag name
    return element.tagName.toLowerCase();
  }
  
  /**
   * Logs event information to the console in the specified format
   * @param {string} eventType - Type of event (click/view)
   * @param {HTMLElement} element - The DOM element that triggered the event
   */
  function logEvent(eventType, element) {
    const timestamp = new Date().toISOString();
    const elementType = getElementType(element);
    
    console.log(`${timestamp}, ${eventType}, ${elementType}`);
  }
  
  /**
   * Click event handler that captures and logs all clicks
   * @param {Event} event - The click event object
   */
  function handleClick(event) {
    logEvent('click', event.target);
  }
  
  /**
   * Sets up the Intersection Observer for tracking element views
   */
  function setupViewTracking() {
    // Create observer instance
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Element has come into view
          logEvent('view', entry.target);
          
          // Optional: Stop observing this element after first view
          // observer.unobserve(entry.target);
        }
      });
    }, {
      root: null, // viewport
      rootMargin: '0px',
      threshold: 0.3 // Element is considered "viewed" when 30% is visible
    });
    
    // Select important elements to track views
    const elementsToTrack = [
      // Important sections and content
      '.screen', '.notebook', '.mug', '.email-tag',
      '.socials-wrapper', '.music-button',
      
      // Text content
      'p', 'h1', 'h2', 'h3', 
      
      // Interactive elements
      'button', 'a', 'iframe', 'img',
      
      // Specific sections to CV page
      '.cv-container', '.education-section', '.skills-section',
      '.projects-section', '.interests-section'
    ];
    
    // Find all elements that match our selectors
    elementsToTrack.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        // Add to our tracked elements and observe
        trackedElements.push(element);
        observer.observe(element);
      });
    });
  }
  
  /**
   * Log a page view event when the page loads
   */
  function logPageView() {
    const timestamp = new Date().toISOString();
    const pagePath = window.location.pathname;
    const pageName = pagePath.split('/').pop() || 'index.html';
    
    console.log(`${timestamp}, pageview, ${pageName}`);
  }
  
  /**
   * Initialize the event tracker
   */
  function init() {
    // Log page view on load
    logPageView();
    
    // Track clicks on the entire document
    document.addEventListener('click', handleClick);
    
    // Wait a moment for the page to render completely
    setTimeout(setupViewTracking, 500);
    
    console.log('Event Tracker initialized. Monitoring clicks and views.');
  }
  
  /**
   * Stop tracking events (useful for cleanup)
   */
  function stop() {
    document.removeEventListener('click', handleClick);
    
    if (observer) {
      trackedElements.forEach(element => {
        observer.unobserve(element);
      });
    }
    
    console.log('Event Tracker stopped.');
  }
  
  // Return public API
  return {
    init: init,
    stop: stop,
    logEvent: logEvent
  };
})();

// Initialize the tracker when the page is fully loaded
window.addEventListener('load', EventTracker.init);
