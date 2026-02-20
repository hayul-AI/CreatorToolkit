/**
 * YouTube Upload Assistant Panel - Refactored Version
 */
(function() {
    const DEFAULTS = {
        isOpen: true,
        position: { top: 80, left: 20 },
        content: { title: '', description: '', tags: [] },
        settings: { includeCTA: true, tone: 'Cozy', purpose: 'Relax', length: 'Medium' },
        templates: []
    };

    let state = JSON.parse(localStorage.getItem('up_state_v2')) || DEFAULTS;

    function saveState() {
        localStorage.setItem('up_state_v2', JSON.stringify(state));
    }

    function init() {
        if (document.getElementById('upload-assistant-panel')) return;
        createUI();
        setupEventListeners();
        setupDrag();
        updateScore();
        restorePanel();
    }

    function createUI() {
        const panel = document.createElement('div');
        panel.id = 'upload-assistant-panel';
        if (!state.isOpen) panel.classList.add('hidden');

        panel.innerHTML = `
            <div class="up-header" id="up-drag-handle">
                <div class="up-header-title">🚀 UPLOAD ASSISTANT</div>
                <div style="display:flex; gap:8px;">
                    <button class="up-icon-btn" id="up-reset-pos">🔄</button>
                    <button class="up-icon-btn" id="up-close-x">✕</button>
                </div>
            </div>
            <div class="up-body">
                <div class="up-score-card">
                    <div class="up-score-top">
                        <span style="font-size:0.8rem; font-weight:700;">STRENGTH</span>
                        <span class="up-score-value"><span id="up-score-val">0</span>/100</span>
                    </div>
                    <div class="up-progress"><div class="up-progress-bar" id="up-score-bar"></div></div>
                    <ul class="up-hints" id="up-hints"></ul>
                </div>

                <div class="up-field">
                    <div class="up-label-row"><span>TITLE</span> <span id="up-title-cnt">0/100</span></div>
                    <input type="text" class="up-input" id="up-title-in" maxlength="100" placeholder="Catchy title here...">
                </div>

                <div class="up-field">
                    <div class="up-label-row"><span>HASHTAGS (MAX 5)</span> <span id="up-tag-cnt">0/5</span></div>
                    <div class="up-tag-container" id="up-tag-cont">
                        <input type="text" class="up-tag-input" id="up-tag-in" placeholder="#lofi,#study,#focus...">
                    </div>
                </div>

                <div class="up-gen-tools">
                    <div class="up-label-row"><span>DESCRIPTION GENERATOR</span></div>
                    <div class="up-gen-grid">
                        <select class="up-select" id="up-gen-tone">
                            <option>Calm</option><option>Professional</option><option selected>Cozy</option>
                        </select>
                        <select class="up-select" id="up-gen-purpose">
                            <option selected>Relax</option><option>Study</option><option>Work</option><option>Sleep</option>
                        </select>
                    </div>
                    <button class="up-btn up-btn-primary" id="up-btn-gen" style="width:100%">✨ Generate Description</button>
                </div>

                <div class="up-field">
                    <div class="up-label-row"><span>DESCRIPTION</span> <span id="up-desc-cnt">0</span></div>
                    <textarea class="up-input" id="up-desc-in" placeholder="Generated text will appear here..."></textarea>
                </div>
            </div>
            <div class="up-footer">
                <button class="up-btn" id="up-copy-t">Title</button>
                <button class="up-btn" id="up-copy-d">Desc</button>
                <button class="up-btn up-btn-primary" id="up-copy-all">Copy ALL</button>
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

        // Sync initial
        titleIn.value = state.content.title;
        descIn.value = state.content.description;
        sr('up-title-cnt').innerText = `${state.content.title.length}/100`;
        sr('up-desc-cnt').innerText = state.content.description.length;
        renderTags();

        // Input events for real-time score
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

        // Hashtag CSV logic
        const processTags = () => {
            const val = tagIn.value.trim();
            if (!val) return;
            const newTags = val.split(',').map(t => t.trim().replace(/^#/, '')).filter(t => t !== '');
            let combined = [...new Set([...state.content.tags, ...newTags])];
            if (combined.length > 5) {
                combined = combined.slice(0, 5);
                showToast("Only 5 hashtags allowed!");
            }
            state.content.tags = combined;
            tagIn.value = '';
            renderTags();
            updateScore();
            saveState();
        };

        tagIn.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); processTags(); } };
        tagIn.onblur = processTags;
        tagIn.onpaste = (e) => { setTimeout(processTags, 10); };

        // Generator logic
        sr('up-btn-gen').onclick = generateDescription;

        // Copy logic
        sr('up-copy-t').onclick = () => copyText(state.content.title);
        sr('up-copy-d').onclick = () => copyText(state.content.description);
        sr('up-copy-all').onclick = () => {
            const tags = state.content.tags.map(t => `#${t}`).join(' ');
            copyText(`${state.content.title}\n\n${state.content.description}\n\n${tags}`);
        };

        sr('up-close-x').onclick = () => togglePanel(false);
        sr('up-global-open').onclick = () => togglePanel(true);
        sr('up-reset-pos').onclick = () => {
            state.position = { top: 80, left: 20 };
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
            chip.innerHTML = `#${tag} <span class="up-tag-remove">×</span>`;
            chip.querySelector('.up-tag-remove').onclick = () => {
                state.content.tags.splice(i, 1);
                renderTags();
                updateScore();
                saveState();
            };
            cont.insertBefore(chip, input);
        });
        document.getElementById('up-tag-cnt').innerText = `${state.content.tags.length}/5`;
    }

    function generateDescription() {
        const title = state.content.title || "this video";
        const tone = document.getElementById('up-gen-tone').value;
        const purpose = document.getElementById('up-gen-purpose').value;
        const tags = state.content.tags.map(t => `#${t}`).join(' ');
        const kw = state.content.tags[0] || "valuable content";

        const intro = {
            Calm: `Welcome to a moment of stillness. In today's upload, we explore "${title}".`,
            Cozy: `Make yourself at home! ✨ Today we're diving into "${title}" for some good vibes.`,
            Professional: `Welcome back. This session is a deep dive into "${title}", designed for clarity.`
        }[tone] || "";

        const body = {
            Relax: `If you're looking to unwind, this content centered around ${kw} is exactly what you need. Let the atmosphere take over.`,
            Study: `Maximize your productivity while focusing on ${kw}. This background set is optimized for deep work and concentration.`,
            Work: `Streamline your professional workflow. We cover the essentials of ${kw} to help you achieve your goals faster.`,
            Sleep: `Specifically crafted for rest. The gentle nature of this ${kw}-focused piece will guide you into a deep, restful sleep.`
        }[purpose] || "";

        const cta = "\n\n🔔 If you find this helpful, please Like and Subscribe to support the channel! It helps us create more content like this.";
        
        const fullDesc = `${tags}\n\n${intro}\n\n${body}${cta}\n\n#youtube #optimization #contentcreator`;

        document.getElementById('up-desc-in').value = fullDesc;
        state.content.description = fullDesc;
        document.getElementById('up-desc-cnt').innerText = fullDesc.length;
        updateScore();
        saveState();
        showToast("Description Generated!");
    }

    function updateScore() {
        const c = state.content;
        let score = 0;
        let hints = [];

        // Title (25)
        const tl = c.title.length;
        if (tl >= 45 && tl <= 70) score += 25;
        else if (tl > 0) { score += 10; hints.push("Title goal: 45-70 chars."); }

        // Desc (25)
        const dl = c.description.length;
        if (dl >= 200) score += 25;
        else if (dl >= 50) { score += 10; hints.push(`Add ${200-dl} more chars to Desc.`); }

        // Tags (20)
        const tc = c.tags.length;
        if (tc >= 3 && tc <= 5) score += 20;
        else if (tc > 0) { score += 10; hints.push("Aim for 3-5 hashtags."); }

        // Keyword Match (16)
        let matches = 0;
        c.tags.forEach(t => { if(c.title.toLowerCase().includes(t.toLowerCase())) matches++; });
        score += Math.min(16, matches * 8);
        if (matches === 0 && tc > 0) hints.push("Use tags in your Title.");

        // CTA (14)
        if (c.description.toLowerCase().includes('subscribe') || c.description.toLowerCase().includes('like')) score += 14;
        else hints.push("Add 'Subscribe' to Desc.");

        // Update UI
        const final = Math.min(100, score);
        document.getElementById('up-score-val').innerText = final;
        document.getElementById('up-score-bar').style.width = `${final}%`;
        document.getElementById('up-hints').innerHTML = hints.slice(0, 3).map(h => `<li>${h}</li>`).join('');
    }

    function setupDrag() {
        const panel = document.getElementById('upload-assistant-panel');
        const handle = document.getElementById('up-drag-handle');
        let isDragging = false;
        let startX, startY, initialTop, initialLeft;

        const start = (e) => {
            if (e.target.closest('button')) return;
            isDragging = true;
            const ev = e.touches ? e.touches[0] : e;
            startX = ev.clientX; startY = ev.clientY;
            initialTop = panel.offsetTop; initialLeft = panel.offsetLeft;
            panel.style.transition = 'none';
        };
        const move = (e) => {
            if (!isDragging) return;
            const ev = e.touches ? e.touches[0] : e;
            const dx = ev.clientX - startX; const dy = ev.clientY - startY;
            state.position.top = Math.max(0, Math.min(window.innerHeight - 100, initialTop + dy));
            state.position.left = Math.max(0, Math.min(window.innerWidth - 300, initialLeft + dx));
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

    function copyText(txt) {
        navigator.clipboard.writeText(txt).then(() => showToast("Copied!"));
    }

    function showToast(msg) {
        const t = document.getElementById('up-toast');
        t.innerText = msg; t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 2000);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
