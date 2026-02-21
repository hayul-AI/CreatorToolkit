document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupMobileMenu();
    registerWebComponents();
});

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    updateThemeToggleUI(savedTheme);
}

function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    const newTheme = isDark ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    updateThemeToggleUI(newTheme);
}

function updateThemeToggleUI(theme) {
    const toggles = document.querySelectorAll('.theme-toggle');
    toggles.forEach(btn => {
        btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
    });
}

window.toggleTheme = toggleTheme;

function setupMobileMenu() {
    const btn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav-links');
    if(btn && nav) {
        btn.onclick = (e) => {
            e.stopPropagation();
            nav.classList.toggle('active');
        };
    }
}

function registerWebComponents() {
    class CreatorHeader extends HTMLElement {
        connectedCallback() {
            const activePath = window.location.pathname;
            this.innerHTML = `
            <header class="header-main">
                <div class="container header-container">
                    <nav class="nav-main">
                        <a href="/index.html" class="logo">CreatorToolkit<span class="text-red">.</span></a>
                        <ul class="nav-links">
                            <li><a href="/index.html#tools" class="${activePath.includes('tools') ? 'active' : ''}">Tools</a></li>
                            <li><a href="/index.html#guides" class="${activePath.includes('guides') ? 'active' : ''}">Guides</a></li>
                            <li><a href="/about.html" class="${activePath === '/about.html' ? 'active' : ''}">About</a></li>
                        </ul>
                        <div class="nav-actions">
                            <button class="theme-toggle" onclick="toggleTheme()">🌙</button>
                            <a href="/index.html#tools" class="btn-primary" style="height:38px;">Start Creating</a>
                            <button class="mobile-menu-btn">☰</button>
                        </div>
                    </nav>
                </div>
            </header>
            <style>
                .header-main { 
                    height: 72px; background: var(--bg-primary); border-bottom: 1px solid var(--border-color); 
                    position: sticky; top: 0; z-index: 1000; display: flex; align-items: center;
                }
                .nav-main { display: flex; align-items: center; justify-content: space-between; width: 100%; }
                .logo { font-size: 1.4rem; font-weight: 800; color: var(--text-primary); }
                .text-red { color: var(--brand-red); }
                .nav-links { display: flex; gap: 2rem; list-style: none; margin: 0; padding: 0; }
                .nav-links a { color: var(--text-secondary); font-weight: 600; font-size: 0.95rem; transition: 0.2s; }
                .nav-links a:hover, .nav-links a.active { color: var(--brand-red); }
                .nav-actions { display: flex; align-items: center; gap: 1rem; }
                .theme-toggle { 
                    background: var(--bg-secondary); border: none; width: 38px; height: 38px; 
                    border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center;
                    font-size: 1.1rem; color: var(--text-primary);
                }
                .mobile-menu-btn { display: none; background: none; border: none; font-size: 1.5rem; color: var(--text-primary); cursor: pointer; }
                @media (max-width: 768px) {
                    .nav-links { display: none; }
                    .mobile-menu-btn { display: block; }
                    .nav-links.active { 
                        display: flex; flex-direction: column; position: absolute; top: 72px; left: 0; width: 100%; 
                        background: var(--bg-primary); padding: 2rem; border-bottom: 1px solid var(--border-color); gap: 1.5rem;
                    }
                }
            </style>
            `;
        }
    }

    class CreatorFooter extends HTMLElement {
        connectedCallback() {
            this.innerHTML = `
            <footer class="footer-main">
                <div class="container">
                    <div class="footer-grid">
                        <div>
                            <a href="/index.html" class="logo">CreatorToolkit<span class="text-red">.</span></a>
                            <p style="margin-top:1rem; color:var(--text-secondary);">Master the algorithm with AI tools.</p>
                        </div>
                        <div class="footer-links">
                            <a href="/privacy-policy.html">Privacy</a>
                            <a href="/terms.html">Terms</a>
                        </div>
                    </div>
                </div>
            </footer>
            <style>
                .footer-main { padding: 4rem 0 2rem; background: var(--bg-secondary); border-top: 1px solid var(--border-color); margin-top: 5rem; }
                .footer-grid { display: flex; justify-content: space-between; align-items: flex-start; }
                .footer-links { display: flex; gap: 2rem; }
                .footer-links a { color: var(--text-secondary); font-size: 0.9rem; }
            </style>
            `;
        }
    }

    if (!customElements.get('creator-header')) customElements.define('creator-header', CreatorHeader);
    if (!customElements.get('creator-footer')) customElements.define('creator-footer', CreatorFooter);
}
