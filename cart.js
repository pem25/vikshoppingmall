document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. UTILITY FUNCTIONS
    // ----------------------------------------------------

    // Loads cart data from Local Storage or returns an empty array
    function getCart() {
        const cartData = localStorage.getItem('vikiCart');
        return cartData ? JSON.parse(cartData) : [];
    }

    // Saves the current cart array back to Local Storage
    function saveCart(cart) {
        localStorage.setItem('vikiCart', JSON.stringify(cart));
    }

    // Formats a number (in kobo/smallest unit) into the Naira currency string
    function formatCurrency(amount) {
        // Assumes price data is stored in the smallest unit (e.g., kobo: 4800000 = ₦48,000.00)
        // Divide by 100 to get the Naira amount before formatting.
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 2
        }).format(amount / 100);
    }

    const SHIPPING_COST = 500000; // ₦5,000.00 in kobo

    // ----------------------------------------------------
    // 2. ADD TO CART LOGIC (Needed for index.html/categories.html)
    // ----------------------------------------------------

    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.stopPropagation(); // Prevents clicking the product card link

            const id = this.dataset.id || this.dataset.productId; 
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

            // Update the cart count in the header/navigation (if applicable)
            updateCartCount();
        });
    });

    // Simple function to update the cart count in the header
    function updateCartCount() {
        const cart = getCart();
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        const cartCountElement = document.querySelector('.cart-count'); // Assuming you have a span/div with this class in your header
        if (cartCountElement) {
            cartCountElement.textContent = totalItems;
        }
    }
    updateCartCount(); // Run once on load for all pages

    // If not on cart.html, stop here.
    if (!document.querySelector('.cart-main-content')) {
        return; 
    }

    // ----------------------------------------------------
    // 3. CART PAGE RENDERING AND CALCULATION (cart.html only)
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

        if (cart.length === 0) {
            emptyMessage.style.display = 'block';
            cartContent.style.display = 'none';
            return;
        }
        
        // Show cart content
        emptyMessage.style.display = 'none';
        cartContent.style.display = 'flex';

        let subtotalKobo = 0;

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotalKobo += itemTotal;

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

        // 4. CALCULATE AND UPDATE SUMMARY
        const totalKobo = subtotalKobo + SHIPPING_COST;
        
        subtotalElement.textContent = formatCurrency(subtotalKobo);
        totalCostElement.textContent = formatCurrency(totalKobo);

        // 5. ATTACH EVENT LISTENERS (after rendering HTML)
        attachCartListeners();
    }

    // Attaches listeners for removing and changing quantity
    function attachCartListeners() {
        document.querySelectorAll('.remove-item-btn').forEach(button => {
            button.addEventListener('click', removeItem);
        });

        document.querySelectorAll('.qty-input').forEach(input => {
            input.addEventListener('change', updateQuantity);
        });
    }
    
    // ----------------------------------------------------
    // 4. CART INTERACTION FUNCTIONS
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
    
    // --- CLEAR CART BUTTON LISTENER (Already in your snippet) ---
    if (clearCartButton) {
        clearCartButton.addEventListener('click', function() {
            if (confirm("Are you sure you want to empty your entire shopping cart?")) {
                localStorage.removeItem('vikiCart');
                renderCart(); 
                updateCartCount();
            }
        });
    }

    // --- INITIALIZATION ---
    renderCart();
});
