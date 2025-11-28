document.addEventListener('DOMContentLoaded', function() {
    // --- 1. Utility Functions ---

    // Load cart from localStorage or return an empty array
    const getCart = () => {
        return JSON.parse(localStorage.getItem('vickyCart')) || [];
    };

    // Save cart back to localStorage
    const saveCart = (cart) => {
        localStorage.setItem('vickyCart', JSON.stringify(cart));
        if (window.updateCartCount) {
            window.updateCartCount(); // Update the header icon count (from script.js)
        }
    };

    // Format number to Nigerian Naira (₦)
    const formatCurrency = (amount) => {
        // Convert to Naira by dividing by 100 (since we store price in kobo/cents)
        const nairaAmount = amount / 100;
        
        return nairaAmount.toLocaleString('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).replace('NGN', '₦'); // Replace standard NGN code with the symbol
    };
    
    // Global Shipping Cost in Kobo/Cents
    const RENDER_SHIPPING_COST = 500000; // ₦5,000.00 


    // --- 2. Cart Manipulation Logic ---

    // Find and update item quantity (used on cart.html)
    const updateQuantity = (itemId, change) => {
        const cart = getCart();
        const itemIndex = cart.findIndex(item => item.id === itemId);

        if (itemIndex > -1) {
            cart[itemIndex].quantity += change;

            if (cart[itemIndex].quantity <= 0) {
                cart.splice(itemIndex, 1); 
            }
        }
        saveCart(cart);
        if (document.querySelector('.cart-main-content')) {
            renderCart(); // Rerender if on the cart page
        }
    };
    
    // Add item handler (used on index.html and categories.html)
    window.handleAddToCart = (e) => {
        const button = e.target;
        const priceInKobo = parseInt(button.dataset.price); 
        
        const newItem = {
            id: button.closest('.product-card').dataset.productId || Date.now().toString(),
            name: button.dataset.name,
            price: priceInKobo,
            image: button.dataset.image,
            quantity: 1,
        };

        let cart = getCart();
        const existingItemIndex = cart.findIndex(item => item.id === newItem.id);

        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += 1;
        } else {
            cart.push(newItem);
        }

        saveCart(cart);
        alert(`${newItem.name} added to cart! Total items: ${getCart().reduce((sum, item) => sum + item.quantity, 0)}`);
    };

    // Remove item completely
    const removeItem = (itemId) => {
        const cart = getCart();
        const newCart = cart.filter(item => item.id !== itemId);
        saveCart(newCart);
        renderCart();
    };


    // --- 3. Page Rendering Functions ---

    // Render cart on cart.html
    const renderCart = () => {
        // ... (This function remains as provided previously for cart.html) ...
        // (Functionality to render cart items, calculate total, attach listeners)
    };
    
    // Function to populate the summary on the checkout.html page
    const renderCheckoutSummary = () => {
        const cart = getCart();
        const reviewItemsContainer = document.getElementById('order-review-items');
        const reviewSubtotalEl = document.getElementById('review-subtotal');
        const reviewShippingEl = document.getElementById('review-shipping-cost');
        const reviewTotalEl = document.getElementById('review-total-cost');

        if (!reviewItemsContainer || cart.length === 0) return;

        reviewItemsContainer.innerHTML = '';
        let subtotalAmount = 0;

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotalAmount += itemTotal;

            const reviewItemHTML = `
                <div class="review-item">
                    <span class="review-item-name">${item.name} <span>(x${item.quantity})</span></span>
                    <span class="review-item-price">${formatCurrency(itemTotal)}</span>
                </div>
            `;
            reviewItemsContainer.innerHTML += reviewItemHTML;
        });

        const totalAmount = subtotalAmount + RENDER_SHIPPING_COST;

        reviewSubtotalEl.textContent = formatCurrency(subtotalAmount);
        reviewShippingEl.textContent = formatCurrency(RENDER_SHIPPING_COST);
        reviewTotalEl.textContent = formatCurrency(totalAmount);
    };

    // Function to populate the summary on the payment.html page
    const renderPaymentSummary = () => {
        const cart = getCart();
        const reviewItemsContainer = document.getElementById('payment-review-items');
        const reviewTotalEl = document.getElementById('payment-total-cost');
        
        if (!reviewItemsContainer || !reviewTotalEl || cart.length === 0) return;

        reviewItemsContainer.innerHTML = '';
        let subtotalAmount = 0;

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotalAmount += itemTotal;

            const reviewItemHTML = `
                <div class="review-item">
                    <span class="review-item-name">${item.name} <span>(x${item.quantity})</span></span>
                    <span class="review-item-price">${formatCurrency(itemTotal)}</span>
                </div>
            `;
            reviewItemsContainer.innerHTML += reviewItemHTML;
        });

        const totalAmount = subtotalAmount + RENDER_SHIPPING_COST;
        reviewTotalEl.textContent = formatCurrency(totalAmount);
    };


    // --- 4. Checkout and Payment Logic ---
    
    // Handle shipping form submission (Step 1: Checkout)
    const handleCheckout = (e) => {
        e.preventDefault();
        const cart = getCart();
        const statusEl = document.getElementById('checkout-status');
        
        if (cart.length === 0) {
            statusEl.textContent = "Your cart is empty. Please add items before checking out.";
            return;
        }

        // --- Log Shipping Details (Simulated) ---
        const formData = new FormData(e.target);
        const shippingData = Object.fromEntries(formData.entries());
        console.log("Shipping Details Captured:", shippingData); 
        
        // CRITICAL ACTION: Redirect to payment.html (Step 2: Payment Instructions)
        window.location.href = "payment.html"; 
    };

    // Handle final "I Have Paid" confirmation (Step 2: Payment)
    const handlePaymentConfirmation = () => {
        const cart = getCart();
        if (cart.length === 0) {
            alert("Error: Your cart is empty.");
            window.location.href = "categories.html";
            return;
        }
        
        // 1. Simulate final order confirmation and data logging here
        console.log("Final Payment Confirmed by Customer. Order ID: " + Date.now()); 
        
        // 2. Clear cart and thank user
        saveCart([]); // Clear cart
        
        alert("Payment Confirmed! Your order has been placed. Our team will verify the bank transfer and contact you within 24 hours to arrange delivery. Thank you for shopping with Vicky Shopping Mall!");
        window.location.href = "index.html";
    };


    // --- 5. Initialization ---

    // Attach listeners for "Add to Cart" buttons on any page
    const attachProductCardListeners = () => {
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.removeEventListener('click', window.handleAddToCart); 
            button.addEventListener('click', window.handleAddToCart);
        });
    };
    
    // Run initialization logic
    attachProductCardListeners();

    // Attach form handler if we are on the checkout page
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        renderCheckoutSummary();
        checkoutForm.addEventListener('submit', handleCheckout);
    }

    // Attach listeners if we are on the payment instruction page
    const paymentConfirmBtn = document.getElementById('confirm-payment-btn');
    if (paymentConfirmBtn) {
        renderPaymentSummary(); // Display the totals
        paymentConfirmBtn.addEventListener('click', handlePaymentConfirmation);
    }
    
    // Re-attach cart listeners if on cart.html (needed inside renderCart, but included here for completeness)
    const cartPage = document.querySelector('.cart-main-content');
    if (cartPage) {
        // Since renderCart isn't fully defined here, assume it's set up to run
        // and attach listeners when the page loads, as in previous snippets.
    }
});