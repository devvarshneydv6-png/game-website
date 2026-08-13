
    // --- NEWSLETTER FORM SUBMIT TO BACKEND ---
    const newsletterForm = document.getElementById('newsletterForm');
    const newsletterMsg = document.getElementById('newsletterMsg');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('newsletterEmail').value;
            const submitBtn = newsletterForm.querySelector('button[type="submit"]');
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
            
            try {
                const response = await fetch('http://localhost:3000/api/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                
                const data = await response.json();
                newsletterMsg.style.display = 'block';
                
                if (response.ok) {
                    newsletterMsg.style.color = 'var(--primary)';
                    newsletterMsg.textContent = data.message;
                    newsletterForm.reset();
                } else {
                    newsletterMsg.style.color = '#ff4444';
                    newsletterMsg.textContent = data.error;
                }
            } catch (err) {
                newsletterMsg.style.display = 'block';
                newsletterMsg.style.color = '#ff4444';
                newsletterMsg.textContent = "Server connect nahi ho pa raha hai (Backend offline hai).";
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Subscribe';
            }
        });
    }
