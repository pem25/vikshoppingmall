document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('support-form');
    const statusMessage = document.getElementById('form-status-message');

    if (!form || !statusMessage) return; // Exit if elements are missing

    // Formspree endpoint provided by the user
    const formspreeEndpoint = 'https://formspree.io/f/xldadpjg';

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitButton = form.querySelector('.cta-button');
        
        // 1. Show loading status and disable button
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;
        statusMessage.textContent = 'Your message is being sent...';
        statusMessage.className = 'form-status-message loading';

        try {
            const response = await fetch(formspreeEndpoint, {
                method: 'POST',
                body: new FormData(form),
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // 2. Success state
                statusMessage.textContent = 'Message sent successfully! We will contact you shortly.';
                statusMessage.className = 'form-status-message success';
                form.reset(); // Clear the form fields
            } else {
                // 3. Handle specific Formspree errors
                const data = await response.json();
                if (data.errors) {
                    statusMessage.textContent = data.errors.map(error => error.message).join(", ");
                } else {
                    statusMessage.textContent = 'Error sending message. Please try again.';
                }
                statusMessage.className = 'form-status-message error';
            }

        } catch (error) {
            // 4. Handle network or other errors
            statusMessage.textContent = 'A network error occurred. Please check your connection.';
            statusMessage.className = 'form-status-message error';

        } finally {
            // 5. Reset the button after a short delay
            setTimeout(() => {
                submitButton.textContent = 'Submit Request';
                submitButton.disabled = false;
            }, 1500);
        }
    });
});