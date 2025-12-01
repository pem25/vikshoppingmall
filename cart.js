document.addEventListener('DOMContentLoaded', () => {
    
    // --- Configuration ---
    const SHIPPING_COST = 500000; // ₦5,000.00 in kobo (5000 * 100)

    // --- Utility Functions ---

    // 1. Loads cart data from Local Storage or returns an empty array
    function getCart() {
        const cartData = localStorage.getItem('vikiCart');
        return cartData ? JSON.parse(cartData) : [];
    }

    // 2. Saves the current cart array back to Local Storage
    function saveCart(cart) {
        localStorage.setItem('vikiCart', JSON.stringify(cart));
    }

    // 3. Formats a number (in kobo/smallest unit) into the Naira currency string
    function formatCurrency(amount) {
        // Divide by 100 to get the Naira amount before formatting.
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 2
        }).format(amount / 100);
    }

    // 4. Updates the item count displayed in the navigation header
    function updateCartCount() {
        const cart = getCart();
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        const cartCountElement = document.querySelector('#cart-count'); // Targets the span in the header
        if (cartCountElement) {
            cartCountElement.textContent = totalItems;
        }
    }
    updateCartCount(); // Run once on load for all pages

    // ----------------------------------------------------
    // 5. ADD TO CART LOGIC (Runs on index.html and categories.html)
    // ----------------------------------------------------

    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.stopPropagation(); // Prevents link activation when clicking "Add to Cart" button

            // Use data-name, data-price, data-image attributes from the button/card
            const id = this.dataset.id || this.closest('.product-card').dataset.productId;
            const name = this.dataset.name;
            const price = parseInt(this.dataset.price); // Price in kobo
            const image = this.dataset.image;

            let cart = getCart();
            const existingItem = cart.find(item => item.id === id);

            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({ id, name, price, image, quantity: 1 });
            }

            saveCart(cart);
            alert(`"${name}" added to cart!`);

            updateCartCount();
        });
    });

    // If the current page is NOT cart.html, stop here.
    if (!document.querySelector('.cart-main-content')) {
        return; 
    }

    // ----------------------------------------------------
    // 6. CART PAGE RENDERING AND CALCULATION (Runs on cart.html only)
    // ----------------------------------------------------

    const cartItemsContainer = document.getElementById('cart-items');
    const emptyMessage = document.getElementById('empty-cart-message');
    const cartContent = document.getElementById('cart-content');
    const subtotalElement = document.getElementById('subtotal');
    const totalCostElement = document.getElementById('total-cost');
    const clearCartButton = document.getElementById('clear-cart-btn');
    
    // Main function to build the HTML and update the totals
    function renderCart() {
        const cart = getCart();
        cartItemsContainer.innerHTML = ''; // Clear existing content
        
        // Toggle visibility based on cart size
        if (cart.length === 0) {
            emptyMessage.style.display = 'block';
            cartContent.style.display = 'none';
            // Also reset totals when empty
            subtotalElement.textContent = formatCurrency(0);
            totalCostElement.textContent = formatCurrency(SHIPPING_COST); // Show shipping is included in base total
            return;
        }
        
        // Show cart content
        emptyMessage.style.display = 'none';
        cartContent.style.display = 'flex';

        let subtotalKobo = 0;

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotalKobo += itemTotal;

            // Template for a single cart item
            const itemHTML = `
                <div class="cart-item" data-id="${item.id}">
                    <div class="col-product">
                        <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                        <div class="item-details">
                            <h4>${item.name}</h4>
                            <p>Discount applied: 30%</p>
                        </div>
                    </div>
                    <span class="col-price">${formatCurrency(item.price)}</span>
                    <div class="col-quantity">
                        <input type="number" min="1" value="${item.quantity}" class="qty-input" data-id="${item.id}">
                    </div>
                    <span class="col-subtotal item-subtotal">${formatCurrency(itemTotal)}</span>
                    <button class="remove-item-btn" data-id="${item.id}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            cartItemsContainer.innerHTML += itemHTML;
        });

        // Calculate and Update Summary
        const totalKobo = subtotalKobo + SHIPPING_COST;
        
        subtotalElement.textContent = formatCurrency(subtotalKobo);
        totalCostElement.textContent = formatCurrency(totalKobo);

        // Attach listeners to newly created elements
        attachCartListeners();
    }

    // Attaches listeners for removing and changing quantity after rendering
    function attachCartListeners() {
        document.querySelectorAll('.remove-item-btn').forEach(button => {
            button.addEventListener('click', removeItem);
        });

        document.querySelectorAll('.qty-input').forEach(input => {
            input.addEventListener('change', updateQuantity);
        });
    }
    
    // ----------------------------------------------------
    // 7. CART INTERACTION FUNCTIONS
    // ----------------------------------------------------

    function removeItem(event) {
        const idToRemove = event.currentTarget.dataset.id;
        let cart = getCart();
        cart = cart.filter(item => item.id !== idToRemove);
        saveCart(cart);
        renderCart();
        updateCartCount();
    }

    function updateQuantity(event) {
        const idToUpdate = event.target.dataset.id;
        const newQuantity = parseInt(event.target.value);
        
        if (newQuantity < 1) {
            // If quantity drops below 1, remove the item
            removeItem({ currentTarget: { dataset: { id: idToUpdate } } });
            return;
        }

        let cart = getCart();
        const item = cart.find(item => item.id === idToUpdate);

        if (item) {
            item.quantity = newQuantity;
            saveCart(cart);
            renderCart(); // Re-render to update the item subtotal and overall summary
            updateCartCount();
        }
    }
    
    // Clear Cart Button Listener
    if (clearCartButton) {
        clearCartButton.addEventListener('click', function() {
            if (confirm("Are you sure you want to empty your entire shopping cart?")) {
                localStorage.removeItem('vikiCart');
                renderCart(); 
                updateCartCount();
            }
        });
    }

    // --- INITIALIZATION: This runs when cart.html is loaded ---
    renderCart();
});
