document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupGlobalDragAndDrop();
    setupMobileMenu();
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
    /* ... existing code ... */
    const dropZones = document.querySelectorAll('.file-drop-zone');
    
    dropZones.forEach(zone => {
        const input = zone.querySelector('input[type="file"]');
        
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
            zone.style.borderColor = 'var(--ct-red)';
            zone.style.backgroundColor = 'var(--ct-red-light)';
        });

        zone.addEventListener('dragleave', () => {
            zone.classList.remove('dragover');
            zone.style.borderColor = '';
            zone.style.backgroundColor = '';
        });

        // Drop Handler
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('dragover');
            zone.style.borderColor = '';
            zone.style.backgroundColor = '';
            
            if (e.dataTransfer.files.length && input) {
                input.files = e.dataTransfer.files;
                // Trigger change event manually
                const event = new Event('change');
                input.dispatchEvent(event);
            }
        });
    });
}

function setupMobileMenu() {
    /* ... existing code ... */
    const btn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav-links');
    
    if(btn && nav) {
        btn.addEventListener('click', (e) => {
            e.stopImmediatePropagation(); 
            
            const isHidden = getComputedStyle(nav).display === 'none';
            
            if(isHidden) {
                nav.style.display = 'flex';
                nav.style.flexDirection = 'column';
                nav.style.position = 'absolute';
                nav.style.top = '72px';
                nav.style.left = '0';
                nav.style.width = '100%';
                nav.style.background = 'var(--ct-bg)';
                nav.style.padding = '1.5rem';
                nav.style.borderBottom = '1px solid var(--ct-border)';
                nav.style.zIndex = '999';
                nav.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
            } else {
                nav.style.display = ''; 
            }
        });
    }
}
