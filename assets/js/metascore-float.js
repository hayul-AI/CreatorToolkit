// MetaScore floating panel controller (static, local-only)
(function () {
  const STORAGE_KEY = "metascore_state_v1"; // Match upload-panel.js state key

  // Pages to EXCLUDE (by path or filename substring)
  const EXCLUDE = ["guides", "about", "privacy", "terms", "contact"];

  function isExcludedPage() {
    const p = (location.pathname || "").toLowerCase();
    return EXCLUDE.some(x => p.includes(x));
  }

  function qs(sel, root=document) { return root.querySelector(sel); }

  function findExistingPanel() {
    return qs("#upload-assistant-panel") || qs("#metascorePanel") || qs(".metascore-panel");
  }

  function wrapAsFloating(panelEl) {
    if (panelEl.closest(".metascore-float")) return panelEl.closest(".metascore-float");

    const wrapper = document.createElement("div");
    wrapper.className = "metascore-float";
    wrapper.id = "metascoreFloatWrap";

    const inner = document.createElement("div");
    inner.className = "metascore-inner";

    panelEl.parentNode.insertBefore(wrapper, panelEl);
    inner.appendChild(panelEl);
    wrapper.appendChild(inner);

    return wrapper;
  }

  function setOpenState(isOpen) {
    try {
      let state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
      state.isOpen = isOpen;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("MetaScore state save failed", e);
    }
  }

  function getOpenState() {
    try {
      const state = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (state && typeof state.isOpen !== 'undefined') return state.isOpen;
    } catch (e) {}
    return true; // default open
  }

  function applyVisibility(wrapper, isOpen) {
    if (!wrapper) return;
    if (isOpen) {
      wrapper.classList.remove("is-hidden");
    } else {
      wrapper.classList.add("is-hidden");
    }
    // Also sync with the panel element itself if it uses .hidden
    const panel = qs("#upload-assistant-panel", wrapper);
    if (panel) panel.classList.toggle('hidden', !isOpen);
  }

  function bindCloseButton(wrapper) {
    const closeBtn =
      qs("#up-close-x", wrapper) ||
      qs("[data-metascore-close]", wrapper) ||
      qs(".metascore-close", wrapper);

    if (closeBtn && !closeBtn.__metascoreBound) {
      closeBtn.__metascoreBound = true;
      closeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        setOpenState(false);
        applyVisibility(wrapper, false);
      });
    }
  }

  function init() {
    if (isExcludedPage()) return;

    const panel = findExistingPanel();
    if (!panel) {
        if (!window._metascoreRetries) window._metascoreRetries = 0;
        if (window._metascoreRetries < 15) {
            window._metascoreRetries++;
            setTimeout(init, 200);
        }
        return;
    }

    const wrapper = wrapAsFloating(panel);
    const open = getOpenState();
    
    // Initial state sync
    applyVisibility(wrapper, open);
    bindCloseButton(wrapper);

    // Watch for dynamic changes to the panel (e.g. if it's re-rendered)
    const observer = new MutationObserver(() => {
        bindCloseButton(wrapper);
    });
    observer.observe(wrapper, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
