document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupMobileMenu();
    registerWebComponents();
    injectBottomNav();
    detectHomePage();
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

function injectBottomNav() {
    if (document.querySelector('.bottom-nav')) return;
    
    const nav = document.createElement('div');
    nav.className = 'bottom-nav';
    nav.setAttribute('role', 'navigation');
    nav.innerHTML = `
        <div class="bottom-nav__inner">
            <button class="bottom-nav__btn bottom-nav__btn--ghost" id="btnBack" type="button">← Back</button>
            <a class="bottom-nav__btn bottom-nav__btn--primary" id="btnHome" href="/">Home</a>
        </div>
    `;
    document.body.appendChild(nav);

    // Logic for Back button
    const backBtn = document.getElementById('btnBack');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (window.history.length > 1) window.history.back();
            else window.location.href = "/";
        });
    }
}

function detectHomePage() {
    const path = window.location.pathname.replace(/\/+$/, "");
    if (path === "" || path === "/" || path.endsWith("/index.html")) {
        document.body.classList.add("is-home");
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
            <header class="site-header">
                <div class="nav-inner">
                    <div class="nav-left">
                        <a href="/index.html" class="logo">CreatorToolkit<span class="text-red">.</span></a>
                    </div>
                    
                    <nav class="nav-center">
                        <ul class="nav-links-list">
                            <li><a href="/index.html#tools" class="${activePath.includes('tools') && !activePath.includes('video-analyzer') && !activePath.includes('earnings') ? 'active' : ''}">Tools</a></li>
                            <li><a href="/tools/video-analyzer.html" class="${activePath.includes('video-analyzer') ? 'active' : ''}">Analyzer</a></li>
                            <li><a href="/tools/earnings-calculator.html" class="${activePath.includes('earnings') ? 'active' : ''}">Earnings</a></li>
                            <li><a href="/tools/thumbnail-copy-generator.html" class="${activePath.includes('thumbnail-copy') ? 'active' : ''}">Copy Gen</a></li>
                            <li><a href="/index.html#guides" class="${activePath.includes('guides') ? 'active' : ''}">Guides</a></li>
                            <li><a href="/about.html" class="${activePath === '/about.html' ? 'active' : ''}">About</a></li>
                        </ul>
                    </nav>

                    <div class="nav-right">
                        <button class="theme-toggle" onclick="toggleTheme()">
                            <span class="theme-icon">${icon}</span><span class="theme-label">${text}</span>
                        </button>
                        <a href="/index.html#tools" class="btn-primary start-btn">Start Creating</a>
                        <button class="mobile-menu-btn">☰</button>
                    </div>
                </div>
            </header>
            <style>
                .site-header { 
                    height: 72px; background: var(--bg-primary); border-bottom: 1px solid var(--border-color); 
                    position: sticky; top: 0; z-index: 1000; display: flex; align-items: center;
                }
                .nav-inner {
                    display: grid;
                    grid-template-columns: 1fr auto 1fr; /* 3구역 완벽 대칭 */
                    align-items: center;
                    height: 72px;
                    width: 100%;
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 20px;
                }
                
                .nav-left { justify-self: start; }
                .nav-center { justify-self: center; }
                .nav-right { 
                    justify-self: end; 
                    display: flex; 
                    align-items: center; 
                    gap: 12px; 
                }

                .logo { font-size: 1.4rem; font-weight: 800; color: var(--text-primary); text-decoration: none; }
                .text-red { color: var(--brand-red); }
                
                .nav-links-list { display: flex; align-items: center; gap: 28px; list-style: none; padding: 0; margin: 0; }
                .nav-links-list a { 
                    font-weight: 600; 
                    font-size: 15.5px; 
                    color: var(--text-primary); 
                    text-decoration: none; 
                    transition: color .15s ease; 
                }
                .nav-links-list a:hover, .nav-links-list a.active { color: var(--brand-red); }
                .nav-links-list a.active { font-weight: 700; }
                
                .theme-toggle { 
                    display: inline-flex; align-items: center; gap: 8px;
                    background: var(--bg-secondary); border: 1px solid var(--border-color); 
                    height: 40px; padding: 0 14px; border-radius: 999px; cursor: pointer; 
                    transition: all 0.2s; color: var(--text-primary); font-weight: 600; font-size: 13px;
                }
                .theme-toggle:hover { background: var(--border-color); }
                .theme-icon { font-size: 16px; }

                .start-btn { height: 40px; font-size: 13px; padding: 0 16px; border-radius: 12px; }

                .mobile-menu-btn { display: none; background: none; border: none; font-size: 1.5rem; color: var(--text-primary); cursor: pointer; }

                @media (max-width: 900px) {
                    .nav-center { display: none; }
                    .mobile-menu-btn { display: block; }
                    .nav-inner { grid-template-columns: auto 1fr; }
                    .nav-right { gap: 8px; }
                }

                @media (max-width: 480px) {
                    .theme-label, .start-btn { display: none; }
                    .theme-toggle { padding: 0 10px; width: 40px; justify-content: center; }
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
