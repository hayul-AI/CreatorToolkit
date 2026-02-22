/**
 * YouTube MetaScore Panel - 2026 Production Fix
 */
(function() {
    const DEFAULTS = {
        isOpen: true,
        position: { top: 100, left: 30 },
        content: { title: '', description: '', tags: [], category: '' }
    };

    let state = JSON.parse(localStorage.getItem('metascore_state_v1')) || DEFAULTS;
    let lastScore = 0;

    function saveState() { localStorage.setItem('metascore_state_v1', JSON.stringify(state)); }

    function init() {
        if (document.getElementById('upload-assistant-panel')) return;
        createUI();
        setupEventListeners();
        setupDrag();
        setTimeout(() => { updateScore(); restorePanel(); }, 100);
    }

    function createUI() {
        const panel = document.createElement('div');
        panel.id = 'upload-assistant-panel';
        if (!state.isOpen) panel.classList.add('hidden');

        panel.innerHTML = `
            <div class="up-header" id="up-drag-handle">
                <div class="up-header-title">🚀 METASCORE</div>
                <div style="display:flex; gap:8px;">
                    <button type="button" class="up-icon-btn" id="up-reset-all" title="Reset">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M3 6h18M8 6V4h8v2M6 6l1 16h10l1-16M10 11v6M14 11v6" stroke-linecap="round"/>
                        </svg>
                    </button>
                    <button type="button" class="up-icon-btn" id="up-close-x" data-metascore-close>✕</button>
                </div>
            </div>
            <div class="up-body">
                <div class="up-score-card metascore" id="up-metascore-root">
                    <div class="metascore__label">META SCORE</div>
                    <div class="metascore__row">
                        <div class="stars" id="up-stars-container">
                            <div class="stars__base">★★★★★</div>
                            <div class="stars__fill" id="up-score-stars">★★★★★</div>
                        </div>
                        <div class="metascore__num"><span id="up-score-val">0</span><span class="slash">/100</span></div>
                    </div>
                    <ul class="up-hints" id="up-hints"></ul>
                </div>
                <div class="up-field">
                    <div class="up-label-row"><span>TITLE</span> <span id="up-title-cnt">0/100</span></div>
                    <input type="text" class="up-input" id="up-title-in" maxlength="100" placeholder="Enter title...">
                </div>
                <div class="up-field">
                    <div class="up-label-row"><span>CATEGORY</span></div>
                    <select class="up-input" id="up-category-in">
                        <option value="">Select Category...</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Education / Knowledge">Education / Knowledge</option>
                        <option value="Tech / How-To">Tech / How-To</option>
                        <option value="Gaming">Gaming</option>
                        <option value="Music">Music</option>
                        <option value="Lifestyle / Hobby">Lifestyle / Hobby</option>
                        <option value="Commentary / Opinion">Commentary / Opinion</option>
                    </select>
                </div>
                <div class="up-field">
                    <div class="up-label-row"><span>HASHTAGS (MAX 5)</span> <span id="up-tag-cnt">0/5</span></div>
                    <div class="up-tag-container" id="up-tag-cont">
                        <input type="text" class="up-input" id="up-tag-in" style="border:none;width:auto;flex:1;" placeholder="Add hashtag...">
                    </div>
                </div>
                <div class="up-field">
                    <div class="up-label-row"><span>DESCRIPTION</span> <span id="up-desc-cnt">0</span></div>
                    <textarea class="up-input" id="up-desc-in" style="min-height:120px;" placeholder="Video description..."></textarea>
                </div>
            </div>
            <div class="up-footer">
                <button type="button" class="up-btn up-btn-primary" id="up-copy-all">Copy Everything</button>
            </div>
            <div id="up-toast-container"></div>
        `;
        document.body.appendChild(panel);
    }

    function setupEventListeners() {
        const sr = (id) => document.getElementById(id);
        const titleIn = sr('up-title-in'), descIn = sr('up-desc-in'), tagIn = sr('up-tag-in'), catIn = sr('up-category-in');

        titleIn.value = state.content.title || '';
        descIn.value = state.content.description || '';
        catIn.value = state.content.category || '';
        renderTags();

        titleIn.oninput = (e) => { state.content.title = e.target.value; updateScore(); saveState(); };
        descIn.oninput = (e) => { state.content.description = e.target.value; updateScore(); saveState(); };
        catIn.onchange = (e) => { state.content.category = e.target.value; updateScore(); saveState(); };

        sr('up-copy-all').onclick = (e) => {
            e.preventDefault();
            const tags = state.content.tags.map(t => `#${t}`).join(' ');
            const categoryText = catIn.options[catIn.selectedIndex] ? catIn.options[catIn.selectedIndex].text : '';
            const copyContent = `Title: ${state.content.title}\nCategory: ${categoryText}\nHashtags: ${tags}\n\nDescription:\n${state.content.description}`;
            copyText(copyContent);
        };

        sr('up-close-x').onclick = (e) => { e.preventDefault(); togglePanel(false); };
        
        const processTags = () => {
            const val = tagIn.value.trim(); if (!val) return;
            const newTags = val.split(/[\s,]+/).map(t => t.trim().replace(/^#/, '')).filter(t => t !== '');
            state.content.tags = [...new Set([...state.content.tags, ...newTags])].slice(0, 5);
            tagIn.value = ''; renderTags(); updateScore(); saveState();
        };
        tagIn.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); processTags(); } };
        sr('up-reset-all').onclick = () => {
            state.content = { title: '', description: '', tags: [], category: '' };
            titleIn.value = descIn.value = catIn.value = ''; renderTags(); updateScore(); saveState();
        };
    }

    function renderTags() {
        const cont = document.getElementById('up-tag-cont'), input = document.getElementById('up-tag-in');
        if (!cont) return;
        cont.querySelectorAll('.up-tag').forEach(t => t.remove());
        (state.content.tags || []).forEach((tag, i) => {
            const chip = document.createElement('div');
            chip.className = 'up-tag';
            chip.innerHTML = `#${tag} <span style="cursor:pointer;margin-left:4px;" onclick="window.removeUpTag(${i})">×</span>`;
            cont.insertBefore(chip, input);
        });
    }
    window.removeUpTag = (idx) => { state.content.tags.splice(idx, 1); renderTags(); updateScore(); saveState(); };

    function updateScore() {
        const c = state.content; let score = 0;
        if (c.category) score += 10;
        if (c.title.length > 40) score += 30;
        if (c.description.length > 100) score += 30;
        if (c.tags.length >= 3) score += 30;
        const final = Math.min(100, score);
        const starsFill = document.getElementById('up-score-stars'), scoreVal = document.getElementById('up-score-val');
        if (starsFill) starsFill.style.width = `${final}%`;
        if (scoreVal) scoreVal.innerText = final;
    }

    function togglePanel(open) {
        state.isOpen = open;
        const wrapper = document.getElementById('metascoreFloatWrap');
        if (wrapper) wrapper.classList.toggle('is-hidden', !open);
        saveState();
    }

    function setupDrag() { 
        const panel = document.getElementById('upload-assistant-panel');
        const handle = document.getElementById('up-drag-handle');
        if (!panel || !handle) return;
        let isDragging = false, startX, startY, initialTop, initialLeft;
        handle.onmousedown = (e) => {
            if (e.target.closest('button') || e.target.closest('input')) return;
            isDragging = true; startX = e.clientX; startY = e.clientY;
            initialTop = panel.offsetTop; initialLeft = panel.offsetLeft;
            panel.style.transition = 'none';
        };
        window.onmousemove = (e) => {
            if (!isDragging) return;
            state.position.top = initialTop + (e.clientY - startY);
            state.position.left = initialLeft + (e.clientX - startX);
            panel.style.top = `${state.position.top}px`; panel.style.left = `${state.position.left}px`;
        };
        window.onmouseup = () => { isDragging = false; panel.style.transition = ''; saveState(); };
    }

    function restorePanel() {
        const p = document.getElementById('upload-assistant-panel');
        if (p) { p.style.top = `${state.position.top}px`; p.style.left = `${state.position.left}px`; }
    }

    function copyText(txt) {
        const fallbackCopy = (text) => {
            const area = document.createElement("textarea");
            area.value = text; document.body.appendChild(area);
            area.select(); document.execCommand("copy");
            document.body.removeChild(area);
            showToast("Copied!");
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(txt).then(() => showToast("Copied!")).catch(() => fallbackCopy(txt));
        } else { fallbackCopy(txt); }
    }

    function showToast(msg) {
        const container = document.getElementById('up-toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'up-toast';
        toast.innerText = msg;
        container.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 1500);
    }

    init();
})();
