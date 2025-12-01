const API_BASE = 'https://fredeids-metis.github.io/school-data/api/2025-01';
const IMAGE_BASE = 'https://fredeids-metis.github.io/school-data/images/fag';

let allFag = [];
let currentFilter = 'all';

// Kategorisering basert på fagkode-prefix
function getCategory(fagkode) {
    if (!fagkode) return 'annet';
    const prefix = fagkode.substring(0, 3).toUpperCase();

    // Realfag
    if (['REA', 'INF'].includes(prefix)) return 'realfag';

    // Språk
    if (['SPR', 'ENG', 'FSP'].includes(prefix)) return 'spraak';

    // Samfunnsfag og okonomi
    if (['SAM', 'SAK', 'HIS', 'GEO', 'PSY', 'SOS', 'REL', 'MAR', 'ENT', 'MED', 'KOM', 'LED'].includes(prefix)) return 'samfunnsfag';

    return 'annet';
}

function getCategoryLabel(category) {
    const labels = {
        'realfag': 'Realfag',
        'spraak': 'Språk',
        'samfunnsfag': 'Samfunnsfag',
        'annet': 'Annet'
    };
    return labels[category] || category;
}

// Get initials for placeholder (matches studieplanlegger)
function getInitials(title) {
    const words = title.split(' ');
    if (words.length === 1) {
        return title.substring(0, 2).toUpperCase();
    }
    return words.slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

// Render accordion component (matches studieplanlegger)
function renderAccordion(id, title, content, count = null) {
    const countBadge = count !== null ? `<span class="accordion-count">(${count})</span>` : '';

    return `
        <div class="fag-accordion" data-accordion-id="${id}">
            <div class="accordion-header" role="button" tabindex="0" aria-expanded="false">
                <h3>${title} ${countBadge}</h3>
                <span class="accordion-icon" aria-hidden="true">▼</span>
            </div>
            <div class="accordion-content">
                ${content}
            </div>
        </div>
    `;
}

// Extract kompetansemal from beskrivelseHTML (matches studieplanlegger)
function extractKompetansemal(beskrivelseHTML) {
    if (!beskrivelseHTML) return { html: null, count: 0 };

    const match = beskrivelseHTML.match(/<h2[^>]*>Kompetansemål<\/h2>([\s\S]*?)(?=<h2|$)/i);
    if (!match) return { html: null, count: 0 };

    const content = match[1].trim();
    // Count list items
    const listItems = content.match(/<li>/gi);
    const count = listItems ? listItems.length : 0;

    return { html: content, count };
}

// Setup accordion event handlers
function setupAccordionHandlers(container) {
    container.querySelectorAll('.fag-accordion .accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const accordion = header.closest('.fag-accordion');
            const isOpen = accordion.classList.contains('open');

            if (isOpen) {
                accordion.classList.remove('open');
                header.setAttribute('aria-expanded', 'false');
            } else {
                accordion.classList.add('open');
                header.setAttribute('aria-expanded', 'true');
            }
        });

        // Keyboard support (Enter/Space)
        header.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                header.click();
            }
        });
    });
}

function createFagCard(fag) {
    const category = getCategory(fag.fagkode);
    const card = document.createElement('article');
    card.className = 'fag-card';
    card.dataset.category = category;
    card.dataset.id = fag.id;
    card.tabIndex = 0;

    const description = fag.omFaget || 'Ingen beskrivelse tilgjengelig.';
    const initials = getInitials(fag.title);
    const imageUrl = fag.bilde ? `${IMAGE_BASE}/${fag.bilde}` : null;

    // Image HTML: show real image if available, otherwise placeholder
    const imageHTML = imageUrl
        ? `<img src="${imageUrl}" alt="${fag.title}" loading="lazy" onerror="this.parentElement.innerHTML='<span>${initials}</span>'">`
        : `<span>${initials}</span>`;

    card.innerHTML = `
        <div class="fag-card-image">
            ${imageHTML}
        </div>
        <div class="fag-card-content">
            <h2>${fag.title}</h2>
            <span class="fagkode">${fag.fagkode || 'Ukjent'}</span>
            <p class="description">${description}</p>
            <span class="category-tag ${category}">${getCategoryLabel(category)}</span>
        </div>
    `;

    card.addEventListener('click', () => openModal(fag));
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openModal(fag);
        }
    });

    return card;
}

function openModal(fag) {
    const modal = document.getElementById('modal');
    const modalContent = modal.querySelector('.modal-content');
    const body = document.getElementById('modal-body');

    const imageUrl = fag.bilde ? `${IMAGE_BASE}/${fag.bilde}` : null;

    // Related badge (fordypning)
    const relatedBadge = fag.related && fag.related.length > 0
        ? `<span class="related-badge">Fordypning med: ${fag.related.join(', ')}</span>`
        : '';

    // Hero section with image (or fallback without)
    const heroHTML = imageUrl
        ? `<div class="modal-hero">
            <img src="${imageUrl}" alt="${fag.title}" class="modal-hero-image" />
            <div class="modal-hero-overlay"></div>
            <div class="modal-hero-content">
                <h2>${fag.title}</h2>
                <div class="modal-hero-badges">
                    <span class="fagkode-badge">${fag.fagkode}</span>
                    ${relatedBadge}
                </div>
            </div>
        </div>`
        : `<div class="modal-hero no-image">
            <div class="modal-hero-content">
                <h2>${fag.title}</h2>
                <div class="modal-hero-badges">
                    <span class="fagkode-badge">${fag.fagkode}</span>
                    ${relatedBadge}
                </div>
            </div>
        </div>`;

    // Accordion 1: Hvordan arbeider man i faget
    const hvordanHTML = fag.hvordanArbeiderMan
        ? `<p>${fag.hvordanArbeiderMan}</p>`
        : '<p class="placeholder-text">Innhold kommer snart</p>';

    // Accordion 2: Fagets relevans
    const relevansHTML = fag.fagetsRelevans
        ? `<p>${fag.fagetsRelevans}</p>`
        : '<p class="placeholder-text">Innhold kommer snart</p>';

    // Accordion 3: I dette faget lærer du å ... (kompetansemål)
    const kompetanse = extractKompetansemal(fag.beskrivelseHTML);
    const kompetanseHTML = kompetanse.html || '<p class="placeholder-text">Ingen kompetansemål tilgjengelig</p>';

    // Accordion 4: Kjerneelementer
    let kjerneHTML = '<p class="placeholder-text">Ingen kjerneelementer tilgjengelig</p>';
    const kjerneCount = fag.kjerneelementer?.length || 0;
    if (fag.kjerneelementer && fag.kjerneelementer.length > 0) {
        kjerneHTML = fag.kjerneelementer.map(k => `
            <div class="kjerneelement">
                <h4>${k.title}</h4>
                <p>${k.content}</p>
            </div>
        `).join('');
    }

    // Build modal body
    body.innerHTML = `
        ${heroHTML}

        <div class="modal-body">
            <div class="om-faget">
                <h2>Om faget</h2>
                <p>${fag.omFaget || 'Ingen beskrivelse tilgjengelig.'}</p>
            </div>

            <div class="fag-accordions">
                ${renderAccordion('hvordan', 'Hvordan arbeider man i faget?', hvordanHTML, null)}
                ${renderAccordion('relevans', 'Fagets relevans', relevansHTML, null)}
                ${renderAccordion('kompetanse', 'I dette faget lærer du å ...', kompetanseHTML, kompetanse.count > 0 ? kompetanse.count : null)}
                ${renderAccordion('kjerne', 'Kjerneelementer', kjerneHTML, kjerneCount > 0 ? kjerneCount : null)}
            </div>

            <a href="https://sokeresultat.udir.no/finn-lareplan.html?query=${fag.fagkode}&source=Laereplan&fltypefiltermulti=L%C3%A6replan&filtervalues=all"
               target="_blank"
               class="btn-lareplan">
                Se full lareplan pa udir.no →
            </a>
        </div>
    `;

    // Setup accordion handlers
    setupAccordionHandlers(body);

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Focus close button for accessibility
    modal.querySelector('.close-btn')?.focus();
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

function filterFag() {
    const searchTerm = document.getElementById('search').value.toLowerCase();

    const cards = document.querySelectorAll('.fag-card');
    cards.forEach(card => {
        const title = card.querySelector('h2').textContent.toLowerCase();
        const fagkode = card.querySelector('.fagkode').textContent.toLowerCase();
        const category = card.dataset.category;

        const matchesSearch = title.includes(searchTerm) || fagkode.includes(searchTerm);
        const matchesCategory = currentFilter === 'all' || category === currentFilter;

        card.style.display = matchesSearch && matchesCategory ? '' : 'none';
    });
}

function setActiveFilter(category) {
    currentFilter = category;

    // Update button states
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });

    filterFag();
}

async function loadFag() {
    const grid = document.getElementById('fag-grid');

    try {
        const response = await fetch(`${API_BASE}/curriculum/fag.json`);
        if (!response.ok) throw new Error('Kunne ikke laste fag');

        const data = await response.json();
        allFag = data.valgfrieProgramfag || [];

        grid.innerHTML = '';

        // Sorter alfabetisk
        allFag.sort((a, b) => a.title.localeCompare(b.title, 'nb'));

        allFag.forEach(fag => {
            grid.appendChild(createFagCard(fag));
        });

    } catch (error) {
        console.error('Feil ved lasting av fag:', error);
        grid.innerHTML = `<p class="loading">Kunne ikke laste fag. Prøv igjen senere.</p>`;
    }
}

// Event listeners
document.getElementById('search').addEventListener('input', filterFag);

// Filter button clicks
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        setActiveFilter(btn.dataset.category);
    });
});

// Modal close
document.querySelector('.close-btn').addEventListener('click', closeModal);
document.getElementById('modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

// Init
loadFag();

// ============================================
// CHATBOT WIDGET (Dummy)
// ============================================

const chatToggle = document.getElementById('chatToggle');
const chatWidget = document.getElementById('chatWidget');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');

// Dummy responses
const dummyResponses = [
    "Dette er en dummy-widget. Den ekte chatboten vil bli lastet fra et separat repo.",
    "Jeg kan dessverre ikke svare ennå - jeg er bare en placeholder!",
    "Når den ekte boten er klar, vil du kunne spørre om fag, fordypningskrav og mer.",
    "Takk for at du tester! Den virkelige fagvalg-assistenten kommer snart.",
    "Visste du at BPG har over 30 programfag å velge mellom? Den ekte boten kan fortelle deg mer!"
];

// Toggle chat widget
chatToggle?.addEventListener('click', () => {
    chatToggle.classList.toggle('open');
    chatWidget.classList.toggle('open');
    if (chatWidget.classList.contains('open')) {
        chatInput?.focus();
    }
});

// Handle chat form submit
chatForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (!message) return;

    // Add user message
    addChatMessage(message, true);
    chatInput.value = '';

    // Show typing indicator
    showTypingIndicator();

    // Simulate response delay
    setTimeout(() => {
        hideTypingIndicator();
        const response = dummyResponses[Math.floor(Math.random() * dummyResponses.length)];
        addChatMessage(response, false);
    }, 1000 + Math.random() * 1000);
});

function addChatMessage(content, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isUser ? 'user' : 'bot'}`;
    messageDiv.textContent = content;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message bot typing';
    typingDiv.id = 'chatTyping';
    typingDiv.innerHTML = `
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTypingIndicator() {
    const typing = document.getElementById('chatTyping');
    if (typing) typing.remove();
}
