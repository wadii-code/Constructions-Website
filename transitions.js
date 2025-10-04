// Page Transition Management
class PageTransition {
    constructor() {
        this.overlay = document.getElementById('pageTransitionOverlay');
        this.isTransitioning = false;
        this.init();
    }

    init() {
        // Show transition on page load
        this.showTransition();
        
        // Handle navigation links
        this.setupNavigationLinks();
        
        // Handle browser back/forward
        this.setupBrowserNavigation();
    }

    showTransition() {
        if (this.overlay) {
            this.overlay.classList.add('active');
            document.body.classList.add('transitioning');
            
            // Hide transition after a delay
            setTimeout(() => {
                this.hideTransition();
            }, 1500);
        }
    }

    hideTransition() {
        if (this.overlay) {
            this.overlay.classList.remove('active');
            document.body.classList.remove('transitioning');
            
            // Add loaded class to page content
            const pageContent = document.querySelector('body');
            if (pageContent) {
                pageContent.classList.add('loaded');
            }
        }
    }

    setupNavigationLinks() {
        // Handle all navigation links
        const navLinks = document.querySelectorAll('a[href]');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                // Only handle internal links and external links to our domain
                if (href && !href.startsWith('#') && !href.startsWith('javascript:') && 
                    !href.startsWith('mailto:') && !href.startsWith('tel:')) {
                    
                    // Check if it's a link to products.html or index.html
                    if (href.includes('products.html') || href.includes('index.html') || 
                        (href.startsWith('/') && (href.includes('products') || href.includes('index')))) {
                        
                        e.preventDefault();
                        this.navigateToPage(href);
                    }
                }
            });
        });
    }

    navigateToPage(url) {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        
        // Show exit transition
        if (this.overlay) {
            this.overlay.classList.add('active', 'exit');
            document.body.classList.add('transitioning');
        }
        
        // Navigate after transition
        setTimeout(() => {
            window.location.href = url;
        }, 600);
    }

    setupBrowserNavigation() {
        // Handle browser back/forward buttons
        window.addEventListener('popstate', () => {
            this.showTransition();
        });
    }
}

// Initialize page transitions when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PageTransition();
});

// Handle page visibility changes (for when user switches tabs)
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        // Page became visible again
        const transition = new PageTransition();
    }
});

// Handle page load completion
window.addEventListener('load', () => {
    // Ensure transition is hidden after all resources are loaded
    const overlay = document.getElementById('pageTransitionOverlay');
    if (overlay && overlay.classList.contains('active')) {
        setTimeout(() => {
            overlay.classList.remove('active');
            document.body.classList.remove('transitioning');
        }, 500);
    }
}); 