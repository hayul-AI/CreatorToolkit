/**
 * YouTube MetaScore PRO - Production Version (Ultimate Singleton & Stability Fix)
 */
(function() {
    const STORAGE_KEY = 'metascore_state_pro';
    const DEFAULTS = {
        isOpen: true,
        isMinimized: false,
        position: { top: 100, left: window.innerWidth - 400 },
        content: { title: '', description: '', tags: [], category: '' }
    };

    let state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || DEFAULTS;
    let lastScore = 0;

    function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

    function init() {
        // 1. Strict Singleton: Cleanup ANY existing versions
        const selectors = [
            '#upload-assistant-panel', 
            '#up-maximize-fab', 
            '.up-minimized-badge', 
            '#ctk-metascore-container',
            '#metascoreFloatWrap'
        ];
        selectors.forEach(s => {
            document.querySelectorAll(s).forEach(el => el.remove());
        });

        if (window._metascoreLoading) return;
        window._metascoreLoading = true;

        createUI();
        setupEventListeners();
        setupDrag();
        
        setTimeout(() => {
            updateScore();
            restoreState();
            window._metascoreLoading = false;
        }, 100);
    }

    function createUI() {
        const panel = document.createElement('div');
        panel.id = 'upload-assistant-panel';
        panel.className = 'metascore-pro-panel';
        
        panel.innerHTML = `
            <div class="up-header" id="up-drag-handle">
                <div class="up-header-title">🚀 METASCORE PRO</div>
                <div style="display:flex; gap:10px; align-items:center;">
                    <button type="button" class="up-icon-btn reset-btn" id="up-reset-all" title="Clear All">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/>
                        </svg>
                    </button>
                    <button type="button" class="up-icon-btn close-btn" id="up-minimize-x" title="Minimize">✕</button>
                </div>
            </div>
            <div class="up-body">
                <div class="up-score-card metascore" id="up-metascore-root">
                    <div class="metascore__label">SEO QUALITY SCORE</div>
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
                    <div class="up-label-row"><span>VIDEO TITLE</span> <span id="up-title-cnt">0/100</span></div>
                    <input type="text" class="up-input" id="up-title-in" maxlength="100" placeholder="Enter a catchy title...">
                </div>

                <div class="up-field">
                    <div class="up-label-row"><span>CATEGORY</span></div>
                    <select class="up-input" id="up-category-in">
                        <option value="">Select Category...</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Education">Education / Knowledge</option>
                        <option value="Tech">Tech / How-To</option>
                        <option value="Gaming">Gaming</option>
                        <option value="Music">Music</option>
                        <option value="Lifestyle">Lifestyle / Hobby</option>
                        <option value="Commentary">Commentary / Opinion</option>
                    </select>
                </div>

                <div class="up-field">
                    <div class="up-label-row"><span>HASHTAGS (MAX 5)</span> <span id="up-tag-cnt">0/5</span></div>
                    <div class="up-tag-container" id="up-tag-cont">
                        <input type="text" class="up-input" id="up-tag-in" style="border:none; padding:4px; width:auto; flex:1;" placeholder="Add hashtag ↵">
                    </div>
                </div>

                <div class="up-field">
                    <div class="up-label-row"><span>DESCRIPTION</span> <span id="up-desc-cnt">0</span></div>
                    <textarea class="up-input" id="up-desc-in" style="min-height:140px;" placeholder="Write detailed video description..."></textarea>
                </div>
            </div>
            <div class="up-footer">
                <button type="button" class="up-btn up-btn-primary" id="up-copy-all">Copy Everything</button>
            </div>
            <div id="up-toast-container"></div>
        `;
        
        // Redesigned Minimized Badge
        const badge = document.createElement('div');
        badge.id = 'up-maximize-badge';
        badge.className = 'up-minimized-badge';
        badge.innerHTML = '<span class="icon">🚀</span> METASCORE';
        badge.style.display = 'none';

        document.body.appendChild(panel);
        document.body.appendChild(badge);
    }

    function setupEventListeners() {
        const sr = (id) => document.getElementById(id);
        const titleIn = sr('up-title-in'), descIn = sr('up-desc-in'), tagIn = sr('up-tag-in'), catIn = sr('up-category-in');

        titleIn.oninput = (e) => { state.content.title = e.target.value; updateCount('up-title-cnt', e.target.value.length, 100); updateScore(); saveState(); };
        descIn.oninput = (e) => { state.content.description = e.target.value; sr('up-desc-cnt').innerText = e.target.value.length; updateScore(); saveState(); };
        catIn.onchange = (e) => { state.content.category = e.target.value; updateScore(); saveState(); };

        const processTags = () => {
            const val = tagIn.value.trim(); if (!val) return;
            const newTags = val.split(/[\s,]+/).map(t => t.trim().replace(/^#/, '')).filter(t => t !== '');
            state.content.tags = [...new Set([...state.content.tags, ...newTags])].slice(0, 5);
            tagIn.value = ''; renderTags(); updateScore(); saveState();
        };
        tagIn.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); processTags(); } };

        sr('up-copy-all').onclick = (e) => {
            e.preventDefault();
            const tags = (state.content.tags || []).map(t => `#${t}`).join(' ');
            const category = catIn.options[catIn.selectedIndex] ? catIn.options[catIn.selectedIndex].text : '';
            const copyContent = `Title: ${state.content.title}\nCategory: ${category}\nHashtags: ${tags}\n\nDescription:\n${state.content.description}`;
            copyToClipboard(copyContent);
        };

        sr('up-minimize-x').onclick = () => setMinimized(true);
        sr('up-maximize-badge').onclick = () => setMinimized(false);

        sr('up-reset-all').onclick = () => {
            if(!confirm("Clear all MetaScore inputs?")) return;
            state.content = { title: '', description: '', tags: [], category: '' };
            titleIn.value = descIn.value = catIn.value = tagIn.value = '';
            renderTags(); updateScore(); saveState();
            showToast("Inputs Cleared");
        };
    }

    function updateCount(id, val, max) { const el = document.getElementById(id); if (el) el.innerText = `${val}/${max}`; }

    function renderTags() {
        const cont = document.getElementById('up-tag-cont'), input = document.getElementById('up-tag-in');
        if (!cont || !input) return;
        cont.querySelectorAll('.up-tag').forEach(t => t.remove());
        (state.content.tags || []).forEach((tag, i) => {
            const chip = document.createElement('div');
            chip.className = 'up-tag';
            chip.innerHTML = `#${tag} <span style="cursor:pointer;margin-left:4px;" onclick="window.removeUpTag(${i})">×</span>`;
            cont.insertBefore(chip, input);
        });
        const tagCnt = document.getElementById('up-tag-cnt');
        if (tagCnt) tagCnt.innerText = `${state.content.tags.length}/5`;
    }
    window.removeUpTag = (idx) => { state.content.tags.splice(idx, 1); renderTags(); updateScore(); saveState(); };

    function updateScore() {
        const c = state.content; let score = 0; let hints = [];
        if (!c.category) { score -= 10; hints.push("Select a category"); }
        const tl = (c.title || "").length;
        if (tl > 45 && tl < 80) score += 30; else hints.push("Aim for 45-80 chars in title");
        if ((c.description || "").length > 200) score += 30; else hints.push("Add more description detail");
        if ((c.tags || []).length >= 3) score += 20; else hints.push("Add at least 3 hashtags");
        const descLower = (c.description || "").toLowerCase();
        if (descLower.includes('subscribe') || descLower.includes('like')) score += 20; else hints.push("Add a CTA (Like/Sub)");

        const final = Math.max(0, Math.min(100, score));
        const root = document.getElementById('up-metascore-root'), stars = document.getElementById('up-score-stars'), val = document.getElementById('up-score-val');
        
        if (root) {
            root.className = 'up-score-card metascore ' + (final < 40 ? 'tone-danger' : final < 70 ? 'tone-warn' : 'tone-good');
        }
        if (stars) stars.style.width = `${final}%`;
        if (val) animateValue(val, lastScore, final, 400);
        lastScore = final;
        
        const hintsEl = document.getElementById('up-hints');
        if (hintsEl) hintsEl.innerHTML = hints.slice(0, 3).map(h => `<li>${h}</li>`).join('');
    }

    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start);
            if (progress < 1) window.requestAnimationFrame(step);
        };
        window.requestAnimationFrame(step);
    }

    function setMinimized(min) {
        state.isMinimized = min;
        const panel = document.getElementById('upload-assistant-panel');
        const badge = document.getElementById('up-maximize-badge');
        if (panel) panel.classList.toggle('is-minimized', min);
        if (badge) badge.style.display = min ? 'flex' : 'none';
        saveState();
    }

    function setupDrag() {
        const handle = document.getElementById('up-drag-handle'), panel = document.getElementById('upload-assistant-panel');
        if (!handle || !panel) return;

        let isDragging = false, startX, startY, initialTop, initialLeft;

        handle.onmousedown = (e) => {
            if (e.target.closest('button')) return;
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialTop = panel.offsetTop;
            initialLeft = panel.offsetLeft;
            panel.style.transition = 'none';
            document.body.style.userSelect = 'none';
        };

        window.onmousemove = (e) => {
            if (!isDragging) return;
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            state.position.top = initialTop + deltaY;
            state.position.left = initialLeft + deltaX;
            
            state.position.top = Math.max(0, Math.min(window.innerHeight - 80, state.position.top));
            state.position.left = Math.max(0, Math.min(window.innerWidth - 100, state.position.left));

            panel.style.top = `${state.position.top}px`;
            panel.style.left = `${state.position.left}px`;
            panel.style.right = 'auto';
        };

        window.onmouseup = () => {
            if (isDragging) {
                isDragging = false;
                panel.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease';
                document.body.style.userSelect = '';
                saveState();
            }
        };
    }

    function restoreState() {
        const panel = document.getElementById('upload-assistant-panel');
        if (!panel) return;

        // Validation: if off-screen, reset to default
        if (state.position.top > window.innerHeight || state.position.left > window.innerWidth) {
            state.position = DEFAULTS.position;
        }

        panel.style.top = `${state.position.top}px`;
        panel.style.left = `${state.position.left}px`;
        panel.style.right = 'auto';

        const tIn = document.getElementById('up-title-in'), dIn = document.getElementById('up-desc-in'), cIn = document.getElementById('up-category-in');
        if (tIn) tIn.value = state.content.title || '';
        if (dIn) dIn.value = state.content.description || '';
        if (cIn) cIn.value = state.content.category || '';
        
        updateCount('up-title-cnt', (state.content.title || '').length, 100);
        const dCnt = document.getElementById('up-desc-cnt');
        if (dCnt) dCnt.innerText = (state.content.description || '').length;
        
        renderTags();
        setMinimized(state.isMinimized);
    }

    function copyToClipboard(txt) {
        navigator.clipboard.writeText(txt).then(() => showToast("Copied Content ✨"));
    }

    function showToast(msg) {
        const container = document.getElementById('up-toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'up-toast'; toast.innerText = msg;
        container.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 2000);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
