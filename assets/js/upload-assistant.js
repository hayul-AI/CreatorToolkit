class UploadAssistant extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        // Default State & Settings
        this.state = {
            isOpen: true,
            position: { x: 20, y: 80 }, 
            content: {
                title: '',
                description: '',
                tags: []
            },
            settings: {
                titleMin: 40, titleMax: 70,
                descMin: 200,
                tagMin: 3, tagMax: 15,
                weights: { title: 30, desc: 30, tags: 20, cta: 10, keywords: 10 },
                ctaKeywords: ['subscribe', 'like', 'comment', 'link', 'check out', 'playlist'],
                negativeKeywords: ['fuck', 'shit', 'scam']
            },
            templates: [] 
        };

        // Load from LocalStorage
        const savedState = localStorage.getItem('ua_state');
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                this.state = { 
                    ...this.state, 
                    ...parsed, 
                    settings: { ...this.state.settings, ...parsed.settings },
                    content: { ...this.state.content, ...parsed.content }
                };
            } catch (e) { console.error('Failed to load state', e); }
        }

        this.currentPage = this.detectContext();
    }

    detectContext() {
        const path = window.location.pathname;
        if (path.includes('thumbnail')) return 'Thumbnail Maker';
        if (path.includes('title')) return 'Video Title Generator';
        if (path.includes('keyword')) return 'Keyword Generator';
        if (path.includes('tag')) return 'Tag Generator';
        if (path.includes('upload')) return 'Upload Time';
        if (path.includes('about')) return 'About Page';
        return 'Dashboard';
    }

    connectedCallback() {
        this.render();
        this.setupDrag();
        this.setupEvents();
        this.updateScore(); 
        this.restorePosition();
    }

    saveState() {
        localStorage.setItem('ua_state', JSON.stringify(this.state));
    }

    render() {
        const s = this.state;
        
        const icons = {
            close: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>`,
            open: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>`,
            drag: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>`,
            copy: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2-2v1"/></svg>`,
            magic: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`
        };

        this.shadowRoot.innerHTML = `
        <style>
            :host {
                --ua-bg: #ffffff;
                --ua-border: #e2e8f0;
                --ua-text: #1e293b;
                --ua-accent: #E11D48;
                --ua-accent-hover: #be123c;
                --ua-muted: #64748b;
                --ua-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.05);
                --ua-radius: 12px;
                font-family: 'Inter', system-ui, sans-serif;
                z-index: 9999;
                position: fixed;
                top: 0; left: 0;
            }

            :host-context([data-theme="dark"]) {
                --ua-bg: #0f172a;
                --ua-border: #334155;
                --ua-text: #f8fafc;
                --ua-muted: #94a3b8;
            }

            .ua-panel {
                width: 350px;
                background: var(--ua-bg);
                border: 1px solid var(--ua-border);
                border-radius: var(--ua-radius);
                box-shadow: var(--ua-shadow);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                transition: opacity 0.2s;
                max-height: 85vh;
                display: ${s.isOpen ? 'flex' : 'none'};
            }

            .ua-minimized {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 50px;
                height: 50px;
                background: var(--ua-accent);
                color: white;
                border-radius: 50%;
                display: ${s.isOpen ? 'none' : 'flex'};
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(225, 29, 72, 0.4);
                z-index: 10000;
                transition: transform 0.2s;
            }
            .ua-minimized:hover { transform: scale(1.1); }

            .ua-header {
                padding: 10px 15px;
                background: var(--ua-bg);
                border-bottom: 1px solid var(--ua-border);
                display: flex;
                align-items: center;
                justify-content: space-between;
                cursor: grab;
                user-select: none;
            }
            .ua-header:active { cursor: grabbing; }
            .ua-title-area { display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 0.9rem; color: var(--ua-text); }
            .ua-badge {
                font-size: 0.7rem;
                background: var(--ua-muted);
                color: white;
                padding: 2px 6px;
                border-radius: 4px;
                opacity: 0.8;
            }
            .ua-close-btn {
                background: none; border: none; cursor: pointer; color: var(--ua-muted);
                padding: 4px; border-radius: 4px; display: flex;
            }
            .ua-close-btn:hover { background: var(--ua-border); color: var(--ua-accent); }

            .ua-body {
                padding: 15px;
                overflow-y: auto;
                flex: 1;
            }

            .ua-field { margin-bottom: 15px; }
            .ua-label { 
                display: flex; justify-content: space-between; 
                font-size: 0.8rem; font-weight: 600; color: var(--ua-muted); margin-bottom: 5px; 
            }
            .ua-input {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid var(--ua-border);
                border-radius: 6px;
                background: var(--ua-bg);
                color: var(--ua-text);
                font-size: 0.9rem;
                box-sizing: border-box;
                font-family: inherit;
            }
            .ua-input:focus { outline: 2px solid var(--ua-accent); border-color: transparent; }
            textarea.ua-input { resize: vertical; min-height: 80px; }

            .ua-tags-input {
                border: 1px solid var(--ua-border);
                border-radius: 6px;
                padding: 6px;
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                background: var(--ua-bg);
            }
            .ua-tag-chip {
                background: #f1f5f9;
                color: #334155;
                font-size: 0.8rem;
                padding: 2px 8px;
                border-radius: 99px;
                display: flex;
                align-items: center;
                gap: 4px;
            }
            .ua-tag-chip span { cursor: pointer; font-weight: bold; color: #94a3b8; }
            .ua-tag-chip span:hover { color: var(--ua-accent); }
            .ua-tags-entry {
                border: none; outline: none; background: transparent;
                flex: 1; min-width: 60px; font-size: 0.9rem; color: var(--ua-text);
            }

            .ua-score-area {
                background: #f8fafc;
                border: 1px solid var(--ua-border);
                border-radius: 8px;
                padding: 12px;
                margin-bottom: 15px;
            }
            .ua-score-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
            .ua-score-val { font-size: 1.2rem; font-weight: 800; color: var(--ua-accent); }
            .ua-progress-bg { height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; }
            .ua-progress-fill { height: 100%; background: var(--ua-accent); width: 0%; transition: width 0.5s ease; }
            
            .ua-hints { list-style: none; padding: 0; margin: 8px 0 0 0; font-size: 0.8rem; color: var(--ua-muted); }
            .ua-hints li { margin-bottom: 4px; display: flex; align-items: center; gap: 6px; }
            .ua-hints li::before { content: '•'; color: var(--ua-accent); }

            .ua-accordion {
                border: 1px solid var(--ua-border); border-radius: 6px; overflow: hidden; margin-bottom: 10px;
            }
            .ua-acc-btn {
                width: 100%; text-align: left; padding: 8px 12px; background: #f1f5f9;
                border: none; font-size: 0.85rem; font-weight: 600; color: #334155;
                cursor: pointer; display: flex; justify-content: space-between;
            }
            .ua-acc-content { display: none; padding: 10px; background: var(--ua-bg); color: var(--ua-text); }
            .ua-acc-content.open { display: block; }
            
            .ua-setting-row { display: flex; justify-content: space-between; margin-bottom: 8px; align-items: center; font-size: 0.8rem; }
            .ua-setting-row input { width: 50px; padding: 4px; text-align: center; border: 1px solid var(--ua-border); background: var(--ua-bg); color: var(--ua-text); }

            .ua-footer {
                padding: 10px 15px;
                border-top: 1px solid var(--ua-border);
                display: flex;
                gap: 8px;
                background: #f8fafc;
            }
            .ua-btn {
                flex: 1;
                padding: 8px;
                border: 1px solid var(--ua-border);
                background: white;
                color: #334155;
                border-radius: 6px;
                font-size: 0.8rem;
                font-weight: 600;
                cursor: pointer;
                display: flex; align-items: center; justify-content: center; gap: 6px;
                transition: all 0.2s;
            }
            .ua-btn:hover { background: #f1f5f9; border-color: var(--ua-muted); }
            .ua-btn-primary { background: var(--ua-accent); color: white; border: none; }
            .ua-btn-primary:hover { background: var(--ua-accent-hover); }

            .ua-toast {
                position: absolute; bottom: 60px; left: 50%; transform: translateX(-50%);
                background: #1e293b; color: white; padding: 6px 12px;
                border-radius: 20px; font-size: 0.8rem; opacity: 0; pointer-events: none; transition: opacity 0.3s;
            }
            .ua-toast.show { opacity: 1; }

        </style>

        <div class="ua-minimized" id="toggle-btn" title="Open Upload Assistant">
            ${icons.open}
        </div>

        <div class="ua-panel" id="panel">
            <div class="ua-header" id="drag-handle">
                <div class="ua-title-area">
                    <span>${icons.drag} Upload Assistant</span>
                    <span class="ua-badge">${this.currentPage}</span>
                </div>
                <button class="ua-close-btn" id="close-btn">${icons.close}</button>
            </div>

            <div class="ua-body">
                <div class="ua-score-area">
                    <div class="ua-score-header">
                        <span style="font-size: 0.9rem; font-weight:600; color: var(--ua-text);">Score</span>
                        <span class="ua-score-val" id="score-val">0/100</span>
                    </div>
                    <div class="ua-progress-bg">
                        <div class="ua-progress-fill" id="score-bar"></div>
                    </div>
                    <ul class="ua-hints" id="hints-list"></ul>
                </div>

                <div class="ua-field">
                    <div class="ua-label">
                        <span>Video Title</span>
                        <span id="title-counter">0/100</span>
                    </div>
                    <input type="text" class="ua-input" id="title-input" placeholder="Enter video title..." value="${s.content.title}" maxlength="100">
                </div>

                <div class="ua-field">
                    <div class="ua-label">
                        <span>Description</span>
                    </div>
                    <textarea class="ua-input" id="desc-input" placeholder="Video description (CTA, Links)...">${s.content.description}</textarea>
                </div>

                <div class="ua-field">
                    <div class="ua-label"><span>Hashtags (Enter to add)</span></div>
                    <div class="ua-tags-input" id="tags-container">
                        <input type="text" class="ua-tags-entry" id="tag-input" placeholder="Add tag...">
                    </div>
                </div>

                <div class="ua-accordion">
                    <button class="ua-acc-btn" onclick="this.nextElementSibling.classList.toggle('open')">
                        ⚙️ Tuning Rules <span>▼</span>
                    </button>
                    <div class="ua-acc-content">
                        <div class="ua-setting-row"><label>Title Min</label> <input type="number" id="s-title-min" value="${s.settings.titleMin}"></div>
                        <div class="ua-setting-row"><label>Title Max</label> <input type="number" id="s-title-max" value="${s.settings.titleMax}"></div>
                        <div class="ua-setting-row"><label>Desc Min</label> <input type="number" id="s-desc-min" value="${s.settings.descMin}"></div>
                        <div class="ua-setting-row"><label>Weight: Title</label> <input type="number" id="s-w-title" value="${s.settings.weights.title}"></div>
                        <div class="ua-setting-row"><label>Weight: Desc</label> <input type="number" id="s-w-desc" value="${s.settings.weights.desc}"></div>
                        <button class="ua-btn" id="save-settings" style="width:100%; margin-top:8px;">Save Settings</button>
                    </div>
                </div>

                <div class="ua-accordion">
                    <button class="ua-acc-btn" onclick="this.nextElementSibling.classList.toggle('open')">
                        💾 Templates <span>▼</span>
                    </button>
                    <div class="ua-acc-content">
                        <div style="display:flex; gap:5px; margin-bottom:10px;">
                            <input type="text" id="tpl-name" class="ua-input" placeholder="Name" style="padding:4px;">
                            <button class="ua-btn ua-btn-primary" id="save-tpl">Save</button>
                        </div>
                        <div id="tpl-list" style="max-height:100px; overflow-y:auto; font-size:0.8rem; color: var(--ua-text);"></div>
                    </div>
                </div>

            </div>

            <div class="ua-footer">
                <button class="ua-btn" id="auto-improve" title="Auto Improve">${icons.magic} Improve</button>
                <button class="ua-btn" id="copy-title" title="Copy Title">Title</button>
                <button class="ua-btn" id="copy-desc" title="Copy Desc">Desc</button>
                <button class="ua-btn ua-btn-primary" id="copy-all" title="Copy All">${icons.copy} All</button>
            </div>

            <div class="ua-toast" id="toast">Copied to clipboard!</div>
        </div>
        `;
    }

    setupEvents() {
        const sr = this.shadowRoot;
        
        sr.getElementById('toggle-btn').onclick = () => this.togglePanel(true);
        sr.getElementById('close-btn').onclick = () => this.togglePanel(false);

        const titleInput = sr.getElementById('title-input');
        const descInput = sr.getElementById('desc-input');
        const tagInput = sr.getElementById('tag-input');
        const tagsContainer = sr.getElementById('tags-container');

        titleInput.oninput = (e) => {
            this.state.content.title = e.target.value;
            sr.getElementById('title-counter').innerText = `${e.target.value.length}/100`;
            this.updateScore();
            this.saveState();
        };

        descInput.oninput = (e) => {
            this.state.content.description = e.target.value;
            this.updateScore();
            this.saveState();
        };

        this.renderTags();
        
        tagInput.onkeydown = (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const val = e.target.value.trim().replace(/^#/, '');
                if (val && this.state.content.tags.length < this.state.settings.tagMax) {
                    this.state.content.tags.push(val);
                    e.target.value = '';
                    this.renderTags();
                    this.updateScore();
                    this.saveState();
                }
            }
            if (e.key === 'Backspace' && e.target.value === '' && this.state.content.tags.length > 0) {
                this.state.content.tags.pop();
                this.renderTags();
                this.updateScore();
                this.saveState();
            }
        };

        tagsContainer.onclick = (e) => {
             if (e.target === tagsContainer) tagInput.focus();
        };

        sr.getElementById('copy-title').onclick = () => this.copyToClipboard(this.state.content.title);
        sr.getElementById('copy-desc').onclick = () => this.copyToClipboard(this.state.content.description);
        sr.getElementById('copy-all').onclick = () => {
            const tags = this.state.content.tags.map(t => `#${t}`).join(' ');
            const text = `${this.state.content.title}

${this.state.content.description}

${tags}`;
            this.copyToClipboard(text);
        };

        sr.getElementById('auto-improve').onclick = () => this.autoImprove();

        sr.getElementById('save-settings').onclick = () => {
            this.state.settings.titleMin = parseInt(sr.getElementById('s-title-min').value);
            this.state.settings.titleMax = parseInt(sr.getElementById('s-title-max').value);
            this.state.settings.descMin = parseInt(sr.getElementById('s-desc-min').value);
            this.state.settings.weights.title = parseInt(sr.getElementById('s-w-title').value);
            this.state.settings.weights.desc = parseInt(sr.getElementById('s-w-desc').value);
            this.updateScore();
            this.saveState();
            this.showToast('Settings Saved!');
        };

        this.renderTemplates();
        sr.getElementById('save-tpl').onclick = () => {
            const name = sr.getElementById('tpl-name').value.trim();
            if(!name) return;
            this.state.templates.push({
                name,
                content: { ...this.state.content },
                settings: { ...this.state.settings }
            });
            sr.getElementById('tpl-name').value = '';
            this.renderTemplates();
            this.saveState();
        };
    }

    renderTags() {
        const container = this.shadowRoot.getElementById('tags-container');
        const input = this.shadowRoot.getElementById('tag-input');
        const chips = container.querySelectorAll('.ua-tag-chip');
        chips.forEach(c => c.remove());

        this.state.content.tags.forEach((tag, index) => {
            const chip = document.createElement('div');
            chip.className = 'ua-tag-chip';
            chip.innerHTML = `#${tag} <span data-idx="${index}">×</span>`;
            chip.querySelector('span').onclick = (e) => {
                e.stopPropagation();
                this.state.content.tags.splice(index, 1);
                this.renderTags();
                this.updateScore();
                this.saveState();
            };
            container.insertBefore(chip, input);
        });
    }

    renderTemplates() {
        const list = this.shadowRoot.getElementById('tpl-list');
        list.innerHTML = '';
        this.state.templates.forEach((tpl, idx) => {
            const div = document.createElement('div');
            div.style.cssText = "display:flex; justify-content:space-between; padding:4px; border-bottom:1px solid #eee; align-items: center;";
            div.innerHTML = `<span>${tpl.name}</span>`;
            
            const btnGroup = document.createElement('div');
            btnGroup.style.display = 'flex';
            btnGroup.style.gap = '4px';
            
            const loadBtn = document.createElement('button');
            loadBtn.innerText = "Load";
            loadBtn.style.cssText = "padding: 2px 6px; font-size: 0.7rem; cursor: pointer;";
            loadBtn.onclick = () => {
                this.state.content = { ...tpl.content };
                this.state.settings = { ...tpl.settings };
                this.shadowRoot.getElementById('title-input').value = this.state.content.title;
                this.shadowRoot.getElementById('desc-input').value = this.state.content.description;
                this.renderTags();
                this.updateScore();
                this.saveState();
                this.showToast('Template Loaded');
            };

            const delBtn = document.createElement('button');
            delBtn.innerText = "X";
            delBtn.style.cssText = "padding: 2px 6px; font-size: 0.7rem; cursor: pointer; color: red;";
            delBtn.onclick = () => {
                this.state.templates.splice(idx, 1);
                this.renderTemplates();
                this.saveState();
            };

            btnGroup.append(loadBtn, delBtn);
            div.appendChild(btnGroup);
            list.appendChild(div);
        });
    }

    updateScore() {
        const s = this.state.settings;
        const c = this.state.content;
        let score = 0;
        let maxScore = s.weights.title + s.weights.desc + s.weights.tags + s.weights.cta + s.weights.keywords;
        let hints = [];

        if (c.title.length >= s.titleMin && c.title.length <= s.titleMax) {
            score += s.weights.title;
        } else {
            hints.push(`Title length: ${s.titleMin}-${s.titleMax} chars`);
        }

        if (c.description.length >= s.descMin) {
            score += s.weights.desc;
        } else {
            hints.push(`Description: +${s.descMin - c.description.length} chars`);
        }

        if (c.tags.length >= s.tagMin && c.tags.length <= s.tagMax) {
            score += s.weights.tags;
        } else {
            hints.push(`Tags: need ${s.tagMin - c.tags.length} more`);
        }

        const hasCTA = s.ctaKeywords.some(k => c.description.toLowerCase().includes(k));
        if (hasCTA) score += s.weights.cta;
        else hints.push(`Add CTA (Subscribe, Like)`);

        const titleWords = c.title.toLowerCase().split(' ').filter(w => w.length > 3);
        const hasKeyword = titleWords.some(w => c.tags.includes(w));
        if (hasKeyword) score += s.weights.keywords;
        else if (titleWords.length > 0) hints.push(`Add "${titleWords[0]}" to tags`);

        const hasNegative = s.negativeKeywords.some(k => c.title.toLowerCase().includes(k) || c.description.toLowerCase().includes(k));
        if (hasNegative) score -= 20;

        const finalScore = Math.max(0, Math.min(100, Math.round((score / maxScore) * 100)));
        this.shadowRoot.getElementById('score-val').innerText = `${finalScore}/100`;
        this.shadowRoot.getElementById('score-bar').style.width = `${finalScore}%`;
        
        const hintsList = this.shadowRoot.getElementById('hints-list');
        hintsList.innerHTML = hints.slice(0, 3).map(h => `<li>${h}</li>`).join('');
    }

    autoImprove() {
        const c = this.state.content;
        let changed = false;

        if (c.title.length < 20) {
            c.title += " | Official Guide 2026";
            changed = true;
        }

        if (!c.description.includes('Subscribe')) {
            c.description += "

👉 Don't forget to Subscribe and Like!";
            changed = true;
        }

        if (c.tags.length === 0 && c.title.length > 0) {
            const words = c.title.split(' ').filter(w => w.length > 3).slice(0, 3);
            c.tags.push(...words);
            changed = true;
        }

        if (changed) {
            this.shadowRoot.getElementById('title-input').value = c.title;
            this.shadowRoot.getElementById('desc-input').value = c.description;
            this.renderTags();
            this.updateScore();
            this.saveState();
            this.showToast('Auto-Improved!');
        } else {
            this.showToast('Already good!');
        }
    }

    togglePanel(isOpen) {
        this.state.isOpen = isOpen;
        this.shadowRoot.getElementById('panel').style.display = isOpen ? 'flex' : 'none';
        this.shadowRoot.getElementById('toggle-btn').style.display = isOpen ? 'none' : 'flex';
        this.saveState();
    }

    restorePosition() {
        const p = this.shadowRoot.getElementById('panel');
        p.style.left = `${this.state.position.x}px`;
        p.style.top = `${this.state.position.y}px`;
    }

    setupDrag() {
        const panel = this.shadowRoot.getElementById('panel');
        const handle = this.shadowRoot.getElementById('drag-handle');
        
        let isDragging = false;
        let startX, startY, initialLeft, initialTop;

        const start = (e) => {
            if (!handle.contains(e.target) && e.target !== handle) return;
            if (e.target.closest('button')) return;

            isDragging = true;
            const clientX = e.clientX || e.touches[0].clientX;
            const clientY = e.clientY || e.touches[0].clientY;
            
            startX = clientX;
            startY = clientY;
            
            const rect = panel.getBoundingClientRect();
            initialLeft = rect.left;
            initialTop = rect.top;
            
            e.preventDefault(); 
        };

        const move = (e) => {
            if (!isDragging) return;
            
            const clientX = e.clientX || e.touches[0].clientX;
            const clientY = e.clientY || e.touches[0].clientY;
            
            const dx = clientX - startX;
            const dy = clientY - startY;

            let newLeft = initialLeft + dx;
            let newTop = initialTop + dy;
            
            const maxLeft = window.innerWidth - panel.offsetWidth;
            const maxTop = window.innerHeight - panel.offsetHeight;

            newLeft = Math.max(0, Math.min(newLeft, maxLeft));
            newTop = Math.max(0, Math.min(newTop, maxTop));

            panel.style.left = `${newLeft}px`;
            panel.style.top = `${newTop}px`;
            
            this.state.position = { x: newLeft, y: newTop };
        };

        const end = () => {
            if(isDragging) {
                isDragging = false;
                this.saveState();
            }
        };

        handle.addEventListener('mousedown', start);
        window.addEventListener('mousemove', move);
        window.addEventListener('mouseup', end);

        handle.addEventListener('touchstart', start, {passive: false});
        window.addEventListener('touchmove', move, {passive: false});
        window.addEventListener('touchend', end);
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showToast('Copied!');
        });
    }

    showToast(msg) {
        const t = this.shadowRoot.getElementById('toast');
        t.innerText = msg;
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 2000);
    }
}

customElements.define('upload-assistant', UploadAssistant);
