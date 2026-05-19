// ============================================
// ANIMACIONES INTERACTIVAS - MUNDO DEL ANIME
// Selectores corregidos para tu estructura exacta
// ============================================

(function() {
    'use strict';

    // ===== CONFIGURACIÓN =====
    const CONFIG = {
        scrollThreshold: 0.15,
        counterDuration: 2000,
        typingSpeed: 40
    };

    // ===== UTILIDADES =====
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    function isInViewport(element, threshold) {
        const rect = element.getBoundingClientRect();
        const h = window.innerHeight || document.documentElement.clientHeight;
        return (rect.top <= h * (1 - threshold) && rect.bottom >= h * threshold);
    }

    // ============================================
    // 1. SCROLL REVEAL - Elementos aparecen al scroll
    // ============================================
    
    function initScrollReveal() {
        const selectors = [
            '.periodo', '.estudio-bloque', '.valor-bloque', '.tradicion-bloque',
            '.demografico-card', '.tematico-card', '.hito-card',
            '.impacto-seccion', '.estudio-contenedor',
            '.stat-card', '.tarjeta',
            '.introduccion-historia', '.introduccion-generos',
            '.introduccion-estudios', '.introduccion-cultura', '.introduccion-impacto',
            '.posibilidades', '.reflexion-section', '.otros-estudios',
            '.hitos-historia', '.valores-cultura', '.tradiciones-cultura',
            '.explorar', '.slider-section'
        ].join(', ');

        const elements = document.querySelectorAll(selectors);
        
        elements.forEach((el, i) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(50px)';
            el.style.transition = `all 0.7s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.08}s`;
            el.dataset.revealed = 'false';
        });

        function reveal() {
            elements.forEach(el => {
                if (el.dataset.revealed === 'true') return;
                if (isInViewport(el, 0.1)) {
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                    el.dataset.revealed = 'true';
                }
            });
        }

        window.addEventListener('scroll', debounce(reveal, 16));
        window.addEventListener('load', reveal);
        setTimeout(reveal, 100);
    }

    // ============================================
    // 2. TÍTULOS CON EFECTO DE ENTRADA
    // ============================================
    
    function initTitleAnimations() {
        const titles = document.querySelectorAll('.titulo, .seccion-titulo, .periodo-titulo, .estudio-nombre, .valor-titulo, .tradicion-titulo, .impacto-titulo-seccion, .reflexion-titulo, .slider-section-title');
        
        titles.forEach(title => {
            const text = title.textContent.trim();
            if (!text) return;
            
            title.innerHTML = '';
            title.style.overflow = 'hidden';
            
            const wrapper = document.createElement('span');
            wrapper.style.display = 'inline-block';
            
            text.split('').forEach((char, i) => {
                const span = document.createElement('span');
                span.textContent = char === ' ' ? '\u00A0' : char;
                span.style.display = 'inline-block';
                span.style.opacity = '0';
                span.style.transform = 'translateY(100%) rotateX(-80deg)';
                span.style.transition = `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.04}s`;
                span.style.transformOrigin = 'center bottom';
                wrapper.appendChild(span);
            });
            
            title.appendChild(wrapper);

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        wrapper.querySelectorAll('span').forEach(span => {
                            span.style.opacity = '1';
                            span.style.transform = 'translateY(0) rotateX(0)';
                        });
                        observer.unobserve(title);
                    }
                });
            }, { threshold: 0.3 });

            observer.observe(title);
        });
    }

    // ============================================
    // 3. CONTADORES ANIMADOS (stat-number)
    // ============================================
    
    function initCounters() {
        const counters = document.querySelectorAll('.stat-number');
        
        counters.forEach(counter => {
            const text = counter.textContent;
            const num = parseInt(text.replace(/\D/g, ''));
            const suffix = text.replace(/[0-9]/g, '');
            
            counter.textContent = '0' + suffix;
            let animated = false;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !animated) {
                        animated = true;
                        animateCounter(counter, num, suffix);
                        observer.unobserve(counter);
                    }
                });
            }, { threshold: 0.5 });

            observer.observe(counter);
        });
    }

    function animateCounter(el, target, suffix) {
        const start = performance.now();
        const dur = CONFIG.counterDuration;

        function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / dur, 1);
            const ease = 1 - Math.pow(1 - progress, 4); // ease-out quart
            const current = Math.floor(target * ease);
            el.textContent = current + suffix;
            if (progress < 1) requestAnimationFrame(update);
            else el.textContent = target + suffix;
        }
        requestAnimationFrame(update);
    }

    // ============================================
    // 4. EFECTO PARALLAX en imágenes de secciones
    // ============================================
    
    function initParallax() {
        const images = document.querySelectorAll('.periodo-imagen img, .estudio-imagen img, .tradicion-imagen-decorativa img, .impacto-imagen img, .demografico-imagen img, .tematico-imagen img');
        
        images.forEach(img => {
            img.parentElement.style.overflow = 'hidden';
            img.style.transition = 'transform 0.3s ease-out';
        });

        window.addEventListener('scroll', debounce(() => {
            images.forEach(img => {
                const rect = img.getBoundingClientRect();
                const h = window.innerHeight;
                if (rect.top < h && rect.bottom > 0) {
                    const scrolled = (h - rect.top) / (h + rect.height);
                    const yPos = (scrolled - 0.5) * 40;
                    img.style.transform = `scale(1.1) translateY(${yPos}px)`;
                }
            });
        }, 16));
    }

    // ============================================
    // 5. EFECTO 3D EN TARJETAS (solo desktop)
    // ============================================
    
    function initCardTilt() {
        if (window.matchMedia('(pointer: coarse)').matches) return;

        const cards = document.querySelectorAll('.demografico-card, .tematico-card, .hito-card, .stat-card, .tarjeta');
        
        cards.forEach(card => {
            card.style.transformStyle = 'preserve-3d';
            card.style.transition = 'transform 0.3s ease';
            
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -8;
                const rotateY = ((x - centerX) / centerX) * 8;
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
            });
        });
    }

    // ============================================
    // 6. BRILLO EN BOTONES
    // ============================================
    
    function initButtonShine() {
        const buttons = document.querySelectorAll('.boton, .hero-boton, .slide-link');
        
        buttons.forEach(btn => {
            btn.style.position = 'relative';
            btn.style.overflow = 'hidden';
            
            const shine = document.createElement('span');
            shine.style.cssText = `
                position: absolute;
                top: 0;
                left: -100%;
                width: 60%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
                transform: skewX(-20deg);
                transition: left 0.6s ease;
                pointer-events: none;
            `;
            btn.appendChild(shine);
            
            btn.addEventListener('mouseenter', () => {
                shine.style.left = '150%';
            });
            
            btn.addEventListener('mouseleave', () => {
                shine.style.transition = 'none';
                shine.style.left = '-100%';
                setTimeout(() => shine.style.transition = 'left 0.6s ease', 50);
            });
        });
    }

    // ============================================
    // 7. EFECTO ONDA AL CLICK en imágenes
    // ============================================
    
    function initRipple() {
        const containers = document.querySelectorAll('.periodo-imagen, .estudio-imagen, .tradicion-imagen-decorativa, .impacto-imagen, .demografico-imagen, .tematico-imagen');
        
        // Agregar keyframe
        if (!document.getElementById('anim-styles')) {
            const style = document.createElement('style');
            style.id = 'anim-styles';
            style.textContent = `
                @keyframes ripple-anim {
                    to { transform: scale(30); opacity: 0; }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes glow-pulse {
                    0%, 100% { box-shadow: 0 0 5px rgba(255,110,199,0.3); }
                    50% { box-shadow: 0 0 20px rgba(255,110,199,0.8), 0 0 40px rgba(110,186,255,0.4); }
                }
            `;
            document.head.appendChild(style);
        }

        containers.forEach(container => {
            container.style.position = 'relative';
            container.style.overflow = 'hidden';
            container.style.cursor = 'pointer';
            
            container.addEventListener('click', (e) => {
                const rect = container.getBoundingClientRect();
                const ripple = document.createElement('span');
                const size = Math.max(rect.width, rect.height);
                
                ripple.style.cssText = `
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(255, 110, 199, 0.3);
                    width: ${size}px;
                    height: ${size}px;
                    left: ${e.clientX - rect.left - size/2}px;
                    top: ${e.clientY - rect.top - size/2}px;
                    pointer-events: none;
                    animation: ripple-anim 0.8s ease-out forwards;
                `;
                
                container.appendChild(ripple);
                setTimeout(() => ripple.remove(), 800);
            });
        });
    }

    // ============================================
    // 8. PARTÍCULAS EN HERO (solo index)
    // ============================================
    
    function initParticles() {
        const hero = document.querySelector('.video-hero, .hero');
        if (!hero || !document.body.classList.contains('pagina-index')) return;

        const canvas = document.createElement('canvas');
        canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;';
        hero.insertBefore(canvas, hero.firstChild);

        const ctx = canvas.getContext('2d');
        let particles = [];
        let animId;

        function resize() {
            canvas.width = hero.offsetWidth;
            canvas.height = hero.offsetHeight;
        }
        resize();
        window.addEventListener('resize', debounce(resize, 100));

        // Crear partículas
        for (let i = 0; i < 30; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 1,
                vx: (Math.random() - 0.5) * 0.8,
                vy: (Math.random() - 0.5) * 0.8,
                alpha: Math.random() * 0.5 + 0.3,
                color: Math.random() > 0.5 ? '#ff6ec7' : '#6ebaff'
            });
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
                
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.alpha;
                ctx.fill();
            });

            // Líneas entre partículas cercanas
            particles.forEach((p1, i) => {
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = '#ff6ec7';
                        ctx.globalAlpha = (1 - dist/120) * 0.15;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            });
            
            ctx.globalAlpha = 1;
            animId = requestAnimationFrame(draw);
        }

        // Solo animar cuando el hero es visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !animId) draw();
                else if (!entry.isIntersecting && animId) {
                    cancelAnimationFrame(animId);
                    animId = null;
                }
            });
        });
        observer.observe(hero);
    }

    // ============================================
    // 9. EFECTO GLITCH en títulos al hover
    // ============================================
        
    function initGlitch() {
        const titles = document.querySelectorAll('.titulo');
        // EFECTO ELIMINADO - No se transforman letras a japonés
        // Ahora solo hace un brillo sutil al pasar el mouse
        
        titles.forEach(title => {
            title.addEventListener('mouseenter', () => {
                title.style.transition = 'all 0.3s ease';
                title.style.textShadow = '0 0 20px rgba(255,110,199,0.8), 0 0 40px rgba(110,186,255,0.6)';
            });
            
            title.addEventListener('mouseleave', () => {
                title.style.textShadow = 'none';
            });
        });
    }

    // ============================================
    // 10. LISTAS PROGRESIVAS (stagger)
    // ============================================
    
    function initStaggeredLists() {
        const containers = document.querySelectorAll('.caracteristicas ul, .ejemplos-lista, .obras-lista, .grid-tematicos, .tabla-hitos');
        
        containers.forEach(container => {
            const items = Array.from(container.children);
            items.forEach((item, i) => {
                item.style.opacity = '0';
                item.style.transform = 'translateX(-30px)';
                item.style.transition = `all 0.5s ease ${i * 0.08}s`;
                
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            item.style.opacity = '1';
                            item.style.transform = 'translateX(0)';
                            observer.unobserve(item);
                        }
                    });
                }, { threshold: 0.2 });
                
                observer.observe(item);
            });
        });
    }

    // ============================================
    // 11. EFECTO PULSO en portal y botón subir
    // ============================================
    
    function initPulse() {
        const elements = document.querySelectorAll('.portal, .boton-subir');
        elements.forEach(el => {
            el.style.animation = 'glow-pulse 2.5s ease-in-out infinite';
        });
    }

    // ============================================
    // 12. BARRA DE PROGRESO DE LECTURA
    // ============================================
    
    function initReadingProgress() {
        const bar = document.createElement('div');
        bar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: linear-gradient(90deg, #ff6ec7, #6ebaff);
            z-index: 10000;
            transition: width 0.1s ease;
        `;
        document.body.appendChild(bar);

        window.addEventListener('scroll', debounce(() => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            bar.style.width = (scrollTop / docHeight * 100) + '%';
        }, 16));
    }

    // ============================================
    // 13. IMÁGENES CON FADE IN
    // ============================================
    
    function initImageFade() {
        const images = document.querySelectorAll('img[loading="lazy"]');
        
        images.forEach(img => {
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            img.style.transform = 'scale(0.95)';
            
            const show = () => {
                img.style.opacity = '1';
                img.style.transform = 'scale(1)';
            };
            
            if (img.complete) show();
            else img.addEventListener('load', show);
        });
    }

    // ============================================
    // 14. EFECTO FLOATING en hero content
    // ============================================
    
    function initFloating() {
        const heroContent = document.querySelector('.hero-content-simple');
        if (!heroContent) return;
        
        let time = 0;
        function float() {
            time += 0.02;
            const y = Math.sin(time) * 8;
            heroContent.style.transform = `translateY(${y}px)`;
            requestAnimationFrame(float);
        }
        float();
    }

    // ============================================
    // INICIALIZAR TODO
    // ============================================
    
    function init() {
        initScrollReveal();
        initTitleAnimations();
        initCounters();
        initParallax();
        initCardTilt();
        initButtonShine();
        initRipple();
        initParticles();
        initGlitch();
        initStaggeredLists();
        initPulse();
        initReadingProgress();
        initImageFade();
        initFloating();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();