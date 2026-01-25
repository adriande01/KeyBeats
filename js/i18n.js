// ============================================================================
// i18n.js
// Global internationalization setup for the entire application
// Uses i18next to automatically translate static and dynamic content
// ============================================================================

// Initialize i18next with HTTP backend and browser language detection
i18next
    .use(i18nextHttpBackend) // Loads translations from JSON files
    .use(i18nextBrowserLanguageDetector) // Detects user's browser language
    .init({
            fallbackLng: 'en', // Default language if detection fails
            debug: true, // Enable debug to see what's happening (set to false in production)
            backend: {
                // Path where translation files are located
                // Changed to match your structure: data/{{lng}}.json
                loadPath: './data/{{lng}}.json'
            },
            detection: {
                // Language detection order - IMPORTANTE: localStorage primero
                order: ['localStorage', 'querystring', 'cookie', 'navigator'],
                caches: ['localStorage', 'cookie'],
                lookupQuerystring: 'lng',
                lookupCookie: 'i18next',
                lookupLocalStorage: 'keybeats_language'
            },
            // Support only these languages (matching your files: al.json and en.json)
            supportedLngs: ['en', 'de'],
            // Don't load languages like 'es-ES', only 'en' or 'de'
            load: 'languageOnly',
            
        },
        translatePage 
    );

// ---------------------------------------------------------------------------
// Translates all elements that use data-i18n attributes
// Also handles attributes like placeholder, title, aria-label, etc.
// ---------------------------------------------------------------------------
function translatePage() {
    // Translate inner text content
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.dataset.i18n;
        const translation = i18next.t(key);

        // Only update if translation is different from key (i.e., translation exists)
        if (translation !== key) {
            element.textContent = translation;
        }
    });

    // Translate HTML attributes (placeholder, title, aria-label...)
    document.querySelectorAll('[data-i18n-attr]').forEach(element => {
        const key = element.dataset.i18n;
        const attribute = element.dataset.i18nAttr;
        const translation = i18next.t(key);

        // Only update if translation is different from key
        if (translation !== key) {
            element.setAttribute(attribute, translation);
        }
    });

    // Handle multiple attributes (data-i18n-attr2, etc.)
    document.querySelectorAll('[data-i18n-attr2]').forEach(element => {
        const key = element.dataset.i18n2;
        const attribute = element.dataset.i18nAttr2;
        if (key) {
            const translation = i18next.t(key);
            if (translation !== key) {
                element.setAttribute(attribute, translation);
            }
        }
    });

    // Update tooltips (data-tooltip attribute)
    document.querySelectorAll('[data-i18n][data-i18n-attr="data-tooltip"]').forEach(element => {
        const key = element.dataset.i18n;
        const translation = i18next.t(key);
        if (translation !== key) {
            element.setAttribute('data-tooltip', translation);
        }
    });

    // Update language selector if it exists
    const langSelect = document.getElementById('language-select');
    if (langSelect) {
        langSelect.value = i18next.language || 'en';
    }
}

// ---------------------------------------------------------------------------
// Change application language dynamically
// Can be called from buttons or menus
// ---------------------------------------------------------------------------
window.changeLanguage = function(lang) {
    i18next.changeLanguage(lang, () => {
        translatePage();
        // Store language preference - i18next ya lo hace automáticamente
        // pero lo dejamos por seguridad
        localStorage.setItem('keybeats_language', lang);
    });
};

// ---------------------------------------------------------------------------
// Expose translatePage globally
// Useful after AJAX or dynamic DOM updates
// ---------------------------------------------------------------------------
window.translatePage = translatePage;

// ---------------------------------------------------------------------------
// Initialize language selector dropdown
// Updates dynamically when user changes language
// ---------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    const langSelect = document.getElementById('language-select');
    if (langSelect) {
        // Set current language as default
        langSelect.value = i18next.language || 'en';

        // Listen for changes
        langSelect.addEventListener('change', (e) => {
            const selectedLang = e.target.value;
            changeLanguage(selectedLang);
        });
    }
});

// ---------------------------------------------------------------------------
// Helper function to translate dynamically created content
// Usage: i18nTranslate('key.to.translation')
// ---------------------------------------------------------------------------
window.i18nTranslate = function(key) {
    return i18next.t(key);
};