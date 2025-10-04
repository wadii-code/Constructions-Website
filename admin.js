let adminProducts = [];
let salesData = {};
let editingProductId = null;

const adminProductsGrid = document.getElementById('adminProductsGrid');
const salesAnalytics = document.getElementById('salesAnalytics');
const adminProductModal = document.getElementById('adminProductModal');
const adminModalOverlay = document.getElementById('adminModalOverlay');
const adminModalClose = document.getElementById('adminModalClose');
const productForm = document.getElementById('productForm');
const addProductBtn = document.getElementById('addProductBtn');
const adminPopup = document.getElementById('adminPopup');

document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin page loaded');
    loadAdminData();
    initializeAdminPage();
    setupAdminEventListeners();
});

function loadAdminData() {
    const savedProducts = localStorage.getItem('adminProducts');
    if (savedProducts) {
        adminProducts = JSON.parse(savedProducts);
    } else {
        if (typeof productsData !== 'undefined') {
            adminProducts = [...productsData];
            saveAdminProducts();
        } else {
            adminProducts = [];
        }
    }
    
    const savedSales = localStorage.getItem('salesData');
    salesData = savedSales ? JSON.parse(savedSales) : {};
}

function initializeAdminPage() {
    renderAdminProducts();
    renderSalesAnalytics();
    updateAdminStats();
}

function setupAdminEventListeners() {
    if (addProductBtn) {
        addProductBtn.addEventListener('click', openAddProductModal);
    }

    if (adminModalOverlay) {
        adminModalOverlay.addEventListener('click', closeAdminModal);
    }
    if (adminModalClose) {
        adminModalClose.addEventListener('click', closeAdminModal);
    }

    if (productForm) {
        productForm.addEventListener('submit', handleProductSubmit);
    }

    const searchInput = document.getElementById('searchAdminProducts');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterAdminProducts(this.value.toLowerCase());
        });
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeAdminModal();
    });
}

// Render Admin Products
function renderAdminProducts() {
    if (!adminProductsGrid) return;

    if (adminProducts.length === 0) {
        adminProductsGrid.innerHTML = `
            <div class="no-products" style="grid-column: 1 / -1;">
                <h3>No products found</h3>
                <p>Click "Add New Product" to create your first product</p>
            </div>
        `;
        return;
    }

    adminProductsGrid.innerHTML = adminProducts.map(product => {
        const productSales = salesData[product.id] || { quantity: 0, revenue: 0 };
        
        return `
            <div class="admin-product-card" data-product-id="${product.id}">
                <div class="admin-product-header">
                    <div class="admin-product-info">
                        <h3>${product.name}</h3>
                        <span class="admin-product-category">${product.category}</span>
                    </div>
                    <div class="product-price">
                        <span class="price">$${formatPrice(product.price)}</span>
                        ${product.originalPrice ? `<span class="original-price">$${formatPrice(product.originalPrice)}</span>` : ''}
                    </div>
                </div>
                
                <p class="product-description">${product.description}</p>
                
                <div class="admin-product-stats">
                    <div class="stat-card">
                        <span class="stat-value">${productSales.quantity || 0}</span>
                        <span class="stat-label">Sold</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-value">$${formatPrice(productSales.revenue || 0)}</span>
                        <span class="stat-label">Revenue</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-value">${product.rating}</span>
                        <span class="stat-label">Rating</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-value">${product.reviews}</span>
                        <span class="stat-label">Reviews</span>
                    </div>
                </div>
                
                <div class="admin-product-actions">
                    <button class="admin-btn btn-edit" onclick="editProduct(${product.id})">
                        Edit
                    </button>
                    <button class="admin-btn btn-delete" onclick="deleteProduct(${product.id})">
                        Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Render Sales Analytics
function renderSalesAnalytics() {
    if (!salesAnalytics) return;

    const totalRevenue = Object.values(salesData).reduce((sum, sale) => sum + (sale.revenue || 0), 0);
    const totalSold = Object.values(salesData).reduce((sum, sale) => sum + (sale.quantity || 0), 0);
    const topProduct = getTopSellingProduct();

    salesAnalytics.innerHTML = `
        <div class="sales-card">
            <h3>Total Revenue</h3>
            <div class="sales-value">$${formatPrice(totalRevenue)}</div>
            <div class="sales-label">All Time Sales</div>
        </div>
        <div class="sales-card">
            <h3>Total Items Sold</h3>
            <div class="sales-value">${totalSold}</div>
            <div class="sales-label">Units Sold</div>
        </div>
        <div class="sales-card">
            <h3>Top Product</h3>
            <div class="sales-value">${topProduct ? topProduct.name : 'N/A'}</div>
            <div class="sales-label">${topProduct ? `${topProduct.sold} sold` : 'No sales yet'}</div>
        </div>
    `;
}

function getTopSellingProduct() {
    let topProduct = null;
    let maxSold = 0;

    Object.entries(salesData).forEach(([productId, sale]) => {
        if (sale.quantity > maxSold) {
            const product = adminProducts.find(p => p.id === parseInt(productId));
            if (product) {
                topProduct = {
                    ...product,
                    sold: sale.quantity
                };
                maxSold = sale.quantity;
            }
        }
    });

    return topProduct;
}

// Update Admin Stats
function updateAdminStats() {
    const totalProducts = adminProducts.length;
    const totalSold = Object.values(salesData).reduce((sum, sale) => sum + (sale.quantity || 0), 0);
    const totalRevenue = Object.values(salesData).reduce((sum, sale) => sum + (sale.revenue || 0), 0);

    const totalProductsEl = document.getElementById('totalProducts');
    const totalSalesEl = document.getElementById('totalSales');
    const totalRevenueEl = document.getElementById('totalRevenue');

    if (totalProductsEl) totalProductsEl.textContent = totalProducts;
    if (totalSalesEl) totalSalesEl.textContent = totalSold;
    if (totalRevenueEl) totalRevenueEl.textContent = `$${formatPrice(totalRevenue)}`;
}

// Filter Admin Products
function filterAdminProducts(searchTerm) {
    const filtered = adminProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm)
    );

    if (filtered.length === 0) {
        adminProductsGrid.innerHTML = `
            <div class="no-products" style="grid-column: 1 / -1;">
                <h3>No products found</h3>
                <p>Try adjusting your search criteria</p>
            </div>
        `;
        return;
    }

    adminProductsGrid.innerHTML = filtered.map(product => {
        const productSales = salesData[product.id] || { quantity: 0, revenue: 0 };
        
        return `
            <div class="admin-product-card" data-product-id="${product.id}">
                <div class="admin-product-header">
                    <div class="admin-product-info">
                        <h3>${product.name}</h3>
                        <span class="admin-product-category">${product.category}</span>
                    </div>
                    <div class="product-price">
                        <span class="price">$${formatPrice(product.price)}</span>
                    </div>
                </div>
                
                <p class="product-description">${product.description}</p>
                
                <div class="admin-product-stats">
                    <div class="stat-card">
                        <span class="stat-value">${productSales.quantity || 0}</span>
                        <span class="stat-label">Sold</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-value">$${formatPrice(productSales.revenue || 0)}</span>
                        <span class="stat-label">Revenue</span>
                    </div>
                </div>
                
                <div class="admin-product-actions">
                    <button class="admin-btn btn-edit" onclick="editProduct(${product.id})">
                        Edit
                    </button>
                    <button class="admin-btn btn-delete" onclick="deleteProduct(${product.id})">
                        Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Product Modal Functions
function openAddProductModal() {
    editingProductId = null;
    document.getElementById('adminModalTitle').textContent = 'Add New Product';
    productForm.reset();
    clearSpecs();
    addSpecRow(); // Add one empty spec row
    adminProductModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function editProduct(productId) {
    const product = adminProducts.find(p => p.id === productId);
    if (!product) return;

    editingProductId = productId;
    document.getElementById('adminModalTitle').textContent = 'Edit Product';

    // Fill form with product data
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productOriginalPrice').value = product.originalPrice || '';
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productFullDescription').value = product.fullDescription || product.description;
    document.getElementById('productRating').value = product.rating;
    document.getElementById('productReviews').value = product.reviews;
    document.getElementById('productBadge').value = product.badge || '';

    // Handle image preview for editing
    const imageInput = document.getElementById('productImage');
    const preview = document.getElementById('imagePreview');
    if (preview) {
        preview.src = product.image || '';
        preview.style.display = product.image ? 'block' : 'none';
    }
    if (imageInput) {
        imageInput.value = '';
    }

    // Fill specs
    clearSpecs();
    if (product.specs && Object.keys(product.specs).length > 0) {
        Object.entries(product.specs).forEach(([key, value]) => {
            addSpecRow(key, value);
        });
    } else {
        addSpecRow();
    }

    adminProductModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeAdminModal() {
    adminProductModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    editingProductId = null;
}

// Specification Management
function addSpecRow(key = '', value = '') {
    const specsContainer = document.getElementById('specsContainer');
    const specRow = document.createElement('div');
    specRow.className = 'spec-row';
    specRow.innerHTML = `
        <input type="text" class="spec-key" placeholder="Spec Name" value="${key}" name="specKey[]">
        <input type="text" class="spec-value" placeholder="Spec Value" value="${value}" name="specValue[]">
        <button type="button" class="remove-spec-btn" onclick="removeSpecRow(this)">×</button>
    `;
    specsContainer.appendChild(specRow);
}

function removeSpecRow(button) {
    const specRow = button.parentElement;
    const allSpecRows = document.querySelectorAll('.spec-row');
    if (allSpecRows.length > 1) {
        specRow.remove();
    } else {
        // Clear values but keep one row
        const inputs = specRow.querySelectorAll('input');
        inputs.forEach(input => input.value = '');
    }
}

function clearSpecs() {
    const specsContainer = document.getElementById('specsContainer');
    specsContainer.innerHTML = '';
}

// Handle Product Form Submission
function handleProductSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(productForm);
    const specs = {};
    
    // Collect specifications
    const specKeys = formData.getAll('specKey[]');
    const specValues = formData.getAll('specValue[]');
    
    specKeys.forEach((key, index) => {
        if (key && specValues[index]) {
            specs[key] = specValues[index];
        }
    });

    // Handle image file upload as DataURL
    let imageData = '';
    const imageInput = document.getElementById('productImage');
    if (imageInput && imageInput.files && imageInput.files[0]) {
        // Synchronous read not possible, so use preview src if available
        const preview = document.getElementById('imagePreview');
        if (preview && preview.src) {
            imageData = preview.src;
        }
    } else {
        imageData = formData.get('image');
    }

    const productData = {
        name: formData.get('name'),
        category: formData.get('category'),
        price: parseFloat(formData.get('price')),
        originalPrice: formData.get('originalPrice') ? parseFloat(formData.get('originalPrice')) : null,
        description: formData.get('description'),
        fullDescription: formData.get('fullDescription'),
        image: imageData,
        rating: parseFloat(formData.get('rating')),
        reviews: parseInt(formData.get('reviews')),
        badge: formData.get('badge') || null,
        specs: specs
    };

    if (editingProductId) {
        // Update existing product
        updateProduct(editingProductId, productData);
    } else {
        // Add new product
        addProduct(productData);
    }
}

function addProduct(productData) {
    const newId = adminProducts.length > 0 ? Math.max(...adminProducts.map(p => p.id)) + 1 : 1;
    const newProduct = {
        id: newId,
        ...productData
    };

    adminProducts.push(newProduct);
    saveAdminProducts();
    renderAdminProducts();
    updateAdminStats();
    closeAdminModal();
    showAdminPopup('Product added successfully!');
}

function updateProduct(productId, productData) {
    const index = adminProducts.findIndex(p => p.id === productId);
    if (index !== -1) {
        adminProducts[index] = {
            ...adminProducts[index],
            ...productData
        };
        saveAdminProducts();
        renderAdminProducts();
        updateAdminStats();
        closeAdminModal();
        showAdminPopup('Product updated successfully!');
    }
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
        adminProducts = adminProducts.filter(p => p.id !== productId);
        delete salesData[productId];
        saveAdminProducts();
        saveSalesData();
        renderAdminProducts();
        renderSalesAnalytics();
        updateAdminStats();
        showAdminPopup('Product deleted successfully!');
    }
}

// Data Persistence
function saveAdminProducts() {
    localStorage.setItem('adminProducts', JSON.stringify(adminProducts));
}

function saveSalesData() {
    localStorage.setItem('salesData', JSON.stringify(salesData));
}

// Sales Tracking Function (to be called from products page)
function trackSale(productId, quantity, price) {
    if (!salesData[productId]) {
        salesData[productId] = { quantity: 0, revenue: 0 };
    }
    
    salesData[productId].quantity += quantity;
    salesData[productId].revenue += quantity * price;
    
    saveSalesData();
    
    // Update admin page if it's open
    if (window.location.pathname.includes('admin.html')) {
        renderSalesAnalytics();
        updateAdminStats();
        renderAdminProducts();
    }
}

// Admin Popup
function showAdminPopup(message) {
    const popupTitle = document.getElementById('adminPopupTitle');
    const popupMessage = document.getElementById('adminPopupMessage');
    
    if (popupTitle && popupMessage) {
        popupTitle.textContent = 'Success!';
        popupMessage.textContent = message;
        
        adminPopup.classList.remove('fade-out');
        adminPopup.classList.add('show');
        
        setTimeout(() => {
            adminPopup.classList.remove('show');
            adminPopup.classList.add('fade-out');
        }, 3000);
    }
}

// Utility Functions
function formatPrice(price) {
    if (typeof price !== 'number' || isNaN(price)) {
        return '0';
    }
    return price.toFixed(2);
}

// Make functions globally available
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.addSpecRow = addSpecRow;
window.removeSpecRow = removeSpecRow;
window.closeAdminModal = closeAdminModal;
window.trackSale = trackSale;