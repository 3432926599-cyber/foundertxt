// ============================================================
// FounderTxt — App Logic
// ============================================================

// ── API Base (Cloudflare Pages 后端) ──────────────────────
const API_BASE = 'https://foundertxt.pages.dev';

// ── 14 Tweet Patterns (embedded, no API call needed) ──────
const PATTERNS = {
  "metric-lesson": {
    id: "metric-lesson", name: "Metric + Lesson", emoji: "💰",
    description: "Share a number with a surprising insight",
    fillBlanks: [
      { id: "metric", label: "What metric surprised you?", placeholder: "e.g. 70% of my signups came from one Reddit comment", maxLength: 200 },
      { id: "lesson", label: "What's the lesson?", placeholder: "e.g. Reply to existing threads instead of making new posts", maxLength: 200 },
    ],
    tier: "free",
  },
  "dead-feature": {
    id: "dead-feature", name: "Dead Feature", emoji: "💀",
    description: "A feature you shipped that nobody used",
    fillBlanks: [
      { id: "feature", label: "What feature did you build?", placeholder: "e.g. A drag-and-drop dashboard builder", maxLength: 200 },
      { id: "data", label: "What did the usage data show?", placeholder: "e.g. 3 users in 2 months, all churned within a week", maxLength: 200 },
      { id: "lesson", label: "What did you learn?", placeholder: "e.g. Users wanted pre-built reports, not a DIY tool", maxLength: 200 },
    ],
    tier: "free",
  },
  "wrong-assumption": {
    id: "wrong-assumption", name: "Wrong Assumption", emoji: "🤦",
    description: "A belief you had that data proved wrong",
    fillBlanks: [
      { id: "assumption", label: "What did you assume?", placeholder: "e.g. I thought annual plans would convert better", maxLength: 200 },
      { id: "reality", label: "What did the data actually show?", placeholder: "e.g. Monthly converted at 4x the rate", maxLength: 200 },
      { id: "takeaway", label: "What did you change?", placeholder: "e.g. Removed annual option, simplified to monthly only", maxLength: 200 },
    ],
    tier: "free",
  },
  "cost-breakdown": {
    id: "cost-breakdown", name: "Cost Breakdown", emoji: "💸",
    description: "Transparent breakdown of your monthly costs",
    fillBlanks: [
      { id: "total", label: "What's your total monthly cost?", placeholder: "e.g. $847/month", maxLength: 100 },
      { id: "categories", label: "How does it break down?", placeholder: "e.g. $312 Postgres, $190 inference, $145 email, $200 misc", maxLength: 300 },
      { id: "insight", label: "What surprised you about the costs?", placeholder: "e.g. Email is 3x what I expected, inference costs dropped 60% after switching models", maxLength: 200 },
    ],
    tier: "pro",
  },
  "pricing-experiment": {
    id: "pricing-experiment", name: "Pricing Experiment", emoji: "🧪",
    description: "A pricing change you tested and the results",
    fillBlanks: [
      { id: "change", label: "What pricing change did you make?", placeholder: "e.g. Raised from $19 to $39/month", maxLength: 200 },
      { id: "expected", label: "What did you expect to happen?", placeholder: "e.g. Expected 20% churn from existing users", maxLength: 200 },
      { id: "actual", label: "What actually happened?", placeholder: "e.g. Trial→paid conversion went up 22%, churn was only 8%", maxLength: 200 },
    ],
    tier: "pro",
  },
  "competitor-compliment": {
    id: "competitor-compliment", name: "Competitor Compliment", emoji: "🏆",
    description: "Genuinely praise something a competitor did well",
    fillBlanks: [
      { id: "competitor", label: "Which competitor?", placeholder: "e.g. Linear", maxLength: 100 },
      { id: "feature", label: "What did they ship that impressed you?", placeholder: "e.g. Their new keyboard-first issue tracking", maxLength: 200 },
      { id: "lesson", label: "What did you learn from it?", placeholder: "e.g. Speed > feature completeness for power users", maxLength: 200 },
    ],
    tier: "pro",
  },
  "before-after-refactor": {
    id: "before-after-refactor", name: "Before / After Refactor", emoji: "⚡",
    description: "Technical improvement with measurable results",
    fillBlanks: [
      { id: "what", label: "What did you refactor?", placeholder: "e.g. Rewrote the payment processing module", maxLength: 200 },
      { id: "before", label: "What was it like before?", placeholder: "e.g. 2 second latency, 800 lines of code", maxLength: 200 },
      { id: "after", label: "What's the result?", placeholder: "e.g. 200ms latency, 40% less code", maxLength: 200 },
    ],
    tier: "pro",
  },
  "user-message": {
    id: "user-message", name: "User Message Changed Roadmap", emoji: "💬",
    description: "A user message that made you change direction",
    fillBlanks: [
      { id: "message", label: "What did the user say?", placeholder: "e.g. 'I love your tool but I can't use it because it doesn't export to CSV'", maxLength: 300 },
      { id: "change", label: "What did you change?", placeholder: "e.g. Paused the analytics dashboard, built CSV export in 2 days", maxLength: 200 },
      { id: "outcome", label: "What was the result?", placeholder: "e.g. Retention went up 30% the following week", maxLength: 200 },
    ],
    tier: "pro",
  },
  "build-vs-buy": {
    id: "build-vs-buy", name: "Build vs Buy", emoji: "🔧",
    description: "Decision to build in-house vs use a service",
    fillBlanks: [
      { id: "decision", label: "What did you build instead of buy?", placeholder: "e.g. Built our own auth system instead of using Clerk", maxLength: 200 },
      { id: "cost", label: "What's the ongoing cost?", placeholder: "e.g. 4 hours/month maintaining it, $0 direct cost", maxLength: 200 },
      { id: "verdict", label: "Was it worth it?", placeholder: "e.g. Worth it at our scale, but if I started over I'd just pay for Clerk", maxLength: 200 },
    ],
    tier: "pro",
  },
  "customer-support-story": {
    id: "customer-support-story", name: "Customer Support Story", emoji: "🎧",
    description: "A support interaction that taught you something",
    fillBlanks: [
      { id: "ticket", label: "What was the support issue?", placeholder: "e.g. User couldn't figure out how to invite their team", maxLength: 200 },
      { id: "realization", label: "What did you realize?", placeholder: "e.g. The invite button was hidden behind 3 clicks", maxLength: 200 },
      { id: "fix", label: "What did you fix?", placeholder: "e.g. Added a big 'Invite Team' button on the empty state", maxLength: 200 },
    ],
    tier: "pro",
  },
  "copy-checklist": {
    id: "copy-checklist", name: "Copy-Paste Checklist", emoji: "📋",
    description: "Actionable checklist others can copy",
    fillBlanks: [
      { id: "topic", label: "What's the checklist for?", placeholder: "e.g. Pre-launch checklist for SaaS products", maxLength: 150 },
      { id: "items", label: "List 5-8 checklist items (one per line)", placeholder: "1. Set up error tracking\n2. Configure staging env\n3. Write rollback plan\n4. Test billing flow\n5. Prepare outage comms template", maxLength: 500 },
      { id: "why", label: "What prompted this checklist?", placeholder: "e.g. Missed 3 of these on my first launch and paid for it", maxLength: 200 },
    ],
    tier: "free",
  },
  "almost-quit": {
    id: "almost-quit", name: "Almost Quit Moment", emoji: "📉",
    description: "A specific moment you almost gave up",
    fillBlanks: [
      { id: "moment", label: "Describe the specific moment", placeholder: "e.g. Thursday 3pm, $847 AWS bill, 0 paying users, had the 'delete repo' dialog open", maxLength: 300 },
      { id: "why_not", label: "Why didn't you quit?", placeholder: "e.g. One user emailed saying the product saved them 10 hours that week", maxLength: 200 },
      { id: "now", label: "Where are you now?", placeholder: "e.g. $3.2k MRR, 47 paying customers, that same user is still a customer", maxLength: 200 },
    ],
    tier: "pro",
  },
  "sixty-day-retro": {
    id: "sixty-day-retro", name: "60-Day Retro", emoji: "🔍",
    description: "What you learned in 60 days of building",
    fillBlanks: [
      { id: "project", label: "What have you been building?", placeholder: "e.g. A project management tool for designers", maxLength: 150 },
      { id: "wrong", label: "What did you get wrong?", placeholder: "e.g. Spent 6 weeks on the wrong problem — designers don't need another PM tool, they need a handoff tool", maxLength: 300 },
      { id: "right", label: "What did you get right?", placeholder: "e.g. Talking to 3 users every week caught the problem before it was too late", maxLength: 200 },
    ],
    tier: "pro",
  },
  "post-launch-different": {
    id: "post-launch-different", name: "Post-Launch: What I'd Do Different", emoji: "🔄",
    description: "After launching, what you'd change if starting over",
    fillBlanks: [
      { id: "launch", label: "What did you launch?", placeholder: "e.g. A no-code database builder", maxLength: 150 },
      { id: "different", label: "What would you do differently?", placeholder: "e.g. Launch with 1 integration instead of 10, charge from day 1", maxLength: 300 },
      { id: "advice", label: "What's your advice to someone starting today?", placeholder: "e.g. Ship when it's embarrassing, charge before you're ready", maxLength: 200 },
    ],
    tier: "pro",
  },
};

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
      const response = await fetch(`${API_BASE}/api/generate`, {
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

  function loadPatterns() {
    // Patterns embedded locally — no API call needed
    patterns = Object.values(PATTERNS).map(p => ({
      id: p.id,
      name: p.name,
      emoji: p.emoji,
      description: p.description,
      fillBlanks: p.fillBlanks,
      tier: p.tier,
    }));
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
