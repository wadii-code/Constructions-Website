// Products Data
let productsData = [];
const savedProducts = localStorage.getItem('adminProducts');
if (savedProducts) {
    productsData = JSON.parse(savedProducts);
} else {
    productsData = [];
}

// Global variables
let currentProducts = [...productsData];
let currentCategory = 'all';
let currentSearch = '';
let currentSort = 'name';
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let savedItems = JSON.parse(localStorage.getItem('savedItems')) || [];

// DOM elements
const productsGrid = document.getElementById('productsGrid');
const searchInput = document.getElementById('searchProducts');
const filterButtons = document.querySelectorAll('.filter-btn');
const sortSelect = document.getElementById('sortProducts');
const productModal = document.getElementById('productModal');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Products page loaded, total products:', productsData.length);
    renderProducts();
    setupEventListeners();
    updateCartCount();
});

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            currentSearch = this.value.toLowerCase();
            filterAndRenderProducts();
        });
    }

    // Filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentCategory = this.dataset.category;
            filterAndRenderProducts();
        });
    });

    // Sort functionality
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            currentSort = this.value;
            filterAndRenderProducts();
        });
    }

    // Modal functionality
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeModal);
    }
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeModal();
    });

    // Quantity controls
    const qtyMinus = document.getElementById('qtyMinus');
    const qtyPlus = document.getElementById('qtyPlus');
    
    if (qtyMinus) {
        qtyMinus.addEventListener('click', function() {
            const quantityInput = document.getElementById('quantity');
            if (quantityInput && quantityInput.value > 1) {
                quantityInput.value = parseInt(quantityInput.value) - 1;
            }
        });
    }

    if (qtyPlus) {
        qtyPlus.addEventListener('click', function() {
            const quantityInput = document.getElementById('quantity');
            if (quantityInput && quantityInput.value < 99) {
                quantityInput.value = parseInt(quantityInput.value) + 1;
            }
        });
    }

    // Buy Now and Save for Later buttons
    const buyNowBtn = document.getElementById('buyNowBtn');
    const saveLaterBtn = document.getElementById('saveLaterBtn');
    const testItemSavedBtn = document.getElementById('testItemSavedBtn');

    if (buyNowBtn) {
        buyNowBtn.addEventListener('click', handleBuyNow);
    }
    if (saveLaterBtn) {
        saveLaterBtn.addEventListener('click', handleSaveForLater);
    }
    if (testItemSavedBtn) {
        testItemSavedBtn.addEventListener('click', showItemSavedMessage);
    }

}

// Filter and render products
function filterAndRenderProducts() {
    let filtered = productsData.filter(product => {
        const matchesCategory = currentCategory === 'all' || product.category === currentCategory;
        const matchesSearch = product.name.toLowerCase().includes(currentSearch) || 
                            product.description.toLowerCase().includes(currentSearch);
        return matchesCategory && matchesSearch;
    });

    // Sort products
    filtered.sort((a, b) => {
        switch(currentSort) {
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'popular':
                return b.reviews - a.reviews;
            default:
                return a.name.localeCompare(b.name);
        }
    });

    currentProducts = filtered;
    renderProducts();
}

// Render products grid
function renderProducts() {
    console.log('Rendering products, count:', currentProducts.length);
    
    if (!productsGrid) return;
    
    // Clear any existing content
    productsGrid.innerHTML = '';
    
    if (currentProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-products">
                <h3>No products found</h3>
                <p>Try adjusting your search or filter criteria</p>
            </div>
        `;
        return;
    }

    productsGrid.innerHTML = currentProducts.map(product => `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://images.pexels.com/photos/325185/pexels-photo-325185.jpeg'">
                ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
            </div>
            <div class="product-content">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">
                    <span class="price">$${formatPrice(product.price)}</span>
                    ${product.originalPrice && product.originalPrice > product.price ? 
                        `<span class="original-price">$${formatPrice(product.originalPrice)}</span>` : ''}
                </div>
                <div class="product-rating">
                    <div class="stars">
                        ${generateStars(product.rating)}
                    </div>
                    <span class="rating-text">${product.rating} (${product.reviews} reviews)</span>
                </div>
                <button class="view-details-btn" onclick="openProductModal(${product.id})">
                    View Details
                </button>
            </div>
        </div>
    `).join('');
}

// Format price to handle numbers properly
function formatPrice(price) {
    if (typeof price !== 'number' || isNaN(price)) {
        return '0';
    }
    return price.toLocaleString();
}

// Generate star rating
function generateStars(rating) {
    if (typeof rating !== 'number' || isNaN(rating)) {
        rating = 0;
    }
    
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<span class="star">★</span>';
    }
    
    if (hasHalfStar) {
        stars += '<span class="star">☆</span>';
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<span class="star">☆</span>';
    }
    
    return stars;
}

// Open product modal
function openProductModal(productId) {
    const product = productsData.find(p => p.id === productId);
    if (!product || !productModal) return;

    // Populate modal content
    const modalProductImage = document.getElementById('modalProductImage');
    const modalProductName = document.getElementById('modalProductName');
    const modalProductPrice = document.getElementById('modalProductPrice');
    const modalOriginalPrice = document.getElementById('modalOriginalPrice');
    const modalProductDescription = document.getElementById('modalProductDescription');
    const modalProductStars = document.getElementById('modalProductStars');
    const modalProductRating = document.getElementById('modalProductRating');
    
    if (modalProductImage) modalProductImage.src = product.image;
    if (modalProductName) modalProductName.textContent = product.name;
    if (modalProductPrice) modalProductPrice.textContent = `$${formatPrice(product.price)}`;
    if (modalOriginalPrice) {
        modalOriginalPrice.textContent = product.originalPrice && product.originalPrice > product.price ? 
            `$${formatPrice(product.originalPrice)}` : '';
    }
    if (modalProductDescription) modalProductDescription.textContent = product.fullDescription || product.description;
    if (modalProductStars) modalProductStars.innerHTML = generateStars(product.rating);
    if (modalProductRating) modalProductRating.textContent = `${product.rating} (${product.reviews} reviews)`;
    
    // Generate specifications
    const specsGrid = document.getElementById('modalProductSpecs');
    if (specsGrid && product.specs) {
        specsGrid.innerHTML = Object.entries(product.specs).map(([key, value]) => `
            <div class="spec-item">
                <span class="spec-label">${key}</span>
                <span class="spec-value">${value}</span>
            </div>
        `).join('');
    }

    // Reset quantity
    const quantityInput = document.getElementById('quantity');
    if (quantityInput) quantityInput.value = 1;

    // Store current product ID
    productModal.dataset.productId = productId;

    // Show modal
    productModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    if (productModal) {
        productModal.classList.remove('active');
    }
    document.body.style.overflow = 'auto';
}

// Handle Buy Now
function handleBuyNow() {
    const productId = parseInt(productModal.dataset.productId);
    const quantityInput = document.getElementById('quantity');
    const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
    const product = productsData.find(p => p.id === productId);
    
    if (!product) return;

    // Add to cart
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: productId,
            name: product.name,
            price: product.price,
            quantity: quantity
        });
    }

    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    
    

    
    // Close modal
    closeModal();
    
    // Update cart count
    updateCartCount();
}

// Handle Save for Later
function handleSaveForLater() {
    const productId = parseInt(productModal.dataset.productId);
    const product = productsData.find(p => p.id === productId);
    
    if (!product) return;

  
    // Add to saved items
    savedItems.push({
        id: productId,
        name: product.name,
        price: product.price,
        image: product.image
    });

    // Save to localStorage
    localStorage.setItem('savedItems', JSON.stringify(savedItems));
    
   
    // Close modal
    closeModal();
}

// Update cart count
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    console.log(`Cart items: ${totalItems}`);
}

// Make openProductModal globally available
window.openProductModal = openProductModal;

 // Function to show the cart popup
        function showCartPopup(itemCount) {
            const popup = document.getElementById('cartPopup');
            const countElement = document.getElementById('cartPopupCount');
            
            // Update the count
            if (countElement) {
                countElement.textContent = itemCount;
            }
            
            // Show the popup with animation
            popup.classList.remove('fade-out');
            popup.classList.add('show');
            
            // Hide after 3 seconds
            setTimeout(() => {
                popup.classList.remove('show');
                popup.classList.add('fade-out');
            }, 3000);
        }

        // Update the handleBuyNow function to use the popup
        function handleBuyNow() {
            const productId = parseInt(productModal.dataset.productId);
            const quantityInput = document.getElementById('quantity');
            const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
            const product = productsData.find(p => p.id === productId);
            
            if (!product) return;

            // Add to cart
            const existingItem = cart.find(item => item.id === productId);
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.push({
                    id: productId,
                    name: product.name,
                    price: product.price,
                    quantity: quantity
                });
            }

            // Save to localStorage
            localStorage.setItem('cart', JSON.stringify(cart));
            
            // Update cart count
            updateCartCount();
            
            // Show the cart popup
            const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
            showCartPopup(totalItems);
            
            // Close modal
            closeModal();
        }

        // Make sure to update the event listener for the buy now button
        document.addEventListener('DOMContentLoaded', function() {
            // Your existing initialization code...
            
            // Update the buy now button event listener
            const buyNowBtn = document.getElementById('buyNowBtn');
            if (buyNowBtn) {
                buyNowBtn.removeEventListener('click', handleBuyNow); // Remove old listener if exists
                buyNowBtn.addEventListener('click', handleBuyNow);
            }
        });

        function handleSaveForLater() {
    const productId = parseInt(productModal.dataset.productId);
    const product = productsData.find(p => p.id === productId);
    if (!product) return;

    // Add to saved items
    savedItems.push({
        id: productId,
        name: product.name,
        price: product.price,
        image: product.image
    });

    // Save to localStorage
    localStorage.setItem('savedItems', JSON.stringify(savedItems));

    // Show popup message
    const popup = document.getElementById('cartPopup');
    if (popup) {
        popup.textContent = 'ites was saved';
        popup.classList.remove('fade-out');
        popup.classList.add('show');
        setTimeout(() => {
            popup.classList.remove('show');
            popup.classList.add('fade-out');
        }, 3000);
    }

    // Close modal
    closeModal();
}

// In products.js, update the handleBuyNow function:
function handleBuyNow() {
    const productId = parseInt(productModal.dataset.productId);
    const quantityInput = document.getElementById('quantity');
    const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
    const product = productsData.find(p => p.id === productId);
    
    if (!product) return;

    // Add to cart
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: productId,
            name: product.name,
            price: product.price,
            quantity: quantity
        });
    }

    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Track sale in admin system
    if (typeof trackSale === 'function') {
        trackSale(productId, quantity, product.price);
    }
    
    // Update cart count
    updateCartCount();
    
    // Show the cart popup
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    showCartPopup(totalItems);
    
    // Close modal
    closeModal();
}