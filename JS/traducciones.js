// ============================================
// SISTEMA DE TRADUCCIÓN - MUNDO DEL ANIME
// Versión 3.0 — CORREGIDO
//   FIX 1: jsonPath dinámico según ubicación del HTML
//   FIX 2: botón se actualiza ANTES del fetch (respuesta inmediata)
//   FIX 3: fallback robusto sin bucle infinito
// ============================================

(function () {
    'use strict';

    // ─── CONFIGURACIÓN ───────────────────────────────────────────────
    const CONFIG = {
        defaultLang: 'es',
        supportedLangs: ['es', 'en'],
        storageKey: 'anime_lang',

        // Detecta automáticamente la ruta a la carpeta lang/
        // Funciona si los HTML están en pages/ y lang/ está en la raíz,
        // o si HTML y lang/ están al mismo nivel.
        // Los HTML están en HTML/ y lang/ está en la raíz del proyecto
        jsonPath: './lang/'
    };

    let currentLang = CONFIG.defaultLang;
    let t = {};   // objeto de traducciones activo

    // ─── INICIALIZACIÓN ───────────────────────────────────────────────
    function init() {
        currentLang = getSavedLang();
        injectLangSelector();
        loadAndApply(currentLang);
    }

    // ─── CARGA DE JSON ────────────────────────────────────────────────
    // FIX 1 + FIX 2: el selector se actualiza ANTES del fetch
    async function loadAndApply(lang) {
        // Actualizar el botón inmediatamente (no esperar al fetch)
        updateSelector(lang);
        document.documentElement.lang = lang;

        try {
            const url = CONFIG.jsonPath + lang + '.json';
            const res = await fetch(url);
            if (!res.ok) throw new Error('HTTP ' + res.status + ' al cargar ' + url);
            t = await res.json();
            applyAll();
            announceChange(lang);
        } catch (err) {
            console.error('[i18n] Error:', err.message);
            // FIX 3: fallback sin bucle infinito
            if (lang !== CONFIG.defaultLang) {
                currentLang = CONFIG.defaultLang;
                saveLang(CONFIG.defaultLang);
                updateSelector(CONFIG.defaultLang);
                loadAndApply(CONFIG.defaultLang);
            }
        }
    }

    // ─── APLICAR TODAS LAS TRADUCCIONES ──────────────────────────────
    function applyAll() {
        applyDataI18n();
        applyPageSpecific();
        applyGreeting();
        applyMeta();
    }

    // ─── MOTOR PRINCIPAL: data-i18n ──────────────────────────────────
    function applyDataI18n() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const val = resolve(el.dataset.i18n);
            if (val) el.textContent = val;
        });
        document.querySelectorAll('[data-i18n-aria]').forEach(el => {
            const val = resolve(el.dataset.i18nAria);
            if (val) el.setAttribute('aria-label', val);
        });
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const val = resolve(el.dataset.i18nTitle);
            if (val) el.setAttribute('title', val);
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const val = resolve(el.dataset.i18nPlaceholder);
            if (val) el.setAttribute('placeholder', val);
        });
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const val = resolve(el.dataset.i18nHtml);
            if (val) el.innerHTML = val;
        });
    }

    // Resuelve una clave con notación de puntos: "nav.inicio" → t.nav.inicio
    function resolve(key) {
        if (!key) return null;
        return key.split('.').reduce((obj, k) => (obj && obj[k] !== undefined ? obj[k] : null), t);
    }

    // ─── TRADUCCIONES ESPECÍFICAS POR PÁGINA ─────────────────────────
    function applyPageSpecific() {
        const body = document.body;

        if (body.classList.contains('pagina-index'))     applyIndex();
        if (body.classList.contains('pagina-historia'))  applyHistoria();
        if (body.classList.contains('pagina-generos'))   applyGeneros();
        if (body.classList.contains('pagina-estudios'))  applyEstudios();
        if (body.classList.contains('pagina-cultura'))   applyCultura();
        if (body.classList.contains('pagina-impacto'))   applyImpacto();

        applyCommon();
    }

    // ── Elementos comunes ──────────────────────────────────────────────
    function applyCommon() {
        const p = (selector, key, attr) => setElement(selector, key, attr);

        p('.logo', 'logo');
        setAttr('.logo', 'aria-label', 'logo_aria');
        p('.skip-link', 'skip_link');
        setAttr('#hamburgerBtn', 'aria-label', 'hamburger_aria');
        setAttr('.boton-subir', 'aria-label', 'boton_subir_aria');
        setAttr('.boton-subir', 'title', 'boton_subir_title');

        applyNav();
        applyFooter();
    }

    function applyNav() {
        // Links directos del menú
        const navLinks = document.querySelectorAll('.nav-link, .menu a');
        const linkMap = {
            'index.html':   'nav.inicio',
            'historia.html':'nav.historia',
            'generos.html': 'nav.generos',
            'estudios.html':'nav.estudios',
            'cultura.html': 'nav.cultura',
            'impacto.html': 'nav.impacto'
        };
        navLinks.forEach(link => {
            const href = (link.getAttribute('href') || '').split('#')[0].split('/').pop();
            if (linkMap[href]) {
                link.textContent = resolve(linkMap[href]);
            }
        });

        // Botones dropdown — preservar la flecha
        const dropdownBtns = document.querySelectorAll('.dropdown-btn');
        const btnKeys = ['nav.historia', 'nav.generos', 'nav.estudios', 'nav.cultura', 'nav.impacto'];
        dropdownBtns.forEach((btn, i) => {
            if (!btnKeys[i]) return;
            const arrow = btn.querySelector('.dropdown-arrow');
            // Limpiar nodos de texto y re-añadir
            Array.from(btn.childNodes).forEach(n => {
                if (n.nodeType === Node.TEXT_NODE) btn.removeChild(n);
            });
            btn.insertBefore(document.createTextNode(resolve(btnKeys[i]) + ' '), btn.firstChild);
            if (arrow && !btn.contains(arrow)) btn.appendChild(arrow);
        });

        // Items del dropdown
        const dropdownItemMap = {
            'historia.html#periodo1-titulo': 'nav_dropdown.historia_origenes',
            'historia.html#periodo2-titulo': 'nav_dropdown.historia_posguerra',
            'historia.html#periodo3-titulo': 'nav_dropdown.historia_dorada',
            'historia.html#periodo4-titulo': 'nav_dropdown.historia_expansion',
            'historia.html#periodo5-titulo': 'nav_dropdown.historia_digital',
            'historia.html#periodo6-titulo': 'nav_dropdown.historia_streaming',
            'generos.html#demograficos-titulo': 'nav_dropdown.generos_demograficos',
            'generos.html#tematicos-titulo': 'nav_dropdown.generos_tematicos',
            'estudios.html#ghibli-titulo': 'nav_dropdown.estudios_ghibli',
            'estudios.html#kyoto-titulo': 'nav_dropdown.estudios_kyoto',
            'estudios.html#toei-titulo': 'nav_dropdown.estudios_toei',
            'cultura.html#valores-titulo': 'nav_dropdown.cultura_valores',
            'cultura.html#tradiciones-titulo': 'nav_dropdown.cultura_tradiciones',
            'cultura.html#gastronomia-titulo': 'nav_dropdown.cultura_gastronomia',
            'cultura.html#festivales-titulo': 'nav_dropdown.cultura_festivales',
            'impacto.html#videojuegos-titulo': 'nav_dropdown.impacto_videojuegos',
            'impacto.html#eventos-titulo': 'nav_dropdown.impacto_eventos',
            'impacto.html#streaming-titulo': 'nav_dropdown.impacto_streaming',
            'impacto.html#influencia-titulo': 'nav_dropdown.impacto_influencia'
        };

        document.querySelectorAll('.dropdown-item').forEach(item => {
            const href = item.getAttribute('href') || '';
            const relative = href.split('/').pop();
            if (dropdownItemMap[relative]) {
                item.textContent = resolve(dropdownItemMap[relative]);
            }
        });
    }

    function applyFooter() {
        setText('footer h3:nth-of-type(1)', 'footer.logo');

        const footerDesc = document.querySelector('footer > div > p:not(.copyright)');
        if (footerDesc) footerDesc.textContent = resolve('footer.desc') || '';

        const copyright = document.querySelector('.copyright');
        if (copyright) copyright.textContent = resolve('footer.copyright') || '';

        const footerNavs = document.querySelectorAll('footer nav');
        if (footerNavs[0]) {
            const h3 = footerNavs[0].querySelector('h3');
            if (h3) h3.textContent = resolve('footer.recursos_titulo') || '';
        }
        if (footerNavs[1]) {
            const h3 = footerNavs[1].querySelector('h3');
            if (h3) h3.textContent = resolve('footer.comunidad_titulo') || '';
        }
        if (footerNavs[2]) {
            const h3 = footerNavs[2].querySelector('h3');
            if (h3) h3.textContent = resolve('footer.acerca_titulo') || '';
        }

        // Mapeo por aria-label (ES + EN para sobrevivir al segundo cambio)
        const footerLinkMap = {
            'Biblioteca de anime':      ['footer.biblioteca', 'footer.biblioteca_aria'],
            'Catálogo completo':        ['footer.catalogo',   'footer.catalogo_aria'],
            'Academia de anime':        ['footer.academia',   'footer.academia_aria'],
            'Blog de noticias':         ['footer.blog',       'footer.blog_aria'],
            'Foros de discusión':       ['footer.foros',      'footer.foros_aria'],
            'Eventos de anime':         ['footer.eventos',    'footer.eventos_aria'],
            'Galería de Cosplay':       ['footer.cosplay',    'footer.cosplay_aria'],
            'Fan Art de la comunidad':  ['footer.fanart',     'footer.fanart_aria'],
            'Sobre nosotros':           ['footer.sobre',      'footer.sobre_aria'],
            'Contacto':                 ['footer.contacto',   'footer.contacto_aria'],
            'Política de privacidad':   ['footer.privacidad', 'footer.privacidad_aria'],
            'Términos de uso':          ['footer.terminos',   'footer.terminos_aria'],
            // EN → ES (para reconocer después del primer cambio)
            'Anime library':            ['footer.biblioteca', 'footer.biblioteca_aria'],
            'Full catalog':             ['footer.catalogo',   'footer.catalogo_aria'],
            'Anime academy':            ['footer.academia',   'footer.academia_aria'],
            'News blog':                ['footer.blog',       'footer.blog_aria'],
            'Discussion forums':        ['footer.foros',      'footer.foros_aria'],
            'Anime events':             ['footer.eventos',    'footer.eventos_aria'],
            'Cosplay gallery':          ['footer.cosplay',    'footer.cosplay_aria'],
            'Community fan art':        ['footer.fanart',     'footer.fanart_aria'],
            'About us':                 ['footer.sobre',      'footer.sobre_aria'],
            'Contact':                  ['footer.contacto',   'footer.contacto_aria'],
            'Privacy policy':           ['footer.privacidad', 'footer.privacidad_aria'],
            'Terms of use':             ['footer.terminos',   'footer.terminos_aria']
        };

        document.querySelectorAll('footer a').forEach(link => {
            const aria = link.getAttribute('aria-label');
            if (aria && footerLinkMap[aria]) {
                const [textKey, ariaKey] = footerLinkMap[aria];
                const newText = resolve(textKey);
                const newAria = resolve(ariaKey);
                if (newText) link.textContent = newText;
                if (newAria) link.setAttribute('aria-label', newAria);
            }
        });
    }

    // ── Página: INDEX ────────────────────────────────────────────────
    function applyIndex() {
        const idx = 'index';
        setText('.index-portal, .portal',    idx + '.portal');
        setText('.index-titulo, .titulo',    idx + '.titulo');
        setText('.index-descripcion',        idx + '.descripcion');
        setText('.index-frase',              idx + '.frase');
        setText('.hero-boton.index-boton, a.index-boton', idx + '.boton_explorar');
        setAttr('.hero-boton.index-boton, a.index-boton', 'aria-label', idx + '.boton_explorar_aria');

        const slides = document.querySelectorAll('.slide');
        const slideKeys = ['slide1', 'slide2', 'slide3', 'slide4', 'slide5'];
        slides.forEach((slide, i) => {
            const k = slideKeys[i];
            if (!k) return;
            const h3 = slide.querySelector('.slide-caption h3');
            const p  = slide.querySelector('.slide-caption p');
            const a  = slide.querySelector('.slide-caption .slide-link');
            if (h3) h3.textContent = resolve(idx + '.' + k + '_titulo') || '';
            if (p)  p.textContent  = resolve(idx + '.' + k + '_desc')   || '';
            if (a)  a.textContent  = resolve(idx + '.' + k + '_link')   || '';
            slide.setAttribute('aria-label', resolve(idx + '.' + k + '_aria') || '');
        });

        setText('.slider-section-title', idx + '.slider_title');

        const statLabels = document.querySelectorAll('.stat-label');
        const statKeys = ['stat1_label', 'stat2_label', 'stat3_label', 'stat4_label'];
        statLabels.forEach((el, i) => {
            if (statKeys[i]) el.textContent = resolve(idx + '.' + statKeys[i]) || '';
        });

        setText('#tarjeta-titulo', idx + '.tarjeta_titulo');
        const tarjetaP = document.querySelector('.tarjeta p');
        if (tarjetaP) tarjetaP.textContent = resolve(idx + '.tarjeta_desc') || '';
    }

    // ── Página: HISTORIA ─────────────────────────────────────────────
    function applyHistoria() {
        const h = 'historia';
        setText('.historia-portal, .portal', h + '.portal');
        setText('.historia-titulo, .titulo', h + '.titulo');
        setText('.historia-descripcion',     h + '.descripcion');
        setText('.historia-boton',           h + '.boton');

        const introPs = document.querySelectorAll('.introduccion-historia .texto-intro');
        if (introPs[0]) introPs[0].textContent = resolve(h + '.intro_p1') || '';
        if (introPs[1]) introPs[1].textContent = resolve(h + '.intro_p2') || '';

        for (let i = 1; i <= 6; i++) {
            const prefix = h + '.periodo' + i;
            setText('#periodo' + i + '-titulo', prefix + '_titulo');
            const tituloEl = document.querySelector('#periodo' + i + '-titulo');
            if (tituloEl) {
                const fecha = tituloEl.closest('.periodo-contenido')?.querySelector('.fecha');
                if (fecha) fecha.textContent = resolve(prefix + '_fecha') || '';
                const art = document.querySelector('[aria-labelledby="periodo' + i + '-titulo"]');
                if (art) {
                    const p = art.querySelector('.periodo-contenido > p');
                    if (p) p.textContent = resolve(prefix + '_desc') || '';
                }
            }
        }

        setText('.hitos-historia .seccion-titulo', h + '.hitos_titulo');
        setText('.hitos-historia .seccion-subtitulo', h + '.hitos_sub');

        const hitosDesc  = document.querySelectorAll('.hito-desc');
        const hitosFecha = document.querySelectorAll('.hito-fecha');
        for (let i = 0; i < 8; i++) {
            if (hitosDesc[i])  hitosDesc[i].textContent  = resolve(h + '.hito' + (i+1) + '_desc')  || '';
            if (hitosFecha[i]) hitosFecha[i].textContent = resolve(h + '.hito' + (i+1) + '_fecha') || '';
        }
    }

    // ── Página: GÉNEROS ──────────────────────────────────────────────
    function applyGeneros() {
        const g = 'generos';
        setText('.generos-portal, .portal', g + '.portal');
        setText('.generos-titulo, .titulo', g + '.titulo');
        setText('.generos-descripcion',     g + '.descripcion');
        setText('.generos-boton',           g + '.boton');

        const introPs = document.querySelectorAll('.introduccion-generos .texto-intro');
        if (introPs[0]) introPs[0].textContent = resolve(g + '.intro_p1') || '';
        if (introPs[1]) introPs[1].textContent = resolve(g + '.intro_p2') || '';

        setText('#demograficos-titulo',          g + '.demograficos_titulo');
        setText('.demograficos .seccion-subtitulo', g + '.demograficos_sub');

        const demoMap = [
            ['shonen', '#shonen-titulo'],
            ['shojo',  '#shojo-titulo'],
            ['seinen', '#seinen-titulo'],
            ['josei',  '#josei-titulo']
        ];
        demoMap.forEach(([key, sel]) => {
            setText(sel, g + '.' + key + '_titulo');
            const card = document.querySelector(sel)?.closest('.demografico-card');
            if (card) {
                const desc = card.querySelector('.genero-descripcion, .demografico-descripcion, p');
                if (desc) desc.textContent = resolve(g + '.' + key + '_desc') || '';
            }
        });

        setText('#tematicos-titulo',           g + '.tematicos_titulo');
        setText('.tematicos .seccion-subtitulo', g + '.tematicos_sub');

        const temaMap = [
            ['mecha',    '#mecha-titulo'],
            ['isekai',   '#isekai-titulo'],
            ['horror',   '#horror-titulo'],
            ['romance',  '#romance-titulo'],
            ['deportes', '#deportes-titulo'],
            ['fantasia', '#fantasia-titulo'],
            ['musical',  '#musical-titulo'],
            ['slice',    '#slice-titulo'],
            ['comedia',  '#comedia-titulo']
        ];
        temaMap.forEach(([key, sel]) => {
            setText(sel, g + '.' + key + '_titulo');
            const card = document.querySelector(sel)?.closest('.tematico-card');
            if (card) {
                const desc = card.querySelector('p');
                if (desc) desc.textContent = resolve(g + '.' + key + '_desc') || '';
            }
        });

        setText('#posibilidades-titulo', g + '.posibilidades_titulo');
        setText('.texto-posibilidades',  g + '.posibilidades_desc');
    }

    // ── Página: ESTUDIOS ─────────────────────────────────────────────
    function applyEstudios() {
        const e = 'estudios';
        setText('.estudios-portal, .portal', e + '.portal');
        setText('.estudios-titulo, .titulo', e + '.titulo');
        setText('.estudios-descripcion',     e + '.descripcion');
        setText('.estudios-boton',           e + '.boton');

        const introPs = document.querySelectorAll('.introduccion-estudios .texto-intro');
        if (introPs[0]) introPs[0].textContent = resolve(e + '.intro_p1') || '';
        if (introPs[1]) introPs[1].textContent = resolve(e + '.intro_p2') || '';

        setText('#ghibli-titulo', e + '.ghibli_titulo');
        setEstudioData('#ghibli-titulo', e + '.ghibli_datos', e + '.ghibli_desc');

        setText('#kyoto-titulo', e + '.kyoto_titulo');
        setEstudioData('#kyoto-titulo', e + '.kyoto_datos', e + '.kyoto_desc');

        setText('#toei-titulo', e + '.toei_titulo');
        setEstudioData('#toei-titulo', e + '.toei_datos', e + '.toei_desc');

        document.querySelectorAll('.obras-titulo').forEach(el => {
            el.textContent = resolve(e + '.obras_titulo') || '';
        });

        setText('#otros-titulo', e + '.otros_titulo');
        setText('.otros-estudios .seccion-subtitulo', e + '.otros_sub');
        const otrosP = document.querySelector('.otros-estudios-texto p');
        if (otrosP) otrosP.textContent = resolve(e + '.otros_desc') || '';
    }

    function setEstudioData(tituloSel, datosKey, descKey) {
        const titulo = document.querySelector(tituloSel);
        if (!titulo) return;
        const contenido = titulo.closest('.estudio-contenido');
        if (!contenido) return;
        const datos = contenido.querySelector('.estudio-datos');
        const desc  = contenido.querySelector('.estudio-descripcion');
        if (datos) datos.textContent = resolve(datosKey) || '';
        if (desc)  desc.textContent  = resolve(descKey)  || '';
    }

    // ── Página: CULTURA ──────────────────────────────────────────────
    function applyCultura() {
        const c = 'cultura';
        setText('.cultura-portal, .portal', c + '.portal');
        setText('.cultura-titulo, .titulo', c + '.titulo');
        setText('.cultura-descripcion',     c + '.descripcion');
        setText('.cultura-boton',           c + '.boton');

        const introPs = document.querySelectorAll('.introduccion-cultura .texto-intro');
        if (introPs[0]) introPs[0].textContent = resolve(c + '.intro_p1') || '';
        if (introPs[1]) introPs[1].textContent = resolve(c + '.intro_p2') || '';

        setText('.valores-cultura .seccion-titulo',    c + '.valores_titulo_seccion');
        setText('.valores-cultura .seccion-subtitulo', c + '.valores_sub');

        const valorMap = [
            ['respeto',        '#respeto-titulo'],
            ['armonia',        '#armonia-titulo'],
            ['perseverancia',  '#perseverancia-titulo'],
            ['honor',          '#honor-titulo']
        ];
        valorMap.forEach(([key, sel]) => {
            const tituloEl = document.querySelector(sel);
            if (tituloEl) {
                const japones = tituloEl.querySelector('.valor-japones');
                const textNode = Array.from(tituloEl.childNodes)
                    .find(n => n.nodeType === Node.TEXT_NODE);
                if (textNode) textNode.textContent = resolve(c + '.' + key + '_titulo') + ' ';
                if (japones) japones.textContent = resolve(c + '.' + key + '_japones') || '';
            }
            const card = document.querySelector(sel)?.closest('.valor-bloque, .valor-card');
            if (card) {
                const desc = card.querySelector('.valor-descripcion');
                if (desc) desc.textContent = resolve(c + '.' + key + '_desc') || '';
            }
        });

        setText('.tradiciones-cultura .seccion-titulo',    c + '.tradiciones_titulo_seccion');
        setText('.tradiciones-cultura .seccion-subtitulo', c + '.tradiciones_sub');

        const tradMap = [
            ['gastronomia', '#gastronomia-titulo'],
            ['festivales',  '#festivales-titulo'],
            ['arquitectura','#arquitectura-titulo'],
            ['ceremonias',  '#ceremonias-titulo']
        ];
        tradMap.forEach(([key, sel]) => {
            const tituloEl = document.querySelector(sel);
            if (!tituloEl) return;

            if (key === 'festivales') {
                const japones = tituloEl.querySelector('.tradicion-japones');
                const textNode = Array.from(tituloEl.childNodes)
                    .find(n => n.nodeType === Node.TEXT_NODE);
                if (textNode) textNode.textContent = resolve(c + '.' + key + '_titulo') + ' ';
                if (japones) japones.textContent = '(' + (resolve(c + '.' + key + '_japones') || '') + ')';
            } else {
                tituloEl.textContent = resolve(c + '.' + key + '_titulo') || '';
            }

            const bloque = tituloEl.closest('.tradicion-bloque');
            if (bloque) {
                const desc = bloque.querySelector('.tradicion-descripcion');
                if (desc) desc.textContent = resolve(c + '.' + key + '_desc') || '';
            }
        });
    }

    // ── Página: IMPACTO ──────────────────────────────────────────────
    function applyImpacto() {
        const imp = 'impacto';
        setText('.impacto-portal, .portal',      imp + '.portal');
        setText('.impacto-titulo-hero, .titulo', imp + '.titulo');
        setText('.impacto-descripcion-hero',     imp + '.descripcion');
        setText('.impacto-boton',                imp + '.boton');

        const introPs = document.querySelectorAll('.introduccion-impacto .texto-intro');
        if (introPs[0]) introPs[0].textContent = resolve(imp + '.intro_p1') || '';
        if (introPs[1]) introPs[1].textContent = resolve(imp + '.intro_p2') || '';

        const seccionMap = [
            ['videojuegos', '#videojuegos-titulo'],
            ['eventos',     '#eventos-titulo'],
            ['streaming',   '#streaming-titulo'],
            ['influencia',  '#influencia-titulo']
        ];
        seccionMap.forEach(([key, tSel]) => {
            setText(tSel, imp + '.' + key + '_titulo');
            const tituloEl = document.querySelector(tSel);
            if (tituloEl) {
                const contenido = tituloEl.closest('article, section');
                if (contenido) {
                    const desc = contenido.querySelector('.impacto-descripcion-seccion');
                    if (desc) desc.textContent = resolve(imp + '.' + key + '_desc') || '';
                }
            }
        });

        setText('#reflexion-titulo', imp + '.reflexion_titulo');
        const reflexionP = document.querySelector('.reflexion-card p');
        if (reflexionP) reflexionP.textContent = resolve(imp + '.reflexion_texto') || '';
    }

    // ─── SALUDO DINÁMICO ──────────────────────────────────────────────
    function applyGreeting() {
        const textEl = document.getElementById('greeting-text');
        if (!textEl) return;

        const hour = new Date().getHours();
        let period;
        if (hour >= 0 && hour < 6)   period = 'night';
        else if (hour < 12)          period = 'morning';
        else if (hour < 18)          period = 'afternoon';
        else                         period = 'evening';

        const msg = resolve('greeting.' + period);
        if (msg) textEl.textContent = msg;
    }

    // ─── META ─────────────────────────────────────────────────────────
    function applyMeta() {
        const body = document.body;
        let pageKey = null;
        if (body.classList.contains('pagina-index'))    pageKey = 'index';
        if (body.classList.contains('pagina-historia')) pageKey = 'historia';
        if (body.classList.contains('pagina-generos'))  pageKey = 'generos';
        if (body.classList.contains('pagina-estudios')) pageKey = 'estudios';
        if (body.classList.contains('pagina-cultura'))  pageKey = 'cultura';
        if (body.classList.contains('pagina-impacto'))  pageKey = 'impacto';
        if (!pageKey) return;

        const title = resolve(pageKey + '.page_title');
        const desc  = resolve(pageKey + '.meta_desc');
        if (title) document.title = title;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && desc) metaDesc.setAttribute('content', desc);
    }

    // ─── SELECTOR DE IDIOMA ───────────────────────────────────────────
    function injectLangSelector() {
        if (document.querySelector('.lang-selector-i18n')) return;

        const header = document.querySelector('header');
        if (!header) return;

        const selector = document.createElement('div');
        selector.className = 'lang-selector-i18n';
        selector.setAttribute('role', 'group');
        selector.setAttribute('aria-label', 'Selector de idioma / Language selector');

        CONFIG.supportedLangs.forEach((lang, idx) => {
            if (idx > 0) {
                const sep = document.createElement('span');
                sep.className = 'lang-sep';
                sep.setAttribute('aria-hidden', 'true');
                sep.textContent = '|';
                selector.appendChild(sep);
            }

            const btn = document.createElement('button');
            btn.className = 'lang-btn-i18n';
            btn.dataset.lang = lang;
            btn.textContent = lang.toUpperCase();
            btn.setAttribute('aria-pressed', lang === currentLang ? 'true' : 'false');
            btn.setAttribute('aria-label', lang === 'es' ? 'Cambiar a Español' : 'Switch to English');
            btn.addEventListener('click', () => changeLanguage(lang));
            selector.appendChild(btn);
        });

        header.appendChild(selector);
    }

    // FIX 2: actualiza botones visualmente (se llama ANTES del fetch)
    function updateSelector(lang) {
        document.querySelectorAll('.lang-btn-i18n').forEach(btn => {
            const isActive = btn.dataset.lang === lang;
            btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
            btn.classList.toggle('active', isActive);
        });
    }

    // ─── CAMBIAR IDIOMA ───────────────────────────────────────────────
    function changeLanguage(lang) {
        if (!CONFIG.supportedLangs.includes(lang)) return;
        if (lang === currentLang) return;
        currentLang = lang;
        saveLang(lang);
        loadAndApply(lang);
    }

    // ─── ALMACENAMIENTO ───────────────────────────────────────────────
    function getSavedLang() {
        try {
            const saved = localStorage.getItem(CONFIG.storageKey);
            return CONFIG.supportedLangs.includes(saved) ? saved : CONFIG.defaultLang;
        } catch (e) {
            return CONFIG.defaultLang;
        }
    }

    function saveLang(lang) {
        try { localStorage.setItem(CONFIG.storageKey, lang); } catch (e) {}
    }

    // ─── ANUNCIO ACCESIBILIDAD ────────────────────────────────────────
    function announceChange(lang) {
        const msg = lang === 'es' ? 'Idioma cambiado a Español' : 'Language changed to English';
        const live = document.createElement('div');
        live.setAttribute('role', 'status');
        live.setAttribute('aria-live', 'polite');
        live.setAttribute('aria-atomic', 'true');
        live.className = 'visually-hidden';
        live.textContent = msg;
        document.body.appendChild(live);
        setTimeout(() => { if (live.parentNode) live.parentNode.removeChild(live); }, 1500);
    }

    // ─── HELPERS ─────────────────────────────────────────────────────
    function setText(selector, key) {
        const el = document.querySelector(selector);
        if (el) {
            const val = resolve(key);
            if (val) el.textContent = val;
        }
    }

    function setAttr(selector, attr, key) {
        const el = document.querySelector(selector);
        if (el) {
            const val = resolve(key);
            if (val) el.setAttribute(attr, val);
        }
    }

    function setElement(selector, key) {
        setText(selector, key);
    }

    // ─── API PÚBLICA ─────────────────────────────────────────────────
    window.i18n = {
        change: changeLanguage,
        t: resolve,
        current: () => currentLang
    };
    window.changeLanguage = changeLanguage;

    // ─── ARRANQUE ────────────────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
