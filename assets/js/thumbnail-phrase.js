(function () {
  const $ = (id) => document.getElementById(id);

  const titleEl = $("tpTitle");
  const styleEl = $("tpStyle");
  const genBtn = $("tpGenerate");

  const statusEl = $("tpStatus");
  const progressEl = $("tpProgress");
  const outputEl = $("tpOutput");
  const copyAllBtn = $("tpCopyAll");
  const copiedEl = $("tpCopied");

  if (!genBtn || !outputEl) return;

  function setStatus(t){ if (statusEl) statusEl.textContent = t; }
  function setProgress(p){ if (progressEl) progressEl.style.width = Math.max(0, Math.min(100, p)) + "%"; }
  function escapeHTML(s){
    return (s || "").replace(/[&<>"']/g, (c) => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[c]));
  }

  const BLOCK = ["kill","hate","racist","sex","porn","drug","weapon","bomb","suicide","nazi"];
  function isSafe(text){
    const t = (text || "").toLowerCase();
    return !BLOCK.some(w => t.includes(w));
  }

  function normalizeTitle(raw){
    return (raw || "").trim().replace(/\s+/g, " ");
  }

  function extractKeywords(title){
    const stop = new Set(["the","a","an","and","or","of","to","in","for","with","on","at","by","from","is","are","be","make","makes","how","why","what","when","your","you"]);
    const clean = title.toLowerCase().replace(/[\[\](){}:;,.!?'"“”‘’]/g, " ").replace(/\s+/g, " ").trim();
    const words = clean.split(" ").filter(w => w && !stop.has(w) && w.length >= 3);
    const freq = {};
    for (const w of words) freq[w] = (freq[w] || 0) + 1;
    const ranked = Object.keys(freq).sort((a,b)=>freq[b]-freq[a]);
    const k1 = ranked[0] || "this";
    const k2 = ranked.find(w => w !== k1) || k1;
    return { k1, k2 };
  }

  function dedupe(arr){
    const seen = new Set();
    const out = [];
    for (const x of arr){
      const key = x.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(x);
    }
    return out;
  }

  function pickTemplates(style){
    const T = {
      aggressive: ["Stop doing this", "You’re doing it wrong", "Fix this NOW", "Big mistake", "Don’t waste time", "This ruins {K}", "Avoid this trap", "Do NOT ignore this", "{K} fails here", "Watch before you start"],
      curiosity: ["Most people miss this", "The hidden reason", "Wait… why does this work?", "Nobody talks about this", "This changes everything", "The real truth", "One thing you need", "Try this once", "What happens next?", "The secret behind {K}"],
      contrast: ["Good vs Bad", "Before vs After", "This vs That", "Beginner vs Pro", "Common vs Correct", "Easy vs Hard way", "What pros do", "What beginners do", "Right way only", "Small change, big result"],
      natural: ["Quick tip", "Simple fix", "Try this", "Easy upgrade", "Better results", "Start here", "Do this first", "One small tweak", "Keep it simple", "Made for beginners"],
      expert: ["Pro technique", "Expert checklist", "Best practice", "Do it like this", "Step-by-step", "The proven method", "High-impact tip", "Quality upgrade", "Reliable workflow", "Industry standard"]
    };
    return T[style] || T.curiosity;
  }

  function fillTemplate(tpl, kw){
    return tpl.replace(/\{K\}/g, kw.k1).replace(/\{K2\}/g, kw.k2);
  }

  function clampWords(text, minW=2, maxW=6){
    const w = text.trim().split(/\s+/);
    if (w.length > maxW) return w.slice(0, maxW).join(" ");
    if (w.length < minW) return (w.join(" ") + " now").split(/\s+/).slice(0, minW).join(" ");
    return text.trim();
  }

  async function copyText(t){
    try { await navigator.clipboard.writeText(t); return true; } catch(e) {
      const ta = document.createElement("textarea"); ta.value = t; ta.style.position = "fixed"; ta.style.left = "-9999px";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); document.body.removeChild(ta); return true; } catch(err) { document.body.removeChild(ta); return false; }
    }
  }

  function render(items, styleLabel){
    outputEl.innerHTML = items.map((p, idx) => `
      <div class="result-row result-card-ai" style="display:flex; cursor:default; min-height:auto; margin-bottom:12px; padding:1rem; align-items:center; justify-content:space-between;">
        <div class="result-main">
          <div class="result-phrase" style="font-weight:800; font-size:1.1rem;">${escapeHTML(p)}</div>
          <div class="result-sub" style="margin-top:4px; font-size:0.8rem; opacity:0.7;">
            <span class="pill" style="background:var(--brand-red-soft); color:var(--brand-red); padding:2px 8px; border-radius:100px; font-weight:700;">${escapeHTML(styleLabel)}</span>
            • ${p.length} chars
          </div>
        </div>
        <button class="btn-outline tp-copy" data-i="${idx}" style="height:36px; padding:0 12px; font-size:0.8rem;" type="button">Copy</button>
      </div>
    `).join("") || `<div class="result-empty">No phrases generated.</div>`;

    outputEl.querySelectorAll(".tp-copy").forEach(b => {
      b.addEventListener("click", async () => {
        const i = Number(b.getAttribute("data-i"));
        const ok = await copyText(items[i] || "");
        b.textContent = ok ? "Saved!" : "Error";
        setTimeout(()=> b.textContent = "Copy", 1200);
      });
    });
  }

  function styleLabelFromValue(v){
    return ({aggressive:"공격적인", curiosity:"호기심유발", contrast:"대조적인", natural:"자연스러운", expert:"전문가처럼"})[v] || "호기심유발";
  }

  function generate(){
    const title = normalizeTitle(titleEl ? titleEl.value : "");
    const style = styleEl ? styleEl.value : "curiosity";
    if (!title) { titleEl.focus(); return; }

    setStatus("Generating...");
    setProgress(20);

    setTimeout(() => {
      try {
        const kw = extractKeywords(title);
        let phrases = pickTemplates(style).map(t => fillTemplate(t, kw)).map(p => clampWords(p, 2, 6));
        if (kw.k1) { phrases.push(clampWords(`The ${kw.k1} fix`, 2, 6)); phrases.push(clampWords(`${kw.k1} — do this`, 2, 6)); }
        phrases = dedupe(phrases).filter(isSafe).slice(0, 10);
        render(phrases, styleLabelFromValue(style));
        setProgress(100);
        setStatus("Done");
      } catch(e) { setStatus("Error"); setProgress(0); }
    }, 200);
  }

  genBtn.addEventListener("click", generate);
  if (titleEl) titleEl.addEventListener("keydown", (e) => { if(e.key==="Enter") generate(); });
  if (copyAllBtn) copyAllBtn.addEventListener("click", async () => {
    const text = Array.from(outputEl.querySelectorAll(".result-phrase")).map(el => el.textContent.trim()).join("
");
    const ok = await copyText(text);
    copyAllBtn.textContent = ok ? "All Copied!" : "Error";
    setTimeout(()=> copyAllBtn.textContent = "Copy All", 1500);
  });

  setStatus("Ready");
  setProgress(0);
})();
