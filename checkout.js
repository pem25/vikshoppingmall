document.addEventListener('DOMContentLoaded', () => {
    // --- IMPORTANT: Assumes getCart(), formatCurrency(), and SHIPPING_COST 
    // are defined and available from cart.js which should be loaded first. ---
    
    // Elements to update in the Order Summary
    const reviewItemsContainer = document.getElementById('order-review-items');
    const reviewSubtotal = document.getElementById('review-subtotal');
    const reviewShippingCost = document.getElementById('review-shipping-cost');
    const reviewTotalCost = document.getElementById('review-total-cost');
    
    // The Checkout Form
    const checkoutForm = document.getElementById('checkout-form');

    function loadOrderSummary() {
        // Use the function from cart.js
        const cart = getCart(); 
        let subtotalKobo = 0;
        reviewItemsContainer.innerHTML = '';

        if (cart.length === 0) {
            // Safety check: redirect back to cart if it's empty
            window.location.href = 'cart.html';
            return;
        }

        // 1. Render Items and Calculate Subtotal
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotalKobo += itemTotal;

            // HTML for each item in the review list
            const itemHTML = `
                <div class="review-item">
                    <span class="review-item-name">${item.name} <span>(x${item.quantity})</span></span>
                    <span class="review-item-price">${formatCurrency(itemTotal)}</span>
                </div>
            `;
            reviewItemsContainer.innerHTML += itemHTML;
        });

        // 2. Calculate Final Totals
        const totalKobo = subtotalKobo + SHIPPING_COST; // SHIPPING_COST is ₦5,000.00 (500000 kobo)
        
        // 3. Update the HTML Spans
        reviewSubtotal.textContent = formatCurrency(subtotalKobo);
        reviewShippingCost.textContent = formatCurrency(SHIPPING_COST);
        reviewTotalCost.textContent = formatCurrency(totalKobo);
    }
    
    // 4. Handle Form Submission (Crucial for linking to payment.html)
    checkoutForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Stop default form submission

        if (!checkoutForm.checkValidity()) {
            // Trigger browser's default validation messages
            return; 
        }

        // Store the order details (optional, but good for demo/review)
        const customerData = new FormData(checkoutForm);
        const orderDetails = {
            customer: Object.fromEntries(customerData),
            items: getCart(),
            total: reviewTotalCost.textContent
        };
        localStorage.setItem('vikiOrder', JSON.stringify(orderDetails));
        
        // Final action: Redirect to the payment instructions page
        window.location.href = 'payment.html'; 
    });

    // Run on page load to populate the summary
    loadOrderSummary();
});
