// ============================================
// MENSAJE DE SALUDO DINÁMICO POR HORA DEL DÍA
// Mundo del Anime - Todo en español
// ============================================

(function() {
    'use strict';
    
    const GREETINGS = {
        night: {
            icon: '🌙',
            text: '¡Buenas noches! Descubre historias que iluminan la madrugada',
            theme: 'night',
            hours: [0, 1, 2, 3, 4, 5]
        },
        morning: {
            icon: '☀️',
            text: '¡Buenos días! Bienvenido a Mundo del Anime',
            theme: 'morning',
            hours: [6, 7, 8, 9, 10, 11]
        },
        afternoon: {
            icon: '🌤️',
            text: '¡Buenas tardes! Explora nuestra cultura japonesa',
            theme: 'afternoon',
            hours: [12, 13, 14, 15, 16, 17]
        },
        evening: {
            icon: '🌆',
            text: '¡Buenas noches! Descubre nuevas historias de anime',
            theme: 'evening',
            hours: [18, 19, 20, 21, 22, 23]
        }
    };
    
    let greetingContainer = null;
    let greetingIcon = null;
    let greetingText = null;
    
    function initGreeting() {
        greetingContainer = document.getElementById('greeting-message');
        greetingIcon = document.getElementById('greeting-icon');
        greetingText = document.getElementById('greeting-text');
        
        if (!greetingContainer || !greetingIcon || !greetingText) {
            console.warn('Elementos de saludo no encontrados');
            return;
        }
        
        updateGreeting();
        setInterval(updateGreeting, 60000);
        
        const now = new Date();
        console.log('Saludo inicializado. Hora actual: ' + now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0'));
    }
    
    function getGreetingByHour(hour) {
        for (const period in GREETINGS) {
            if (GREETINGS[period].hours.includes(hour)) {
                return GREETINGS[period];
            }
        }
        return GREETINGS.morning;
    }
    
    function updateGreeting() {
        const now = new Date();
        const currentHour = now.getHours();
        const greeting = getGreetingByHour(currentHour);
        
        updateIcon(greeting.icon);
        greetingText.textContent = greeting.text;
        updateTheme(greeting.theme);
        greetingContainer.setAttribute('aria-label', 'Mensaje de bienvenida: ' + greeting.text);
    }
    
    function updateIcon(newIcon) {
        if (greetingIcon.textContent === newIcon) return;
        
        greetingIcon.style.opacity = '0';
        greetingIcon.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            greetingIcon.textContent = newIcon;
            greetingIcon.style.opacity = '1';
            greetingIcon.style.transform = 'scale(1)';
        }, 200);
    }
    
    function updateTheme(theme) {
        greetingContainer.classList.remove('morning', 'afternoon', 'evening', 'night');
        greetingContainer.classList.add(theme);
    }
    
    window.forceGreetingUpdate = function() {
        updateGreeting();
    };
    
    window.getCurrentGreeting = function() {
        const now = new Date();
        return getGreetingByHour(now.getHours());
    };
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGreeting);
    } else {
        initGreeting();
    }
})();