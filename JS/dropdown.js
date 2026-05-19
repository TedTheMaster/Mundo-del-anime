// ============================================
// MENÚS DESPLEGABLES - MUNDO DEL ANIME
// Desktop: mouseenter/leave | Móvil: click/touch
// ============================================

(function() {
    'use strict';
    
    const CONFIG = {
        hoverDelay: 150,
        closeDelay: 200,
        mobileBreakpoint: 768
    };
    
    let hoverTimer = null;
    let closeTimer = null;
    let isMobile = false;
    
    function initDropdowns() {
        checkIsMobile();
        
        const dropdownBtns = document.querySelectorAll('.dropdown-btn');
        
        dropdownBtns.forEach(btn => {
            const parentLi = btn.closest('li');
            const dropdown = parentLi.querySelector('.dropdown-list');
            
            if (!dropdown) return;
            
            // ===== DESKTOP: Hover =====
            if (!isMobile) {
                parentLi.addEventListener('mouseenter', () => {
                    clearTimeout(closeTimer);
                    hoverTimer = setTimeout(() => {
                        openDropdown(btn, dropdown);
                    }, CONFIG.hoverDelay);
                });
                
                parentLi.addEventListener('mouseleave', () => {
                    clearTimeout(hoverTimer);
                    closeTimer = setTimeout(() => {
                        closeDropdown(btn, dropdown);
                    }, CONFIG.closeDelay);
                });
                
                // Click para accesibilidad (teclado)
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const isOpen = btn.getAttribute('aria-expanded') === 'true';
                    if (isOpen) {
                        closeDropdown(btn, dropdown);
                    } else {
                        closeAllDropdowns();
                        openDropdown(btn, dropdown);
                    }
                });
            }
            
            // ===== MÓVIL: Click/Touch =====
            else {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const isOpen = btn.getAttribute('aria-expanded') === 'true';
                    closeAllDropdowns();
                    
                    if (!isOpen) {
                        openDropdown(btn, dropdown);
                    }
                });
            }
            
            // ===== TECLADO =====
            btn.addEventListener('keydown', (e) => {
                handleBtnKeydown(e, btn, dropdown);
            });
            
            const links = dropdown.querySelectorAll('.dropdown-item');
            links.forEach((link, index) => {
                link.addEventListener('keydown', (e) => {
                    handleDropdownKeydown(e, links, index, btn);
                });
            });
        });
        
        // Cerrar al hacer click fuera
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-menu')) {
                closeAllDropdowns();
            }
        });
        
        // Cerrar con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeAllDropdowns();
                const firstBtn = document.querySelector('.dropdown-btn');
                if (firstBtn) firstBtn.focus();
            }
        });
        
        // Actualizar en resize
        window.addEventListener('resize', () => {
            const wasMobile = isMobile;
            checkIsMobile();
            if (wasMobile !== isMobile) {
                closeAllDropdowns();
            }
        });
    }
    
    function checkIsMobile() {
        isMobile = window.innerWidth <= CONFIG.mobileBreakpoint;
    }
    
    function openDropdown(btn, dropdown) {
        btn.setAttribute('aria-expanded', 'true');
        dropdown.classList.add('show');
    }
    
    function closeDropdown(btn, dropdown) {
        btn.setAttribute('aria-expanded', 'false');
        dropdown.classList.remove('show');
    }
    
    function closeAllDropdowns() {
        document.querySelectorAll('.dropdown-btn').forEach(btn => {
            const dropdown = btn.closest('li').querySelector('.dropdown-list');
            if (dropdown) closeDropdown(btn, dropdown);
        });
    }
    
    function handleBtnKeydown(e, btn, dropdown) {
        const links = dropdown.querySelectorAll('.dropdown-item');
        
        switch(e.key) {
            case 'ArrowDown':
            case ' ':
                e.preventDefault();
                openDropdown(btn, dropdown);
                if (links.length > 0) links[0].focus();
                break;
            case 'ArrowUp':
                e.preventDefault();
                openDropdown(btn, dropdown);
                if (links.length > 0) links[links.length - 1].focus();
                break;
        }
    }
    
    function handleDropdownKeydown(e, links, currentIndex, btn) {
        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                const next = currentIndex < links.length - 1 ? currentIndex + 1 : 0;
                links[next].focus();
                break;
            case 'ArrowUp':
                e.preventDefault();
                const prev = currentIndex > 0 ? currentIndex - 1 : links.length - 1;
                links[prev].focus();
                break;
            case 'Escape':
                e.preventDefault();
                closeDropdown(btn, btn.closest('li').querySelector('.dropdown-list'));
                btn.focus();
                break;
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDropdowns);
    } else {
        initDropdowns();
    }
})();