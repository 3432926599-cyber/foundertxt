// ============================================================
// FounderTxt — App Logic
// ============================================================

const App = (() => {
  // ── State ────────────────────────────────────────────────

  let patterns = [];
  let selectedPattern = null;
  let isGenerating = false;

  // ── DOM Refs ─────────────────────────────────────────────

  const $grid = document.getElementById('pattern-grid');
  const $fillSection = document.getElementById('fill-section');
  const $fillBlanks = document.getElementById('fill-blanks');
  const $fillPatternName = document.getElementById('fill-pattern-name');
  const $btnGenerate = document.getElementById('btn-generate');
  const $resultSection = document.getElementById('result-section');
  const $resultText = document.getElementById('result-text');
  const $resultCharCount = document.getElementById('result-char-count');
  const $btnCopy = document.getElementById('btn-copy');

  // ── Toast ────────────────────────────────────────────────

  let toastTimer = null;

  function showToast(message, duration = 2500) {
    const $container = document.getElementById('toast-container');
    const $toast = document.getElementById('toast');
    const $msg = document.getElementById('toast-msg');

    if (toastTimer) clearTimeout(toastTimer);

    $msg.textContent = message;
    $toast.classList.add('mvs-toast--visible');
    $container.style.display = 'block';

    toastTimer = setTimeout(() => {
      $toast.classList.remove('mvs-toast--visible');
      setTimeout(() => { $container.style.display = 'none'; }, 300);
    }, duration);
  }

  // ── Render Pattern Grid ──────────────────────────────────

  function renderGrid() {
    if (!patterns.length) {
      $grid.innerHTML = '<p style="text-align:center;color:var(--mvs-text-tertiary);grid-column:1/-1;padding:var(--mvs-space-5xl);">Loading patterns...</p>';
      return;
    }

    $grid.innerHTML = patterns.map(p => `
      <div class="mvs-card pattern-card ${selectedPattern && selectedPattern.id === p.id ? 'pattern-card--selected' : ''}"
           data-pattern-id="${p.id}"
           onclick="App.selectPattern('${p.id}')">
        <div class="pattern-card__inner">
          <span class="pattern-card__emoji">${p.emoji}</span>
          <span class="pattern-card__name">${p.name}</span>
          <span class="pattern-card__desc">${p.description}</span>
          <span class="pattern-card__tier ${p.tier === 'free' ? 'pattern-card__tier--free' : 'pattern-card__tier--pro'}">${p.tier === 'free' ? 'Free' : 'Pro'}</span>
        </div>
      </div>
    `).join('');
  }

  // ── Select Pattern ───────────────────────────────────────

  function selectPattern(patternId) {
    selectedPattern = patterns.find(p => p.id === patternId);
    if (!selectedPattern) return;

    // Render fill blanks
    $fillPatternName.textContent = `${selectedPattern.emoji} ${selectedPattern.name}`;
    $fillBlanks.innerHTML = selectedPattern.fillBlanks.map(blank => `
      <div class="fill-field">
        <label class="fill-field__label" for="blank-${blank.id}">${blank.label}</label>
        <textarea
          class="fill-field__input"
          id="blank-${blank.id}"
          placeholder="${blank.placeholder}"
          maxlength="${blank.maxLength}"
          rows="2"
        ></textarea>
        <p class="fill-field__hint"><span class="char-count" data-for="blank-${blank.id}">0</span> / ${blank.maxLength}</p>
      </div>
    `).join('');

    // Setup char counters
    $fillBlanks.querySelectorAll('textarea').forEach(ta => {
      ta.addEventListener('input', () => {
        const counter = $fillBlanks.querySelector(`.char-count[data-for="${ta.id}"]`);
        if (counter) counter.textContent = ta.value.length;
      });
    });

    // Show fill section, hide result
    $resultSection.classList.remove('visible');
    $fillSection.classList.add('visible');
    renderGrid();

    // Scroll to fill section
    $fillSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Focus first input
    setTimeout(() => {
      const first = $fillBlanks.querySelector('textarea');
      if (first) first.focus();
    }, 300);
  }

  function backToGrid() {
    selectedPattern = null;
    $fillSection.classList.remove('visible');
    $resultSection.classList.remove('visible');
    renderGrid();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Generate ─────────────────────────────────────────────

  async function generate() {
    if (!selectedPattern) return;
    if (isGenerating) return;

    // Collect answers
    const answers = {};
    const textareas = $fillBlanks.querySelectorAll('textarea');
    let hasContent = false;
    textareas.forEach(ta => {
      answers[ta.id.replace('blank-', '')] = ta.value.trim();
      if (ta.value.trim()) hasContent = true;
    });

    if (!hasContent) {
      showToast('Please fill in at least one blank');
      return;
    }

    // Loading state
    isGenerating = true;
    $btnGenerate.innerHTML = '<span class="spinner"></span> Generating...';
    $btnGenerate.disabled = true;
    $resultSection.classList.remove('visible');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patternId: selectedPattern.id,
          answers,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      // Show result
      $resultText.textContent = data.result;
      const len = data.result.length;
      $resultCharCount.textContent = `${len} / 280 chars${len > 280 ? ' — over limit!' : ''}`;
      $resultCharCount.className = len > 280
        ? 'result-card__char-count result-card__char-count--over'
        : 'result-card__char-count';
      $resultSection.classList.add('visible');

      // Scroll to result
      $resultSection.scrollIntoView({ behavior: 'smooth', block: 'center' });

    } catch (err) {
      showToast(err.message || 'Something went wrong. Please try again.');
    } finally {
      isGenerating = false;
      $btnGenerate.innerHTML = '✨ Generate Tweet';
      $btnGenerate.disabled = false;
    }
  }

  // ── Copy ─────────────────────────────────────────────────

  async function copy() {
    const text = $resultText.textContent;
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied to clipboard!');
    } catch {
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('Copied to clipboard!');
    }
  }

  // ── Load Patterns ────────────────────────────────────────

  async function loadPatterns() {
    try {
      const res = await fetch('/api/patterns');
      if (res.ok) {
        patterns = await res.json();
      }
    } catch {
      // If API unavailable, patterns will be empty → upgrade prompt
      console.warn('Could not load patterns from API');
    }
    renderGrid();
  }

  // ── Init ─────────────────────────────────────────────────

  function init() {
    loadPatterns();
  }

  // ── Public API ───────────────────────────────────────────

  return {
    init,
    selectPattern,
    backToGrid,
    generate,
    copy,
  };
})();

// Boot
document.addEventListener('DOMContentLoaded', () => App.init());
