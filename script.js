// Navigation functionality
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

// Navbar scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
navMenu.addEventListener('click', (e) => {
    if (e.target.classList.contains('nav-link')) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxLayers = document.querySelectorAll('.parallax-layer');
    
    parallaxLayers.forEach(layer => {
        const speed = layer.dataset.speed;
        const yPos = -(scrolled * speed);
        layer.style.transform = `translateY(${yPos}px)`;
    });
});

// Animated counters
const animateCounters = () => {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const increment = target / 100;
        let current = 0;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.textContent = Math.floor(current).toLocaleString();
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target.toLocaleString();
            }
        };
        
        updateCounter();
    });
};

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('aos-animate');
            
            // Trigger counter animation when hero stats are visible
            if (entry.target.classList.contains('hero-stats')) {
                animateCounters();
            }
        }
    });
}, observerOptions);

// Observe all elements with data-aos attribute
document.querySelectorAll('[data-aos]').forEach(el => {
    observer.observe(el);
});

// Observe hero stats for counter animation
const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
    observer.observe(heroStats);
}

// News slider functionality
class NewsSlider {
    constructor() {
        this.slider = document.getElementById('news-slider');
        this.track = this.slider.querySelector('.news-track');
        this.prevBtn = document.getElementById('news-prev');
        this.nextBtn = document.getElementById('news-next');
        this.cards = this.track.querySelectorAll('.news-card');
        this.currentIndex = 0;
        this.cardWidth = 420; // 400px + 20px gap
        this.visibleCards = this.getVisibleCards();
        
        this.init();
        this.setupEventListeners();
        this.setupAutoPlay();
    }
    
    init() {
        this.updateSlider();
        window.addEventListener('resize', () => {
            this.visibleCards = this.getVisibleCards();
            this.updateSlider();
        });
    }
    
    getVisibleCards() {
        const containerWidth = this.slider.offsetWidth;
        return Math.floor(containerWidth / this.cardWidth);
    }
    
    setupEventListeners() {
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        
        // Enhanced arrow styling and effects
        this.prevBtn.addEventListener('mouseenter', () => {
            this.prevBtn.style.transform = 'scale(1.1) translateX(-2px)';
        });
        
        this.prevBtn.addEventListener('mouseleave', () => {
            this.prevBtn.style.transform = 'scale(1) translateX(0)';
        });
        
        this.nextBtn.addEventListener('mouseenter', () => {
            this.nextBtn.style.transform = 'scale(1.1) translateX(2px)';
        });
        
        this.nextBtn.addEventListener('mouseleave', () => {
            this.nextBtn.style.transform = 'scale(1) translateX(0)';
        });
        
        // Touch/swipe support
        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        
        this.track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
        });
        
        this.track.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentX = e.touches[0].clientX;
            e.preventDefault();
        });
        
        this.track.addEventListener('touchend', () => {
            if (!isDragging) return;
            const diffX = startX - currentX;
            
            if (Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
            }
            
            isDragging = false;
        });
    }
    
    setupAutoPlay() {
        setInterval(() => {
            this.nextSlide();
        }, 5000);
    }
    
    prevSlide() {
        this.currentIndex = Math.max(0, this.currentIndex - 1);
        this.updateSlider();
    }
    
    nextSlide() {
        const maxIndex = Math.max(0, this.cards.length - this.visibleCards);
        this.currentIndex = this.currentIndex >= maxIndex ? 0 : this.currentIndex + 1;
        this.updateSlider();
    }
    
    updateSlider() {
        const translateX = -this.currentIndex * this.cardWidth;
        this.track.style.transform = `translateX(${translateX}px)`;
        
        // Update button states
        this.prevBtn.style.opacity = this.currentIndex === 0 ? '0.5' : '1';
        const maxIndex = Math.max(0, this.cards.length - this.visibleCards);
        this.nextBtn.style.opacity = this.currentIndex >= maxIndex ? '0.5' : '1';
    }
}

// Initialize news slider when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NewsSlider();
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Hero scroll arrow functionality
const scrollIndicator = document.querySelector('.scroll-indicator');
if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
        const currentScroll = window.pageYOffset;
        const targetScroll = currentScroll + window.innerHeight; // Scroll exactly 100vh
        
        window.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
        });
    });
}

// Scroll to projects section
function scrollToProjects() {
    const projectsSection = document.getElementById('projects');
    if (projectsSection) {
        const offsetTop = projectsSection.offsetTop - 80; // Account for fixed navbar
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}
function scrollToServices() {
    const ServiceSection = document.getElementById('news');
    if (ServiceSection) {
        const offsetTop = ServiceSection.offsetTop - 80; // Account for fixed navbar
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

// Service card hover effects
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Project card advanced hover effects
document.querySelectorAll('.project-card').forEach(card => {
    const overlay = card.querySelector('.project-overlay');
    
    card.addEventListener('mouseenter', function() {
        overlay.style.opacity = '1';
        this.style.transform = 'translateY(-5px)';
    });
    
    card.addEventListener('mouseleave', function() {
        overlay.style.opacity = '0';
        this.style.transform = 'translateY(0)';
    });
    
    // Add click handler for project details
    card.addEventListener('click', function() {
        const projectName = this.querySelector('h3').textContent;
        console.log(`Viewing project: ${projectName}`);
        // Here you could add navigation to project detail page
    });
});

// Feature items animation on scroll
const featureItems = document.querySelectorAll('.feature-item');
featureItems.forEach((item, index) => {
    const itemObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateX(0)';
                }, index * 150);
            }
        });
    }, { threshold: 0.3 });
    
    // Set initial state
    item.style.opacity = '0';
    item.style.transform = 'translateX(-30px)';
    item.style.transition = 'all 0.6s ease';
    
    itemObserver.observe(item);
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// Advanced scroll-triggered animations
const scrollTriggers = document.querySelectorAll('.service-card, .project-card, .news-card');
scrollTriggers.forEach(element => {
    const triggerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { 
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Set initial state
    element.style.opacity = '0';
    element.style.transform = 'translateY(30px)';
    element.style.transition = 'all 0.6s ease';
    
    triggerObserver.observe(element);
});

// Floating geometric shapes animation
const shapes = document.querySelectorAll('.shape');
shapes.forEach((shape, index) => {
    const animationDuration = 8000 + (index * 2000);
    const delay = index * 1000;
    
    shape.style.animationDuration = `${animationDuration}ms`;
    shape.style.animationDelay = `${delay}ms`;
});

// Add dynamic background particles (performance-optimized)
const createBackgroundParticles = () => {
    const particleContainer = document.createElement('div');
    particleContainer.className = 'background-particles';
    particleContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
        overflow: hidden;
    `;
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: rgba(0, 188, 212, 0.3);
            border-radius: 50%;
            animation: float ${8 + Math.random() * 4}s linear infinite;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation-delay: ${Math.random() * 8}s;
        `;
        particleContainer.appendChild(particle);
    }
    
    document.body.appendChild(particleContainer);
};

// Initialize particles only on larger screens for performance
if (window.innerWidth > 768) {
    createBackgroundParticles();
}

// Add custom cursor effect for desktop
if (window.innerWidth > 1024) {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        background: radial-gradient(circle, rgba(0, 188, 212, 0.6), transparent);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transition: transform 0.1s ease;
        mix-blend-mode: screen;
    `;
    document.body.appendChild(cursor);
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX - 10 + 'px';
        cursor.style.top = e.clientY - 10 + 'px';
    });
    
    // Scale cursor on hover over interactive elements
    document.querySelectorAll('a, button, .project-card, .service-card').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform = 'scale(2)';
        });
        el.addEventListener('mouseleave', () => {
            cursor.style.transform = 'scale(1)';
        });
    });
}

// Performance optimization: Throttle scroll events
let ticking = false;
const throttledScrollHandler = () => {
    if (!ticking) {
        requestAnimationFrame(() => {
            // Existing scroll handlers here
            ticking = false;
        });
        ticking = true;
    }
};

window.addEventListener('scroll', throttledScrollHandler);

// Add keyboard navigation support
document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowLeft':
            if (e.target.closest('.news-slider')) {
                document.getElementById('news-prev').click();
            }
            break;
        case 'ArrowRight':
            if (e.target.closest('.news-slider')) {
                document.getElementById('news-next').click();
            }
            break;
        case 'Escape':
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            break;
    }
});

// Contact Form Functionality
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = this.querySelector('.submit-btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');
        
        // Show loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        // Get form data
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);
        
        try {
            // Simulate form submission (replace with actual endpoint)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Show success message
            showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
            
            // Reset form
            this.reset();
            
        } catch (error) {
            // Show error message
            showNotification('Something went wrong. Please try again.', 'error');
        } finally {
            // Hide loading state
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    });
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)'};
        border: 1px solid ${type === 'success' ? '#00ff00' : '#ff0000'};
        border-radius: 8px;
        padding: 1rem;
        color: #ffffff;
        z-index: 10000;
        backdrop-filter: blur(20px);
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 400px;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Form validation and enhancement
document.querySelectorAll('.contact-form input, .contact-form textarea, .contact-form select').forEach(input => {
    // Add floating label effect
    input.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', function() {
        if (!this.value) {
            this.parentElement.classList.remove('focused');
        }
    });
    
    // Real-time validation
    input.addEventListener('input', function() {
        validateField(this);
    });
});

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Remove existing error styling
    field.classList.remove('error');
    const existingError = field.parentElement.querySelector('.field-error');
    if (existingError) existingError.remove();
    
    // Validation rules
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    } else if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
    } else if (field.type === 'tel' && value) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
            isValid = false;
            errorMessage = 'Please enter a valid phone number';
        }
    }
    
    // Show error if invalid
    if (!isValid) {
        field.classList.add('error');
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = errorMessage;
        errorElement.style.cssText = `
            color: #ff6b6b;
            font-size: 0.8rem;
            margin-top: 0.25rem;
            animation: fadeIn 0.3s ease;
        `;
        field.parentElement.appendChild(errorElement);
    }
    
    return isValid;
}

console.log('🏗️ VIAWORK Construction - Website Loaded Successfully');