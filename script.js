(function() {
    'use strict';

    let particles = [];
    let animationId = null;
    let isInitialized = false;
    let lastTime = 0;
    const FPS_LIMIT = 60;
    const FRAME_TIME = 1000 / FPS_LIMIT;

    const config = {
        particleCount: window.innerWidth < 768 ? 12 : 20,
        maxParticles: 25
    };

    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    function isMobile() {
        return window.innerWidth <= 768;
    }

    function throttle(func, delay) {
        let timeoutId;
        let lastExecTime = 0;
        return function (...args) {
            const currentTime = Date.now();
            if (currentTime - lastExecTime > delay) {
                func.apply(this, args);
                lastExecTime = currentTime;
            } else {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                    lastExecTime = Date.now();
                }, delay - (currentTime - lastExecTime));
            }
        };
    }

    class Particle {
        constructor() {
            this.reset();
            this.y = random(0, window.innerHeight);
        }

        reset() {
            this.x = random(-20, window.innerWidth + 20);
            this.y = window.innerHeight + 20;
            this.speed = random(0.8, 2.2);
            this.size = random(2, 4);
            this.opacity = random(0.4, 0.8);
            this.hue = random(45, 65); 
        }

        update() {
            this.y -= this.speed;
            if (this.y < -30) {
                this.reset();
            }
        }

        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = `hsl(${this.hue}, 80%, 65%)`; 
            ctx.shadowBlur = 8;
            ctx.shadowColor = `hsl(${this.hue}, 100%, 75%)`;
            ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
            ctx.restore();
        }
    }

    function initParticles() {
        const canvas = document.createElement('canvas');
        canvas.id = 'particle-canvas';
        canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
            will-change: transform;
        `;
        document.body.appendChild(canvas);

        const ctx = canvas.getContext('2d', { alpha: true });
        ctx.imageSmoothingEnabled = true;
        
        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            const newCount = window.innerWidth < 768 ? 12 : 20;
            if (particles.length !== newCount) {
                particles.length = 0;
                for (let i = 0; i < newCount; i++) {
                    particles.push(new Particle());
                }
            }
        }
        resize();
        window.addEventListener('resize', throttle(resize, 250));

        for (let i = 0; i < config.particleCount; i++) {
            particles.push(new Particle());
        }

        function animate(currentTime) {
            if (currentTime - lastTime >= FRAME_TIME) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                for (let i = 0; i < particles.length; i++) {
                    const particle = particles[i];
                    particle.update();
                    if (particle.y >= -30 && particle.y <= canvas.height + 30) {
                        particle.draw(ctx);
                    }
                }

                lastTime = currentTime;
            }
            
            animationId = requestAnimationFrame(animate);
        }
        
        animate(0);
    }

    function initNavigation() {
        const navLinks = document.querySelectorAll('a[href^="#"]');
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const target = document.querySelector(targetId);
                
                if (target) {
                    const header = document.querySelector('header');
                    const offset = header ? header.offsetHeight + 20 : 20;
                    const targetPosition = target.offsetTop - offset;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });

        const toggle = document.querySelector('.mobile-toggle');
        const menu = document.querySelector('.nav-menu-enhanced');
        
        if (toggle && menu) {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                menu.classList.toggle('active');
            });

            menu.addEventListener('click', (e) => {
                if (e.target.tagName === 'A') {
                    menu.classList.remove('active');
                }
            });

            document.addEventListener('click', (e) => {
                if (!menu.contains(e.target) && !toggle.contains(e.target)) {
                    menu.classList.remove('active');
                }
            });
        }

        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const header = document.querySelector('.header-enhanced');
                    if (header) {
                        const scrollY = window.pageYOffset;
                        if (scrollY > 100) {
                            header.classList.add('scrolled');
                        } else {
                            header.classList.remove('scrolled');
                        }
                    }
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    function initHoverEffects() {
        const cards = document.querySelectorAll('.service-card-enhanced, .product-card-enhanced');
        const buttons = document.querySelectorAll('.buy-button-enhanced, .cta-button-enhanced, .social-button-enhanced');

        if (isMobile()) {
            cards.forEach(card => {
                card.addEventListener('touchstart', () => {
                    card.classList.add('touch-active');
                }, { passive: true });
                
                card.addEventListener('touchend', () => {
                    setTimeout(() => {
                        card.classList.remove('touch-active');
                    }, 150);
                }, { passive: true });
            });
        } else {
            cards.forEach(card => {
                card.addEventListener('mouseenter', () => {
                    card.classList.add('hover-active');
                });
                
                card.addEventListener('mouseleave', () => {
                    card.classList.remove('hover-active');
                });
            });

            buttons.forEach(btn => {
                btn.addEventListener('mouseenter', () => {
                    btn.classList.add('hover-active');
                });
                
                btn.addEventListener('mouseleave', () => {
                    btn.classList.remove('hover-active');
                });
            });
        }
    }

    function initObserver() {
        if (!('IntersectionObserver' in window)) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -30px 0px'
        });

        const elements = document.querySelectorAll('.service-card-enhanced, .product-card-enhanced, .about-enhanced');
        elements.forEach(el => {
            observer.observe(el);
        });
    }

    function initPurchaseSystem() {
        let isModalOpen = false;
        
        function showModal(productName, productPrice) {
            if (isModalOpen) return;
            isModalOpen = true;
            
            const price = parseFloat(productPrice.replace(/[$*]/g, '')) || 0;
            const whatsappMsg = `Hola! Me interesa comprar: ${productName} - $${price}`;
            const whatsappUrl = `https://wa.me/593991389251?text=${encodeURIComponent(whatsappMsg)}`;
            
            const modal = document.createElement('div');
            modal.className = 'purchase-modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <button class="modal-close" aria-label="Cerrar modal">&times;</button>
                    <div class="product-info">
                        <h3>${productName}</h3>
                        <div class="product-price">$${price.toFixed(2)}</div>
                    </div>
                    
                    <div class="quantity-section">
                        <button class="quantity-btn minus" aria-label="Disminuir cantidad">−</button>
                        <input type="number" class="quantity-input" value="1" min="1" max="99" aria-label="Cantidad">
                        <button class="quantity-btn plus" aria-label="Aumentar cantidad">+</button>
                    </div>
                    
                    <div class="total-section">
                        <h4>Total: <span class="total-price">$${price.toFixed(2)}</span></h4>
                    </div>

                    <div class="payment-qr">
                        <h4>Escanea para pagar</h4>
                        <img src="Stickers.jpg" alt="QR de pago" class="qr-image">
                    </div>
                    
                    <div class="contact-buttons">
                        <a href="${whatsappUrl}" class="contact-btn whatsapp" target="_blank" rel="noopener">
                            📱 WhatsApp
                        </a>
                        <a href="mailto:lafilec01@gmail.com?subject=Consulta ${encodeURIComponent(productName)}" class="contact-btn email">
                            📧 Email
                        </a>
                        <a href="tel:+593991389251" class="contact-btn phone">
                            📞 Llamar
                        </a>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            document.body.style.overflow = 'hidden';
            
            requestAnimationFrame(() => {
                modal.classList.add('show');
            });
            
            const quantityInput = modal.querySelector('.quantity-input');
            const totalPrice = modal.querySelector('.total-price');
            
            function updateTotal() {
                const qty = Math.max(1, Math.min(99, parseInt(quantityInput.value) || 1));
                quantityInput.value = qty;
                totalPrice.textContent = `$${(price * qty).toFixed(2)}`;
            }
            
            modal.querySelector('.minus').addEventListener('click', () => {
                quantityInput.value = Math.max(1, parseInt(quantityInput.value) - 1);
                updateTotal();
            });
            
            modal.querySelector('.plus').addEventListener('click', () => {
                quantityInput.value = Math.min(99, parseInt(quantityInput.value) + 1);
                updateTotal();
            });
            
            quantityInput.addEventListener('input', updateTotal);
            
            function closeModal() {
                if (!isModalOpen) return;
                
                isModalOpen = false;
                modal.classList.remove('show');
                document.body.style.overflow = '';
                
                setTimeout(() => {
                    if (modal.parentNode) {
                        modal.parentNode.removeChild(modal);
                    }
                }, 300);
            }
            
            modal.querySelector('.modal-close').addEventListener('click', closeModal);
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });
            
            const escHandler = (e) => {
                if (e.key === 'Escape') {
                    closeModal();
                    document.removeEventListener('keydown', escHandler);
                }
            };
            document.addEventListener('keydown', escHandler);
        }

        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.buy-button-enhanced');
            if (!btn || btn.classList.contains('no-modal') || btn.classList.contains('disabled')) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            if (isModalOpen) return;
            
            const card = btn.closest('.product-card-enhanced');
            if (card) {
                const name = card.querySelector('h3')?.textContent || 'Producto';
                const price = card.querySelector('.product-price-enhanced')?.textContent || '$0.00';
                showModal(name, price);
            }
        });
    }

    function showNotification(message, type = 'info', duration = 3000) {
        document.querySelectorAll('.notification').forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <div class="notification-content ${type}">
                <span class="notification-icon">${type === 'error' ? '❌' : '✅'}</span>
                <span class="notification-text">${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);

        notification.addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
    }

    function cleanup() {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        
        const canvas = document.getElementById('particle-canvas');
        if (canvas && canvas.parentNode) {
            canvas.parentNode.removeChild(canvas);
        }
        
        particles.length = 0;
    }

    window.addEventListener('error', (e) => {
        console.error('Error:', e.error);
        showNotification('Ha ocurrido un error en la página', 'error');
    });

    function init() {
        if (isInitialized) return;
        isInitialized = true;

        try {
            initParticles();
            initNavigation();
            initHoverEffects();
            initObserver();
            initPurchaseSystem();
            
            setTimeout(() => {
                showNotification('¡Bienvenid@, explora nuestros productos!', 'info', 4000);
            }, 1500);
            
            console.log('LA FIL optimizado correctamente');
        } catch (error) {
            console.error('Error al inicializar:', error);
            showNotification('Error al cargar la página', 'error');
        }
    }

    function handleVisibilityChange() {
        if (document.hidden) {
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        } else {
            if (!animationId && isInitialized) {
                const canvas = document.getElementById('particle-canvas');
                if (canvas) {
                    const ctx = canvas.getContext('2d');
                    function animate(currentTime) {
                        if (currentTime - lastTime >= FRAME_TIME) {
                            ctx.clearRect(0, 0, canvas.width, canvas.height);
                            
                            for (let i = 0; i < particles.length; i++) {
                                const particle = particles[i];
                                particle.update();
                                if (particle.y >= -30 && particle.y <= canvas.height + 30) {
                                    particle.draw(ctx);
                                }
                            }
                            
                            lastTime = currentTime;
                        }
                        animationId = requestAnimationFrame(animate);
                    }
                    animate(0);
                }
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.addEventListener('beforeunload', cleanup);
    window.addEventListener('visibilitychange', handleVisibilityChange);
    
    window.addEventListener('unload', () => {
        cleanup();
        isInitialized = false;
    });

    document.addEventListener('DOMContentLoaded', () => {
        const logo = document.querySelector('.logo-enhanced');
        if (logo && !logo.dataset.handlerAdded) {
            logo.dataset.handlerAdded = 'true';
            logo.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = window.location.origin + window.location.pathname;
            });
        }
    });

})();
