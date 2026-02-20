document.addEventListener('DOMContentLoaded', () => {
    setupGlobalDragAndDrop();
    setupMobileMenu();
});

function setupGlobalDragAndDrop() {
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
    const btn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav-links');
    
    if(btn && nav) {
        // Remove existing listeners (if any inline ones exist, this adds a new one)
        // Ideally we'd replace the node, but simple addition is fine for now as long as logic is idempotent
        
        btn.addEventListener('click', (e) => {
            e.stopImmediatePropagation(); // Stop other inline scripts if possible
            
            const isHidden = getComputedStyle(nav).display === 'none';
            
            if(isHidden) {
                nav.style.display = 'flex';
                nav.style.flexDirection = 'column';
                nav.style.position = 'absolute';
                nav.style.top = '72px';
                nav.style.left = '0';
                nav.style.width = '100%';
                nav.style.background = 'white';
                nav.style.padding = '1.5rem';
                nav.style.borderBottom = '1px solid var(--ct-border)';
                nav.style.zIndex = '999';
                nav.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
            } else {
                nav.style.display = ''; // Clear inline style to revert to CSS
            }
        });
    }
}
