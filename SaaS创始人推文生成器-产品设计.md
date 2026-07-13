# 🥇 SaaS 创始人推文生成器 — 详细产品设计

> 设计日期：2026-07-13
> 数据来源：Reddit/Indie Hackers/Product Hunt 社区验证 + 14 种已验证内容模式 + 竞品差评分析

---

## 一、需求验证摘要

### 用户痛点（已验证）

| 痛点 | 来源 | 严重度 |
|------|------|:--:|
| 空白屏幕瘫痪 — 不知道今天发什么 | 80+ 创始人访谈，Product Hunt | 🔴 |
| 写一篇好帖平均 2-3 小时 → 写了 3 次就 burnout | 同上 | 🔴 |
| AI 工具文风像"Sheldon"或"卖课导师" | 竞品差评（TweetHunter/Postwise） | 🟡 |
| 默认只发产品更新 → 没互动 → 没人看 | 500+ 帖子分析 | 🔴 |
| MRR 截图 → 算法惩罚（读作炫富） | 2026 X 算法更新 | 🟡 |

### 已验证的内容需求

14 种高互动内容模式（来自创作者真实数据）：

| # | 模式 | 转化力 | 示例 |
|---|------|:--:|------|
| 1 | 数字+教训 | ⭐⭐⭐ | "$2.1K MRR，70% 来自一条差点没发的 Reddit 评论" |
| 2 | 成本拆解 | ⭐⭐⭐ | "$847 上个月。$312 Postgres，$190 推理，$145 邮件" |
| 3 | 定价实验 | ⭐⭐⭐ | "从 $19 涨到 $39，预期流失，结果 trial→paid 涨了 22%" |
| 4 | 已死功能 | ⭐⭐ | "Q1 上线了 X，用量曲线 → 平线。我误读了用户什么" |
| 5 | 错误假设+证据 | ⭐⭐⭐ | "我以为年付会转化，实际月付转化率是 4 倍" |
| 6 | 竞品赞美 | ⭐⭐ | "竞品 X 刚发了 Y，做得比我们好" |
| 7 | 重构前后对比 | ⭐⭐ | "重写了支付模块，延迟从 2s 降到 200ms，代码少了 40%" |
| 8 | 用户消息改变路线图 | ⭐⭐⭐ | 截图真实用户反馈 → 你改了什么 |
| 9 | Build vs Buy | ⭐⭐ | "我们自建了 auth 而不是用 Clerk，这是我每月花的 4 小时" |
| 10 | 客户支持故事 | ⭐⭐ | "一个工单教会我的关于用户的事" |
| 11 | 可复制清单 | ⭐⭐⭐ | "上线前检查清单，建议复制粘贴" |
| 12 | 差点放弃的时刻 | ⭐⭐ | "具体哪个周四下午，哪张账单，哪次对话" |
| 13 | 60天复盘 | ⭐⭐ | "我烧了 6 周追错了切入点，我是怎么发现的" |
| 14 | 上线后"我会怎么做不同" | ⭐⭐ | "上线两周后，有了真实数据" |

### 竞品缺口

| 竞品 | 价格 | 问题 |
|------|------|------|
| TweetHunter | $99/月 | 太贵、UI 混乱、文风"bro culture" |
| Typefully | $12.50/月 | AI 太弱、只是排版工具 |
| Postwise | $37/月 | AI 内容公式化 |
| 通用 AI（ChatGPT） | $20/月 | 不懂创始人语境，输出像教科书 |

**缺口：没有人做"给独立开发者/SaaS 创始人的专门推文工具"。**

---

## 二、产品定义

### 一句话

> **选一个已验证的创始人内容模式 → 填你的具体信息 → AI 生成有真人感的推文**

### 不是

- ❌ 不是通用推文生成器（ChatGPT 就能做）
- ❌ 不是社交媒体管理平台（Buffer/Hootsuite 市场已死）
- ❌ 不是"AI 帮你运营 Twitter"（太宽泛）

### 是

- ✅ **内容模式的麦当劳套餐**："我想要一个'错误假设+证据'类型的帖子"
- ✅ **创始人语气的 AI 翻译器**：把"我改了支付"变成独立开发者会写的话
- ✅ **每天 30 秒出推文的系统**：选模板 → 填 3 个空 → 生成 → 复制

---

## 三、页面设计

### 主页面（唯一功能页）

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  🚀 FounderTxt                                       │
│  Tweets that sound like you, not ChatGPT             │
│                                                      │
│  Step 1: Pick a post type                            │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐  │
│  │💰 Metric│ │💀 Dead │ │🤦 Wrong│ │📦 Launch │  │
│  │+Lesson │ │ Feature │ │Assumption│ │Checklist│  │
│  └─────────┘ └─────────┘ └─────────┘ └──────────┘  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐  │
│  │🔧 Build│ │💬 User │ │📉 Almost│ │🏆 Competitor│ │
│  │ vs Buy │ │Message │ │  Quit  │ │ Compliment│  │
│  └─────────┘ └─────────┘ └─────────┘ └──────────┘  │
│  ... + 6 more                                       │
│                                                      │
│  Step 2: Fill in the blanks                          │
│  ┌──────────────────────────────────────────────┐   │
│  │ What metric surprised you?                   │   │
│  │ [70% of my signups came from one Reddit     ]│   │
│  │                                              │   │
│  │ What's the lesson?                           │   │
│  │ [Reply to posts where people are already    ]│   │
│  │ [looking for a solution, don't make new posts]│   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│         [✨ Generate Tweet]                          │
│                                                      │
│  ┌─ Result ────────────────────────────────────┐    │
│  │                                             │    │
│  │ $2.1k MRR, and 70% of it came from one     │    │
│  │ Reddit comment I almost didn't write.       │    │
│  │                                             │    │
│  │ I thought it would look spammy. Instead     │    │
│  │ it became my #1 acquisition channel.        │    │
│  │                                             │    │
│  │ Lesson: reply to posts where people are     │    │
│  │ already looking for a solution. Don't       │    │
│  │ make new posts hoping they find you.        │    │
│  │                                             │    │
│  │ [Copy] [Regenerate] [Try different pattern] │    │
│  └─────────────────────────────────────────────┘    │
│                                                      │
│  Free: 3 posts/day · Pro: unlimited + all patterns   │
│  [Upgrade $5/mo →]                                  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 交互流程

```
用户打开 / → 看到 14 个卡片（内容模式）
  → 点一个卡片（如 "Metric + Lesson"）
  → 看到 2-3 个填空（针对该模式的引导问题）
  → 填完 → 点 Generate
  → 看到结果 + 可复制 → 免费用户每日 3 次
  → 用完 → "今日免费次数已用完 → 升级 $5/月 无限用"
```

### 关键设计决策

1. **模式卡片先行，不是文本框先行**
   - 普通工具：给一个空文本框 → "写什么？" → 空白屏瘫痪
   - 我们：14 个卡片 → "哦，我今天可以说说我改支付的事" → 选「重构前后」

2. **填空式输入，不是自由输入**
   - 每个模式有 2-3 个填空，引导用户提供关键信息
   - 消除"我该写什么"的决策疲劳
   - 填空的答案就是 AI 的原材料

3. **一次一个模式**
   - 不做"选多个模式混合"
   - 降低认知负担

---

## 四、14 种内容模式的数据结构

每个模式 = 模板名 + 引导问题 + AI prompt 模板

### 示例：模式 1 — Metric + Lesson

```typescript
{
  id: "metric-lesson",
  name: "Metric + Lesson",
  emoji: "💰",
  description: "Share a number with a surprising insight",
  fillBlanks: [
    { label: "What metric surprised you?", placeholder: "70% of my signups came from...", maxLength: 200 },
    { label: "What's the lesson?", placeholder: "Reply to existing posts instead of...", maxLength: 200 },
  ],
  systemPrompt: `You are an indie hacker who builds SaaS products. 
Write a tweet in authentic founder voice. Rules:
- Start with the metric (specific number)
- Add the non-obvious lesson
- Sound like a real person, not a marketer
- No emoji spam, no "🚀", no "thread 🧵"
- No hashtags unless naturally part of the sentence
- Max 280 chars for main tweet`,
}
```

### 示例：模式 4 — Dead Feature

```typescript
{
  id: "dead-feature",
  name: "Dead Feature",
  emoji: "💀",
  description: "A feature you shipped that nobody used",
  fillBlanks: [
    { label: "What feature did you build?", placeholder: "A drag-and-drop dashboard builder...", maxLength: 200 },
    { label: "What did the usage data show?", placeholder: "3 users in 2 months, all churned within a week", maxLength: 200 },
    { label: "What did you learn?", placeholder: "Users didn't want customization, they wanted a pre-built report", maxLength: 200 },
  ],
  systemPrompt: "...",
}
```

---

## 五、技术架构

### 技术栈

| 层 | 选型 | 原因 |
|---|------|------|
| 框架 | Next.js 16 (App Router) | Vercel 部署，SEO |
| 样式 | Tailwind CSS | 14 个卡片快速布局 |
| AI | DeepInfra Llama 3.1 8B 或 GPT-5.4-nano 备选 | $0.02/百万 token |
| 数据库 | Supabase | 免费层，存用户+次数+历史 |
| 认证 | Supabase Auth（邮箱） | 零配置 |
| 支付 | Waffo Pancake | MoR，支付宝提现 |
| 部署 | Vercel | 免费层 |

### 成本估算

| 项目 | 月成本 |
|------|:--:|
| Vercel | $0 |
| Supabase | $0 |
| AI API（DeepInfra） | ~$10（1000 用户日活） |
| Waffo 手续费 | 3.9%+$0.50/笔 |
| **总成本** | **~$10-15/月** |

### 代码结构

```
founder-txt/
├── app/
│   ├── page.tsx                # 唯一页面
│   ├── layout.tsx
│   ├── api/
│   │   ├── generate/route.ts   # POST: 生成推文
│   │   └── webhooks/waffo/route.ts
│   ├── login/page.tsx
│   ├── tos/page.tsx
│   ├── privacy/page.tsx
│   └── refund/page.tsx
├── lib/
│   ├── patterns.ts             # 14 种内容模式的数据定义
│   ├── ai.ts                   # AI API 封装
│   ├── supabase.ts
│   └── usage.ts                # 免费次数检查
├── components/
│   ├── PatternGrid.tsx          # 14 个模式卡片
│   ├── FillBlanks.tsx           # 填空输入区
│   ├── ResultCard.tsx           # 生成结果
│   └── UpgradeBanner.tsx        # 升级提示
└── .env.local
```

### 核心 API：`app/api/generate/route.ts`

```typescript
// 伪代码
POST /api/generate
Body: { patternId: "metric-lesson", answers: { metric: "...", lesson: "..." } }

1. 验证登录（Supabase Auth）
2. 查 usage 表 → 免费用户是否还有今日次数（3次/天）
3. 从 patterns.ts 取对应 pattern 的 systemPrompt
4. 拼装 prompt: systemPrompt + answers + few-shot examples
5. 调 DeepInfra API
6. usage 次数 -1
7. 存结果到 history 表
8. 返回 { result: "生成的推文", remaining: 2 }
```

---

## 六、AI Prompt 设计（关键差异化）

### 核心 System Prompt（全局）

```
You are an indie hacker building a SaaS product. 
Your tweets must follow these rules:

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
- Max 280 chars for a single tweet

WHAT TO AVOID:
- "I'm excited to announce..."
- "We're thrilled to share..."
- "Just shipped! 🚀" (without context)
- "Can't believe this happened 🤯"
- Any sentence that could be in a press release
```

### 模式级 Prompt（以 Metric+Lesson 为例）

```
Generate ONE tweet (max 280 chars) using the founder's inputs.
Pattern: Metric + Lesson

The tweet must:
1. Start with the specific number
2. Then reveal the non-obvious insight
3. End with the practical lesson

Example output style:
"$2.1k MRR, and 70% of it came from one Reddit comment I almost didn't write. I thought it would look spammy. Lesson: reply to existing threads where people are already looking for a solution."

User provided:
- Metric: {{metric}}
- Lesson: {{lesson}}
```

---

## 七、变现

### 定价

| 档位 | 价格 | 内容 |
|------|------|------|
| Free | $0 | 3 次/天，4 种模式 |
| Pro | **$5/月** | 无限次，14 种全部模式，历史记录 |

### Waffo 集成

```
1. Waffo 创建订阅 Product → 复制 ID
2. Upgrade 按钮 → 跳 Waffo checkout URL
3. Webhook subscription.active → Supabase users.tier = 'pro'
4. subscription.expired → 降级 free
```

---

## 八、开发排期

| # | 任务 | 时间 |
|---|------|:--:|
| 1 | Next.js 项目初始化 + Tailwind + Supabase | 30min |
| 2 | Supabase Auth（邮箱注册/登录） | 30min |
| 3 | 14 种模式数据定义（patterns.ts） | 1h |
| 4 | 主页面 UI（模式卡片网格 + 填空 + 结果） | 1.5h |
| 5 | AI API 封装 + 模式级 prompt 模板 | 1h |
| 6 | 免费次数逻辑 + usage 表 | 30min |
| 7 | Waffo Product + checkout + webhook | 45min |
| 8 | TOS / Privacy / Refund | 30min |
| 9 | Vercel 部署 | 10min |
| **总计** | | **~6 小时** |

---

## 九、与竞品的差异化总结

| | FounderTxt | TweetHunter | Typefully | ChatGPT |
|------|:--:|:--:|:--:|:--:|
| 价格 | **$5/月** | $99/月 | $12.50/月 | $20/月 |
| 懂创始人语境 | ✅ 14 种模式 | ⚠️ 部分 | ❌ | ❌ |
| 先选模式再写 | ✅ | ❌（自由输入） | ❌ | ❌ |
| AI 文风 | 真人创始人 | "bro culture" | 弱 | 教科书 |
| 复杂度 | 一个页面 | 功能太多 | 中等 | 通用 |
| 目标用户 | 独立开发者 | 增长黑客 | 写作者 | 所有人 |

---

## 十、获客策略

### Week 1-2：Reddit + Indie Hackers + X

直接在你的目标用户所在地发帖：

**Reddit 帖子模板**：
> "I analyzed 500+ founder tweets that got 100+ likes. Found 14 patterns that consistently work. Built a free tool that turns these patterns into templates — you just fill in the blanks."
> → r/SaaS, r/indiehackers, r/SideProject, r/Entrepreneur

**X/Twitter 策略**：
- 用你自己的工具生成推文（dogfooding）
- 分享你分析 500 条推文发现的规律
- 每条推文末尾贴工具链接

### Week 3：Product Hunt 周日上线

- 定位："Battle-tested tweet templates for indie founders"

### Week 4+：内容飞轮

- 在 Indie Hackers / Dev.to 发布「14 种已验证的创始人推文模式」长文
- 文末引导到工具

---

## 十一、风险与对策

| 风险 | 概率 | 对策 |
|------|:--:|------|
| 模式不够多/不够好 | 低 | 已验证 14 种，后续可加用户投稿模式 |
| AI 输出质量不稳定 | 中 | prompt 用 few-shot examples 锁定输出格式 |
| 竞品抄袭（太容易复制） | 高 | 速度优势 + 创始人社区深耕（他们不愿做窄） |
| 没人付费 | 中 | 先 Reddit 发帖收集 waitlist，有人登记再开发 |
| 市场规模太小 | 中 | 这是验证项目不是大生意，100 付费用户就够了 |

---

## 十二、盈亏分析

| 付费用户 | 月收入（到手） | 月成本 |
|:--:|:--:|:--:|
| 10 | ~$43 | ~$10 |
| 50 | ~$215 | ~$15 |
| 100 | ~$431 | ~$20 |

> 10 个用户回本。目标 50 用户 = 月净收入 $200。验证成功标准。
