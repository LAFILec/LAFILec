(function() {
    'use strict';

    let particles = [];
    let animId = null;
    let isInit = false;
    let lastTime = 0;
    const FPS = 60;
    const frameTime = 1000 / FPS;

    const config = {
        count: window.innerWidth < 768 ? 8 : 15
    };

    function rand(min, max) {
        return Math.random() * (max - min) + min;
    }

    function isMobile() {
        return window.innerWidth <= 768;
    }

    class Particle {
        constructor() {
            this.reset();
            this.y = rand(0, window.innerHeight);
            this.hueShift = rand(0, 360);
            this.pulsePhase = rand(0, Math.PI * 2);
        }

        reset() {
            this.x = rand(-20, window.innerWidth + 20);
            this.y = window.innerHeight + 20;
            this.speed = rand(0.8, 2.2);
            this.size = rand(1.5, 3);
            this.opacity = rand(0.3, 0.7);
            this.hue = rand(45, 65);
            this.shimmer = rand(0.1, 0.3);
        }

        update() {
            this.y -= this.speed;
            this.hueShift += 0.5;
            this.pulsePhase += 0.02;
            
            if (this.y < -30) {
                this.reset();
            }
        }

        draw(ctx) {
            ctx.save();
            
            const pulse = Math.sin(this.pulsePhase) * 0.3 + 0.7;
            const currentOpacity = this.opacity * pulse;
            const currentSize = this.size * (0.8 + pulse * 0.4);
            const currentHue = (this.hue + Math.sin(this.hueShift * 0.01) * 15) % 360;
            
            ctx.globalAlpha = currentOpacity;
            ctx.fillStyle = `hsl(${currentHue}, 80%, 65%)`;
            ctx.shadowBlur = 6;
            ctx.shadowColor = `hsl(${currentHue}, 90%, 75%)`;
            
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, currentSize);
            gradient.addColorStop(0, `hsl(${currentHue}, 80%, 75%)`);
            gradient.addColorStop(0.7, `hsl(${currentHue}, 70%, 60%)`);
            gradient.addColorStop(1, `hsla(${currentHue}, 60%, 50%, 0)`);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, currentSize, 0, Math.PI * 2);
            ctx.fill();
            
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

        const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
        
        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            const newCount = window.innerWidth < 768 ? 8 : 15;
            if (particles.length !== newCount) {
                particles.length = 0;
                for (let i = 0; i < newCount; i++) {
                    particles.push(new Particle());
                }
            }
        }
        resize();
        window.addEventListener('resize', resize);

        for (let i = 0; i < config.count; i++) {
            particles.push(new Particle());
        }

        function animate(currentTime) {
            if (currentTime - lastTime >= frameTime) {
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
            animId = requestAnimationFrame(animate);
        }
        animate(0);
    }

    function closeMobileMenu() {
        const toggle = document.querySelector('.mobile-toggle');
        const menu = document.querySelector('.nav-menu-enhanced');
        if (toggle && menu) {
            toggle.classList.remove('active');
            menu.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
        }
    }

    function initNav() {
        const toggle = document.querySelector('.mobile-toggle');
        const menu = document.querySelector('.nav-menu-enhanced');

        if (toggle && menu) {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                const isActive = toggle.classList.toggle('active');
                menu.classList.toggle('active');
                toggle.setAttribute('aria-expanded', isActive.toString());
            });
        }

        function handleNavClick(e) {
            const link = e.target.closest('a[href^="#"]');
            if (!link) return;

            e.preventDefault();

            const href = link.getAttribute('href');
            let target = null;
            let extra = 20;

            if (href === '#productos') {
                target = document.querySelector('.product-card-enhanced[data-product="stickers"]');

                if (!target) {
                    const section = document.querySelector('#productos');
                    target = section?.querySelector('.section-header') || section;
                }

                extra = 30;
            } else if (href === '#servicios') {
                target = document.querySelector('section#servicios') || document.querySelector('.services-enhanced');
                extra = 20;
            } else if (href === '#contacto') {
                target = document.querySelector('#contacto') || document.querySelector('.footer-enhanced');
                extra = 20;
            } else {
                target = document.querySelector(href);
            }

            if (!target) return;

            const headerEl = document.querySelector('.header-enhanced');
            const headerHeight = headerEl ? Math.ceil(headerEl.getBoundingClientRect().height) : 80;

            const rect = target.getBoundingClientRect();
            const absTop = window.scrollY + rect.top;
            const final = Math.max(0, Math.floor(absTop - headerHeight - extra));

            window.scrollTo({
                top: final,
                behavior: 'smooth'
            });

            if (typeof closeMobileMenu === 'function') closeMobileMenu();
        }

        document.addEventListener('click', handleNavClick);
    }

    function initEffects() {
        const cards = document.querySelectorAll('.service-card-enhanced, .product-card-enhanced');
        const buttons = document.querySelectorAll('.buy-button-enhanced, .cta-button-enhanced, .social-button-enhanced');

        if (isMobile()) {
            cards.forEach(card => {
                card.addEventListener('touchstart', () => {
                    card.classList.add('touch-active');
                    card.style.transform = 'translateY(-5px) scale(1.02)';
                }, { passive: true });
                
                card.addEventListener('touchend', () => {
                    setTimeout(() => {
                        card.classList.remove('touch-active');
                        card.style.transform = '';
                    }, 150);
                }, { passive: true });
            });
        } else {
            cards.forEach(card => {
                let hoverTimeout;
                
                card.addEventListener('mouseenter', () => {
                    clearTimeout(hoverTimeout);
                    card.classList.add('hover-active');
                    card.style.filter = 'brightness(1.1) saturate(1.2)';
                });
                
                card.addEventListener('mouseleave', () => {
                    card.classList.remove('hover-active');
                    hoverTimeout = setTimeout(() => {
                        card.style.filter = '';
                    }, 300);
                });
            });

            buttons.forEach(btn => {
                btn.addEventListener('mouseenter', () => {
                    btn.classList.add('hover-active');
                    btn.style.filter = 'brightness(1.15) saturate(1.3)';
                });
                
                btn.addEventListener('mouseleave', () => {
                    btn.classList.remove('hover-active');
                    setTimeout(() => {
                        btn.style.filter = '';
                    }, 300);
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
                    entry.target.style.transform = 'translateY(0)';
                    entry.target.style.opacity = '1';
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -30px 0px'
        });

        const elements = document.querySelectorAll('.service-card-enhanced, .product-card-enhanced, .about-enhanced');
        elements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = `all 0.6s ease ${index * 0.1}s`;
            observer.observe(el);
        });
    }

    function initPurchase() {
        let isModalOpen = false;
        
        function showModal(prodName, prodPrice) {
            if (isModalOpen) return;
            isModalOpen = true;
            
            const price = parseFloat(prodPrice.replace(/[$*]/g, '')) || 0;
            
            const modal = document.createElement('div');
            modal.className = 'purchase-modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <button class="modal-close" aria-label="Cerrar modal">&times;</button>
                    <div class="product-info">
                        <h3>${prodName}</h3>
                        <div class="product-price">${price.toFixed(2)}</div>
                    </div>
                    
                    <div class="quantity-section">
                        <button class="quantity-btn minus" aria-label="Disminuir cantidad">−</button>
                        <input type="number" class="quantity-input" value="1" min="1" max="99" aria-label="Cantidad">
                        <button class="quantity-btn plus" aria-label="Aumentar cantidad">+</button>
                    </div>
                    
                    <div class="total-section">
                        <h4>Total: <span class="total-price">${price.toFixed(2)}</span></h4>
                    </div>

                    <div class="qr-container">
                        <img src="PB.png" alt="Código QR para pago" class="qr-image">
                        <p class="qr-instruction">Envía tu comprobante al finalizar con el pago y coordinaremos la entrega, tiempo estimado de entrega 24h.</p>
                    </div>
                    
                    <div class="contact-buttons">
                        <a href="https://wa.me/593991389252" class="contact-btn whatsapp" target="_blank" rel="noopener">
                            <svg class="contact-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                                <path fill="currentColor" d="M380.9 97.1C339 55.1 283.2 32 224 32 100.3 32 0 132.3 0 256c0 45.3 12 89.2 34.9 127.3L0 480l99.4-34.6C135.1 469.4 179 480 224 480c123.7 0 224-100.3 224-224 0-59.2-23.1-115-67.1-158.9zM224 438.5c-41.1 0-81.2-11.1-116.1-32.1l-8.3-5-59 20 19.5-60.7-5.4-8.7C36.7 316.4 24 286.7 24 256c0-110.3 89.7-200 200-200 53.4 0 103.6 20.8 141.4 58.6 37.8 37.8 58.6 88 58.6 141.4 0 110.3-89.7 200-200 200zm101.6-138.5c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.4 2.8-3.6 5.5-14.2 18-17.4 21.6-3.2 3.6-6.4 4.1-11.9 1.4-5.5-2.8-23.1-8.5-44-27-16.3-14.6-27.4-32.7-30.6-38.2-3.2-5.5-.3-8.5 2.4-11.3 2.5-2.5 5.5-6.4 8.2-9.6 2.7-3.2 3.6-5.5 5.5-9.1 1.8-3.6.9-6.8-.5-9.6-1.4-2.8-12.4-29.9-17-40.9-4.5-10.8-9.1-9.3-12.4-9.5-3.2-.2-6.8-.2-10.4-.2s-9.6 1.4-14.6 6.8c-5 5.5-19.1 18.7-19.1 45.5s19.6 52.7 22.4 56.3c2.8 3.6 38.5 58.7 93.2 82.3 54.7 23.6 54.7 15.8 64.6 14.8 9.9-.9 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.4-2.5-5-4-10.5-6.8z"/>
                            </svg>
                        </a>

                        <a href="mailto:lafilec01@gmail.com" class="contact-btn email">
                            <svg class="contact-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                <path fill="currentColor" d="M502.3 190.8L327.4 338c-15.1 12.9-37.7 12.9-52.8 0L9.7 190.8C3.9 185.7 0 178.3 0 170.4v-20.5c0-21.3 17.2-38.5 38.5-38.5h435c21.3 0 38.5 17.2 38.5 38.5v20.5c0 7.9-3.9 15.3-9.7 20.4zM0 213.3V416c0 21.3 17.2 38.5 38.5 38.5h435c21.3 0 38.5-17.2 38.5-38.5V213.3L327.4 360.4c-15.1 12.9-37.7 12.9-52.8 0L0 213.3z"/>
                            </svg>
                        </a>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            document.body.style.overflow = 'hidden';
            
            requestAnimationFrame(() => {
                modal.classList.add('show');
            });
            
            const qtyInput = modal.querySelector('.quantity-input');
            const totalPrice = modal.querySelector('.total-price');
            
            function updateTotal() {
                const qty = Math.max(1, Math.min(99, parseInt(qtyInput.value) || 1));
                qtyInput.value = qty;
                totalPrice.textContent = `${(price * qty).toFixed(2)}`;
            }
            
            modal.querySelector('.minus').addEventListener('click', () => {
                qtyInput.value = Math.max(1, parseInt(qtyInput.value) - 1);
                updateTotal();
            });
            
            modal.querySelector('.plus').addEventListener('click', () => {
                qtyInput.value = Math.min(99, parseInt(qtyInput.value) + 1);
                updateTotal();
            });
            
            qtyInput.addEventListener('input', updateTotal);
            
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

    function showNotif(message, type = 'info', duration = 3000) {
        const existing = document.querySelectorAll('.notification');
        existing.forEach(n => n.remove());

        const notif = document.createElement('div');
        notif.className = 'notification';
        notif.innerHTML = `
            <div class="notification-content ${type}">
                <span class="notification-icon">${type === 'error' ? '❌' : '✅'}</span>
                <span class="notification-text">${message}</span>
            </div>
        `;
        
        document.body.appendChild(notif);
        
        requestAnimationFrame(() => {
            notif.classList.add('show');
        });
        
        const timeout = setTimeout(() => {
            notif.classList.remove('show');
            setTimeout(() => {
                if (notif.parentNode) {
                    notif.parentNode.removeChild(notif);
                }
            }, 300);
        }, duration);
        
        notif.addEventListener('click', () => {
            clearTimeout(timeout);
            notif.classList.remove('show');
            setTimeout(() => {
                if (notif.parentNode) {
                    notif.parentNode.removeChild(notif);
                }
            }, 300);
        });
    }

    function cleanup() {
        if (animId) {
            cancelAnimationFrame(animId);
            animId = null;
        }
        
        const canvas = document.getElementById('particle-canvas');
        if (canvas && canvas.parentNode) {
            canvas.parentNode.removeChild(canvas);
        }
        
        particles.length = 0;
    }

    function handleVisibility() {
        if (document.hidden) {
            if (animId) {
                cancelAnimationFrame(animId);
                animId = null;
            }
        } else {
            if (!animId && isInit) {
                const canvas = document.getElementById('particle-canvas');
                if (canvas) {
                    const ctx = canvas.getContext('2d');
                    function animate(currentTime) {
                        if (currentTime - lastTime >= frameTime) {
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
                        animId = requestAnimationFrame(animate);
                    }
                    animate(0);
                }
            }
        }
    }

    function initAnimations() {
        const heroTitle = document.querySelector('.hero-title');
        const logoText = document.querySelector('.logo-text');
        const serviceCards = document.querySelectorAll('.service-card-enhanced');
        const productCards = document.querySelectorAll('.product-card-enhanced');

        if (heroTitle) {
            heroTitle.addEventListener('mouseenter', () => {
                heroTitle.style.transform = 'scale(1.02)';
                heroTitle.style.filter = 'drop-shadow(0 0 40px rgba(255, 215, 0, 0.8))';
            });
            
            heroTitle.addEventListener('mouseleave', () => {
                heroTitle.style.transform = '';
                heroTitle.style.filter = '';
            });
        }

        if (logoText) {
            logoText.addEventListener('click', (e) => {
                e.preventDefault();
                logoText.style.animation = 'none';
                logoText.offsetHeight;
                logoText.style.animation = 'magic 2s ease-in-out';
            });
        }

        serviceCards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.2}s`;
            
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-12px) scale(1.03) rotateX(5deg)';
                card.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.4), 0 0 30px rgba(255, 215, 0, 0.3)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
                card.style.boxShadow = '';
            });
        });

        productCards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.15}s`;
        });
    }

    function addScrollEffects() {
        let lastScrollY = window.scrollY;
        
        function handleScroll() {
            const currentScrollY = window.scrollY;
            const header = document.querySelector('.header-enhanced');
            
            if (header) {
                if (currentScrollY > lastScrollY && currentScrollY > 100) {
                    header.style.transform = 'translateY(-100%)';
                } else {
                    header.style.transform = 'translateY(0)';
                }
                
                if (currentScrollY > 50) {
                    header.style.background = 'linear-gradient(135deg, rgba(45, 100, 45, 0.98) 0%, rgba(55, 120, 55, 0.98) 50%, rgba(35, 80, 35, 0.98) 100%)';
                    header.style.backdropFilter = 'blur(25px)';
                } else {
                    header.style.background = '';
                    header.style.backdropFilter = '';
                }
            }
            
            lastScrollY = currentScrollY;
        }
        
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    function init() {
        if (isInit) return;
        isInit = true;

        try {
            initParticles();
            initNav();
            initEffects();
            initObserver();
            initPurchase();
            initAnimations();
            addScrollEffects();
            
            setTimeout(() => {
                showNotif('¡Bienvenid@s! Explora nuestros productos', 'info', 4000);
            }, 1500);
            
        } catch (error) {
            console.error('Error al inicializar:', error);
            showNotif('Error al cargar la página', 'error');
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.addEventListener('beforeunload', cleanup);
    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('unload', () => {
        cleanup();
        isInit = false;
    });

    const headerEl = document.querySelector('.header-enhanced');
    if (headerEl) {
        document.documentElement.style.setProperty('--header-height', `${Math.ceil(headerEl.getBoundingClientRect().height)}px`);
    }

})();
