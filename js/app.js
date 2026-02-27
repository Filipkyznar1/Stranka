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

// Wishlist Management
class Wishlist {
    constructor() {
        this.load();
    }

    load() {
        const saved = localStorage.getItem('footballWishlist');
        this.items = saved ? JSON.parse(saved) : [];
    }

    save() {
        localStorage.setItem('footballWishlist', JSON.stringify(this.items));
    }

    toggle(productId) {
        const index = this.items.indexOf(productId);
        if (index > -1) {
            this.items.splice(index, 1);
        } else {
            this.items.push(productId);
        }
        this.save();
    }

    contains(productId) {
        return this.items.includes(productId);
    }

    getCount() {
        return this.items.length;
    }

    getItems() {
        return this.items.map(id => getProductById(id)).filter(p => p !== undefined);
    }
}

// App State
let cart = new ShoppingCart();
let wishlist = new Wishlist();

let currentFilters = {
    search: "",
    team: "",
    size: "",
    price: Infinity,
    sort: "default"
};

let currentProduct = null;
let currentImageIndex = 0;
let selectedSize = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme(); 
    initializeUI();
    applyFilters(); 
    setupEventListeners();

    setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.classList.add('hidden');
        }
    }, 800);
});

// Toast notifikace
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? '✓' : '⚠️';
    toast.innerHTML = `<span class="toast-icon">${icon}</span> <span>${message}</span>`;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function initializeTheme() {
    const savedTheme = localStorage.getItem('footballTheme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const themeToggle = document.getElementById('themeToggle');

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.body.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '☀️';
    } else {
        document.body.setAttribute('data-theme', 'light');
        themeToggle.textContent = '🌙';
    }
}

function initializeUI() {
    const teamFilter = document.getElementById('teamFilter');
    const teams = getTeams();
    teams.forEach(team => {
        const option = document.createElement('option');
        option.value = team;
        option.textContent = team;
        teamFilter.appendChild(option);
    });

    updateCartCount();
    updateWishlistCount();
}

function setupEventListeners() {
    // Navigace
    document.getElementById('homeLogo').addEventListener('click', showHome);
    document.getElementById('wishlistButton').addEventListener('click', openWishlistPage);
    document.getElementById('cartButton').addEventListener('click', openCartPage);

    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', (e) => {
        const body = document.body;
        const currentTheme = body.getAttribute('data-theme');
        
        if (currentTheme === 'dark') {
            body.setAttribute('data-theme', 'light');
            localStorage.setItem('footballTheme', 'light');
            e.target.textContent = '🌙';
        } else {
            body.setAttribute('data-theme', 'dark');
            localStorage.setItem('footballTheme', 'dark');
            e.target.textContent = '☀️';
        }
    });

    // Search
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const searchTerm = e.target.value.trim();
        const dropdown = document.getElementById('searchDropdown');

        if (searchTerm.length === 0) {
            dropdown.classList.add('hidden');
            currentFilters.search = "";
            applyFilters();
            return;
        }

        const results = filterProducts(searchTerm);

        if (results.length === 0) {
            dropdown.classList.add('hidden');
            currentFilters.search = searchTerm;
            applyFilters();
            return;
        }

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

        dropdown.querySelectorAll('.search-item').forEach(item => {
            item.addEventListener('click', () => {
                const productId = parseInt(item.dataset.productId);
                openProductDetail(productId);
                dropdown.classList.add('hidden');
                e.target.value = '';
            });
        });
    });

    document.addEventListener('click', (e) => {
        const searchInput = document.getElementById('searchInput');
        const dropdown = document.getElementById('searchDropdown');
        if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.add('hidden');
        }
    });

    // Filters and Sorting
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

    document.getElementById('sortFilter').addEventListener('change', (e) => {
        currentFilters.sort = e.target.value;
        applyFilters();
    });

    document.getElementById('resetFilters').addEventListener('click', () => {
        document.getElementById('searchInput').value = '';
        document.getElementById('teamFilter').value = '';
        document.getElementById('sizeFilter').value = '';
        document.getElementById('priceFilter').value = '';
        document.getElementById('sortFilter').value = 'default';
        currentFilters = { search: "", team: "", size: "", price: Infinity, sort: "default" };
        applyFilters();
    });

    // Wishlist detail button
    document.getElementById('wishlistDetailBtn').addEventListener('click', () => {
        if (!currentProduct) return;
        wishlist.toggle(currentProduct.id);
        updateWishlistCount();
        
        const wishBtn = document.getElementById('wishlistDetailBtn');
        if (wishlist.contains(currentProduct.id)) {
            wishBtn.classList.add('active');
            wishBtn.textContent = '♥ Odebrat z oblíbených';
            showToast('Dres přidán do oblíbených');
        } else {
            wishBtn.classList.remove('active');
            wishBtn.textContent = '♡ Přidat do oblíbených';
            showToast('Dres odebrán z oblíbených');
        }

        if (!document.getElementById('wishlistPage').classList.contains('hidden')) {
            renderWishlistPage();
        } else if (!document.getElementById('mainSection').classList.contains('hidden')) {
            applyFilters();
        }
    });

    // Pokladna
    document.getElementById('checkoutForm').addEventListener('submit', processOrder);
    document.getElementById('cartPageCheckoutBtn').addEventListener('click', openCheckoutPage);

    // Zavírání modálů kliknutím mimo
    window.addEventListener('click', (e) => {
        if (e.target.id === 'productModal') closeProductDetail();
    });

    document.getElementById('closeProduct').addEventListener('click', closeProductDetail);
    document.getElementById('prevImage').addEventListener('click', () => previousImage());
    document.getElementById('nextImage').addEventListener('click', () => nextImage());
    document.getElementById('addToCartDetail').addEventListener('click', addToCartFromDetail);

    // Klávesové zkratky
    document.addEventListener('keydown', (e) => {
        if (!document.getElementById('productModal').classList.contains('hidden')) {
            if (e.key === 'ArrowLeft') previousImage();
            if (e.key === 'ArrowRight') nextImage();
        }
    });

    // --- LOGIKA LUPY PŘI NAJETÍ MYŠÍ ---
    const zoomContainer = document.getElementById('zoomContainer');
    const mainImage = document.getElementById('mainImage');

    zoomContainer.addEventListener('mousemove', (e) => {
        // Ignorujeme hover, pokud jsme zrovna nad navigačními šipkami
        if(e.target.classList.contains('gallery-nav')) {
            mainImage.style.transformOrigin = 'center center';
            mainImage.style.transform = 'scale(1)';
            return;
        }

        const rect = zoomContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Vypočítání procentuální pozice kurzoru uvnitř galerie
        const xPercent = (x / rect.width) * 100;
        const yPercent = (y / rect.height) * 100;
        
        // Nastavení středu transformace (Zoom origin) na pozici myši
        mainImage.style.transformOrigin = `${xPercent}% ${yPercent}%`;
        mainImage.style.transform = 'scale(2.5)'; // Míra přiblížení
    });

    // Když myš odjede pryč, vrátíme obrázek do původního stavu
    zoomContainer.addEventListener('mouseleave', () => {
        mainImage.style.transformOrigin = 'center center';
        mainImage.style.transform = 'scale(1)';
    });
}

// --- NAVIGACE A PLYNULÉ PŘECHODY ---

let isAnimating = false;

function transitionToPage(pageId, showFilters = false) {
    if (isAnimating) return; 
    
    const pages = ['mainSection', 'wishlistPage', 'cartPage', 'checkoutPage'];
    const filters = document.getElementById('filtersSection');
    
    const activePageId = pages.find(id => !document.getElementById(id).classList.contains('hidden'));
    
    if (activePageId === pageId) return; 

    isAnimating = true;
    const activePage = activePageId ? document.getElementById(activePageId) : null;

    // Fade out
    if (activePage) {
        activePage.classList.add('page-exit');
    }
    if (!showFilters && !filters.classList.contains('hidden')) {
        filters.classList.add('page-exit');
    }

    // Fade in
    setTimeout(() => {
        pages.forEach(id => {
            const p = document.getElementById(id);
            p.classList.add('hidden');
            p.classList.remove('page-exit', 'page-transition');
        });
        
        filters.classList.remove('page-exit', 'page-transition');
        
        if (showFilters) {
            filters.classList.remove('hidden');
            filters.classList.add('page-transition');
        } else {
            filters.classList.add('hidden');
        }

        const targetPage = document.getElementById(pageId);
        targetPage.classList.remove('hidden');
        targetPage.classList.add('page-transition');

        window.scrollTo({ top: 0, behavior: 'smooth' });
        isAnimating = false; 
    }, 250); 
}

function showHome() {
    applyFilters(); 
    transitionToPage('mainSection', true);
}

function openWishlistPage() {
    renderWishlistPage();
    transitionToPage('wishlistPage', false);
}

function openCartPage() {
    renderCartPage();
    transitionToPage('cartPage', false);
}

function openCheckoutPage() {
    if (cart.items.length === 0) {
        showToast('Váš košík je prázdný.', 'error');
        return;
    }
    renderCheckoutPage();
    transitionToPage('checkoutPage', false);
}

function renderWishlistPage() {
    const items = wishlist.getItems();
    renderProducts(items, 'wishlistGrid');
}

function renderCartPage() {
    const container = document.getElementById('cartItemsContainer');
    const checkoutBtn = document.getElementById('cartPageCheckoutBtn');

    if (cart.items.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">🛒</div>
                <p>Váš košík je prázdný</p>
                <button class="back-btn" onclick="showHome()" style="margin-top: 20px;">Začít nakupovat</button>
            </div>
        `;
        checkoutBtn.disabled = true;
    } else {
        container.innerHTML = cart.items.map((item, index) => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-details">${item.team} • Velikost: ${item.size} • Počet: ${item.quantity}</div>
                </div>
                <div class="cart-item-price">${(item.price * item.quantity).toLocaleString('cs-CZ')} Kč</div>
                <button class="cart-item-remove" onclick="removeFromCart(${index})">Odebrat</button>
            </div>
        `).join('');
        checkoutBtn.disabled = false;
    }

    document.getElementById('cartPageTotal').textContent = cart.getTotalPrice().toLocaleString('cs-CZ') + ' Kč';
}

function renderCheckoutPage() {
    const summaryContainer = document.getElementById('checkoutSummaryItems');
    summaryContainer.innerHTML = cart.items.map(item => `
        <div class="summary-item-row">
            <span class="summary-item-name">${item.quantity}x ${item.name} (${item.size})</span>
            <span>${(item.price * item.quantity).toLocaleString('cs-CZ')} Kč</span>
        </div>
    `).join('');

    updateCheckoutTotal();
}

function updateCheckoutTotal() {
    const subtotal = cart.getTotalPrice();
    const shippingInput = document.querySelector('input[name="shipping"]:checked');
    const shippingCost = shippingInput ? parseInt(shippingInput.value) : 0;
    const paymentInput = document.querySelector('input[name="payment"]:checked');
    const paymentCost = paymentInput ? parseInt(paymentInput.value) : 0;

    const totalFees = shippingCost + paymentCost;
    const total = subtotal + totalFees;

    document.getElementById('checkoutSubtotal').textContent = subtotal.toLocaleString('cs-CZ') + ' Kč';
    document.getElementById('checkoutFees').textContent = totalFees > 0 ? totalFees.toLocaleString('cs-CZ') + ' Kč' : 'Zdarma';
    document.getElementById('checkoutTotal').textContent = total.toLocaleString('cs-CZ') + ' Kč';
}

function applyFilters() {
    let filtered = filterProducts(
        currentFilters.search,
        currentFilters.team,
        currentFilters.size,
        currentFilters.price
    );
    
    if (currentFilters.sort === 'price-asc') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (currentFilters.sort === 'price-desc') {
        filtered.sort((a, b) => b.price - a.price);
    } else if (currentFilters.sort === 'name-asc') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    renderProducts(filtered, 'productsGrid');
}

function renderProducts(productsList, containerId = 'productsGrid') {
    const grid = document.getElementById(containerId);
    grid.innerHTML = '';

    if (productsList.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1;" class="empty-cart">
                <div class="empty-cart-icon">${containerId === 'wishlistGrid' ? '❤️' : '👕'}</div>
                <p style="font-size: 18px; color: var(--text-light);">${containerId === 'wishlistGrid' ? 'Zatím tu nemáte žádné oblíbené dresy.' : 'Žádné produkty nenalezeny.'}</p>
            </div>
        `;
        return;
    }

    productsList.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.style.cursor = 'pointer';
        
        const inWishlist = wishlist.contains(product.id);
        
        card.innerHTML = `
            <button class="wishlist-toggle-btn ${inWishlist ? 'active' : ''}" data-id="${product.id}" title="Přidat do oblíbených">
                ${inWishlist ? '♥' : '♡'}
            </button>
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
                    ${containerId === 'wishlistGrid' ? 'Zvolit velikost' : 'Přidat do košíku'}
                </button>
            </div>
        `;

        let selectedSize = null;

        card.addEventListener('click', (e) => {
            if (e.target.closest('.wishlist-toggle-btn')) {
                const btn = e.target.closest('.wishlist-toggle-btn');
                wishlist.toggle(product.id);
                updateWishlistCount();
                
                if (containerId === 'wishlistGrid') {
                    renderWishlistPage();
                    showToast('Dres odebrán z oblíbených');
                } else {
                    btn.classList.toggle('active');
                    const isFav = wishlist.contains(product.id);
                    btn.textContent = isFav ? '♥' : '♡';
                    showToast(isFav ? 'Dres přidán do oblíbených' : 'Dres odebrán z oblíbených');
                }
                
            } else if (e.target.classList.contains('card-size-btn')) {
                card.querySelectorAll('.card-size-btn').forEach(btn => btn.classList.remove('selected'));
                e.target.classList.add('selected');
                selectedSize = e.target.dataset.size;
                
            } else if (e.target.classList.contains('add-to-cart-btn')) {
                if (containerId === 'wishlistGrid') {
                    openProductDetail(product.id);
                } else {
                    addToCartWithSize(product.id, selectedSize);
                    if (selectedSize) {
                        selectedSize = null; 
                        card.querySelectorAll('.card-size-btn').forEach(btn => btn.classList.remove('selected'));
                    }
                }
            } else {
                openProductDetail(product.id);
            }
        });
        grid.appendChild(card);
    });
}

function renderRelatedProducts(product) {
    const container = document.getElementById('relatedProductsGrid');
    const allProducts = filterProducts();
    let available = allProducts.filter(p => p.id !== product.id);
    
    let related = available.filter(p => p.team === product.team);
    
    if (related.length < 3) {
        const others = available.filter(p => p.team !== product.team);
        others.sort(() => 0.5 - Math.random());
        related = [...related, ...others].slice(0, 3);
    } else {
        related = related.slice(0, 3);
    }

    container.innerHTML = related.map(p => `
        <div class="product-card related-card" onclick="openProductDetail(${p.id})">
            <div class="product-image" style="height: 120px; font-size: 50px;">${p.emoji}</div>
            <div class="product-info" style="padding: 10px;">
                <div class="product-name" style="font-size: 14px; margin-bottom: 2px;">${p.name}</div>
                <div class="product-price" style="font-size: 16px; margin-bottom: 0;">${p.price} Kč</div>
            </div>
        </div>
    `).join('');
}

function openProductDetail(productId) {
    currentProduct = getProductById(productId);
    currentImageIndex = 0;
    selectedSize = null;

    if (!currentProduct) return;

    document.getElementById('productTitle').textContent = currentProduct.name;
    document.getElementById('productTeam').textContent = currentProduct.team;
    document.getElementById('productPrice').textContent = currentProduct.price + ' Kč';
    document.getElementById('productDescription').textContent = currentProduct.longDescription || currentProduct.description;

    updateGalleryImage();

    const specsList = document.getElementById('specsList');
    specsList.innerHTML = Object.entries(currentProduct.specs || {}).map(([key, value]) =>
        `<li><strong>${capitalizeFirstLetter(key)}:</strong> ${value}</li>`
    ).join('');

    const sizeOptions = document.getElementById('sizeOptions');
    sizeOptions.innerHTML = currentProduct.sizes.map(size => `
        <button class="size-btn" data-size="${size}" onclick="selectSize('${size}')">${size}</button>
    `).join('');

    const wishBtn = document.getElementById('wishlistDetailBtn');
    if (wishlist.contains(currentProduct.id)) {
        wishBtn.classList.add('active');
        wishBtn.textContent = '♥ Odebrat z oblíbených';
    } else {
        wishBtn.classList.remove('active');
        wishBtn.textContent = '♡ Přidat do oblíbených';
    }
    
    renderRelatedProducts(currentProduct);

    const modal = document.getElementById('productModal');
    modal.classList.remove('hidden');
    document.getElementById('productModalContent').scrollTop = 0;
}

function closeProductDetail() {
    currentProduct = null;
    currentImageIndex = 0;
    selectedSize = null;
    document.getElementById('productModal').classList.add('hidden');
    
    // Vyresetování lupy při zavření okna
    const mainImage = document.getElementById('mainImage');
    mainImage.style.transformOrigin = 'center center';
    mainImage.style.transform = 'scale(1)';
}

function updateGalleryImage() {
    if (!currentProduct) return;
    const image = currentProduct.images[currentImageIndex];
    const mainImage = document.getElementById('mainImage');
    mainImage.textContent = image;
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
    const sizeOptionsContainer = document.getElementById('sizeOptions');
    sizeOptionsContainer.querySelectorAll('.size-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    sizeOptionsContainer.querySelector(`[data-size="${size}"]`).classList.add('selected');
}

function addToCartFromDetail() {
    if (!currentProduct) return;
    if (!selectedSize) {
        showToast('Nejprve prosím vyberte velikost dresu.', 'error');
        return;
    }

    cart.addItem(currentProduct, selectedSize);
    updateCartCount();
    closeProductDetail();
    showToast(`${currentProduct.name} (${selectedSize}) přidán do košíku!`);
}

function addToCartWithSize(productId, size) {
    const product = getProductById(productId);
    if (!product) return;

    if (!size) {
        showToast('Nejprve prosím vyberte velikost dresu.', 'error');
        return;
    }

    cart.addItem(product, size);
    updateCartCount();
    showToast(`${product.name} (${size}) přidán do košíku!`);
}

function updateCartCount() {
    const count = cart.getItemCount();
    document.getElementById('cartCount').textContent = count;
}

function updateWishlistCount() {
    const count = wishlist.getCount();
    document.getElementById('wishlistCount').textContent = count;
}

function removeFromCart(index) {
    cart.removeItem(index);
    updateCartCount();
    if (!document.getElementById('cartPage').classList.contains('hidden')) {
        renderCartPage();
    }
    showToast('Položka byla odebrána z košíku');
}

function processOrder(e) {
    e.preventDefault(); 
    if (cart.items.length === 0) {
        showToast('Váš košík je prázdný.', 'error');
        return;
    }

    cart.clear();
    updateCartCount();
    document.getElementById('checkoutForm').reset();
    showToast('Objednávka byla úspěšně odeslána. Děkujeme za nákup!', 'success');
    
    setTimeout(() => {
        showHome();
    }, 2000);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}