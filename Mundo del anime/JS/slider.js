// ============================================
// SLIDER DE IMÁGENES - MUNDO DEL ANIME
// Navegación automática (setInterval) + manual
// ============================================

(function() {
    'use strict';
    
    const CONFIG = {
        autoPlayInterval: 5000,
        transitionDuration: 600,
        pauseOnHover: true,
        pauseOnInteraction: true
    };
    
    let currentSlide = 0;
    let slides = [];
    let dots = [];
    let autoPlayTimer = null;
    let isPlaying = true;
    let isTransitioning = false;
    
    let sliderContainer = null;
    let sliderTrack = null;
    let btnPrev = null;
    let btnNext = null;
    let dotsContainer = null;
    let btnPlayPause = null;
    
    function initSlider() {
        sliderContainer = document.getElementById('anime-slider');
        if (!sliderContainer) return;
        
        sliderTrack = document.getElementById('slider-track');
        btnPrev = document.getElementById('slider-prev');
        btnNext = document.getElementById('slider-next');
        dotsContainer = document.getElementById('slider-dots');
        btnPlayPause = document.getElementById('slider-play-pause');
        
        slides = sliderTrack.querySelectorAll('.slide');
        if (slides.length === 0) return;
        
        createDots();
        goToSlide(0, false);
        startAutoPlay();
        setupEventListeners();
        
        announceToScreenReader('Galería de imágenes cargada. ' + slides.length + ' imágenes disponibles.');
    }
    
    function createDots() {
        if (!dotsContainer) return;
        
        dotsContainer.innerHTML = '';
        dots = [];
        
        slides.forEach((slide, index) => {
            const dot = document.createElement('button');
            dot.className = 'slider-dot' + (index === 0 ? ' active' : '');
            dot.setAttribute('role', 'tab');
            dot.setAttribute('aria-label', 'Ir a imagen ' + (index + 1) + ' de ' + slides.length);
            dot.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
            dot.setAttribute('aria-controls', 'slide-' + index);
            dot.setAttribute('tabindex', index === 0 ? '0' : '-1');
            dot.id = 'dot-' + index;
            
            dot.addEventListener('click', () => {
                if (isTransitioning) return;
                pauseAutoPlay();
                goToSlide(index);
                if (CONFIG.pauseOnInteraction) {
                    setTimeout(() => {
                        if (!isPlaying) startAutoPlay();
                    }, 10000);
                }
            });
            
            dot.addEventListener('keydown', (e) => {
                handleDotKeydown(e, index);
            });
            
            dotsContainer.appendChild(dot);
            dots.push(dot);
        });
    }
    
    function handleDotKeydown(e, index) {
        let newIndex = index;
        
        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                newIndex = index > 0 ? index - 1 : slides.length - 1;
                break;
            case 'ArrowRight':
                e.preventDefault();
                newIndex = index < slides.length - 1 ? index + 1 : 0;
                break;
            case 'Home':
                e.preventDefault();
                newIndex = 0;
                break;
            case 'End':
                e.preventDefault();
                newIndex = slides.length - 1;
                break;
            default:
                return;
        }
        
        dots[newIndex].focus();
        goToSlide(newIndex);
        pauseAutoPlay();
    }
    
    function goToSlide(index, animate = true) {
        if (isTransitioning && animate) return;
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;
        
        isTransitioning = true;
        
        slides[currentSlide].classList.remove('active');
        slides[currentSlide].style.display = 'none';
        
        if (dots[currentSlide]) {
            dots[currentSlide].classList.remove('active');
            dots[currentSlide].setAttribute('aria-selected', 'false');
            dots[currentSlide].setAttribute('tabindex', '-1');
        }
        
        currentSlide = index;
        slides[currentSlide].style.display = 'block';
        
        requestAnimationFrame(() => {
            slides[currentSlide].classList.add('active');
            
            if (dots[currentSlide]) {
                dots[currentSlide].classList.add('active');
                dots[currentSlide].setAttribute('aria-selected', 'true');
                dots[currentSlide].setAttribute('tabindex', '0');
            }
            
            const caption = slides[currentSlide].querySelector('.slide-caption h3');
            if (caption) {
                announceToScreenReader('Mostrando imagen ' + (currentSlide + 1) + ' de ' + slides.length + ': ' + caption.textContent);
            }
        });
        
        setTimeout(() => {
            isTransitioning = false;
        }, CONFIG.transitionDuration);
    }
    
    function goToPrev() {
        if (isTransitioning) return;
        pauseAutoPlay();
        goToSlide(currentSlide - 1);
    }
    
    function goToNext() {
        if (isTransitioning) return;
        goToSlide(currentSlide + 1);
    }
    
    function startAutoPlay() {
        if (autoPlayTimer) clearInterval(autoPlayTimer);
        isPlaying = true;
        updatePlayPauseButton();
        
        autoPlayTimer = setInterval(() => {
            if (!isTransitioning) {
                goToSlide(currentSlide + 1);
            }
        }, CONFIG.autoPlayInterval);
    }
    
    function pauseAutoPlay() {
        if (autoPlayTimer) {
            clearInterval(autoPlayTimer);
            autoPlayTimer = null;
        }
        isPlaying = false;
        updatePlayPauseButton();
    }
    
    function togglePlayPause() {
        if (isPlaying) {
            pauseAutoPlay();
        } else {
            startAutoPlay();
        }
    }
    
    function updatePlayPauseButton() {
        if (!btnPlayPause) return;
        
        const iconPause = btnPlayPause.querySelector('.icon-pause');
        const iconPlay = btnPlayPause.querySelector('.icon-play');
        
        if (isPlaying) {
            btnPlayPause.setAttribute('aria-label', 'Pausar reproducción automática');
            btnPlayPause.setAttribute('title', 'Pausar');
            if (iconPause) iconPause.style.display = 'block';
            if (iconPlay) iconPlay.style.display = 'none';
        } else {
            btnPlayPause.setAttribute('aria-label', 'Reanudar reproducción automática');
            btnPlayPause.setAttribute('title', 'Reanudar');
            if (iconPause) iconPause.style.display = 'none';
            if (iconPlay) iconPlay.style.display = 'block';
        }
    }
    
    function setupEventListeners() {
        if (btnPrev) btnPrev.addEventListener('click', goToPrev);
        if (btnNext) btnNext.addEventListener('click', goToNext);
        if (btnPlayPause) btnPlayPause.addEventListener('click', togglePlayPause);
        
        if (CONFIG.pauseOnHover && sliderContainer) {
            sliderContainer.addEventListener('mouseenter', () => {
                if (isPlaying) {
                    pauseAutoPlay();
                    sliderContainer.dataset.wasPlaying = 'true';
                }
            });
            
            sliderContainer.addEventListener('mouseleave', () => {
                if (sliderContainer.dataset.wasPlaying === 'true') {
                    startAutoPlay();
                    delete sliderContainer.dataset.wasPlaying;
                }
            });
        }
        
        if (sliderContainer) {
            sliderContainer.addEventListener('keydown', (e) => {
                switch(e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        goToPrev();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        goToNext();
                        break;
                }
            });
            
            sliderContainer.setAttribute('tabindex', '0');
        }
        
        let touchStartX = 0;
        let touchEndX = 0;
        
        if (sliderContainer) {
            sliderContainer.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });
            
            sliderContainer.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
            }, { passive: true });
        }
        
        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    goToNext();
                } else {
                    goToPrev();
                }
            }
        }
        
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                pauseAutoPlay();
            } else if (sliderContainer && sliderContainer.dataset.wasPlaying !== 'true') {
                startAutoPlay();
            }
        });
    }
    
    function announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'visually-hidden';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            if (document.body.contains(announcement)) {
                document.body.removeChild(announcement);
            }
        }, 1000);
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSlider);
    } else {
        initSlider();
    }
})();