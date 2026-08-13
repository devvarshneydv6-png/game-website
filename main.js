document.addEventListener('DOMContentLoaded', () => {

    // --- THEME TOGGLE LOGIC ---
    const themeToggleBtn = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const body = document.documentElement;

    // Check saved theme or default to light (as per user preference)
    const savedTheme = localStorage.getItem('nindoTheme') || 'light';
    if (savedTheme === 'light') {
        body.setAttribute('data-theme', 'light');
        themeIcon.classList.replace('fa-sun', 'fa-moon');
    } else {
        body.removeAttribute('data-theme');
        themeIcon.classList.replace('fa-moon', 'fa-sun');
    }

    themeToggleBtn.addEventListener('click', (e) => {
        // Ninja Slice Transition
        const slice = document.createElement('div');
        slice.className = 'theme-slice';
        
        // Determine upcoming theme background
        const isLight = body.getAttribute('data-theme') === 'light';
        slice.style.background = isLight ? '#050a12' : '#fdf2f4'; 
        
        document.body.appendChild(slice);
        
        // Force reflow
        void slice.offsetWidth;
        
        // Slide in
        slice.classList.add('active');

        // Switch theme midway
        setTimeout(() => {
            if (isLight) {
                // Currently light, switch to dark
                body.removeAttribute('data-theme');
                localStorage.setItem('nindoTheme', 'dark');
                themeIcon.classList.replace('fa-moon', 'fa-sun');
            } else {
                // Currently dark, switch to light
                body.setAttribute('data-theme', 'light');
                localStorage.setItem('nindoTheme', 'light');
                themeIcon.classList.replace('fa-sun', 'fa-moon');
            }
            
            // Slide out
            slice.classList.remove('active');
            slice.classList.add('exit');
            setTimeout(() => slice.remove(), 600);
        }, 600); // Wait for slide in to complete
    });

    // --- MOBILE MENU LOGIC ---
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-links a');

    mobileMenuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const icon = mobileMenuBtn.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.classList.replace('fa-bars', 'fa-times');
        } else {
            icon.classList.replace('fa-times', 'fa-bars');
        }
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            mobileMenuBtn.querySelector('i').classList.replace('fa-times', 'fa-bars');
        });
    });

    // --- SMOOTH SCROLLING ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // --- SCROLL PROGRESS & NAVBAR COMPRESSION ---
    const navbar = document.querySelector('.navbar');
    const scrollProgress = document.getElementById('scrollProgress');
    
    window.addEventListener('scroll', () => {
        // Compression
        if(window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Progress Bar
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        if(scrollHeight > 0) {
            const progress = (window.scrollY / scrollHeight) * 100;
            scrollProgress.style.width = `${progress}%`;
        }
    });

    // --- CUSTOM CURSOR ---
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorGlow = document.querySelector('.cursor-glow');

    if (cursorDot && cursorGlow) {
        window.addEventListener('mousemove', (e) => {
            const x = e.clientX;
            const y = e.clientY;

            cursorDot.style.left = `${x}px`;
            cursorDot.style.top = `${y}px`;

            // Use animate for a smoother, slightly delayed trailing effect on the glow
            cursorGlow.animate({
                left: `${x}px`,
                top: `${y}px`
            }, { duration: 300, fill: 'forwards' });
        });

        // Add hover effect to clickable elements
        const clickables = document.querySelectorAll('a, button, summary');
        clickables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorGlow.classList.add('hovering');
            });
            el.addEventListener('mouseleave', () => {
                cursorGlow.classList.remove('hovering');
            });
        });
    }
    // --- CANVAS PARTICLES (NETWORK & SAKURA MIX) ---
    const canvas = document.getElementById('backgroundCanvas');
    if(canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;

        // Track mouse for network connection
        let mouse = { x: null, y: null, radius: 150 };

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        window.addEventListener('mouseout', () => {
            mouse.x = null;
            mouse.y = null;
        });

        function resize() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        }
        window.addEventListener('resize', resize);
        resize();

        class RainParticle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.length = Math.random() * 20 + 10;
                this.speedY = Math.random() * 4 + 4; // Gentle falling speed
                this.speedX = Math.random() * 1 + 0.5; // Slight wind angle
                this.opacity = Math.random() * 0.4 + 0.1; // Soothing transparency
                this.color = `rgba(150, 200, 255, ${this.opacity})`; // Soft blue-white
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.y > height) {
                    this.y = -20;
                    this.x = Math.random() * width;
                }
                if (this.x > width) this.x = -20;
            }
            draw() {
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x + this.speedX * 2, this.y + this.length);
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 1.5;
                ctx.lineCap = 'round';
                ctx.stroke();
            }
        }

        class SakuraParticle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height - height;
                this.size = Math.random() * 8 + 6; // Larger size requested by user
                this.speedY = Math.random() * 1.2 + 0.8; 
                this.speedX = Math.random() * 1.5 - 0.75;
                this.angle = Math.random() * Math.PI * 2;
                this.spin = (Math.random() - 0.5) * 0.05; 
                this.color = 'rgba(255, 182, 193, 0.75)'; 
            }
            update() {
                this.y += this.speedY;
                this.angle += this.spin;
                this.x += Math.sin(this.angle) * 1.2 + this.speedX;

                if (this.y > height + 20) {
                    this.y = -20;
                    this.x = Math.random() * width;
                }
                if (this.x > width + 20) this.x = -20;
                if (this.x < -20) this.x = width + 20;
            }
            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle);
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.quadraticCurveTo(this.size, -this.size, this.size * 2, 0);
                ctx.quadraticCurveTo(this.size, this.size, 0, 0);
                ctx.fillStyle = this.color;
                ctx.fill();
                ctx.restore();
            }
        }

        class NetworkParticle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 3 + 2; // Slightly larger dots
                this.speedX = (Math.random() - 0.5) * 0.8;
                this.speedY = (Math.random() - 1.5) * 1.2;
                this.color = 'rgba(255, 215, 0, 0.9)'; // Brighter Gold
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x < 0 || this.x > width) this.speedX *= -1;
                if (this.y < -50) this.y = height + 50;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.shadowBlur = 12; // Glowing dot effect
                ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
                ctx.fill();
                ctx.shadowBlur = 0; // Reset
            }
        }

        let rainParticles = [];
        let sakuraParticles = [];
        let networkParticles = [];
        
        for(let i = 0; i < 60; i++) rainParticles.push(new RainParticle());
        for(let i = 0; i < 40; i++) sakuraParticles.push(new SakuraParticle());
        for(let i = 0; i < 35; i++) networkParticles.push(new NetworkParticle());

        function connectNetwork() {
            let opacityValue = 1;
            for(let a = 0; a < networkParticles.length; a++) {
                if (mouse.x != null) {
                    let dxMouse = networkParticles[a].x - mouse.x;
                    let dyMouse = networkParticles[a].y - mouse.y;
                    let distanceMouse = Math.sqrt(dxMouse*dxMouse + dyMouse*dyMouse);
                    
                    if(distanceMouse < mouse.radius) {
                        opacityValue = 1 - (distanceMouse/mouse.radius);
                        ctx.strokeStyle = `rgba(255, 215, 0, ${opacityValue * 0.6})`;
                        ctx.lineWidth = 2;
                        ctx.shadowBlur = 5; // Glowing line
                        ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
                        ctx.beginPath();
                        ctx.moveTo(networkParticles[a].x, networkParticles[a].y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.stroke();
                        ctx.shadowBlur = 0;
                    }
                }
            }
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);
            
            const isLight = document.documentElement.getAttribute('data-theme') === 'light';
            
            if (!isLight) {
                rainParticles.forEach(p => { p.update(); p.draw(); });
            } else {
                sakuraParticles.forEach(p => { p.update(); p.draw(); });
            }
            
            // Show shining dots in BOTH themes
            networkParticles.forEach(p => { p.update(); p.draw(); });
            connectNetwork();
            
            requestAnimationFrame(animate);
        }
        animate();
    }
    // --- SCROLL REVEAL ANIMATIONS ---
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-up').forEach((el) => {
        observer.observe(el);
    });

    // --- EPIC INTRO CLEANUP ---
    setTimeout(() => {
        const introScroll = document.getElementById('intro-scroll');
        if (introScroll) introScroll.remove();
    }, 3000); // Remove from DOM after animation completes

    // --- 3D HOVER TILT EFFECT & HOLOGRAM GLARE (CARDS) ---
    const cards = document.querySelectorAll('.glass-card:not(.faq-item), .gallery-item');
    cards.forEach(card => {
        // Create glare element
        const glare = document.createElement('div');
        glare.className = 'glare';
        card.appendChild(glare);

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Calculate rotation (max 10 degrees)
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;
            
            // Hologram Glare positioning
            const px = (x / rect.width) * 100;
            const py = (y / rect.height) * 100;
            glare.style.transform = `translate(${px - 50}%, ${py - 50}%)`;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            card.style.transition = 'none'; // Instant follow
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            card.style.transition = 'transform 0.5s ease'; // Smooth reset
            glare.style.transform = `translate(0%, 0%)`;
        });
    });

    // --- MOUSE SPARKS TRAIL ---
    let lastSparkTime = 0;
    document.addEventListener('mousemove', (e) => {
        if (window.matchMedia("(pointer: coarse)").matches) return; // Disable on touch devices
        
        const now = Date.now();
        if (now - lastSparkTime > 50) { // Throttle spark creation
            const spark = document.createElement('div');
            spark.className = 'mouse-spark';
            spark.style.left = `${e.clientX}px`;
            spark.style.top = `${e.clientY}px`;
            
            // Random direction
            const tx = (Math.random() - 0.5) * 60;
            const ty = (Math.random() - 0.5) * 60 + 20; // Drift mostly up/down randomly
            spark.style.setProperty('--tx', `${tx}px`);
            spark.style.setProperty('--ty', `${ty}px`);
            
            document.body.appendChild(spark);
            lastSparkTime = now;
            
            setTimeout(() => {
                if(spark.parentNode) spark.parentNode.removeChild(spark);
            }, 800);
        }
    });

    // --- INTERACTIVE NINJA SHURIKEN CLICK EFFECT ---
    document.addEventListener('click', (e) => {
        // Don't spawn shuriken if clicking a button/link so we don't interfere with UI
        if(e.target.closest('a, button, summary, input')) return; 

        // Spawn Shuriken
        const shuriken = document.createElement('i');
        shuriken.className = 'fas fa-dharmachakra shuriken-effect'; // Using dharmachakra as it looks like a shuriken
        shuriken.style.left = `${e.clientX}px`;
        shuriken.style.top = `${e.clientY}px`;
        document.body.appendChild(shuriken);
        
        // Remove Shuriken after animation
        setTimeout(() => {
            if(document.body.contains(shuriken)) shuriken.remove();
        }, 600);

        // Spawn Sparks
        for(let i=0; i<6; i++) {
            const spark = document.createElement('div');
            spark.className = 'shuriken-spark';
            spark.style.left = `${e.clientX}px`;
            spark.style.top = `${e.clientY}px`;
            
            const angle = (i / 6) * Math.PI * 2;
            const dist = 50 + Math.random() * 50;
            
            spark.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
            spark.style.setProperty('--ty', `${Math.sin(angle) * dist}px`);
            spark.style.transform = `translate(-50%, -50%) rotate(${angle + Math.PI/2}rad)`;
            
            document.body.appendChild(spark);
            
            // Remove Spark
            setTimeout(() => {
                if(document.body.contains(spark)) spark.remove();
            }, 400);
        }
    });

    // --- MOUSE PARALLAX EFFECT (BACKGROUND ORBS) ---
    const orbs = document.querySelectorAll('.bg-orb');
    window.addEventListener('mousemove', (e) => {
        const mouseX = (e.clientX / window.innerWidth) - 0.5;
        const mouseY = (e.clientY / window.innerHeight) - 0.5;
        
        orbs.forEach((orb, index) => {
            // Farther orbs move slower
            const speed = (index + 1) * 40; 
            const x = mouseX * speed;
            const y = mouseY * speed;
            orb.style.transform = `translate(${x}px, ${y}px)`;
        });
    });

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
                newsletterMsg.textContent = "Unable to connect to the server (Backend is offline).";
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Subscribe';
            }
        });
    }

});
