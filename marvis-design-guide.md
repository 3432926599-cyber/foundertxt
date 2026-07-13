# Marvis 设计风格 · 1:1 复现指南

> 来源：腾讯应用宝桌面客户端 `Marvis v1.60.1700.106` 源码逆向提取
> 适用于：Agent 自动编码 / 设计师参考 / 新项目搭建
> 配套文件：`marvis-design-system.css`（含全部组件 CSS 类名）

---

## 一、全局 Token（直接复制到 :root）

```css
:root {
  /* === 表面色 === */
  --mvs-bg-page:              #ffffff;
  --mvs-bg-content:           #f7f7f7;
  --mvs-bg-card:              rgba(255, 255, 255, 0.70);
  --mvs-bg-input:             rgba(0, 0, 0, 0.03);    /* #00000008 */
  --mvs-bg-hover:             rgba(0, 0, 0, 0.04);    /* #0000000a */
  --mvs-bg-active:            rgba(0, 0, 0, 0.06);    /* #0000000f */
  --mvs-bg-mask:              rgba(15, 15, 15, 0.20);
  --mvs-bg-toast:             #ffffff;
  --mvs-bg-banner:            rgba(123, 72, 53, 0.06); /* 仅特殊场景 */

  /* === 文字色（rgba 透明度层级，不用任何 hex 灰） === */
  --mvs-text-primary:         rgba(0, 0, 0, 0.85);    /* 标题、正文 */
  --mvs-text-secondary:       rgba(0, 0, 0, 0.65);    /* 辅助说明 */
  --mvs-text-tertiary:        rgba(0, 0, 0, 0.45);    /* 时间戳、副标题 */
  --mvs-text-placeholder:     rgba(0, 0, 0, 0.25);    /* placeholder */
  --mvs-text-icon:            rgba(0, 0, 0, 0.30);    /* 图标默认色 */
  --mvs-text-label:           #404040;                 /* 特殊标签 */
  --mvs-text-pure-black:      #000000;                 /* 少数标题用 */

  /* === 按钮色 === */
  --mvs-btn-primary-bg:       #0f0f0f;
  --mvs-btn-primary-bg-hover: rgba(15, 15, 15, 0.90);
  --mvs-btn-primary-bg-disabled: #2c2c2c;
  --mvs-btn-primary-text:     #ffffff;
  --mvs-btn-primary-text-disabled: rgba(255, 255, 255, 0.25);
  --mvs-btn-default-bg:       rgba(0, 0, 0, 0.05);    /* #0000000d */
  --mvs-btn-default-bg-hover: rgba(0, 0, 0, 0.10);    /* #0000001a */

  /* === 语义色 === */
  --mvs-color-error:          #f5222d;
  --mvs-color-error-alt:      #ff4d4f;
  --mvs-color-error-bg:       rgba(255, 63, 63, 0.08); /* #ff3f3f14 */
  --mvs-color-badge:          #f75040;
  --mvs-color-close-hover:    #f02c2c;

  /* === 点缀色（极低频） === */
  --mvs-color-accent-blue:    #0052d9;
  --mvs-color-accent-blue-hover: #003eb3;

  /* === 边框 === */
  --mvs-border-subtle:        1px solid rgba(15, 15, 15, 0.06);
  --mvs-border-window:        0.5px solid rgba(0, 0, 0, 0.20);

  /* === 排版 === */
  --mvs-font-ui:              -apple-system, BlinkMacSystemFont, 'Segoe UI',
                              'PingFang SC', 'Microsoft YaHei', sans-serif;
  --mvs-font-number:          'AvenirNext', 'Avenir Next', sans-serif;
  --mvs-font-chinese:         'Noto Sans SC', 'Microsoft YaHei', sans-serif;

  /* === 字号 === */
  --mvs-fs-hero:              24px;
  --mvs-fs-h1:                20px;
  --mvs-fs-h2:                18px;
  --mvs-fs-h3:                16px;
  --mvs-fs-body:              16px;
  --mvs-fs-body-sm:           14px;
  --mvs-fs-caption:           12px;
  --mvs-fs-tiny:              10px;

  /* === 字重（只用 400 和 500，700 仅特殊场景） === */
  --mvs-fw-regular:           400;
  --mvs-fw-medium:            500;
  --mvs-fw-semibold:          600;
  --mvs-fw-bold:              700;

  /* === 行高 === */
  --mvs-lh-heading-xl:        38px;
  --mvs-lh-heading-lg:        32px;
  --mvs-lh-heading:           28px;
  --mvs-lh-body:              24px;
  --mvs-lh-body-sm:           22px;
  --mvs-lh-caption-lg:        20px;
  --mvs-lh-caption:           18px;

  /* === 圆角 === */
  --mvs-radius-window:        32px;
  --mvs-radius-modal:         24px;
  --mvs-radius-card:          20px;
  --mvs-radius-card-sm:       16px;
  --mvs-radius-input:         12px;
  --mvs-radius-tab:           8px;
  --mvs-radius-tab-sm:        6px;
  --mvs-radius-pill-sm:       28px;
  --mvs-radius-pill-xs:       18px;
  --mvs-radius-pill:          100px;
  --mvs-radius-full:          9999px;

  /* === 阴影（一律单层、极轻柔） === */
  --mvs-shadow-toast:         0 8px 16px rgba(0, 0, 0, 0.02);
  --mvs-shadow-modal:         0 24px 32px rgba(0, 0, 0, 0.12);
  --mvs-shadow-menu:          0 4px 10px rgba(0, 0, 0, 0.20);
  --mvs-shadow-tooltip:       0 8px 24px rgba(0, 0, 0, 0.12),
                              0 2px 8px rgba(0, 0, 0, 0.08);

  /* === 间距（4px 网格） === */
  --mvs-space-xs:             4px;
  --mvs-space-sm:             8px;
  --mvs-space-md:             12px;
  --mvs-space-lg:             16px;
  --mvs-space-xl:             20px;
  --mvs-space-2xl:            24px;
  --mvs-space-3xl:            32px;
  --mvs-space-4xl:            40px;
  --mvs-space-5xl:            48px;

  /* === 动效 === */
  --mvs-duration-hover:       150ms;
  --mvs-duration-toast-in:    300ms;
  --mvs-duration-toast-out:   250ms;
  --mvs-duration-expand:      250ms;
  --mvs-duration-page:        433ms;
  --mvs-easing-default:       ease;
  --mvs-easing-out:           ease-out;
  --mvs-easing-in:            ease-in;

  /* === 毛玻璃 === */
  --mvs-blur-toast:           blur(4px);
  --mvs-blur-qrcode:          blur(3.5px);
}
```

---

## 二、组件一比一规格

### 2.1 按钮 `<button>`

| 变体 | 背景 | 文字 | 圆角 | 高度 | 字号 | 字重 | padding |
|------|------|------|------|------|------|------|---------|
| Primary | `#0f0f0f` | `#fff` | 28px | 40px | 16px | 500 | 0 20px |
| Primary hover | `rgba(15,15,15,0.90)` | `#fff` | — | — | — | — | — |
| Primary disabled | `#2c2c2c` | `rgba(255,255,255,0.25)` | — | — | — | — | — |
| Default | `rgba(0,0,0,0.05)` | `rgba(0,0,0,0.85)` | 28px | 40px | 16px | 500 | 0 20px |
| Default hover | `rgba(0,0,0,0.10)` | — | — | — | — | — | — |
| Large | `#0f0f0f` | `#fff` | 40px | 64px | 20px | 500 | 0 40px |
| Compact | 同 Primary/Default | — | 28px | 30px | 12px | 500 | 0 12px |

**规则**：
- 按钮 `transition: background-color 150ms ease`
- `line-height` = `height`（文字垂直居中）
- `cursor: pointer`，禁用时 `cursor: not-allowed; opacity: 0.5`
- 不要给按钮加 `box-shadow`
- 不要用彩色按钮（蓝色 `#0052d9` 仅限登录认证场景）

### 2.2 输入框 `<input>`

```
背景:       rgba(0, 0, 0, 0.03)   /* #00000008 */
圆角:       12px
高度:       44px（紧凑 33px）
padding:    0 16px（紧凑 0 12px）
文字:       16px / 400 / rgba(0,0,0,0.85)
placeholder:14px / 400 / rgba(0,0,0,0.25)
字体:       Noto Sans CJK SC（中文输入）
border:     none（不要边框！）
outline:    none
```

**密码输入框额外规则**：
- `letter-spacing: 2px`
- 右侧眼睛图标按钮（24px × 24px，颜色 `rgba(0,0,0,0.45)`，hover → `rgba(0,0,0,0.75)`）

**多行文本区**：
```
背景:       rgba(0, 0, 0, 0.03)
圆角:       12px
padding:    14px
文字:       16px / 400 / #000
placeholder:rgba(0,0,0,0.25)
resize:     none
```

### 2.3 模态框 `<dialog>`

```
遮罩:       rgba(15, 15, 15, 0.20) fixed inset 0
面板:       #fff + 32px padding + 24px border-radius
阴影:       0 24px 32px rgba(0,0,0,0.12)
边框:       1px solid rgba(15,15,15,0.06)

标题:       20px / 500 / rgba(0,0,0,0.85) / 28px line-height
正文:       14px / 400 / rgba(0,0,0,0.65) / 22px line-height
正文间距:   margin-bottom: 24px

Footer:     display: flex; justify-content: flex-end; gap: 12px

关闭按钮:   右上角 10px,10px
            28×28px 圆形
            颜色 rgba(0,0,0,0.30)
            hover 背景 rgba(0,0,0,0.04)
            危险变体 hover → 红底白字 #f02c2c
            SVG 图标 16×16px
```

### 2.4 Toast 通知

```
容器:       #fff + backdrop-filter: blur(4px) + 20px border-radius
            + border: 1px solid #ffffff
            + box-shadow: 0 8px 16px rgba(0,0,0,0.02)
尺寸:       max-width 540px / height 84px
padding:    20px 24px 20px 20px
gap:        12px

左图标:     44×44px 圆形 + rgba(0,0,0,0.02) 背景
            内嵌 28×28px img

标题:       14px / 500 / #000 / 22px
            单行截断 overflow:hidden; text-overflow:ellipsis; white-space:nowrap

副标题:     12px / 400 / rgba(0,0,0,0.45) / 18px
            单行截断

操作按钮:   96px × 40px / 28px 圆角 / rgba(0,0,0,0.04) 背景
            文字 16px / 500 / #000
            hover → rgba(0,0,0,0.06)

入场动画:   @keyframes slideInFromTop
            0%   { transform: translateY(-100%) scale(0.6); opacity: 0.6; }
            100% { transform: translateY(0) scale(1); opacity: 1; }
            时长 300ms ease-out

出场动画:   @keyframes slideOutToTop
            0%   { transform: translateY(0) scale(1); opacity: 1; }
            100% { transform: translateY(-120%); opacity: 0; }
            时长 250ms ease-in

紧凑模式:   max-width 419px / height 63px / padding 16px 20px 16px 16px
            图标 33×33px / img 21×21px / 按钮 72px × 30px
```

### 2.5 卡片（模块卡片）

```
背景:       rgba(255, 255, 255, 0.70)
圆角:       24px（紧凑 18px）

Header:     display: flex; justify-content: space-between
            padding: 16px 28px 16px 20px（紧凑 12px 24px 12px 15px）
            user-select: none

标题:       14px / 500 / #000 / line-height 1.5714
描述:       12px / 400 / rgba(0,0,0,0.45) / line-height 1.5
            单行截断

折叠箭头:   20×20px / transition: transform 250ms ease
            展开 → rotate(-180deg)
Body:       max-height 动画 250ms ease / padding 0 20px 16px
```

### 2.6 右键菜单

```
容器:       #fff / 12px 圆角 / 0 4px 10px rgba(0,0,0,0.20) 阴影
            list-style: none / padding: 0

菜单项:     min-width 160px / 14px / 500 / rgba(0,0,0,0.85)
            height 32px / line-height 32px
            padding 0 8px / margin 7px / border-radius 8px
            cursor pointer
            hover → rgba(0,0,0,0.05) 背景
```

### 2.7 红点徽章

```
标准徽章:   min-width 16px / height 16px / padding 0 4px
            border-radius 50px（完美胶囊）
            background #f75040 / color #fff
            font-size 12px / font-weight 500 / line-height 1
            Windows 下文字向上偏移 0.5px

圆点徽章:   9×9px / padding 0 / border-radius 8px
            background #f14144
```

### 2.8 图片预览器

```
遮罩:       rgba(0,0,0,0.80) fixed inset 0
            cursor: zoom-out

图片:       max-width 90% / max-height 90% / border-radius 8px
            object-fit: contain / cursor: default
            缩放: transform-origin center center

工具栏:     96px × 36px / #444 背景 / 28px 圆角
            position absolute top 40px left 50% translateX(-50%)
            内部分割线 1px × 14px / rgba(255,255,255,0.20)

操作按钮:   16×16px / transparent 背景 / color #fff
            hover → rgba(255,255,255,0.12)
            禁用 → opacity 0.35

关闭按钮:   36×36px / #444 背景 / 18px 圆角
            position fixed top 40px right 40px

左右箭头:   36×36px / #444 背景 / 18px 圆角
            position fixed top 50% translateY(-50%)
```

### 2.9 Tooltip

```
padding:     10px 12px
背景:        #fff
圆角:        12px
阴影:        0 10px 24px rgba(0,0,0,0.12)
文字:        13px / 400 / rgba(0,0,0,0.65) / 20px
max-width:   304px
```

### 2.10 加载旋转器

```
标准:        24×24px
             background: conic-gradient(from 90deg, transparent 0deg, rgba(0,0,0,0.08) 360deg)
             border-radius: 50%
             animation: spin 800ms linear infinite

小型:        16×16px（按钮内用）

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(-360deg); }  /* 注意：逆时针 */
}
```

### 2.11 设置面板（双栏布局）

```
侧边栏:     196px（紧凑 148px）
            背景 #fff
            header: 64px 高 / padding 16px 24px / 标题 14px/400/rgba(0,0,0,0.45)
            标签项: 36px 高 / 8px 圆角 / 14px/400/#000
                   hover/active → rgba(0,0,0,0.04) 背景
                   含 20×20px SVG + 文字 + 可选徽章
                   间距 4px / padding 0 11px

内容区:     flex:1 / 背景 #f7f7f7 / 右侧圆角 24px
            header: 64px 高 / padding 12px 48px / 标题 14px/500/#000

关闭按钮:   右上角 / 28×28px / 颜色 rgba(15,15,15,0.45) / hover → rgba(0,0,0,0.04)
```

### 2.12 开关 / 复选框

```
复选框容器: display:flex / align-items:center / gap:6px / cursor:pointer
图标:       20×20px SVG
文字:       16px / 400 / #000
```

### 2.13 进度步骤条

```
步骤圆点:   16×16px（紧凑 12×12px）
            背景 rgba(0,0,0,0.04) / 圆形
            数字 12px/600/rgba(0,0,0,0.45)
连接线:     1px × 24px（紧凑 18px）/ rgba(0,0,0,0.12)
            激活态 → #000
步骤文字:   14px/400/#000 / 22px / 单行截断
```

### 2.14 分割线

```
宽 100% / 高 1px / 背景 rgba(0,0,0,0.04) / 无边距
```

### 2.15 头像

```
SM:  20×20px / 圆形 / object-fit: cover
MD:  32×32px / 圆形
LG:  46×46px / 圆形
带边框: +1px solid rgba(0,0,0,0.06)
```

---

## 三、响应式断点

| 断点 | 宽度 | CSS 变量 | 效果 |
|------|------|----------|------|
| **xs** | ≤901px | `--breakpoint-tier: "xs"` | 最小布局 |
| **sm** | ≤1081px | `--breakpoint-tier: "sm"` | 紧凑布局 |
| **md** | ≤1324px | `--breakpoint-tier: "md"` | 标准缩放 |
| **lg** | >1324px | `--breakpoint-tier: "lg"` | 全尺寸 |

**紧凑模式触发条件**：宽度 ≤1324px **或** 高度 ≤769px
```
--dialog-view-compact: 1
效果：所有间距缩小约 25%、圆角降一档、字号缩小
```

---

## 四、动效规范

| 类型 | 时长 | 缓动 | 属性 |
|------|------|------|------|
| hover 过渡 | 150ms | ease | background-color |
| Toast 入场 | 300ms | ease-out | transform + opacity |
| Toast 出场 | 250ms | ease-in | transform + opacity |
| 模块展开 | 250ms | ease | max-height |
| 模块箭头 | 250ms | ease | transform: rotate |
| 页面切换 | 433ms | ease-out | opacity + transform |
| 进度环 | 300ms | ease | stroke-dashoffset |
| 加载旋转 | 800ms | linear | transform: rotate |

**铁律**：
- 只用 `transform` + `opacity` 做动画（不触发布局重排）
- 必须响应 `@media (prefers-reduced-motion: reduce)`

---

## 五、全局规则（Agent 编码检查清单）

1. **全局 `box-sizing: border-box`**
2. **body 字体**：`var(--mvs-font-ui)` / 16px / 400 / `var(--mvs-text-primary)` / 背景 `#fff`
3. **禁用系统默认样式**：`-webkit-tap-highlight-color: transparent`、`touch-action: manipulation`、`-webkit-text-size-adjust: 100%`
4. **文本抗锯齿**：`-webkit-font-smoothing: antialiased` / `-moz-osx-font-smoothing: grayscale`
5. **不要用任何 hex 灰色**（如 `#999` `#ccc` `#eee` `#f5f5f5`）——全部用 `rgba(0,0,0,*)` 透明度
6. **不要用 `border-radius: 0`** ——最小 6px
7. **不要给按钮加彩色** ——主按钮只用 `#0f0f0f`，蓝色 `#0052d9` 仅登录场景
8. **不要用多层阴影或彩色阴影**
9. **按钮不设 `box-shadow`**
10. **字重只用 400/500**，700 仅特殊强调
11. **圆角不要混用** ——窗口 32px / 模态 24px / 卡片 20px / 输入 12px / 标签 8px
12. **边框不显眼** ——`1px solid rgba(15,15,15,0.06)` 几乎是 invisible
13. **所有图标用 SVG**，不用 emoji
14. **动画全部 GPU 加速** ——只用 `transform` + `opacity`
15. **毛玻璃仅用于 Toast** ——`backdrop-filter: blur(4px)`
16. **间距全部 4 的倍数** ——4/8/12/16/20/24/32/40/48

---

## 六、装饰层（非 UI 组件，按需使用）

### 角锥渐变 Banner
用于页面顶部的装饰条（1420px × 52px），颜色序列：
```
cyan → teal → blue → pink → light-pink → green → yellow-amber → light-blue
```
使用 `conic-gradient` 配合 `foreignObject` 实现。在产品中是非必要的装饰元素。

### 毛玻璃图标
设置齿轮图标使用：
- 径向渐变 `#76879D` → `#B2BEC8`（蓝灰色系）
- `backdrop-filter: blur(5px)` + `clip-path`
- 内圈深色渐变 `#8595A8` → `#B2BEC8`
- 中心亮色 `#F5F9FE`

### 加载动画
使用 PAG 格式（腾讯自研动画），包含：
- 品牌 IP 角色动画（蓝白机器猫头鹰形象）
- Logo 入场动画（scale + clip-path mask）
- 团队展示动画

### 品牌 IP
一个蓝白色、圆形、类似猫头鹰或企鹅的吉祥物形象，出现在启动页和加载动画中。

---

## 七、快速自检问题

从 Marvis 风格拷问你的实现：

1. 「这个灰色是 hex 还是 rgba？」— 必须是 rgba
2. 「这个按钮有圆角吗？」— 最小 20px，必须是胶囊形
3. 「这个阴影是第几层？」— 最多一层，而且必须极轻
4. 「这个字重是多少？」— 不是 400 就是 500
5. 「这个彩色是哪来的？」— 除了蓝 `#0052d9` 和红 `#f5222d`，不应该有其他彩色
6. 「这个间距能被 4 整除吗？」— 必须能
