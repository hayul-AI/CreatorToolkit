document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupMobileMenu();
    registerWebComponents();
});

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    // Ensure UI is updated after web components might have rendered
    setTimeout(() => updateThemeToggleUI(savedTheme), 0);
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
        const icon = theme === 'dark' ? '☀️' : '🌙';
        const text = theme === 'dark' ? 'Light' : 'Dark';
        btn.innerHTML = `<span class="theme-icon">${icon}</span><span class="theme-label">${text}</span>`;
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
            const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
            const icon = currentTheme === 'dark' ? '☀️' : '🌙';
            const text = currentTheme === 'dark' ? 'Light' : 'Dark';

            this.innerHTML = `
            <header class="header-main">
                <div class="container header-container">
                    <nav class="nav-main">
                        <a href="/index.html" class="logo">CreatorToolkit<span class="text-red">.</span></a>
                        
                        <ul class="nav-links">
                            <li><a href="/index.html#tools" class="${activePath.includes('tools') ? 'active' : ''}">Tools</a></li>
                            <li><a href="/tools/video-analyzer.html" class="${activePath.includes('video-analyzer') ? 'active' : ''}">Analyzer</a></li>
                            <li><a href="/index.html#guides" class="${activePath.includes('guides') ? 'active' : ''}">Guides</a></li>
                            <li><a href="/about.html" class="${activePath === '/about.html' ? 'active' : ''}">About</a></li>
                        </ul>

                        <div class="nav-actions">
                            <button class="theme-toggle" onclick="toggleTheme()">
                                <span class="theme-icon">${icon}</span><span class="theme-label">${text}</span>
                            </button>
                            <a href="/index.html#tools" class="btn-primary start-btn">Start Creating</a>
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
                .header-container { width: 100%; }
                .nav-main { display: flex; align-items: center; justify-content: space-between; width: 100%; }
                .logo { font-size: 1.4rem; font-weight: 800; color: var(--text-primary); flex-shrink: 0; }
                .text-red { color: var(--brand-red); }
                
                .nav-links { display: flex; gap: 2rem; list-style: none; margin: 0; padding: 0; }
                .nav-links a { color: var(--text-secondary); font-weight: 600; font-size: 0.95rem; transition: 0.2s; }
                .nav-links a:hover, .nav-links a.active { color: var(--brand-red); }
                
                .nav-actions { display: flex; align-items: center; gap: 12px; margin-left: auto; }
                
                .theme-toggle { 
                    display: inline-flex; align-items: center; gap: 8px;
                    background: var(--bg-secondary); border: 1px solid var(--border-color); 
                    height: 40px; padding: 0 14px; border-radius: 999px; cursor: pointer; 
                    transition: all 0.2s; color: var(--text-primary); font-weight: 600; font-size: 13px;
                }
                .theme-toggle:hover { background: var(--border-color); box-shadow: var(--shadow-sm); }
                .theme-icon { font-size: 16px; line-height: 1; }

                .start-btn { height: 40px; font-size: 13px; }

                .mobile-menu-btn { display: none; background: none; border: none; font-size: 1.5rem; color: var(--text-primary); cursor: pointer; }

                @media (max-width: 1024px) {
                    .nav-links { gap: 1.25rem; }
                }

                @media (max-width: 768px) {
                    .nav-links { display: none; }
                    .mobile-menu-btn { display: block; order: 3; }
                    .nav-links.active { 
                        display: flex; flex-direction: column; position: absolute; top: 72px; left: 0; width: 100%; 
                        background: var(--bg-primary); padding: 2rem; border-bottom: 1px solid var(--border-color); gap: 1.5rem;
                    }
                }

                @media (max-width: 480px) {
                    .theme-label { display: none; }
                    .theme-toggle { padding: 0 10px; width: 40px; justify-content: center; }
                    .start-btn { display: none; }
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
