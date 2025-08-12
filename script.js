(function() {
    'use strict';

    let particles = [];
    let animationId = null;
    let isInitialized = false;
    let lastTime = 0;
    const FPS_LIMIT = 60;
    const FRAME_TIME = 1000 / FPS_LIMIT;

    const config = {
        particleCount: window.innerWidth < 768 ? 8 : 15
    };

    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    function isMobile() {
        return window.innerWidth <= 768;
    }

    class LokiParticle {
        constructor() {
            this.reset();
            this.y = random(0, window.innerHeight);
            this.hueShift = random(0, 360);
            this.pulsePhase = random(0, Math.PI * 2);
        }

        reset() {
            this.x = random(-20, window.innerWidth + 20);
            this.y = window.innerHeight + 20;
            this.speed = random(0.8, 2.2);
            this.size = random(1.5, 3);
            this.opacity = random(0.3, 0.7);
            this.hue = random(45, 65);
            this.shimmer = random(0.1, 0.3);
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
                    particles.push(new LokiParticle());
                }
            }
        }
        resize();
        window.addEventListener('resize', resize);

        for (let i = 0; i < config.particleCount; i++) {
            particles.push(new LokiParticle());
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

    function closeMenuMobile() {
        const toggle = document.querySelector('.mobile-toggle');
        const menu = document.querySelector('.nav-menu-enhanced');
        if (toggle && menu) {
            toggle.classList.remove('active');
            menu.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
        }
    }

    function initNavigation() {
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
    console.log('Link clickeado:', href);

    let scrollTarget = null;
    let offsetExtra = 20;

    if (href === '#productos') {
        // 1) Intentar ir DIRECTO a la tarjeta "stickers" (más específico)
        scrollTarget = document.querySelector('.product-card-enhanced[data-product="stickers"]');

        // 2) Si no existe, ir al título de la sección o a la propia sección como fallback
        if (!scrollTarget) {
            const section = document.querySelector('#productos');
            scrollTarget = section?.querySelector('.section-header') || section;
        }

        offsetExtra = 30;
    } else if (href === '#servicios') {
        scrollTarget = document.querySelector('section#servicios') || document.querySelector('.services-enhanced');
        offsetExtra = 20;
    } else {
        scrollTarget = document.querySelector(href);
    }

    if (!scrollTarget) {
        console.warn('No se encontró objetivo para', href);
        return;
    }

    // altura real del header (más fiable)
    const headerEl = document.querySelector('.header-enhanced');
    const headerHeight = headerEl ? Math.ceil(headerEl.getBoundingClientRect().height) : 80;

    // posición absoluta del objetivo
    const rect = scrollTarget.getBoundingClientRect();
    const absoluteTop = window.scrollY + rect.top;
    const finalPosition = Math.max(0, Math.floor(absoluteTop - headerHeight - offsetExtra));

    console.log({ href, target: scrollTarget, rectTop: rect.top, absoluteTop, headerHeight, finalPosition });

    window.scrollTo({
        top: finalPosition,
        behavior: 'smooth'
    });

    // cerrar menú móvil si existe
    if (typeof closeMenuMobile === 'function') closeMenuMobile();
}


        document.addEventListener('click', handleNavClick);
    }

    function initLokiEffects() {
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

    function initPurchaseSystem() {
        let isModalOpen = false;
        
        function showModal(productName, productPrice) {
            if (isModalOpen) return;
            isModalOpen = true;
            
            const price = parseFloat(productPrice.replace(/[$*]/g, '')) || 0;
            const whatsappMsg = `¡Hola! Me interesa comprar: ${productName} - $${price}`;
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
                    
                    <div class="contact-buttons">
                        <a href="${whatsappUrl}" class="contact-btn whatsapp" target="_blank" rel="noopener">
                            WhatsApp
                        </a>
                        <a href="mailto:lafilec01@gmail.com?subject=Consulta ${encodeURIComponent(productName)}" class="contact-btn email">
                            Email
                        </a>
                        <a href="tel:+593991389251" class="contact-btn phone">
                            Llamar
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
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(n => n.remove());

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
        
        const timeout = setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
        
        notification.addEventListener('click', () => {
            clearTimeout(timeout);
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

    function initLokiAnimations() {
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
                logoText.style.animation = 'lokiMagic 2s ease-in-out';
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
            // Los efectos de hover se manejan completamente con CSS
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
                    header.style.background = 'linear-gradient(135deg, rgba(34, 85, 34, 0.98) 0%, rgba(45, 105, 45, 0.98) 50%, rgba(25, 65, 25, 0.98) 100%)';
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
        if (isInitialized) return;
        isInitialized = true;

        try {
            initParticles();
            initNavigation();
            initLokiEffects();
            initObserver();
            initPurchaseSystem();
            initLokiAnimations();
            addScrollEffects();
            
            setTimeout(() => {
                showNotification('¡Bienvenid@s! Explora nuestros productos', 'info', 4000);
            }, 1500);
            
        } catch (error) {
            console.error('Error al inicializar:', error);
            showNotification('Error al cargar la página', 'error');
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

    scrollTarget = document.querySelector('#product-stickers') || document.querySelector('#productos');
    const headerEl = document.querySelector('.header-enhanced');
if (headerEl) {
    document.documentElement.style.setProperty('--header-height', `${Math.ceil(headerEl.getBoundingClientRect().height)}px`);
}

})();
