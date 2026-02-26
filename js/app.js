// Shopping Cart Management
class ShoppingCart {
    constructor() {
        this.loadCart();
    }

    loadCart() {
        const saved = localStorage.getItem('footballCart');
        this.items = saved ? JSON.parse(saved) : [];
    }

    saveCart() {
        localStorage.setItem('footballCart', JSON.stringify(this.items));
    }

    addItem(product, size) {
        const existingItem = this.items.find(item => item.productId === product.id && item.size === size);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                productId: product.id,
                name: product.name,
                team: product.team,
                price: product.price,
                size: size,
                quantity: 1
            });
        }

        this.saveCart();
    }

    removeItem(index) {
        this.items.splice(index, 1);
        this.saveCart();
    }

    getTotalPrice() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    getItemCount() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    clear() {
        this.items = [];
        this.saveCart();
    }
}

// App State
let cart = new ShoppingCart();
let currentFilters = {
    search: "",
    team: "",
    size: "",
    price: Infinity
};

// Gallery State
let currentProduct = null;
let currentImageIndex = 0;
let selectedSize = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeUI();
    renderProducts(filterProducts());
    setupEventListeners();
});

// Initialize UI elements
function initializeUI() {
    // Populate team filter
    const teamFilter = document.getElementById('teamFilter');
    const teams = getTeams();
    teams.forEach(team => {
        const option = document.createElement('option');
        option.value = team;
        option.textContent = team;
        teamFilter.appendChild(option);
    });

    // Update cart count
    updateCartCount();
}

// Setup event listeners
function setupEventListeners() {
    // Search with autocomplete
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const searchTerm = e.target.value.trim();
        const dropdown = document.getElementById('searchDropdown');

        if (searchTerm.length === 0) {
            dropdown.classList.add('hidden');
            currentFilters.search = "";
            applyFilters();
            return;
        }

        // Filter products for autocomplete
        const results = filterProducts(searchTerm);

        if (results.length === 0) {
            dropdown.classList.add('hidden');
            currentFilters.search = searchTerm;
            applyFilters();
            return;
        }

        // Show autocomplete dropdown
        dropdown.classList.remove('hidden');
        dropdown.innerHTML = results.map(product => `
            <div class="search-item" data-product-id="${product.id}">
                <div class="search-item-emoji">${product.emoji}</div>
                <div class="search-item-content">
                    <div class="search-item-name">${product.name}</div>
                    <div class="search-item-team">${product.team}</div>
                </div>
            </div>
        `).join('');

        // Add event listeners to dropdown items
        dropdown.querySelectorAll('.search-item').forEach(item => {
            item.addEventListener('click', () => {
                const productId = item.dataset.productId;
                openProductDetail(productId);
                dropdown.classList.add('hidden');
                e.target.value = '';
            });
        });
    });

    // Hide dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const searchInput = document.getElementById('searchInput');
        const dropdown = document.getElementById('searchDropdown');
        if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.add('hidden');
        }
    });

    // Filters
    document.getElementById('teamFilter').addEventListener('change', (e) => {
        currentFilters.team = e.target.value;
        applyFilters();
    });

    document.getElementById('sizeFilter').addEventListener('change', (e) => {
        currentFilters.size = e.target.value;
        applyFilters();
    });

    document.getElementById('priceFilter').addEventListener('input', (e) => {
        currentFilters.price = e.target.value ? parseFloat(e.target.value) : Infinity;
        applyFilters();
    });

    // Reset filters
    document.getElementById('resetFilters').addEventListener('click', () => {
        document.getElementById('searchInput').value = '';
        document.getElementById('teamFilter').value = '';
        document.getElementById('sizeFilter').value = '';
        document.getElementById('priceFilter').value = '';
        currentFilters = { search: "", team: "", size: "", price: Infinity };
        renderProducts(filterProducts());
    });

    // Cart modal
    document.getElementById('cartButton').addEventListener('click', openCart);
    document.getElementById('closeCart').addEventListener('click', closeCart);
    document.getElementById('checkoutBtn').addEventListener('click', checkout);

    // Close modal when clicking outside
    document.getElementById('cartModal').addEventListener('click', (e) => {
        if (e.target.id === 'cartModal') {
            closeCart();
        }
    });

    // Product detail modal
    document.getElementById('closeProduct').addEventListener('click', closeProductDetail);
    document.getElementById('productModal').addEventListener('click', (e) => {
        if (e.target.id === 'productModal') {
            closeProductDetail();
        }
    });

    // Gallery navigation
    document.getElementById('prevImage').addEventListener('click', () => previousImage());
    document.getElementById('nextImage').addEventListener('click', () => nextImage());

    // Zoom modal
    document.getElementById('zoomImage').addEventListener('click', openZoom);
    document.getElementById('closeZoom').addEventListener('click', closeZoom);
    document.getElementById('zoomPrev').addEventListener('click', () => zoomPrevious());
    document.getElementById('zoomNext').addEventListener('click', () => zoomNext());

    // Add to cart from detail
    document.getElementById('addToCartDetail').addEventListener('click', addToCartFromDetail);

    // Close zoom modal when clicking outside
    document.getElementById('zoomModal').addEventListener('click', (e) => {
        if (e.target.id === 'zoomModal') {
            closeZoom();
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (!document.getElementById('productModal').classList.contains('hidden')) {
            if (e.key === 'ArrowLeft') previousImage();
            if (e.key === 'ArrowRight') nextImage();
        }
        if (!document.getElementById('zoomModal').classList.contains('hidden')) {
            if (e.key === 'ArrowLeft') zoomPrevious();
            if (e.key === 'ArrowRight') zoomNext();
            if (e.key === 'Escape') closeZoom();
        }
    });
}

// Apply filters
function applyFilters() {
    const filtered = filterProducts(
        currentFilters.search,
        currentFilters.team,
        currentFilters.size,
        currentFilters.price
    );
    renderProducts(filtered);
}

// Render product cards
function renderProducts(productsList) {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';

    if (productsList.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px;">Žádné produkty nenalezeny.</p>';
        return;
    }

    productsList.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.style.cursor = 'pointer';
        card.innerHTML = `
            <div class="product-image">${product.emoji}</div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-team">${product.team}</div>
                <div class="product-price">${product.price} Kč</div>
                <div class="card-size-selector">
                    <div class="card-size-label">Velikost:</div>
                    <div class="card-size-buttons">
                        ${product.sizes.map(size => `<button class="card-size-btn" data-size="${size}">${size}</button>`).join('')}
                    </div>
                </div>
                <button class="add-to-cart-btn">
                    Přidat do košíku
                </button>
            </div>
        `;

        // Track selected size for this card
        let selectedSize = null;

        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('card-size-btn')) {
                // Size button clicked
                card.querySelectorAll('.card-size-btn').forEach(btn => {
                    btn.classList.remove('selected');
                });
                e.target.classList.add('selected');
                selectedSize = e.target.dataset.size;
            } else if (e.target.classList.contains('add-to-cart-btn')) {
                // Add to cart clicked
                addToCartWithSize(product.id, selectedSize);
            } else {
                // Open product detail
                openProductDetail(product.id);
            }
        });
        grid.appendChild(card);
    });
}

// Product Detail Functions
function openProductDetail(productId) {
    currentProduct = getProductById(productId);
    currentImageIndex = 0;
    selectedSize = null;

    if (!currentProduct) return;

    // Update modal header
    document.getElementById('productTitle').textContent = currentProduct.name;
    document.getElementById('productTeam').textContent = currentProduct.team;
    document.getElementById('productPrice').textContent = currentProduct.price + ' Kč';
    document.getElementById('productDescription').textContent = currentProduct.longDescription || currentProduct.description;

    // Update images
    updateGalleryImage();

    // Update specs
    const specsList = document.getElementById('specsList');
    specsList.innerHTML = Object.entries(currentProduct.specs || {}).map(([key, value]) =>
        `<li><strong>${capitalizeFirstLetter(key)}:</strong> ${value}</li>`
    ).join('');

    // Update size options
    const sizeOptions = document.getElementById('sizeOptions');
    sizeOptions.innerHTML = currentProduct.sizes.map(size => `
        <button class="size-btn" data-size="${size}" onclick="selectSize('${size}')">${size}</button>
    `).join('');

    // Open modal
    document.getElementById('productModal').classList.remove('hidden');
}

function closeProductDetail() {
    currentProduct = null;
    currentImageIndex = 0;
    selectedSize = null;
    document.getElementById('productModal').classList.add('hidden');
}

function updateGalleryImage() {
    if (!currentProduct) return;

    const image = currentProduct.images[currentImageIndex];
    const mainImage = document.getElementById('mainImage');
    mainImage.textContent = image;
    mainImage.style.fontSize = '80px';
    mainImage.style.lineHeight = '1';

    document.getElementById('imageCounter').textContent = `${currentImageIndex + 1} / ${currentProduct.images.length}`;
}

function previousImage() {
    if (!currentProduct) return;
    currentImageIndex = (currentImageIndex - 1 + currentProduct.images.length) % currentProduct.images.length;
    updateGalleryImage();
}

function nextImage() {
    if (!currentProduct) return;
    currentImageIndex = (currentImageIndex + 1) % currentProduct.images.length;
    updateGalleryImage();
}

function selectSize(size) {
    selectedSize = size;
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    document.querySelector(`[data-size="${size}"]`).classList.add('selected');
}

function addToCartFromDetail() {
    if (!currentProduct) return;
    if (!selectedSize) {
        alert('Prosím vyberte velikost!');
        return;
    }

    cart.addItem(currentProduct, selectedSize);
    updateCartCount();
    closeProductDetail();

    showNotification(`${currentProduct.name} (${selectedSize}) přidán do košíku!`);
}

function openZoom() {
    if (!currentProduct) return;
    const image = currentProduct.images[currentImageIndex];
    const zoomImg = document.getElementById('zoomImage');
    zoomImg.textContent = image;
    zoomImg.style.fontSize = '100px';
    zoomImg.style.lineHeight = '1';
    document.getElementById('zoomModal').classList.remove('hidden');
}

function closeZoom() {
    document.getElementById('zoomModal').classList.add('hidden');
}

function zoomPrevious() {
    previousImage();
    openZoom();
}

function zoomNext() {
    nextImage();
    openZoom();
}

// Add to cart with pre-selected size
function addToCartWithSize(productId, size) {
    const product = getProductById(productId);
    if (!product) return;

    if (!size) {
        alert('Prosím vyberte velikost!');
        return;
    }

    cart.addItem(product, size);
    updateCartCount();
    showNotification(`${product.name} (${size}) přidán do košíku!`);
}

// Add to cart (quick add)
function addToCart(productId) {
    const product = getProductById(productId);
    if (!product) return;

    const sizeOptions = product.sizes.map(size => `<option value="${size}">${size}</option>`).join('');
    const size = prompt(`Vyberte velikost pro ${product.name}:\n\n${product.sizes.join(', ')}`);

    if (size && product.sizes.includes(size)) {
        cart.addItem(product, size);
        updateCartCount();
        showNotification(`${product.name} (${size}) přidán do košíku!`);
    }
}

// Update cart count
function updateCartCount() {
    const count = cart.getItemCount();
    document.getElementById('cartCount').textContent = count;
}

// Open cart modal
function openCart() {
    const modal = document.getElementById('cartModal');
    const cartItems = document.getElementById('cartItems');

    if (cart.items.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">🛒</div>
                <p>Váš košík je prázdný</p>
            </div>
        `;
        document.getElementById('checkoutBtn').disabled = true;
    } else {
        cartItems.innerHTML = cart.items.map((item, index) => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-details">${item.team} • ${item.size} • Počet: ${item.quantity}</div>
                </div>
                <div class="cart-item-price">${(item.price * item.quantity).toLocaleString('cs-CZ')} Kč</div>
                <button class="cart-item-remove" onclick="removeFromCart(${index})">Smazat</button>
            </div>
        `).join('');
        document.getElementById('checkoutBtn').disabled = false;
    }

    document.getElementById('cartTotal').textContent = cart.getTotalPrice().toLocaleString('cs-CZ') + ' Kč';
    modal.classList.remove('hidden');
}

// Close cart modal
function closeCart() {
    document.getElementById('cartModal').classList.add('hidden');
}

// Remove from cart
function removeFromCart(index) {
    cart.removeItem(index);
    updateCartCount();
    openCart();
}

// Checkout
function checkout() {
    if (cart.items.length === 0) return;

    const total = cart.getTotalPrice();
    const itemCount = cart.getItemCount();

    if (confirm(`Potvrdit objednávku?\nPočet položek: ${itemCount}\nCelková cena: ${total.toLocaleString('cs-CZ')} Kč`)) {
        cart.clear();
        updateCartCount();
        closeCart();
        showSuccessMessage();
    }
}

// Show notification
function showNotification(message) {
    alert(message);
}

// Show success message
function showSuccessMessage() {
    const message = document.getElementById('successMessage');
    message.classList.remove('hidden');

    setTimeout(() => {
        message.classList.add('hidden');
    }, 3000);
}

// Helper function
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
