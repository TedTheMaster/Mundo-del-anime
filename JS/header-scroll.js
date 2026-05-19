// ============================================
// HEADER SCROLL HIDE/SHOW - PARA MÓVILES
// Archivo: header-scroll.js (VERSIÓN CORREGIDA)
// ============================================

(function() {
    'use strict';
    
    let lastScrollY = 0;
    let headerElement = document.querySelector('header');
    let isMobile = false;
    
    // Detectar si es móvil (ancho <= 768px) - SIN importar orientación
    function checkIsMobile() {
        // CELULAR: cualquier dispositivo con ancho <= 768px
        // Esto funciona tanto en vertical (390x844) como en horizontal (844x390)
        isMobile = window.innerWidth <= 1000;
        return isMobile;
    }
    
    // Mostrar header
    function showHeader() {
        if (headerElement) {
            headerElement.style.transform = 'translateY(0)';
            headerElement.style.opacity = '1';
        }
    }
    
    // Ocultar header
    function hideHeader() {
        if (headerElement) {
            headerElement.style.transform = 'translateY(-100%)';
            headerElement.style.opacity = '0';
        }
    }
    
    // Resetear header (mostrar siempre)
    function resetHeader() {
        if (headerElement) {
            headerElement.style.transform = 'translateY(0)';
            headerElement.style.opacity = '1';
        }
    }
    
    // Manejar el evento de scroll
    function handleScroll() {
        // Si no es móvil, mantener header visible
        if (!checkIsMobile()) {
            resetHeader();
            return;
        }
        
        let currentScrollY = window.scrollY;
        
        // Scroll hacia abajo Y pasó los 50px - OCULTAR header
        if (currentScrollY > lastScrollY && currentScrollY > 50) {
            hideHeader();
        } 
        // Scroll hacia arriba - MOSTRAR header
        else if (currentScrollY < lastScrollY) {
            showHeader();
        }
        // Si está en el tope de la página, mostrar header
        else if (currentScrollY <= 10) {
            showHeader();
        }
        
        lastScrollY = currentScrollY;
    }
    
    // Manejar cambio de orientación o resize
    function handleResize() {
        checkIsMobile();
        resetHeader();
        lastScrollY = window.scrollY;
    }
    
    // Inicializar
    function init() {
        if (!headerElement) {
            console.warn('Header no encontrado');
            return;
        }
        
        // Asegurar que el header tenga transición
        headerElement.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
        resetHeader();
        checkIsMobile();
        
        // Agregar event listeners
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleResize);
        
        // Para simular scroll en herramientas de desarrollo
        window.addEventListener('touchmove', function() {
            setTimeout(handleScroll, 10);
        });
    }
    
    // Ejecutar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();