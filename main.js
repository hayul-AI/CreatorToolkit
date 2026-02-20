document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupGlobalDragAndDrop();
    setupMobileMenu();
    registerWebComponents();
});

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const theme = savedTheme || systemTheme;
    
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeToggleUI(theme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeToggleUI(newTheme);
}

function updateThemeToggleUI(theme) {
    const toggles = document.querySelectorAll('.theme-toggle');
    toggles.forEach(btn => {
        btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
        btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
    });
}

// Ensure theme toggle works globally
window.toggleTheme = toggleTheme;

function setupGlobalDragAndDrop() {
    const dropZones = document.querySelectorAll('.file-drop-zone');
    
    dropZones.forEach(zone => {
        const input = zone.querySelector('input[type="file"]');
        if (!input) return;

        // Click to open file dialog
        zone.addEventListener('click', (e) => {
            if(e.target !== input) {
                input.click();
            }
        });

        // Drag Visuals
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('dragover');
        });

        zone.addEventListener('dragleave', () => {
            zone.classList.remove('dragover');
        });

        // Drop Handler
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('dragover');
            
            if (e.dataTransfer.files.length) {
                input.files = e.dataTransfer.files;
                const event = new Event('change', { bubbles: true });
                input.dispatchEvent(event);
            }
        });
    });
}

function setupMobileMenu() {
    const btn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav-links');
    
    if(btn && nav) {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            nav.classList.toggle('active');
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (nav.classList.contains('active') && !nav.contains(e.target) && !btn.contains(e.target)) {
                nav.classList.remove('active');
            }
        });
    }
}

/**
 * WEB COMPONENTS
 */
function registerWebComponents() {
    // Shared Header
    class CreatorHeader extends HTMLElement {
        connectedCallback() {
            const activePath = window.location.pathname;
            this.innerHTML = `
            <header>
                <div class="container">
                    <nav>
                        <a href="/index.html" class="logo">
                            CreatorToolkit<span class="text-red">.</span>
                        </a>
                        <ul class="nav-links">
                            <li><a href="/index.html#tools" class="${activePath.includes('tools') ? 'text-red' : ''}">Tools</a></li>
                            <li><a href="/index.html#guides" class="${activePath.includes('guides') ? 'text-red' : ''}">Guides</a></li>
                            <li><a href="/about.html" class="${activePath === '/about.html' ? 'text-red' : ''}">About</a></li>
                            <li><a href="/contact.html" class="${activePath === '/contact.html' ? 'text-red' : ''}">Contact</a></li>
                        </ul>
                        <div class="flex items-center gap-4">
                            <button class="theme-toggle" onclick="toggleTheme()" aria-label="Toggle Theme">🌙</button>
                            <a href="/index.html#tools" class="btn btn-primary btn-sm">Start Creating</a>
                            <button class="mobile-menu-btn" aria-label="Menu">☰</button>
                        </div>
                    </nav>
                </div>
            </header>
            `;
            // Re-setup mobile menu after rendering
            setupMobileMenu();
            initTheme();
        }
    }

    // Shared Footer
    class CreatorFooter extends HTMLElement {
        connectedCallback() {
            this.innerHTML = `
            <footer>
                <div class="container">
                    <div class="footer-grid">
                        <div class="footer-col">
                            <a href="/index.html" class="logo" style="margin-bottom: 1.5rem;">
                                CreatorToolkit<span class="text-red">.</span>
                            </a>
                            <p class="text-muted">Empowering creators with free, high-quality tools for channel growth and SEO optimization.</p>
                        </div>
                        <div class="footer-col">
                            <h4>Tools</h4>
                            <ul>
                                <li><a href="/tools/thumbnail-maker.html">Thumbnail Maker</a></li>
                                <li><a href="/tools/title-generator.html">Title Generator</a></li>
                                <li><a href="/tools/keyword-generator.html">Keyword Tool</a></li>
                                <li><a href="/tools/image-converter.html">Image Converter</a></li>
                            </ul>
                        </div>
                        <div class="footer-col">
                            <h4>Resources</h4>
                            <ul>
                                <li><a href="/guides/youtube-seo-guide.html">SEO Guide</a></li>
                                <li><a href="/guides/thumbnail-ctr-guide.html">CTR Guide</a></li>
                                <li><a href="/guides/viral-titles-guide.html">Viral Titles</a></li>
                            </ul>
                        </div>
                        <div class="footer-col">
                            <h4>Legal</h4>
                            <ul>
                                <li><a href="/about.html">About Us</a></li>
                                <li><a href="/contact.html">Contact</a></li>
                                <li><a href="/privacy-policy.html">Privacy Policy</a></li>
                                <li><a href="/terms.html">Terms of Service</a></li>
                            </ul>
                        </div>
                    </div>
                    <div class="text-center" style="margin-top: 4rem; padding-top: 2rem; border-top: 1px solid var(--ct-border);">
                        <p class="text-muted" style="font-size: 0.875rem;">&copy; 2026 CreatorToolkit. All rights reserved.</p>
                    </div>
                </div>
            </footer>
            `;
        }
    }

    if (!customElements.get('creator-header')) {
        customElements.define('creator-header', CreatorHeader);
    }
    if (!customElements.get('creator-footer')) {
        customElements.define('creator-footer', CreatorFooter);
    }
}
