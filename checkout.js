document.addEventListener('DOMContentLoaded', () => {
    // Re-use utility functions from cart.js (assuming it's loaded first)
    // NOTE: If cart.js is not loaded, you would need to re-define getCart(), formatCurrency(), and SHIPPING_COST here.

    const reviewItemsContainer = document.getElementById('order-review-items');
    const reviewSubtotal = document.getElementById('review-subtotal');
    const reviewShippingCost = document.getElementById('review-shipping-cost');
    const reviewTotalCost = document.getElementById('review-total-cost');
    const checkoutForm = document.getElementById('checkout-form');
    const checkoutStatus = document.getElementById('checkout-status');

    function loadOrderSummary() {
        const cart = getCart();
        let subtotalKobo = 0;
        reviewItemsContainer.innerHTML = '';

        if (cart.length === 0) {
            // Redirect back to cart if it's empty
            window.location.href = 'cart.html';
            return;
        }

        // 1. Render Items and Calculate Subtotal
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotalKobo += itemTotal;

            const itemHTML = `
                <div class="review-item">
                    <span class="review-item-name">${item.name} <span>(x${item.quantity})</span></span>
                    <span class="review-item-price">${formatCurrency(itemTotal)}</span>
                </div>
            `;
            reviewItemsContainer.innerHTML += itemHTML;
        });

        // 2. Calculate Final Totals
        const totalKobo = subtotalKobo + SHIPPING_COST;

        // 3. Update the HTML Spans
        reviewSubtotal.textContent = formatCurrency(subtotalKobo);
        reviewShippingCost.textContent = formatCurrency(SHIPPING_COST);
        reviewTotalCost.textContent = formatCurrency(totalKobo);
    }
    
    // 4. Handle Form Submission
    checkoutForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Stop default form submission/page reload

        // Simple validation check
        if (!checkoutForm.checkValidity()) {
            checkoutStatus.textContent = 'Please fill out all required fields.';
            return;
        }

        // --- SUCCESS: Simulate processing and move to payment ---
        
        // Optionally, store the customer data temporarily (optional, but useful for a static site demo)
        const customerData = new FormData(checkoutForm);
        const orderDetails = {
            customer: Object.fromEntries(customerData),
            items: getCart(),
            total: reviewTotalCost.textContent
        };
        localStorage.setItem('vikiOrder', JSON.stringify(orderDetails));

        // Redirect to the final payment instructions page
        window.location.href = 'payment.html'; 
    });

    // Run on page load
    loadOrderSummary();
});
