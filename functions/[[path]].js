// ============================================================
// FounderTxt — Cloudflare Pages Functions (catch-all)
// Handles /api/generate, /api/patterns, /api/webhooks/waffo
// All other requests → static files
// ============================================================

// ── 14 Patterns ─────────────────────────────────────────────

const PATTERNS = {
  "metric-lesson": {
    id: "metric-lesson",
    name: "Metric + Lesson",
    emoji: "💰",
    description: "Share a number with a surprising insight",
    fillBlanks: [
      { id: "metric", label: "What metric surprised you?", placeholder: "e.g. 70% of my signups came from one Reddit comment", maxLength: 200 },
      { id: "lesson", label: "What's the lesson?", placeholder: "e.g. Reply to existing threads instead of making new posts", maxLength: 200 },
    ],
    systemPrompt: `Generate ONE tweet (max 280 chars).

Pattern: Metric + Lesson
Start with a specific number, reveal the non-obvious insight behind it, end with the practical lesson.

Example:
"$2.1k MRR, and 70% of it came from one Reddit comment I almost didn't write. I thought it would look spammy. Lesson: reply to existing threads where people are already looking for a solution."

Rules:
- Lead with the number
- Lesson at the end
- Authentic founder voice, not marketer
- No emoji spam, no hashtags, no "thread 🧵"`,
    tier: "free",
  },

  "dead-feature": {
    id: "dead-feature",
    name: "Dead Feature",
    emoji: "💀",
    description: "A feature you shipped that nobody used",
    fillBlanks: [
      { id: "feature", label: "What feature did you build?", placeholder: "e.g. A drag-and-drop dashboard builder", maxLength: 200 },
      { id: "data", label: "What did the usage data show?", placeholder: "e.g. 3 users in 2 months, all churned within a week", maxLength: 200 },
      { id: "lesson", label: "What did you learn?", placeholder: "e.g. Users wanted pre-built reports, not a DIY tool", maxLength: 200 },
    ],
    systemPrompt: `Generate ONE tweet (max 280 chars).

Pattern: Dead Feature
Share a feature you built that got zero traction, what the data showed, and the hard lesson.

Example:
"I shipped a drag-and-drop dashboard builder. 3 users tried it in 2 months. All churned within a week. I spent 6 weeks building something nobody wanted. They didn't need customization — they needed a one-click report. Ship the smallest thing first."

Rules:
- Be honest and self-deprecating
- Include the specific timeframe
- End with the actionable lesson`,
    tier: "free",
  },

  "wrong-assumption": {
    id: "wrong-assumption",
    name: "Wrong Assumption",
    emoji: "🤦",
    description: "A belief you had that data proved wrong",
    fillBlanks: [
      { id: "assumption", label: "What did you assume?", placeholder: "e.g. I thought annual plans would convert better", maxLength: 200 },
      { id: "reality", label: "What did the data actually show?", placeholder: "e.g. Monthly converted at 4x the rate", maxLength: 200 },
      { id: "takeaway", label: "What did you change?", placeholder: "e.g. Removed annual option, simplified to monthly only", maxLength: 200 },
    ],
    systemPrompt: `Generate ONE tweet (max 280 chars).

Pattern: Wrong Assumption
State your assumption, counter it with real data, share what you changed.

Example:
"I thought annual plans would convert better. Reality: monthly converted at 4x the rate. So I removed the annual option entirely. Revenue went up 22% the next month. Sometimes the 'best practice' is just wrong for your specific users."

Rules:
- Use specific numbers
- Show the before/after change
- Don't sound arrogant about being right — sound curious about being wrong`,
    tier: "free",
  },

  "cost-breakdown": {
    id: "cost-breakdown",
    name: "Cost Breakdown",
    emoji: "💸",
    description: "Transparent breakdown of your monthly costs",
    fillBlanks: [
      { id: "total", label: "What's your total monthly cost?", placeholder: "e.g. $847/month", maxLength: 100 },
      { id: "categories", label: "How does it break down?", placeholder: "e.g. $312 Postgres, $190 inference, $145 email, $200 misc", maxLength: 300 },
      { id: "insight", label: "What surprised you about the costs?", placeholder: "e.g. Email is 3x what I expected, inference costs dropped 60% after switching models", maxLength: 200 },
    ],
    systemPrompt: `Generate ONE tweet (max 280 chars).

Pattern: Cost Breakdown
Share your real monthly costs transparently. Founders love seeing real numbers.

Example:
"$847 to run my SaaS last month. $312 Postgres. $190 AI inference. $145 email (way too high — switching providers). $200 misc tools. The email cost surprised me most — it's 3x what I budgeted. Optimization target for this month."

Rules:
- List real categories with dollar amounts
- Include one surprising insight
- Don't humble-brag — be genuinely transparent`,
    tier: "pro",
  },

  "pricing-experiment": {
    id: "pricing-experiment",
    name: "Pricing Experiment",
    emoji: "🧪",
    description: "A pricing change you tested and the results",
    fillBlanks: [
      { id: "change", label: "What pricing change did you make?", placeholder: "e.g. Raised from $19 to $39/month", maxLength: 200 },
      { id: "expected", label: "What did you expect to happen?", placeholder: "e.g. Expected 20% churn from existing users", maxLength: 200 },
      { id: "actual", label: "What actually happened?", placeholder: "e.g. Trial→paid conversion went up 22%, churn was only 8%", maxLength: 200 },
    ],
    systemPrompt: `Generate ONE tweet (max 280 chars).

Pattern: Pricing Experiment
Describe the pricing change, what you feared, what actually happened.

Example:
"Raised my SaaS from $19 to $39/mo. Expected 20% churn. Instead: trial→paid conversion went up 22%, churn was only 8%. Lesson: I was undercharging and attracting price-sensitive users who churned anyway. Higher prices brought better customers."

Rules:
- Specific numbers for old price, new price, and results
- Include what you feared vs what happened
- Actionable takeaway`,
    tier: "pro",
  },

  "competitor-compliment": {
    id: "competitor-compliment",
    name: "Competitor Compliment",
    emoji: "🏆",
    description: "Genuinely praise something a competitor did well",
    fillBlanks: [
      { id: "competitor", label: "Which competitor?", placeholder: "e.g. Linear", maxLength: 100 },
      { id: "feature", label: "What did they ship that impressed you?", placeholder: "e.g. Their new keyboard-first issue tracking", maxLength: 200 },
      { id: "lesson", label: "What did you learn from it?", placeholder: "e.g. Speed > feature completeness for power users", maxLength: 200 },
    ],
    systemPrompt: `Generate ONE tweet (max 280 chars).

Pattern: Competitor Compliment
Genuinely praise something a competitor did. This builds credibility and shows confidence.

Example:
"Linear just shipped keyboard-first issue tracking and it's genuinely impressive. We compete in the same space and I still smiled using it. Lesson: speed matters more than feature count for power users. Stealing this insight for our next sprint."

Rules:
- Name the competitor explicitly
- Be specific about what impressed you
- End with what you learned from it
- Don't backhand — be genuinely complimentary`,
    tier: "pro",
  },

  "before-after-refactor": {
    id: "before-after-refactor",
    name: "Before / After Refactor",
    emoji: "⚡",
    description: "Technical improvement with measurable results",
    fillBlanks: [
      { id: "what", label: "What did you refactor?", placeholder: "e.g. Rewrote the payment processing module", maxLength: 200 },
      { id: "before", label: "What was it like before?", placeholder: "e.g. 2 second latency, 800 lines of code", maxLength: 200 },
      { id: "after", label: "What's the result?", placeholder: "e.g. 200ms latency, 40% less code", maxLength: 200 },
    ],
    systemPrompt: `Generate ONE tweet (max 280 chars).

Pattern: Before/After Refactor
Share a technical improvement with measurable before/after numbers.

Example:
"Rewrote the payment module this weekend. Before: 2s latency, 800 lines, 3 bugs/week. After: 200ms latency, 480 lines, zero bugs in 2 weeks. Sometimes the best feature you can ship is deleting code."

Rules:
- Specific before/after metrics
- Timeline (how long it took)
- Keep it technical but readable by non-engineers`,
    tier: "pro",
  },

  "user-message": {
    id: "user-message",
    name: "User Message Changed Roadmap",
    emoji: "💬",
    description: "A user message that made you change direction",
    fillBlanks: [
      { id: "message", label: "What did the user say?", placeholder: "e.g. 'I love your tool but I can't use it because it doesn't export to CSV'", maxLength: 300 },
      { id: "change", label: "What did you change?", placeholder: "e.g. Paused the analytics dashboard, built CSV export in 2 days", maxLength: 200 },
      { id: "outcome", label: "What was the result?", placeholder: "e.g. Retention went up 30% the following week", maxLength: 200 },
    ],
    systemPrompt: `Generate ONE tweet (max 280 chars).

Pattern: User Message Changed Roadmap
Share a specific user message that made you reprioritize your roadmap.

Example:
"A user wrote: 'I love your tool but I can't use it because no CSV export.' I had been building an analytics dashboard for 3 weeks. Paused it. Built CSV export in 2 days. Retention went up 30% that week. Sometimes the roadmap is wrong. Your users will tell you."

Rules:
- Quote the user message (or close paraphrase)
- Show what you were building vs what you built instead
- Include the outcome`,
    tier: "pro",
  },

  "build-vs-buy": {
    id: "build-vs-buy",
    name: "Build vs Buy",
    emoji: "🔧",
    description: "Decision to build in-house vs use a service",
    fillBlanks: [
      { id: "decision", label: "What did you build instead of buy?", placeholder: "e.g. Built our own auth system instead of using Clerk", maxLength: 200 },
      { id: "cost", label: "What's the ongoing cost?", placeholder: "e.g. 4 hours/month maintaining it, $0 direct cost", maxLength: 200 },
      { id: "verdict", label: "Was it worth it?", placeholder: "e.g. Worth it at our scale, but if I started over I'd just pay for Clerk", maxLength: 200 },
    ],
    systemPrompt: `Generate ONE tweet (max 280 chars).

Pattern: Build vs Buy
Share a build-vs-buy decision, the real ongoing cost, and whether you'd do it again.

Example:
"We built our own auth instead of using Clerk. Saved $99/mo. But: 4 hours/month maintaining it, one security scare that cost a weekend, and onboarding still isn't as smooth. Verdict: at $0 MRR, build is fine. Above $5k MRR, just pay for Clerk."

Rules:
- Name the specific service you didn't use
- Include real time/cost numbers
- Honest verdict — was it worth it?`,
    tier: "pro",
  },

  "customer-support-story": {
    id: "customer-support-story",
    name: "Customer Support Story",
    emoji: "🎧",
    description: "A support interaction that taught you something",
    fillBlanks: [
      { id: "ticket", label: "What was the support issue?", placeholder: "e.g. User couldn't figure out how to invite their team", maxLength: 200 },
      { id: "realization", label: "What did you realize?", placeholder: "e.g. The invite button was hidden behind 3 clicks", maxLength: 200 },
      { id: "fix", label: "What did you fix?", placeholder: "e.g. Added a big 'Invite Team' button on the empty state", maxLength: 200 },
    ],
    systemPrompt: `Generate ONE tweet (max 280 chars).

Pattern: Customer Support Story
Share a support interaction that revealed a deeper product problem.

Example:
"A user emailed: 'How do I invite my team?' 5 emails later, I realized: the invite button was behind Settings → Workspace → Members → Invite. Three clicks too deep. Moved it to the top of the dashboard. Support tickets about invites dropped to zero. Sometimes support isn't about answering questions — it's about making the question unnecessary."

Rules:
- Start with the user's question
- Reveal the real product problem
- End with the fix and result`,
    tier: "pro",
  },

  "copy-checklist": {
    id: "copy-checklist",
    name: "Copy-Paste Checklist",
    emoji: "📋",
    description: "Actionable checklist others can copy",
    fillBlanks: [
      { id: "topic", label: "What's the checklist for?", placeholder: "e.g. Pre-launch checklist for SaaS products", maxLength: 150 },
      { id: "items", label: "List 5-8 checklist items (one per line)", placeholder: "1. Set up error tracking\n2. Configure staging env\n3. Write rollback plan\n4. Test billing flow\n5. Prepare outage comms template", maxLength: 500 },
      { id: "why", label: "What prompted this checklist?", placeholder: "e.g. Missed 3 of these on my first launch and paid for it", maxLength: 200 },
    ],
    systemPrompt: `Generate ONE tweet (max 280 chars).

Pattern: Copy-Paste Checklist
Share a practical checklist others can save and use.

Example:
"My SaaS pre-launch checklist (save this):
1. Error tracking set up (Sentry)
2. Staging env that mirrors prod
3. Rollback plan written down
4. Billing tested with real card
5. Outage comms template ready
6. Support email forwarding configured
7. Database backups verified

Missed #4 on my first launch. Never again."

Rules:
- Numbered list
- Each item is actionable
- Share one mistake you made to build credibility
- Max 280 chars — keep items concise`,
    tier: "free",
  },

  "almost-quit": {
    id: "almost-quit",
    name: "Almost Quit Moment",
    emoji: "📉",
    description: "A specific moment you almost gave up",
    fillBlanks: [
      { id: "moment", label: "Describe the specific moment", placeholder: "e.g. Thursday 3pm, $847 AWS bill, 0 paying users, had the 'delete repo' dialog open", maxLength: 300 },
      { id: "why_not", label: "Why didn't you quit?", placeholder: "e.g. One user emailed saying the product saved them 10 hours that week", maxLength: 200 },
      { id: "now", label: "Where are you now?", placeholder: "e.g. $3.2k MRR, 47 paying customers, that same user is still a customer", maxLength: 200 },
    ],
    systemPrompt: `Generate ONE tweet (max 280 chars).

Pattern: Almost Quit Moment
Describe a vivid, specific moment you nearly gave up. Be cinematic.

Example:
"Thursday, 3:14pm. $847 AWS bill. Zero paying users. Had the 'delete repo' dialog open. Then an email: 'Your tool saved me 10 hours this week.' One user. One message. Closed the dialog. Today: $3.2k MRR, 47 customers. That user? Still a customer. Building is hard. Quitting is easy. One user can change everything."

Rules:
- Specific time, place, numbers
- Vivid detail (what did the screen look like?)
- The turn — what stopped you
- Where you are now`,
    tier: "pro",
  },

  "sixty-day-retro": {
    id: "sixty-day-retro",
    name: "60-Day Retro",
    emoji: "🔍",
    description: "What you learned in 60 days of building",
    fillBlanks: [
      { id: "project", label: "What have you been building?", placeholder: "e.g. A project management tool for designers", maxLength: 150 },
      { id: "wrong", label: "What did you get wrong?", placeholder: "e.g. Spent 6 weeks on the wrong problem — designers don't need another PM tool, they need a handoff tool", maxLength: 300 },
      { id: "right", label: "What did you get right?", placeholder: "e.g. Talking to 3 users every week caught the problem before it was too late", maxLength: 200 },
    ],
    systemPrompt: `Generate ONE tweet (max 280 chars).

Pattern: 60-Day Retro
Reflect honestly on 60 days of building. What went wrong, what went right.

Example:
"60 days building a PM tool for designers. What I got wrong: spent 6 weeks on the wrong problem. Designers don't need another PM tool — they need a handoff tool. What I got right: talking to 3 users every week. One of them told me the truth at week 5. Saved me 6 more months of building the wrong thing."

Rules:
- Specific timeframe
- One big thing you got wrong
- One thing you got right
- Forward-looking — what happens next`,
    tier: "pro",
  },

  "post-launch-different": {
    id: "post-launch-different",
    name: "Post-Launch: What I'd Do Different",
    emoji: "🔄",
    description: "After launching, what you'd change if starting over",
    fillBlanks: [
      { id: "launch", label: "What did you launch?", placeholder: "e.g. A no-code database builder", maxLength: 150 },
      { id: "different", label: "What would you do differently?", placeholder: "e.g. Launch with 1 integration instead of 10, charge from day 1", maxLength: 300 },
      { id: "advice", label: "What's your advice to someone starting today?", placeholder: "e.g. Ship when it's embarrassing, charge before you're ready", maxLength: 200 },
    ],
    systemPrompt: `Generate ONE tweet (max 280 chars).

Pattern: Post-Launch What I'd Do Different
After launching, what would you change? Be specific.

Example:
"Launched a no-code database builder 2 weeks ago. If I could go back: 1) Launch with 1 integration, not 10 — nobody used 8 of them. 2) Charge from day 1 — free users gave the worst feedback. 3) Build in public sooner — the audience compounds. Advice: ship when it's embarrassing, charge before you're ready."

Rules:
- Specific product name/type
- 2-3 concrete things you'd change
- End with actionable advice
- Don't be generic — use real numbers and details`,
    tier: "pro",
  },
};

// ── DeepSeek V4 ─────────────────────────────────────────────

const GLOBAL_SYSTEM_PROMPT = `You are an indie hacker building a SaaS product. Your tweets must follow these rules:

VOICE RULES:
- Write like a real person who codes, not a marketer
- Short sentences. No corporate jargon.
- Specific numbers > adjectives ("47% lower" not "much faster")
- Be honest about failures and uncertain about wins

FORMAT RULES:
- No emoji spam (max 1 emoji per tweet)
- No "thread 🧵" or "a thread 👇"
- No hashtag lists
- No ALL CAPS unless genuinely excited
- Max 280 chars

WHAT TO AVOID:
- "I'm excited to announce..."
- "We're thrilled to share..."
- "Just shipped! 🚀" (without context)
- "Can't believe this happened 🤯"
- Any sentence that could be in a press release`;

async function callDeepSeek(systemPrompt, userInput, apiKey) {
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-v4-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userInput },
      ],
      max_tokens: 350,
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`DeepSeek API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

// ── Helpers ─────────────────────────────────────────────────

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

// ── Route Handlers ──────────────────────────────────────────

async function handleGenerate(request, env) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const { patternId, answers } = body;

  if (!patternId || !answers) {
    return json({ error: 'Missing patternId or answers' }, 400);
  }

  const pattern = PATTERNS[patternId];
  if (!pattern) {
    return json({ error: `Unknown pattern: ${patternId}`, available: Object.keys(PATTERNS) }, 400);
  }

  const userLines = Object.entries(answers).map(([key, value]) => `${key}: ${value}`);
  const userPrompt = `Generate ONE tweet using these inputs:\n${userLines.join('\n')}`;
  const systemPrompt = `${GLOBAL_SYSTEM_PROMPT}\n\n${pattern.systemPrompt}`;

  try {
    const result = await callDeepSeek(systemPrompt, userPrompt, env.DEEPSEEK_API_KEY);
    return json({ result, pattern: patternId });
  } catch (err) {
    return json({ error: 'AI generation failed', detail: err.message }, 502);
  }
}

function handlePatterns() {
  const list = Object.values(PATTERNS).map(p => ({
    id: p.id,
    name: p.name,
    emoji: p.emoji,
    description: p.description,
    fillBlanks: p.fillBlanks,
    tier: p.tier,
  }));
  return json(list);
}

// ── Main Handler ────────────────────────────────────────────

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  // POST /api/generate
  if (path === '/api/generate') {
    return handleGenerate(request, env);
  }

  // GET /api/patterns
  if (path === '/api/patterns') {
    return handlePatterns();
  }

  // POST /api/webhooks/waffo — placeholder
  if (path === '/api/webhooks/waffo') {
    return json({ received: true });
  }

  // All other requests → serve static files
  return context.next();
}
