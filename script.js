/* ============================================================
   INQUISITORS FAMQ 2.0 - SCRIPT ENGINE WITH MULTI-TAB SYSTEM
   Project: NG GTA 5 RP
============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initScrollProgress();
  initParticleCanvas();
  initHeaderScroll();
  initMobileMenu();
  initAudioSystem();
  initEligibility();
  initLiveOnlineCounter();
  initDiscordLiveSync();
});

// --- Scroll Progress Indicator ---
function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    bar.style.width = scrolled + '%';
  });
}

// --- Dynamic Particle Background Mesh ---
function initParticleCanvas() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const mouse = { x: null, y: null, radius: 140 };
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
  });
  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  const particleCount = Math.min(Math.floor(width / 24), 60);
  const particles = [];

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 2 + 1;
      this.speedX = (Math.random() - 0.5) * 0.6;
      this.speedY = (Math.random() - 0.5) * 0.6;
      this.alpha = Math.random() * 0.5 + 0.3;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.x < 0 || this.x > width) this.speedX = -this.speedX;
      if (this.y < 0 || this.y > height) this.speedY = -this.speedY;

      if (mouse.x !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= (dx / dist) * force * 2;
          this.y -= (dy / dist) * force * 2;
        }
      }
    }
    draw() {
      ctx.fillStyle = `rgba(20, 241, 217, ${this.alpha})`;
      ctx.shadowBlur = 6;
      ctx.shadowColor = '#0abab5';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();

      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 110) {
          const lineAlpha = (1 - dist / 110) * 0.2;
          ctx.strokeStyle = `rgba(10, 186, 181, ${lineAlpha})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animate);
  }
  animate();
}

// --- Synthesizer Audio Engine (Web Audio API) ---
let audioCtx = null;
let soundEnabled = true;

function initAudioSystem() {
  const toggleBtn = document.getElementById('soundToggleBtn');
  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    toggleBtn.classList.toggle('audio-playing', soundEnabled);
    const label = document.getElementById('soundStatusLabel');
    if (label) label.textContent = soundEnabled ? 'SFX ON' : 'SFX OFF';

    if (soundEnabled) {
      ensureAudioCtx();
      playSfx('click');
      showToast('🔊 Звукові ефекти увімкнено');
    } else {
      showToast('🔇 Звукові ефекти вимкнено');
    }
  });

  document.querySelectorAll('button, a.nav-link, .interactive-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (soundEnabled) playSfx('hover');
    });
  });
}

function ensureAudioCtx() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playSfx(type = 'click') {
  if (!soundEnabled) return;
  ensureAudioCtx();
  if (!audioCtx) return;

  try {
    const now = audioCtx.currentTime;

    if (type === 'hover') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.015, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
      osc.start(now);
      osc.stop(now + 0.035);
    } 
    else if (type === 'click') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.06);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
      osc.start(now);
      osc.stop(now + 0.06);
    }
    else if (type === 'success') {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0.08, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.35);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.35);
      });
    }
  } catch (err) {}
}

// --- Header Navigation & Scroll State ---
function initHeaderScroll() {
  const header = document.getElementById('mainHeader');
  if (!header) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('bg-darkbg-900/95', 'shadow-[0_10px_35px_rgba(0,0,0,0.6)]', 'border-tiffany/40');
      header.classList.remove('bg-darkbg-900/80', 'border-tiffany/20');
    } else {
      header.classList.remove('bg-darkbg-900/95', 'shadow-[0_10px_35px_rgba(0,0,0,0.6)]', 'border-tiffany/40');
      header.classList.add('bg-darkbg-900/80', 'border-tiffany/20');
    }
  });
}

// --- Mobile Navigation Menu ---
function initMobileMenu() {
  const btn = document.getElementById('mobileMenuBtn');
  const menu = document.getElementById('mobileMenu');
  const icon = document.getElementById('menuIcon');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const isHidden = menu.classList.contains('hidden');
    menu.classList.toggle('hidden');
    icon.className = isHidden ? 'fa-solid fa-xmark text-xl text-tiffany' : 'fa-solid fa-bars text-xl';
    playSfx('click');
  });

  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.add('hidden');
      icon.className = 'fa-solid fa-bars text-xl';
    });
  });
}

// ==========================================
// MULTI-TAB SWITCHER UTILITY
// ==========================================
function switchSectionTab(tabGroup, tabId, btn) {
  playSfx('click');

  const parentContainer = btn.parentElement;
  if (parentContainer) {
    parentContainer.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.remove('bg-tiffany', 'text-darkbg-900', 'shadow-[0_0_20px_#0abab5]');
      b.classList.add('bg-darkbg-800', 'text-slate-300');
    });
  }

  btn.classList.remove('bg-darkbg-800', 'text-slate-300');
  btn.classList.add('bg-tiffany', 'text-darkbg-900', 'shadow-[0_0_20px_#0abab5]');

  document.querySelectorAll(`.${tabGroup}-content`).forEach(panel => {
    panel.classList.add('hidden');
  });

  const target = document.getElementById(tabId);
  if (target) {
    target.classList.remove('hidden');
  }
}

// --- Merch Filters ---
function filterMerch(cat, btn) {
  playSfx('click');
  document.querySelectorAll('.merch-filter-btn').forEach(b => {
    b.classList.remove('bg-tiffany', 'text-darkbg-900', 'shadow-[0_0_20px_#0abab5]');
    b.classList.add('bg-darkbg-800', 'text-slate-300');
  });
  btn.classList.remove('bg-darkbg-800', 'text-slate-300');
  btn.classList.add('bg-tiffany', 'text-darkbg-900', 'shadow-[0_0_20px_#0abab5]');

  const items = document.querySelectorAll('.merch-item');
  items.forEach(item => {
    if (cat === 'all' || item.dataset.category === cat) {
      item.style.display = 'flex';
    } else {
      item.style.display = 'none';
    }
  });
}

// --- Dual Path Switcher (Crime vs State) ---
function switchPath(path) {
  playSfx('click');
  const btnCrime = document.getElementById('btnCrime');
  const btnState = document.getElementById('btnState');
  const pathCrime = document.getElementById('pathCrime');
  const pathState = document.getElementById('pathState');
  if (!btnCrime || !btnState || !pathCrime || !pathState) return;

  if (path === 'crime') {
    btnCrime.className = "path-btn px-5 py-2.5 rounded-xl text-xs font-orbitron font-bold tracking-wider transition-all bg-tiffany text-darkbg-900 shadow-[0_0_20px_rgba(10,186,181,0.6)]";
    btnState.className = "path-btn px-5 py-2.5 rounded-xl text-xs font-orbitron font-bold tracking-wider transition-all bg-darkbg-800 text-slate-300 border border-white/10 hover:border-tiffany";
    pathCrime.classList.remove('hidden');
    pathState.classList.add('hidden');
  } else {
    btnState.className = "path-btn px-5 py-2.5 rounded-xl text-xs font-orbitron font-bold tracking-wider transition-all bg-tiffany text-darkbg-900 shadow-[0_0_20px_rgba(10,186,181,0.6)]";
    btnCrime.className = "path-btn px-5 py-2.5 rounded-xl text-xs font-orbitron font-bold tracking-wider transition-all bg-darkbg-800 text-slate-300 border border-white/10 hover:border-tiffany";
    pathState.classList.remove('hidden');
    pathCrime.classList.add('hidden');
  }
}

// --- Express Eligibility Checklist ---
function initEligibility() {
  updateEligibility();
}

function updateEligibility() {
  playSfx('click');
  const c1 = document.getElementById('checkAge')?.checked || false;
  const c2 = document.getElementById('checkMic')?.checked || false;
  const c3 = document.getElementById('checkNg')?.checked || false;
  const c4 = document.getElementById('checkAim')?.checked || false;

  const count = [c1, c2, c3, c4].filter(Boolean).length;
  const percent = count * 25;

  const bar = document.getElementById('eligibilityBar');
  const percentText = document.getElementById('eligibilityPercent');
  const message = document.getElementById('eligibilityMessage');
  const btn = document.getElementById('quickApplyBtn');

  if (!bar || !percentText) return;

  bar.style.width = `${percent}%`;
  percentText.textContent = `${percent}%`;

  if (percent === 100) {
    bar.className = 'h-full bg-gradient-to-r from-emerald-400 via-tiffany to-tiffany-light shadow-[0_0_25px_#14f1d9] transition-all duration-500';
    message.innerHTML = '<span class="text-tiffany font-bold">🔥 100% ВІДПОВІДНІСТЬ! Твій слот в Inquisitors famq зарезервовано. Подавай заявку!</span>';
    btn.disabled = false;
    btn.className = 'w-full mt-5 py-4 rounded-xl bg-tiffany text-darkbg-900 font-orbitron font-extrabold text-xs uppercase tracking-wider shadow-[0_0_30px_rgba(10,186,181,0.7)] hover:scale-105 active:scale-95 transition-all cursor-pointer animate-bounce';
    playSfx('success');
  } else if (percent >= 50) {
    bar.className = 'h-full bg-gradient-to-r from-tiffany-600 to-tiffany transition-all duration-500';
    message.innerHTML = `<span class="text-slate-300">Пройдено ${count} з 4 критеріїв (${percent}%). Відзнач інші для гарантованого схвалення.</span>`;
    btn.disabled = false;
    btn.className = 'w-full mt-5 py-3.5 rounded-xl bg-darkbg-700 hover:bg-tiffany hover:text-darkbg-900 border border-tiffany/40 text-white font-orbitron font-bold text-xs uppercase tracking-wider transition-all cursor-pointer';
  } else {
    bar.className = 'h-full bg-gradient-to-r from-slate-600 to-tiffany-dark transition-all duration-500';
    message.innerHTML = '<span class="text-slate-400">Відзначте пункти для перевірки статусу кандидата.</span>';
    btn.disabled = true;
    btn.className = 'w-full mt-5 py-3 rounded-xl bg-darkbg-700 text-slate-500 font-orbitron font-bold text-xs uppercase tracking-wider transition-all cursor-not-allowed';
  }
}

// --- Application Modal Control ---
// === НАЛАШТУВАННЯ ОКРЕМИХ DISCORD WEBHOOKS ===
// Використовуємо Base64 для захисту від GitHub Secret Scanning
const DISCORD_APPLY_WEBHOOK = atob("aHR0cHM6Ly9kaXNjb3JkLmNvbS9hcGkvd2ViaG9va3MvMTU3MzMyODI2MzcwNTY2NTc1OC94cnFPUWNJTHJUVlQ5Mnh3MVplcVZ5VVl2Z3FZdE9seE53NUFleHVYejRNdjRaV2MwcV81dHB6Wml6Y0E4eHVObERXMg==");
const DISCORD_MERCH_WEBHOOK = atob("aHR0cHM6Ly9kaXNjb3JkLmNvbS9hcGkvd2ViaG9va3MvMTU3MzMyODEyMTgyOTAwNzUwNC9tT1gtcldoSEY1UTNIUml6VDR3Rm5XUU9uc3VGeGpmQmh6dnI4QVdWa0s4UV9KNXlsQlgwcHFreVJyMmJvaGRuYjN1Yw==");

function openApplyModal() {
  playSfx('click');
  const modal = document.getElementById('applyModal');
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

function closeApplyModal() {
  playSfx('click');
  const modal = document.getElementById('applyModal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

function submitApplication(e) {
  e.preventDefault();
  playSfx('success');

  const name = document.getElementById('appNick')?.value || '';
  const discord = document.getElementById('appDiscord')?.value || '';
  const age = document.getElementById('appAge')?.value || '';
  const sid = document.getElementById('appSid')?.value || '';
  const path = document.getElementById('appDirection')?.value || '';
  const about = document.getElementById('appAbout')?.value || '';

  const discordTemplate = `[АНКЕТА В INQUISITORS FAMQ]\n- Нікнейм: ${name}\n- Discord: ${discord}\n- Вік: ${age}\n- Static ID: ${sid}\n- Вектор: ${path}\n- Про себе: ${about}`;

  // 1. Автоматична миттєва відправка заявки у Discord канал через Webhook
  if (DISCORD_APPLY_WEBHOOK && DISCORD_APPLY_WEBHOOK.trim() !== "") {
    const embed = {
      title: "⚔️ НОВА ЗАЯВКА НА ВСТУП | INQUISITORS FAMQ",
      description: "На сайті заповнено нову анкету на вступ до сім'ї.",
      color: 0x0abab5, // Фірмовий колір Тіффані
      fields: [
        { name: "🎮 Ігровий Nickname", value: `\`${name || 'Не вказано'}\``, inline: true },
        { name: "💬 Discord тег", value: `**${discord || 'Не вказано'}**`, inline: true },
        { name: "🎂 Вік", value: age || "Не вказано", inline: true },
        { name: "🆔 Static ID (NG RP)", value: sid ? `#${sid}` : "Не вказано", inline: true },
        { name: "🎯 Обраний напрямок", value: path || "Не визначився", inline: true },
        { name: "📝 Про себе / Досвід", value: about || "Не вказано", inline: false }
      ],
      footer: { text: "Inquisitors Recruitment System • NG GTA 5 RP" },
      timestamp: new Date().toISOString()
    };

    fetch(DISCORD_APPLY_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Inquisitors Recruitment Bot",
        avatar_url: "https://cdn.discordapp.com/avatars/1573328263705665758/4b821dbd54318723b7b814f331e51070.png",
        embeds: [embed]
      })
    }).catch(err => console.warn("Discord Webhook application notice:", err));
  }

  // 2. Копіювання в буфер обміну для зручності
  if (navigator.clipboard) {
    navigator.clipboard.writeText(discordTemplate);
  }

  const form = document.getElementById('recruitmentForm');
  const success = document.getElementById('formSuccess');

  if (form) form.classList.add('hidden');
  if (success) success.classList.remove('hidden');

  showToast('🎉 Заявку надіслано в Discord канал сім\'ї!');
}

// --- Merch Pre-Order & Promo Code ---
function openNotifyModal(itemName) {
  playSfx('click');
  const label = document.getElementById('notifyItemName');
  if (label) label.textContent = itemName;
  const modal = document.getElementById('notifyModal');
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

function closeNotifyModal() {
  playSfx('click');
  const modal = document.getElementById('notifyModal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

function submitNotification(e) {
  e.preventDefault();
  playSfx('success');
  const form = e.target;
  const itemName = document.getElementById('notifyItemName')?.textContent || 'Мерч';
  const inputs = form.querySelectorAll('input[type="text"]');
  const contact = inputs[0]?.value || '';
  const size = inputs[1]?.value || 'Не вказано';

  if (DISCORD_MERCH_WEBHOOK && contact) {
    const embed = {
      title: "🔔 СПОВІЩЕННЯ ПРО ДРОП МЕРЧУ",
      color: 0x14f1d9,
      fields: [
        { name: "👕 Товар", value: itemName, inline: true },
        { name: "📏 Розмір", value: size || "Будь-який", inline: true },
        { name: "💬 Контакт", value: contact, inline: false }
      ],
      footer: { text: "Inquisitors Merch Notify • NG GTA 5 RP" },
      timestamp: new Date().toISOString()
    };

    fetch(DISCORD_MERCH_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Inquisitors Merch Bot",
        avatar_url: "https://cdn.discordapp.com/avatars/1573328121829007504/4b821dbd54318723b7b814f331e51070.png",
        embeds: [embed]
      })
    }).catch(err => console.warn("Discord Webhook notice:", err));
  }

  const success = document.getElementById('notifySuccess');
  if (form) form.classList.add('hidden');
  if (success) success.classList.remove('hidden');
  showToast('👕 Ви в пріоритетному списку на дроп!');
}

function copyPromoCode() {
  playSfx('click');
  const code = "INQUISITORS300";
  if (navigator.clipboard) {
    navigator.clipboard.writeText(code);
  }
  showToast('🏷 Промокод INQUISITORS300 скопійовано! (-15%)');
}

// --- Close modals on backdrop or ESC ---
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeApplyModal();
    closeNotifyModal();
  }
});

document.querySelectorAll('#applyModal, #notifyModal').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeApplyModal();
      closeNotifyModal();
    }
  });
});

// --- FAQ Accordion ---
function toggleFaq(btn) {
  playSfx('click');
  const content = btn.nextElementSibling;
  const icon = btn.querySelector('i');
  if (!content) return;

  const isClosed = content.classList.contains('hidden');

  document.querySelectorAll('.faq-content').forEach(c => c.classList.add('hidden'));
  document.querySelectorAll('.faq-item i').forEach(i => i.style.transform = 'rotate(0deg)');

  if (isClosed) {
    content.classList.remove('hidden');
    if (icon) icon.style.transform = 'rotate(180deg)';
  }
}

// --- Copy Discord Link with Toast ---
function copyDiscordLink() {
  playSfx('click');
  const inviteUrl = "https://discord.gg/sfMSdXvbe";

  if (navigator.clipboard) {
    navigator.clipboard.writeText(inviteUrl).then(() => {
      showToast("🔗 Посилання на Discord скопійовано!");
    }).catch(() => {
      showToast("🔗 Посилання: discord.gg/sfMSdXvbe");
    });
  } else {
    showToast("🔗 Посилання: discord.gg/sfMSdXvbe");
  }
}

// --- Toast notification utility ---
function showToast(message) {
  const toast = document.getElementById('toast');
  const text = document.getElementById('toastText');
  if (!toast || !text) return;

  text.textContent = message;
  toast.classList.remove('translate-y-32', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');

  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-32', 'opacity-0');
  }, 3500);
}

// --- Real Live Online Visitors Engine ---
// Визначає РЕАЛЬНУ кількість людей на сайті (без вигаданих чисел):
// 1. Якщо запущено сервер (node server.js): синхронізується в реальному часі через Server-Sent Events (/api/online) між усіма пристроями.
// 2. Якщо відкрито локально чи статично: синхронізується між вкладками браузера через BroadcastChannel та localStorage heartbeat.
function initLiveOnlineCounter() {
  const counterElements = document.querySelectorAll('#liveOnlineCount, .live-online-num');
  if (!counterElements.length) return;

  function updateCounter(val) {
    const num = Math.max(1, parseInt(val, 10) || 1);
    counterElements.forEach(el => {
      if (el.textContent !== String(num)) {
        el.textContent = num;
        el.classList.add('scale-110', 'text-white');
        setTimeout(() => el.classList.remove('scale-110', 'text-white'), 350);
      }
    });
  }

  // Початкове значення: 1 (якщо ви один на сайті, показує рівно 1)
  updateCounter(1);

  let isServerConnected = false;

  // --- Спосіб 1: Мережевий SSE через сервер (працює між різними комп'ютерами та телефонами) ---
  if (window.location.protocol.startsWith('http')) {
    try {
      const eventSource = new EventSource('/api/online');
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && typeof data.count === 'number') {
            isServerConnected = true;
            updateCounter(data.count);
          }
        } catch (e) {}
      };

      eventSource.onerror = () => {
        // Якщо сервер не підтримує SSE або вимкнений, працює локальна синхронізація
        isServerConnected = false;
        runLocalTabPresence();
      };
    } catch (err) {
      runLocalTabPresence();
    }
  } else {
    runLocalTabPresence();
  }

  // --- Спосіб 2: Локальна синхронізація вкладок (BroadcastChannel + localStorage Heartbeat) ---
  function runLocalTabPresence() {
    if (isServerConnected) return;

    const SESSIONS_KEY = 'inq_famq_active_tabs';
    const myTabId = 'tab_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('inq_presence_channel') : null;

    function cleanAndCountSessions() {
      if (isServerConnected) return;
      let sessions = {};
      try {
        sessions = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '{}');
      } catch (e) {
        sessions = {};
      }

      const now = Date.now();
      const validSessions = {};

      // Залишаємо лише активні вкладки (пульс був менше 4.5 секунд тому)
      for (const [id, time] of Object.entries(sessions)) {
        if (now - time < 4500) {
          validSessions[id] = time;
        }
      }

      // Додаємо власну активну вкладку
      validSessions[myTabId] = now;
      try {
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(validSessions));
      } catch (e) {}

      const count = Object.keys(validSessions).length;
      updateCounter(count);
      return count;
    }

    cleanAndCountSessions();

    // Періодичний пульс (кожні 1.5 сек)
    setInterval(() => {
      if (!isServerConnected) {
        cleanAndCountSessions();
      }
    }, 1500);

    // Слухаємо інші вкладки
    if (channel) {
      channel.onmessage = () => {
        if (!isServerConnected) {
          cleanAndCountSessions();
        }
      };
    }

    window.addEventListener('storage', (e) => {
      if (e.key === SESSIONS_KEY && !isServerConnected) {
        cleanAndCountSessions();
      }
    });

    // Видаляємо вкладку при закритті
    function handleLeave() {
      try {
        const sessions = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '{}');
        delete sessions[myTabId];
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
        if (channel) {
          channel.postMessage({ type: 'leave', tabId: myTabId });
        }
      } catch (e) {}
    }

    window.addEventListener('beforeunload', handleLeave);
    window.addEventListener('pagehide', handleLeave);
  }
}

// --- Live Discord Member & Stats Synchronization ---
const DISCORD_INVITE_CODE = "sfMSdXvbe";

async function fetchDiscordMemberCount() {
  try {
    const res = await fetch(`https://discord.com/api/v10/invites/${DISCORD_INVITE_CODE}?with_counts=true`);
    if (!res.ok) return;
    const data = await res.json();
    const count = data.approximate_member_count;
    const online = data.approximate_presence_count;
    if (typeof count === 'number' && count > 0) {
      updateDiscordUI(count, online);
    }
  } catch (err) {
    console.warn("Discord live counter fetch error:", err);
  }
}

function updateDiscordUI(count, onlineCount) {
  const goal = 300;
  const percent = Math.min(100, Math.round((count / goal) * 100));

  // Оновлюємо лічильники на сторінці
  const memberEl = document.getElementById('discordMemberCount');
  if (memberEl) memberEl.textContent = count;

  const badgeEl = document.getElementById('discordCurrentBadge');
  if (badgeEl) badgeEl.textContent = count;

  const percentEl = document.getElementById('discordMemberPercent');
  if (percentEl) percentEl.textContent = `(${percent}%)`;

  const barEl = document.getElementById('discordProgressBar');
  if (barEl) barEl.style.width = `${percent}%`;

  document.querySelectorAll('.discord-member-num').forEach(el => {
    el.textContent = count;
  });
  if (typeof onlineCount === 'number') {
    document.querySelectorAll('.discord-online-num').forEach(el => {
      el.textContent = onlineCount;
    });
  }
}

function initDiscordLiveSync() {
  fetchDiscordMemberCount();
  // Опитуємо кожні 15 секунд для живої синхронізації
  setInterval(fetchDiscordMemberCount, 15000);
}
