/**
 * YouTube MetaScore Panel - 2026 Refactored Version
 * Replaced AI Generator with Category selection and updated scoring logic.
 * Enhanced: Star rating UI & Count-up animation.
 */
(function() {
    const DEFAULTS = {
        isOpen: true,
        position: { top: 100, left: 30 },
        content: { title: '', description: '', tags: [], category: '' },
        settings: { includeCTA: true }
    };

    let state = JSON.parse(localStorage.getItem('metascore_state_v1')) || DEFAULTS;
    let lastScore = 0; // For count-up animation

    function saveState() {
        localStorage.setItem('metascore_state_v1', JSON.stringify(state));
    }

    function init() {
        if (document.getElementById('upload-assistant-panel')) return;
        createUI();
        setupEventListeners();
        setupDrag();
        
        setTimeout(() => {
            updateScore();
            restorePanel();
        }, 100);
    }

    function createUI() {
        const panel = document.createElement('div');
        panel.id = 'upload-assistant-panel';
        if (!state.isOpen) panel.classList.add('hidden');

        panel.innerHTML = `
            <div class="up-header" id="up-drag-handle">
                <div class="up-header-title">🚀 METASCORE</div>
                <div style="display:flex; gap:8px;">
                    <button class="up-icon-btn" id="up-reset-pos" title="Reset Position">🔄</button>
                    <button class="up-icon-btn" id="up-close-x">✕</button>
                </div>
            </div>
            <div class="up-body">
                <div class="up-score-card metascore" id="up-metascore-root">
                    <div class="metascore__label">META SCORE</div>
                    <div class="metascore__row">
                        <div class="stars" id="up-stars-container" aria-label="MetaScore rating">
                            <div class="stars__base">★★★★★</div>
                            <div class="stars__fill" id="up-score-stars">★★★★★</div>
                        </div>
                        <div class="metascore__num"><span id="up-score-val">0</span><span class="slash">/100</span></div>
                    </div>
                    <ul class="up-hints" id="up-hints"></ul>
                </div>

                <div class="up-field">
                    <div class="up-label-row"><span>TITLE</span> <span id="up-title-cnt">0/100</span></div>
                    <input type="text" class="up-input" id="up-title-in" maxlength="100" placeholder="Enter video title...">
                </div>

                <div class="up-field">
                    <div class="up-label-row"><span>CATEGORY</span></div>
                    <select class="up-input" id="up-category-in" style="font-weight:600; cursor:pointer;">
                        <option value="">Select Category...</option>
                        <option value="ent">Entertainment</option>
                        <option value="edu">Education / Knowledge</option>
                        <option value="tech">Tech / How-To</option>
                        <option value="game">Gaming</option>
                        <option value="music">Music</option>
                        <option value="life">Lifestyle / Hobby</option>
                        <option value="opinion">Commentary / Opinion</option>
                    </select>
                </div>

                <div class="up-field">
                    <div class="up-label-row"><span>HASHTAGS (MAX 5)</span> <span id="up-tag-cnt">0/5</span></div>
                    <div class="up-tag-container" id="up-tag-cont">
                        <input type="text" class="up-input" id="up-tag-in" style="border:none; padding:4px; width:auto; flex:1;" placeholder="Enter a hashtag ↵">
                    </div>
                </div>

                <div class="up-field">
                    <div class="up-label-row"><span>DESCRIPTION</span> <span id="up-desc-cnt">0</span></div>
                    <textarea class="up-input" id="up-desc-in" style="min-height:150px;" placeholder="Paste or type detailed description here..."></textarea>
                </div>
            </div>
            <div class="up-footer">
                <button class="up-btn up-btn-primary" id="up-copy-all">Copy Everything</button>
            </div>
            <div class="up-toast" id="up-toast">Copied!</div>
        `;
        document.body.appendChild(panel);

        const openBtn = document.createElement('button');
        openBtn.id = 'up-global-open';
        openBtn.className = 'up-open-btn';
        openBtn.innerHTML = '🚀';
        if (state.isOpen) openBtn.style.display = 'none';
        document.body.appendChild(openBtn);
    }

    function setupEventListeners() {
        const sr = (id) => document.getElementById(id);
        const titleIn = sr('up-title-in');
        const descIn = sr('up-desc-in');
        const tagIn = sr('up-tag-in');
        const catIn = sr('up-category-in');

        titleIn.value = state.content.title;
        descIn.value = state.content.description;
        catIn.value = state.content.category;
        renderTags();

        titleIn.oninput = (e) => {
            state.content.title = e.target.value;
            sr('up-title-cnt').innerText = `${e.target.value.length}/100`;
            updateScore();
            saveState();
        };

        descIn.oninput = (e) => {
            state.content.description = e.target.value;
            sr('up-desc-cnt').innerText = e.target.value.length;
            updateScore();
            saveState();
        };

        catIn.onchange = (e) => {
            state.content.category = e.target.value;
            updateScore();
            saveState();
        };

        const processTags = () => {
            const val = tagIn.value.trim();
            if (!val) return;
            const newTags = val.split(/[\s,]+/).map(t => t.trim().replace(/^#/, '')).filter(t => t !== '');
            let combined = [...new Set([...state.content.tags, ...newTags])];
            if (combined.length > 5) combined = combined.slice(0, 5);
            state.content.tags = combined;
            tagIn.value = '';
            renderTags();
            updateScore();
            saveState();
        };

        tagIn.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); processTags(); } };
        tagIn.onblur = processTags;

        sr('up-copy-all').onclick = () => {
            const tags = state.content.tags.map(t => `#${t}`).join(' ');
            copyText(`${state.content.title}\n\n${state.content.description}\n\n${tags}`);
        };

        sr('up-close-x').onclick = () => togglePanel(false);
        sr('up-global-open').onclick = () => togglePanel(true);
        sr('up-reset-pos').onclick = () => {
            state.position = { top: 100, left: 30 };
            restorePanel();
            saveState();
        };
    }

    function renderTags() {
        const cont = document.getElementById('up-tag-cont');
        const input = document.getElementById('up-tag-in');
        cont.querySelectorAll('.up-tag').forEach(t => t.remove());
        state.content.tags.forEach((tag, i) => {
            const chip = document.createElement('div');
            chip.className = 'up-tag';
            chip.innerHTML = `#${tag} <span style="cursor:pointer;margin-left:4px;" onclick="window.removeUpTag(${i})">×</span>`;
            cont.insertBefore(chip, input);
        });
        document.getElementById('up-tag-cnt').innerText = `${state.content.tags.length}/5`;
    }

    window.removeUpTag = (idx) => {
        state.content.tags.splice(idx, 1);
        renderTags();
        updateScore();
        saveState();
    };

    function updateScore() {
        const c = state.content;
        let score = 0;
        let hints = [];

        if (!c.category) { score -= 10; hints.push("Choose a category to improve clarity."); }

        const tl = c.title.trim().length;
        if (tl >= 45 && tl <= 75) score += 30;
        else if (tl > 0) { score += 15; hints.push("Aim for 45-75 chars in title."); }
        else hints.push("Add a video title to start.");

        const dl = c.description.trim().length;
        if (dl >= 250) score += 30;
        else if (dl >= 50) { score += 15; hints.push(`Description is a bit short.`); }
        else hints.push("Add a detailed description.");

        const tc = c.tags.length;
        if (tc >= 3) score += 20;
        else if (tc > 0) { score += 10; hints.push("Add at least 3 hashtags."); }
        else hints.push("Use hashtags for better reach.");

        if (c.description.toLowerCase().includes('subscribe') || c.description.toLowerCase().includes('like')) score += 20;
        else hints.push("Add a Call to Action (Like/Sub).");

        const final = Math.max(0, Math.min(100, score));
        
        // UI Updates
        const root = document.getElementById('up-metascore-root');
        const starsFill = document.getElementById('up-score-stars');
        const scoreVal = document.getElementById('up-score-val');
        const hintsEl = document.getElementById('up-hints');
        const container = document.getElementById('up-stars-container');

        if (root) {
            root.classList.remove('tone-danger', 'tone-warn', 'tone-good');
            const tone = final < 40 ? 'tone-danger' : (final < 70 ? 'tone-warn' : 'tone-good');
            root.classList.add(tone);
        }

        if (starsFill) starsFill.style.width = `${final}%`;
        
        if (container) {
            const starsValue = (final / 20).toFixed(1);
            container.setAttribute('aria-label', `MetaScore ${final} out of 100, ${starsValue} out of 5 stars`);
        }

        if (scoreVal) animateValue(scoreVal, lastScore, final, 350);
        lastScore = final;

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

    function setupDrag() {
        const panel = document.getElementById('upload-assistant-panel');
        const handle = document.getElementById('up-drag-handle');
        let isDragging = false;
        let startX, startY, initialTop, initialLeft;

        const start = (e) => {
            if (e.target.closest('button') || e.target.closest('input') || e.target.closest('textarea') || e.target.closest('select')) return;
            isDragging = true;
            const ev = e.touches ? e.touches[0] : e;
            startX = ev.clientX; startY = ev.clientY;
            initialTop = panel.offsetTop; initialLeft = panel.offsetLeft;
            panel.style.transition = 'none';
        };
        const move = (e) => {
            if (!isDragging) return;
            const ev = e.touches ? e.touches[0] : e;
            state.position.top = initialTop + (ev.clientY - startY);
            state.position.left = initialLeft + (ev.clientX - startX);
            panel.style.top = `${state.position.top}px`;
            panel.style.left = `${state.position.left}px`;
        };
        const end = () => { isDragging = false; panel.style.transition = ''; saveState(); };

        handle.onmousedown = start; handle.ontouchstart = start;
        window.onmousemove = move; window.ontouchmove = move;
        window.onmouseup = end; window.ontouchend = end;
    }

    function togglePanel(open) {
        state.isOpen = open;
        document.getElementById('upload-assistant-panel').classList.toggle('hidden', !open);
        document.getElementById('up-global-open').style.display = open ? 'none' : 'block';
        saveState();
    }

    function restorePanel() {
        const p = document.getElementById('upload-assistant-panel');
        p.style.top = `${state.position.top}px`;
        p.style.left = `${state.position.left}px`;
    }

    function copyText(txt) { navigator.clipboard.writeText(txt).then(() => showToast("Copied to Clipboard!")); }
    function showToast(msg) {
        const t = document.getElementById('up-toast');
        t.innerText = msg; t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 2000);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
