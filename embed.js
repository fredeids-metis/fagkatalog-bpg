/**
 * Fagkatalog Embed Loader
 *
 * Universell innbyggingskode som henter HTML, CSS og JS dynamisk fra repoet.
 * Oppdateringer i repoet reflekteres automatisk uten å endre innbyggingskoden.
 *
 * Bruk (standard - Bergen Private Gymnas):
 *   <div id="fagkatalog"></div>
 *   <script src="https://fredeids-metis.github.io/fagkatalog-bpg/embed.js"></script>
 *
 * Bruk med tema (f.eks. Metis VGS):
 *   <div id="fagkatalog" data-school="metis-vgs"></div>
 *   <script src="https://fredeids-metis.github.io/fagkatalog-bpg/embed.js"></script>
 *
 * Tilgjengelige skoler/temaer:
 *   - bergen-private-gymnas (default)
 *   - metis-vgs
 */
(function() {
    'use strict';

    const BASE_URL = 'https://fredeids-metis.github.io/fagkatalog-bpg';
    const CONTAINER_ID = 'fagkatalog';

    // Cache-busting med dato (oppdateres daglig)
    const today = new Date().toISOString().slice(0, 10);
    const version = today;

    // Finn container
    const container = document.getElementById(CONTAINER_ID);
    if (!container) {
        console.error('Fagkatalog: Container #fagkatalog ikke funnet');
        return;
    }

    // Hent skole fra data-attributt (default: bergen-private-gymnas)
    const school = container.dataset.school || 'bergen-private-gymnas';

    // Last CSS (base styles)
    function loadCSS() {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `${BASE_URL}/style.css?v=${version}`;
        document.head.appendChild(link);
    }

    // Last tema-CSS (school-specific colors)
    function loadThemeCSS() {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `${BASE_URL}/themes/${school}.css?v=${version}`;
        document.head.appendChild(link);
    }

    // Last HTML fra index.html og ekstraher innholdet
    async function loadHTML() {
        try {
            const response = await fetch(`${BASE_URL}/index.html?v=${version}`);
            if (!response.ok) throw new Error('Kunne ikke laste HTML');

            const html = await response.text();

            // Parse HTML og ekstraher innholdet fra #fagkatalog
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const source = doc.getElementById(CONTAINER_ID);

            if (source) {
                container.innerHTML = source.innerHTML;
            } else {
                throw new Error('Kunne ikke finne #fagkatalog i HTML');
            }
        } catch (error) {
            console.error('Fagkatalog: Feil ved lasting av HTML', error);
            container.innerHTML = '<p style="text-align:center;padding:2rem;color:#666;">Kunne ikke laste fagkatalog. Prøv å laste siden på nytt.</p>';
        }
    }

    // Last app.js
    function loadJS() {
        const script = document.createElement('script');
        script.src = `${BASE_URL}/app.js?v=${version}`;
        script.async = true;
        document.body.appendChild(script);
    }

    // Initialiser
    async function init() {
        loadCSS();
        loadThemeCSS();
        await loadHTML();
        loadJS();
    }

    // Kjør når DOM er klar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
