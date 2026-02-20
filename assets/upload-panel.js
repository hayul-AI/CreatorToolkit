/**
 * YouTube Upload Assistant Panel Logic
 * Senior Frontend Implementation (Vanilla JS)
 */

(function() {
    // 1. Initial State & Default Settings
    const DEFAULTS = {
        isOpen: true,
        position: { top: 80, left: 20 },
        content: { title: '', description: '', tags: [] },
        settings: {
            titleMin: 45, titleMax: 70,
            descMin: 200,
            tagMin: 3, tagMax: 5, tagLimit: 15,
            weights: { title: 30, desc: 30, tags: 20, cta: 20 },
            ctaList: ['subscribe', 'like', 'playlist', 'relax', 'study', 'focus', 'work'],
            bannedList: ['scam', 'click here now']
        },
        templates: []
    };

    let state = JSON.parse(localStorage.getItem('up_state')) || DEFAULTS;

    // Merge settings if missing (for updates)
    state.settings = { ...DEFAULTS.settings, ...state.settings };

    function saveState() {
        localStorage.setItem('up_state', JSON.stringify(state));
    }

    // 2. Main Mount Function
    function init() {
        if (document.getElementById('upload-assistant-panel')) return;

        createPanelUI();
        createToast();
        createOpenButton();
        
        setupEventListeners();
        setupDrag();
        
        updateScore();
        restorePanel();
    }

    function createPanelUI() {
        const panel = document.createElement('div');
        panel.id = 'upload-assistant-panel';
        if (!state.isOpen) panel.classList.add('hidden');

        panel.innerHTML = `
            <div class="up-header" id="up-drag-handle">
                <div class="up-header-title">📌 Upload Assistant</div>
                <div class="up-header-btns">
                    <button class="up-icon-btn" id="up-reset-pos" title="Reset Position">🔄</button>
                    <button class="up-icon-btn" id="up-close-x" title="Close">✕</button>
                </div>
            </div>
            <div class="up-body">
                <!-- Score Gauge -->
                <div class="up-score-card">
                    <div class="up-score-top">
                        <span class="up-score-label">Upload Strength</span>
                        <span class="up-score-value" id="up-score-val">0</span>
                    </div>
                    <div class="up-progress"><div class="up-progress-bar" id="up-score-bar"></div></div>
                    <ul class="up-hints" id="up-hints"></ul>
                </div>

                <!-- Fields -->
                <div class="up-field">
                    <div class="up-label-row"><span>Video Title</span> <span id="up-title-cnt">0/100</span></div>
                    <input type="text" class="up-input" id="up-title-in" maxlength="100" placeholder="Enter title...">
                </div>

                <div class="up-field">
                    <div class="up-label-row"><span>Description</span> <span id="up-desc-cnt">0</span></div>
                    <textarea class="up-input" id="up-desc-in" placeholder="Enter description..."></textarea>
                </div>

                <div class="up-field">
                    <div class="up-label-row"><span>Hashtags (#)</span> <span id="up-tag-cnt">0/15</span></div>
                    <div class="up-tag-container" id="up-tag-cont">
                        <input type="text" class="up-tag-input" id="up-tag-in" placeholder="Add #tag...">
                    </div>
                </div>

                <!-- Settings Accordion -->
                <div class="up-acc">
                    <button class="up-acc-trigger">⚙️ Score Settings <span>▼</span></button>
                    <div class="up-acc-content" id="up-settings-panel">
                        <div class="up-setting-row"><label>Title Target</label> <div><input type="number" id="s-t-min" value="${state.settings.titleMin}"> - <input type="number" id="s-t-max" value="${state.settings.titleMax}"></div></div>
                        <div class="up-setting-row"><label>Min Desc</label> <input type="number" id="s-d-min" value="${state.settings.descMin}"></div>
                        <div class="up-setting-row"><label>Tag Range</label> <div><input type="number" id="s-tg-min" value="${state.settings.tagMin}"> - <input type="number" id="s-tg-max" value="${state.settings.tagMax}"></div></div>
                        <button class="up-btn" id="up-save-settings" style="width:100%; margin-top:10px;">Apply Rules</button>
                    </div>
                </div>

                <!-- Templates Accordion -->
                <div class="up-acc">
                    <button class="up-acc-trigger">💾 Templates <span>▼</span></button>
                    <div class="up-acc-content">
                        <div style="display:flex; gap:8px; margin-bottom:10px;">
                            <input type="text" id="up-tpl-name" class="up-input" placeholder="Template Name" style="padding:6px;">
                            <button class="up-btn up-btn-primary" id="up-save-tpl" style="padding:6px 12px;">Save</button>
                        </div>
                        <div id="up-tpl-list" style="font-size:0.8rem;"></div>
                    </div>
                </div>
            </div>
            <div class="up-footer">
                <button class="up-btn" id="up-copy-t">Title</button>
                <button class="up-btn" id="up-copy-d">Desc</button>
                <button class="up-btn up-btn-primary" id="up-copy-all">Copy All</button>
            </div>
        `;
        document.body.appendChild(panel);
    }

    function createToast() {
        const toast = document.createElement('div');
        toast.id = 'up-toast';
        toast.className = 'up-toast';
        toast.innerText = 'Copied to clipboard!';
        document.body.appendChild(toast);
    }

    function createOpenButton() {
        // Try to find a place in the header to inject the "Open" button
        // If not found, place it fixed top-right
        const openBtn = document.createElement('button');
        openBtn.className = 'up-open-btn';
        openBtn.id = 'up-global-open';
        openBtn.innerHTML = '📌 Assistant';
        openBtn.style.cssText = "position:fixed; top:80px; right:20px; z-index:10000;";
        if (state.isOpen) openBtn.style.display = 'none';
        
        document.body.appendChild(openBtn);
    }

    // 3. Event Handling
    function setupEventListeners() {
        const sr = (id) => document.getElementById(id);
        
        // Input Sync
        sr('up-title-in').value = state.content.title;
        sr('up-desc-in').value = state.content.description;
        renderTags();

        sr('up-title-in').oninput = (e) => {
            state.content.title = e.target.value;
            sr('up-title-cnt').innerText = `${e.target.value.length}/100`;
            updateScore();
            saveState();
        };

        sr('up-desc-in').oninput = (e) => {
            state.content.description = e.target.value;
            sr('up-desc-cnt').innerText = e.target.value.length;
            updateScore();
            saveState();
        };

        sr('up-tag-in').onkeydown = (e) => {
            if (e.key === 'Enter') {
                const val = e.target.value.trim().replace(/^#/, '');
                if (val && state.content.tags.length < state.settings.tagLimit) {
                    state.content.tags.push(val);
                    e.target.value = '';
                    renderTags();
                    updateScore();
                    saveState();
                }
            }
        };

        // UI Toggles
        sr('up-close-x').onclick = () => togglePanel(false);
        sr('up-global-open').onclick = () => togglePanel(true);
        sr('up-reset-pos').onclick = () => resetPosition();

        document.querySelectorAll('.up-acc-trigger').forEach(trigger => {
            trigger.onclick = () => trigger.nextElementSibling.classList.toggle('active');
        });

        // Actions
        sr('up-copy-t').onclick = () => copyText(state.content.title);
        sr('up-copy-d').onclick = () => copyText(state.content.description);
        sr('up-copy-all').onclick = () => {
            const tags = state.content.tags.map(t => `#${t}`).join(' ');
            copyText(`${state.content.title}

${state.content.description}

${tags}`);
        };

        sr('up-save-settings').onclick = () => {
            state.settings.titleMin = parseInt(sr('s-t-min').value);
            state.settings.titleMax = parseInt(sr('s-t-max').value);
            state.settings.descMin = parseInt(sr('s-d-min').value);
            state.settings.tagMin = parseInt(sr('s-tg-min').value);
            state.settings.tagMax = parseInt(sr('s-tg-max').value);
            updateScore();
            saveState();
            showToast('Rules Applied!');
        };

        sr('up-save-tpl').onclick = () => {
            const name = sr('up-tpl-name').value.trim();
            if (!name) return;
            state.templates.push({ name, content: { ...state.content } });
            sr('up-tpl-name').value = '';
            renderTemplates();
            saveState();
            showToast('Template Saved!');
        };

        renderTemplates();
    }

    function renderTags() {
        const cont = document.getElementById('up-tag-cont');
        const input = document.getElementById('up-tag-in');
        cont.querySelectorAll('.up-tag').forEach(t => t.remove());
        
        state.content.tags.forEach((tag, i) => {
            const chip = document.createElement('div');
            chip.className = 'up-tag';
            chip.innerHTML = `#${tag} <span class="up-tag-remove" data-idx="${i}">×</span>`;
            chip.querySelector('.up-tag-remove').onclick = () => {
                state.content.tags.splice(i, 1);
                renderTags();
                updateScore();
                saveState();
            };
            cont.insertBefore(chip, input);
        });
        document.getElementById('up-tag-cnt').innerText = `${state.content.tags.length}/15`;
    }

    function renderTemplates() {
        const list = document.getElementById('up-tpl-list');
        list.innerHTML = '';
        state.templates.forEach((tpl, i) => {
            const item = document.createElement('div');
            item.style.cssText = "display:flex; justify-content:space-between; align-items:center; padding:6px; border-bottom:1px solid var(--up-border);";
            item.innerHTML = `<span>${tpl.name}</span> <div>
                <button class="up-btn" style="padding:2px 6px; font-size:0.7rem;" onclick="window.UP_LOAD_TPL(${i})">Load</button>
                <button class="up-btn" style="padding:2px 6px; font-size:0.7rem; color:red;" onclick="window.UP_DEL_TPL(${i})">✕</button>
            </div>`;
            list.appendChild(item);
        });
    }

    window.UP_LOAD_TPL = (i) => {
        state.content = { ...state.templates[i].content };
        document.getElementById('up-title-in').value = state.content.title;
        document.getElementById('up-desc-in').value = state.content.description;
        renderTags();
        updateScore();
        saveState();
        showToast('Template Loaded');
    };

    window.UP_DEL_TPL = (i) => {
        state.templates.splice(i, 1);
        renderTemplates();
        saveState();
    };

    // 4. Scoring Logic
    function updateScore() {
        const c = state.content;
        const s = state.settings;
        let score = 0;
        let hints = [];

        // Title (30%)
        if (c.title.length >= s.titleMin && c.title.length <= s.titleMax) score += s.weights.title;
        else hints.push(`Title length should be ${s.titleMin}-${s.titleMax} chars`);

        // Desc (30%)
        if (c.description.length >= s.descMin) score += s.weights.desc;
        else hints.push(`Need ${s.descMin - c.description.length} more chars in description`);

        // Tags (20%)
        if (c.tags.length >= s.tagMin && c.tags.length <= s.tagMax) score += s.weights.tags;
        else hints.push(`Aim for ${s.tagMin}-${s.tagMax} focused hashtags`);

        // CTA (20%)
        const hasCTA = s.ctaList.some(w => c.description.toLowerCase().includes(w));
        if (hasCTA) score += s.weights.cta;
        else hints.push("Add a CTA like 'Subscribe' or 'Link'");

        // Normalization
        const finalScore = Math.min(100, score);
        document.getElementById('up-score-val').innerText = finalScore;
        document.getElementById('up-score-bar').style.width = `${finalScore}%`;
        
        const hintList = document.getElementById('up-hints');
        hintList.innerHTML = hints.slice(0, 3).map(h => `<li>${h}</li>`).join('');
    }

    // 5. Drag Logic
    function setupDrag() {
        const panel = document.getElementById('upload-assistant-panel');
        const handle = document.getElementById('up-drag-handle');
        let isDragging = false;
        let startX, startY, initialTop, initialLeft;

        const start = (e) => {
            if (e.target.closest('button')) return;
            isDragging = true;
            const clientX = e.clientX || e.touches[0].clientX;
            const clientY = e.clientY || e.touches[0].clientY;
            startX = clientX;
            startY = clientY;
            initialTop = panel.offsetTop;
            initialLeft = panel.offsetLeft;
            panel.style.transition = 'none';
        };

        const move = (e) => {
            if (!isDragging) return;
            const clientX = e.clientX || e.touches[0].clientX;
            const clientY = e.clientY || e.touches[0].clientY;
            const dx = clientX - startX;
            const dy = clientY - startY;
            
            state.position.top = Math.max(0, Math.min(window.innerHeight - 100, initialTop + dy));
            state.position.left = Math.max(0, Math.min(window.innerWidth - 300, initialLeft + dx));
            
            panel.style.top = `${state.position.top}px`;
            panel.style.left = `${state.position.left}px`;
        };

        const end = () => {
            if (isDragging) {
                isDragging = false;
                panel.style.transition = '';
                saveState();
            }
        };

        handle.onmousedown = start;
        window.addEventListener('mousemove', move);
        window.addEventListener('mouseup', end);
        handle.ontouchstart = start;
        window.addEventListener('touchmove', move);
        window.addEventListener('touchend', end);
    }

    // 6. Utils
    function togglePanel(open) {
        state.isOpen = open;
        document.getElementById('upload-assistant-panel').classList.toggle('hidden', !open);
        document.getElementById('up-global-open').style.display = open ? 'none' : 'block';
        saveState();
    }

    function resetPosition() {
        state.position = { top: 80, left: (window.innerWidth / 2) - 190 };
        restorePanel();
        saveState();
    }

    function restorePanel() {
        const panel = document.getElementById('upload-assistant-panel');
        panel.style.top = `${state.position.top}px`;
        panel.style.left = `${state.position.left}px`;
    }

    function copyText(text) {
        navigator.clipboard.writeText(text).then(() => showToast('Copied!'));
    }

    function showToast(msg) {
        const t = document.getElementById('up-toast');
        t.innerText = msg;
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 2000);
    }

    // Run on Load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
