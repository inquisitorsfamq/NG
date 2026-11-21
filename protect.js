/* ============================================================
   INQUISITORS FAMQ 2.0 - ADVANCED ANTI-COPY & CONTENT PROTECTION
   Protects text, media, assets, and source code from unauthorized copying
============================================================ */

(function() {
  'use strict';

  let lastToastTime = 0;

  function notifyProtected() {
    const now = Date.now();
    if (now - lastToastTime < 1500) return; // Debounce 1.5s
    lastToastTime = now;

    // Determine current language
    let isRu = false;
    try {
      const saved = localStorage.getItem('inq_famq_lang');
      if (saved === 'ru' || (typeof currentLang !== 'undefined' && currentLang === 'ru')) {
        isRu = true;
      }
    } catch (e) {}

    const msg = isRu 
      ? '🛡️ Копирование материалов сайта защищено Inquisitors Famq!' 
      : '🛡️ Копіювання матеріалів сайту захищено Inquisitors Famq!';

    // Trigger existing toast systems if available
    if (typeof showToast === 'function') {
      showToast(msg);
    } else if (typeof showMerchToast === 'function') {
      showMerchToast(msg);
    } else {
      showCustomProtectionToast(msg);
    }

    // Audio warning feedback
    if (typeof playSfx === 'function') {
      try { playSfx('click'); } catch (e) {}
    }
  }

  function showCustomProtectionToast(msg) {
    let toast = document.getElementById('protectionToastAlert');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'protectionToastAlert';
      toast.className = 'fixed bottom-6 right-6 z-[9999] px-5 py-3.5 rounded-2xl bg-darkbg-950/95 border border-tiffany text-white text-xs sm:text-sm font-orbitron font-bold shadow-[0_0_30px_rgba(10,186,181,0.6)] backdrop-blur-xl flex items-center gap-3 transition-all duration-300 transform translate-y-32 opacity-0 pointer-events-none';
      toast.innerHTML = `<i class="fa-solid fa-shield-halved text-tiffany text-lg animate-pulse"></i> <span>${msg}</span>`;
      document.body.appendChild(toast);
    } else {
      toast.querySelector('span').textContent = msg;
    }

    toast.classList.remove('translate-y-32', 'opacity-0');
    setTimeout(() => {
      toast.classList.add('translate-y-32', 'opacity-0');
    }, 2800);
  }

  // 1. Block Context Menu (Right Click)
  document.addEventListener('contextmenu', function(e) {
    if (e.target && e.target.closest && e.target.closest('input, textarea, [contenteditable="true"]')) {
      return; // Allow right click inside text fields
    }
    e.preventDefault();
    notifyProtected();
    return false;
  }, { passive: false, capture: true });

  // 2. Block Selection Copying
  document.addEventListener('copy', function(e) {
    if (e.target && e.target.closest && e.target.closest('input, textarea, [contenteditable="true"], .allow-copy')) {
      return; // Allow copying inside inputs
    }
    e.preventDefault();
    notifyProtected();
    return false;
  }, { passive: false, capture: true });

  // 3. Block Text Cutting
  document.addEventListener('cut', function(e) {
    if (e.target && e.target.closest && e.target.closest('input, textarea, [contenteditable="true"]')) {
      return;
    }
    e.preventDefault();
    notifyProtected();
    return false;
  }, { passive: false, capture: true });

  // 4. Block Dragging of Images & Media
  document.addEventListener('dragstart', function(e) {
    if (e.target && e.target.closest && e.target.closest('input, textarea')) {
      return;
    }
    e.preventDefault();
    return false;
  }, { passive: false, capture: true });

  // 5. Block Key Combinations (Ctrl+C, Ctrl+U, Ctrl+S, Ctrl+P, Ctrl+A, F12, DevTools)
  document.addEventListener('keydown', function(e) {
    const isInput = e.target && e.target.closest && e.target.closest('input, textarea, [contenteditable="true"]');
    const isCtrlOrCmd = e.ctrlKey || e.metaKey;
    const key = (e.key || '').toLowerCase();

    // DevTools: F12
    if (e.key === 'F12') {
      e.preventDefault();
      notifyProtected();
      return false;
    }

    // DevTools: Ctrl+Shift+I / J / C
    if (isCtrlOrCmd && e.shiftKey && ['i', 'j', 'c'].includes(key)) {
      e.preventDefault();
      notifyProtected();
      return false;
    }

    // View Source: Ctrl+U
    if (isCtrlOrCmd && key === 'u') {
      e.preventDefault();
      notifyProtected();
      return false;
    }

    // Save Page: Ctrl+S
    if (isCtrlOrCmd && key === 's') {
      e.preventDefault();
      notifyProtected();
      return false;
    }

    // Print: Ctrl+P
    if (isCtrlOrCmd && key === 'p') {
      e.preventDefault();
      notifyProtected();
      return false;
    }

    // Select All (Ctrl+A) or Copy (Ctrl+C) outside input fields
    if (!isInput && isCtrlOrCmd && ['a', 'c', 'x'].includes(key)) {
      e.preventDefault();
      notifyProtected();
      return false;
    }
  }, { passive: false, capture: true });

  // 6. Injection of anti-selection style directly to document head
  const css = `
    html, body {
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
      user-select: none !important;
      -webkit-touch-callout: none !important;
    }
    img, svg, video {
      -webkit-user-drag: none !important;
      user-drag: none !important;
      -webkit-touch-callout: none !important;
    }
    input, textarea, [contenteditable="true"], .allow-select {
      -webkit-user-select: text !important;
      -moz-user-select: text !important;
      -ms-user-select: text !important;
      user-select: text !important;
    }
  `;

  if (document.head) {
    const style = document.createElement('style');
    style.id = 'inqAntiCopyStyle';
    style.textContent = css;
    document.head.appendChild(style);
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      const style = document.createElement('style');
      style.id = 'inqAntiCopyStyle';
      style.textContent = css;
      document.head.appendChild(style);
    });
  }

})();
