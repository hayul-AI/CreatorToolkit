document.addEventListener('DOMContentLoaded', () => {
    // Shared functionality for file upload tools
    setupDragAndDrop();
});

function setupDragAndDrop() {
    const dropZones = document.querySelectorAll('.drop-zone');
    
    dropZones.forEach(zone => {
        const input = zone.querySelector('input[type="file"]');
        
        zone.addEventListener('click', () => {
            if(input) input.click();
        });

        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('dragover');
        });

        zone.addEventListener('dragleave', () => {
            zone.classList.remove('dragover');
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('dragover');
            
            if (e.dataTransfer.files.length && input) {
                input.files = e.dataTransfer.files;
                const event = new Event('change');
                input.dispatchEvent(event);
            }
        });
    });
}
