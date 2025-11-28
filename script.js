document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    // === 1. HAMBURGER MENU TOGGLE (3-bar <-> X transition) ===
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('is-active'); // Toggles 'X' style
        });
    }

    // Close menu when a link is clicked (mobile view)
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 900) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('is-active');
            }
        });
    });

    // === 2. INITIAL CART COUNT DISPLAY ===
    // This function will be called by cart.js to update the count
    window.updateCartCount = function() {
        const cart = JSON.parse(localStorage.getItem('vickyCart')) || [];
        const countElement = document.getElementById('cart-count');
        
        if (countElement) {
            // Sums the quantity of all items in the cart
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            countElement.textContent = totalItems;
        }
    }

    // Initialize the count on page load
    updateCartCount();
});