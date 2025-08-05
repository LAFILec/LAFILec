(function() {
    'use strict';

    let particleContainer;
    let particles = [];
    let animationFrame;
    let isParticleAnimationActive = true;

    const PARTICLE_CONFIG = {
        count: 25,
        maxOpacity: 0.7,
        minOpacity: 0.3,
        speed: { min: 0.5, max: 2 },
        size: { min: 2, max: 4 }
    };

    const utils = {
        throttle: function(func, limit) {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },

        debounce: function(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        random: function(min, max) {
            return Math.random() * (max - min) + min;
        },

        isInViewport: function(element) {
            const rect = element.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        },

        isMobile: function() {
            return window.innerWidth <= 768;
        },

        isTablet: function() {
            return window.innerWidth > 768 && window.innerWidth <= 1024;
        }
    };

    class Particle {
        constructor() {
            this.reset();
            this.y = utils.random(0, window.innerHeight);
            this.opacity = utils.random(PARTICLE_CONFIG.minOpacity, PARTICLE_CONFIG.maxOpacity);
        }

        reset() {
            this.x = utils.random(0, window.innerWidth);
            this.y = window.innerHeight + 10;
            this.speed = utils.random(PARTICLE_CONFIG.speed.min, PARTICLE_CONFIG.speed.max);
            this.size = utils.random(PARTICLE_CONFIG.size.min, PARTICLE_CONFIG.size.max);
            this.rotation = 0;
            this.rotationSpeed = utils.random(-2, 2);
            this.opacity = utils.random(PARTICLE_CONFIG.minOpacity, PARTICLE_CONFIG.maxOpacity);
        }

        update() {
            this.y -= this.speed;
            this.rotation += this.rotationSpeed;
            
            if (this.y < -10) {
                this.reset();
            }
        }

        draw(element) {
            element.style.left = this.x + 'px';
            element.style.top = this.y + 'px';
            element.style.width = this.size + 'px';
            element.style.height = this.size + 'px';
            element.style.opacity = this.opacity;
            element.style.transform = `rotate(${this.rotation}deg)`;
        }
    }

    const ParticleSystem = {
        init: function() {
            particleContainer = document.getElementById('particles');
            if (!particleContainer) return;

            const particleCount = utils.isMobile() ? 15 : PARTICLE_CONFIG.count;
            this.createParticles(particleCount);
            this.startAnimation();
        },

        createParticles: function(count = PARTICLE_CONFIG.count) {
            const fragment = document.createDocumentFragment();
            
            for (let i = 0; i < count; i++) {
                const particleElement = document.createElement('div');
                particleElement.className = 'particle';
                
                const particle = new Particle();
                particles.push({
                    element: particleElement,
                    particle: particle
                });
                
                fragment.appendChild(particleElement);
            }
            
            particleContainer.appendChild(fragment);
        },

        animate: function() {
            if (!isParticleAnimationActive) return;

            particles.forEach(({ element, particle }) => {
                particle.update();
                particle.draw(element);
            });

            animationFrame = requestAnimationFrame(() => this.animate());
        },

        startAnimation: function() {
            this.animate();
        },

        pauseAnimation: function() {
            isParticleAnimationActive = false;
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        },

        resumeAnimation: function() {
            isParticleAnimationActive = true;
            this.startAnimation();
        },

        resize: function() {
            particles.forEach(({ particle }) => {
                if (particle.x > window.innerWidth) {
                    particle.reset();
                }
            });
        }
    };

    const SmoothScroll = {
        init: function() {
            const links = document.querySelectorAll('a[href^="#"]');
            links.forEach(link => {
                link.addEventListener('click', this.handleClick.bind(this));
            });
        },

        handleClick: function(e) {
            e.preventDefault();
            const targetId = e.currentTarget.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const header = document.querySelector('header');
                const headerHeight = header ? header.offsetHeight : 0;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        }
    };

    const AnimationObserver = {
        init: function() {
            if ('IntersectionObserver' in window) {
                this.setupIntersectionObserver();
            } else {
                this.fallbackAnimation();
            }
        },

        setupIntersectionObserver: function() {
            const options = {
                threshold: utils.isMobile() ? 0.05 : 0.1,
                rootMargin: '0px 0px -50px 0px'
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.animationPlayState = 'running';
                        observer.unobserve(entry.target);
                    }
                });
            }, options);

            const animatedElements = document.querySelectorAll('.service-card, .product-card');
            animatedElements.forEach(el => {
                el.style.animationPlayState = 'paused';
                observer.observe(el);
            });
        },

        fallbackAnimation: function() {
            const animatedElements = document.querySelectorAll('.service-card, .product-card');
            animatedElements.forEach((el, index) => {
                setTimeout(() => {
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }, index * 200);
            });
        }
    };

    const HoverEffects = {
        init: function() {
            if (!utils.isMobile()) {
                this.setupCardHovers();
                this.setupButtonHovers();
            } else {
                this.setupMobileTouch();
            }
        },

        setupCardHovers: function() {
            const cards = document.querySelectorAll('.service-card, .product-card');
            
            cards.forEach(card => {
                card.addEventListener('mouseenter', this.cardMouseEnter.bind(this));
                card.addEventListener('mouseleave', this.cardMouseLeave.bind(this));
            });
        },

        cardMouseEnter: function(e) {
            const card = e.currentTarget;
            card.style.transform = 'translateY(-10px) scale(1.02)';
        },

        cardMouseLeave: function(e) {
            const card = e.currentTarget;
            card.style.transform = 'translateY(0) scale(1)';
        },

        setupButtonHovers: function() {
            const buttons = document.querySelectorAll('.buy-button, .cta-button, .social-button');
            
            buttons.forEach(button => {
                button.addEventListener('mouseenter', this.buttonMouseEnter.bind(this));
                button.addEventListener('mouseleave', this.buttonMouseLeave.bind(this));
            });
        },

        buttonMouseEnter: function(e) {
            const button = e.currentTarget;
            button.style.transform = 'translateY(-3px) scale(1.05)';
        },

        buttonMouseLeave: function(e) {
            const button = e.currentTarget;
            button.style.transform = 'translateY(0) scale(1)';
        },

        setupMobileTouch: function() {
            const cards = document.querySelectorAll('.service-card, .product-card');
            cards.forEach(card => {
                card.addEventListener('touchstart', this.cardTouchStart.bind(this), { passive: true });
                card.addEventListener('touchend', this.cardTouchEnd.bind(this), { passive: true });
            });
        },

        cardTouchStart: function(e) {
            const card = e.currentTarget;
            card.style.transform = 'scale(0.98)';
        },

        cardTouchEnd: function(e) {
            const card = e.currentTarget;
            setTimeout(() => {
                card.style.transform = 'scale(1)';
            }, 150);
        }
    };

    const MobileNavigation = {
        init: function() {
            this.createMobileToggle();
            this.setupMobileMenu();
            this.addMobileStyles();
        },

        createMobileToggle: function() {
            const nav = document.querySelector('nav');
            if (!nav) return;

            const toggle = document.createElement('button');
            toggle.className = 'mobile-toggle';
            toggle.innerHTML = '☰';
            toggle.setAttribute('aria-label', 'Toggle navigation');
            
            toggle.addEventListener('click', this.toggleMobileMenu.bind(this));
            
            const navMenu = document.querySelector('.nav-menu');
            if (navMenu) {
                nav.insertBefore(toggle, navMenu);
            }
        },

        addMobileStyles: function() {
            const style = document.createElement('style');
            style.textContent = `
                .mobile-toggle {
                    display: none;
                    background: linear-gradient(135deg, #8bc34a, #ffd700);
                    border: none;
                    color: #0d1f0d;
                    font-size: 1.5rem;
                    padding: 0.5rem;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    z-index: 1001;
                }
                
                .mobile-toggle:hover {
                    transform: scale(1.1);
                }
                
                @media (max-width: 768px) {
                    .mobile-toggle {
                        display: block;
                    }
                    
                    .nav-menu {
                        position: fixed;
                        top: 100%;
                        left: 0;
                        right: 0;
                        background: rgba(45, 75, 35, 0.98);
                        backdrop-filter: blur(20px);
                        flex-direction: column;
                        padding: 2rem;
                        transform: translateY(-100vh);
                        transition: transform 0.3s ease;
                        z-index: 999;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                    }
                    
                    .nav-menu.active {
                        transform: translateY(0);
                    }

                    .nav-menu a {
                        padding: 1rem 0;
                        border-bottom: 1px solid rgba(139, 195, 74, 0.2);
                    }

                    .nav-menu a:last-child {
                        border-bottom: none;
                    }
                }

                @media (max-width: 480px) {
                    .nav-menu {
                        padding: 1.5rem;
                    }
                }
            `;
            document.head.appendChild(style);
        },

        setupMobileMenu: function() {
            const navLinks = document.querySelectorAll('.nav-menu a');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    const navMenu = document.querySelector('.nav-menu');
                    if (navMenu) {
                        navMenu.classList.remove('active');
                    }
                });
            });

            document.addEventListener('click', (e) => {
                const navMenu = document.querySelector('.nav-menu');
                const toggle = document.querySelector('.mobile-toggle');
                
                if (navMenu && toggle && !navMenu.contains(e.target) && !toggle.contains(e.target)) {
                    navMenu.classList.remove('active');
                }
            });
        },

        toggleMobileMenu: function() {
            const navMenu = document.querySelector('.nav-menu');
            if (navMenu) {
                navMenu.classList.toggle('active');
            }
        }
    };

    const PerformanceOptimizer = {
        init: function() {
            this.setupScrollOptimization();
            this.setupResizeOptimization();
            this.setupVisibilityChange();
        },

        setupScrollOptimization: utils.throttle(function() {
            const scrollY = window.pageYOffset;
            const header = document.querySelector('header');
            
            if (header) {
                if (scrollY > 100) {
                    header.style.background = 'rgba(45, 75, 35, 0.98)';
                } else {
                    header.style.background = 'linear-gradient(135deg, rgba(45, 75, 35, 0.95) 0%, rgba(75, 105, 45, 0.95) 50%, rgba(35, 65, 25, 0.95) 100%)';
                }
            }
        }, 16),

        setupResizeOptimization: utils.debounce(function() {
            ParticleSystem.resize();
            HoverEffects.init();
        }, 250),

        setupVisibilityChange: function() {
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    ParticleSystem.pauseAnimation();
                } else {
                    ParticleSystem.resumeAnimation();
                }
            });
        }
    };

    const PurchaseSystem = {
        init: function() {
            const buyButtons = document.querySelectorAll('.buy-button');
                buyButtons.forEach(button => {
                    if (button.classList.contains('no-modal')) return;
                    button.addEventListener('click', this.handlePurchase.bind(this));
                });

        },

        handlePurchase: function(e) {
            e.preventDefault();
            const button = e.currentTarget;
            const productCard = button.closest('.product-card');
            
            if (productCard) {
                const productName = productCard.querySelector('h3')?.textContent || 'Producto';
                const productPrice = productCard.querySelector('.product-price')?.textContent || '$0.00';
                
                this.showPurchaseModal(productName, productPrice);
            }

            
        },

        showPurchaseModal: function(name, price) {
            const modal = document.createElement('div');
            modal.className = 'purchase-modal';

            const qrValue = 'https://imgur.com/a/LehO3sL';
            const qrURL = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrValue)}`;

            modal.innerHTML = `
                <div class="modal-backdrop"></div>
                <div class="modal-content">
                    <h3>Proceso de Compra</h3>
                    <p>Producto: <strong>${name}</strong></p>
                    <p>Precio: <strong>${price}</strong></p>
                    <div class="qr-section">
                        <p>Escanea este código QR para proceder con tu pago:</p>
                        <img src="${qrURL}" alt="QR de pago" class="qr-image">
                    </div>
                    <p>O contáctanos a través de:</p>
                    <div class="contact-options">
                        <a href="mailto:info@lafil.com" class="contact-btn">📧 Email</a>
                        <a href="tel:+593991387253" class="contact-btn">📱 Teléfono</a>
                    </div>
                    <button class="close-modal">Cerrar</button>
                </div>
            `;

            this.addModalStyles();

            document.body.appendChild(modal);
            document.body.classList.add('modal-open');

            const closeModal = () => {
                document.body.classList.remove('modal-open');
                if (document.body.contains(modal)) {
                    document.body.removeChild(modal);
                }
            };

            modal.querySelector('.close-modal')?.addEventListener('click', closeModal);
            modal.querySelector('.modal-backdrop')?.addEventListener('click', closeModal);
            modal.querySelector('.modal-content')?.addEventListener('click', e => e.stopPropagation());

            document.addEventListener('keydown', function escapeHandler(e) {
                if (e.key === 'Escape') {
                    closeModal();
                    document.removeEventListener('keydown', escapeHandler);
                }
            });
        },

        addModalStyles: function() {
            if (document.querySelector('#modal-styles')) return;
            
            const style = document.createElement('style');
            style.id = 'modal-styles';
            style.textContent = `
                .purchase-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: modalFadeIn 0.3s ease;
                }
                
                .modal-backdrop {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(10px);
                }
                
                .modal-content {
                    background: linear-gradient(145deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.1));
                    backdrop-filter: blur(25px);
                    border: 2px solid rgba(139, 195, 74, 0.5);
                    border-radius: 25px;
                    padding: 3rem;
                    max-width: 500px;
                    width: 90%;
                    max-height: 90vh;
                    overflow-y: auto;
                    position: relative;
                    z-index: 10001;
                    text-align: center;
                    color: #e8f5e8;
                    animation: modalSlideIn 0.3s ease;
                }
                
                .modal-content h3 {
                    color: #8bc34a;
                    font-family: 'Orbitron', monospace;
                    font-size: 2rem;
                    margin-bottom: 2rem;
                    text-shadow: 0 0 20px rgba(139, 195, 74, 0.5);
                }
                
                .modal-content p {
                    margin-bottom: 1rem;
                    font-size: 1.1rem;
                    line-height: 1.6;
                }
                
                .contact-options {
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                    margin: 2rem 0;
                    flex-wrap: wrap;
                }
                
                .contact-btn {
                    background: linear-gradient(135deg, #8bc34a, #ffd700);
                    color: #0d1f0d;
                    padding: 0.8rem 1.5rem;
                    border-radius: 20px;
                    text-decoration: none;
                    font-weight: 500;
                    transition: all 0.3s ease;
                    font-size: 0.9rem;
                }
                
                .contact-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(139, 195, 74, 0.4);
                }
                
                .close-modal {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(139, 195, 74, 0.3);
                    color: #e8f5e8;
                    padding: 0.8rem 2rem;
                    border-radius: 20px;
                    cursor: pointer;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                    margin-top: 1rem;
                }
                
                .close-modal:hover {
                    background: rgba(139, 195, 74, 0.2);
                    border-color: rgba(139, 195, 74, 0.6);
                }
                
                @keyframes modalFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes modalSlideIn {
                    from { 
                        opacity: 0; 
                        transform: translateY(-50px) scale(0.9); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translateY(0) scale(1); 
                    }
                }
                
                @media (max-width: 768px) {
                    .modal-content {
                        padding: 2rem;
                        margin: 1rem;
                        font-size: 0.9rem;
                    }
                    
                    .modal-content h3 {
                        font-size: 1.5rem;
                    }
                    
                    .contact-options {
                        flex-direction: column;
                        align-items: center;
                    }
                    
                    .contact-btn {
                        width: 200px;
                    }
                }

                @media (max-width: 480px) {
                    .modal-content {
                        padding: 1.5rem;
                        margin: 0.5rem;
                    }
                    
                    .qr-image {
                        width: 150px;
                        height: 150px;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    };

    const NotificationSystem = {
        show: function(message, type = 'info', duration = 3000) {
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.textContent = message;
            
            Object.assign(notification.style, {
                position: 'fixed',
                top: '20px',
                right: '20px',
                padding: '1rem 2rem',
                borderRadius: '10px',
                color: '#fff',
                fontWeight: '500',
                zIndex: '10000',
                transform: 'translateX(100%)',
                transition: 'transform 0.3s ease',
                maxWidth: utils.isMobile() ? '280px' : '300px',
                wordWrap: 'break-word',
                fontSize: utils.isMobile() ? '0.9rem' : '1rem'
            });

            switch(type) {
                case 'success':
                    notification.style.background = 'linear-gradient(135deg, #4caf50, #8bc34a)';
                    break;
                case 'error':
                    notification.style.background = 'linear-gradient(135deg, #f44336, #e91e63)';
                    break;
                case 'warning':
                    notification.style.background = 'linear-gradient(135deg, #ff9800, #ffc107)';
                    break;
                default:
                    notification.style.background = 'linear-gradient(135deg, #2196f3, #03a9f4)';
            }

            document.body.appendChild(notification);

            setTimeout(() => {
                notification.style.transform = 'translateX(0)';
            }, 100);

            setTimeout(() => {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }, duration);

            notification.addEventListener('click', () => {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            });
        }
    };

    function initializeApp() {
        const requiredElements = document.querySelector('header') && document.querySelector('main');
        if (!requiredElements) {
            return;
        }

        try {
            ParticleSystem.init();
            SmoothScroll.init();
            AnimationObserver.init();
            HoverEffects.init();
            MobileNavigation.init();
            PurchaseSystem.init();
            PerformanceOptimizer.init();

            window.addEventListener('scroll', PerformanceOptimizer.setupScrollOptimization, { passive: true });
            window.addEventListener('resize', PerformanceOptimizer.setupResizeOptimization, { passive: true });

            setTimeout(() => {
                NotificationSystem.show('¡Bienvenido! Explora nuestros productos.', 'success', 4000);
            }, 1500);

        } catch (error) {
            NotificationSystem.show('Hubo un error al cargar la página. Por favor, recarga.', 'error');
        }
    }

    function cleanup() {
        ParticleSystem.pauseAnimation();
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        initializeApp();
    }

    window.addEventListener('beforeunload', cleanup);

    window.addEventListener('error', function(e) {
        NotificationSystem.show('Se produjo un error inesperado.', 'error');
    });

    window.addEventListener('unhandledrejection', function(e) {
        e.preventDefault();
    });

})();
