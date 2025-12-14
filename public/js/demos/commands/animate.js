// Animate command demo - shows static page becoming choreographed
export default {
  id: 'animate',
  caption: 'Static page → Choreographed page load',
  
  // This demo uses CSS animations triggered by data-state attribute
  // The before/after states are the same HTML, animation is CSS-driven
  before: `
    <div class="motion-demo-page" style="opacity: 1;">
      <div class="motion-demo-page-hero" style="opacity: 1; transform: none;">Hero</div>
      <div class="motion-demo-page-content">
        <div class="motion-demo-page-heading" style="opacity: 1; transform: none;"></div>
        <div class="motion-demo-page-text" style="opacity: 1; transform: none;"></div>
        <div class="motion-demo-page-text" style="opacity: 1; transform: none;"></div>
        <div class="motion-demo-page-text" style="opacity: 1; transform: none;"></div>
      </div>
    </div>
  `,
  
  after: null, // Uses CSS animation, no HTML change needed
  
  // Custom toggle handler for animation re-triggering
  onToggle: (viewport, isAfter) => {
    viewport.dataset.state = isAfter ? 'after' : 'before';
    if (isAfter) {
      // Re-trigger animation by cloning the element
      const page = viewport.querySelector('.motion-demo-page');
      if (page) {
        const clone = page.cloneNode(true);
        page.parentNode.replaceChild(clone, page);
      }
    }
  },
  
  viewportClass: 'demo-viewport-dark'
};
