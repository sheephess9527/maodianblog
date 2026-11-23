# 锚点 · Anchor

> 用系统对抗混乱，用逻辑重塑日常。

一个聚焦**系统思维、决策与效率**的个人博客，现代工业 / 生产力风格（效率蓝 + 活力橙），基于 **React 19 + Vite + Tailwind CSS** 构建，部署在 **Cloudflare Workers**，线上地址 [www.maodian.uk](https://www.maodian.uk)。

构建产物是**纯静态文件**，无服务端、无数据库。

---

## 🤝 接手指南（AI / 新账号必读）

> 这一节让任何新的 AI 或新登录的账号都能立刻接手。**先读完这一节再动手。**

### 一句话现状
个人中文博客，仓库 `sheephess9527/maodianblog`，开发分支 `main`，推到 `main` 后 **Cloudflare Workers Builds 自动构建并部署**到 [www.maodian.uk](https://www.maodian.uk)，约 1–2 分钟生效。`dist/` 由 Cloudflare 在云端构建，**无需提交**。目前 88+ 篇文章。

### 凭据
推送需要一个对该仓库有 **push 权限的 GitHub Personal Access Token**。它通过会话环境提供，**绝不写进仓库**。新接手者若没有，向仓库主人索取。

### 日常最高频任务：发布文章
用户最常说「**写/更新今天的四篇**」，含义是每个板块各一篇：**系统思维 / 决策 / 效率 / 思考**（有时只要两篇或指定方向）。流程：

1. **先列已有 slug 防止选题重复**：`ls content/posts/`。
2. 每篇新建 `content/posts/<英文-slug>.md`，frontmatter 见下方《如何添加内容》。
3. **封面必填**：`cover: https://picsum.photos/seed/N/1200/800`，`N` 取比现有最大 seed 更大的数（`rg -oN --no-filename "seed/(\d+)/" content/posts -r '$1' | sort -n | tail -1` 查最大值，依次 +1）。缺封面卡片会退化成纯标题块。
4. `npm run build` 验证无错（会顺带生成 RSS 和静态文章页）。
5. 提交并推送（见下方《推送》）。

> **草稿审阅**：用户有时说「先不发，我认可后再发」。此时只写本地文件、**不要 build/commit/push**，等用户确认后再发。Stop hook 可能提示「未提交/未跟踪文件」，这是预期的，忽略即可。

### 文风规范（保持一致很重要）
- **全程中文**，正文里**不要夹突兀的英文单词**（概念首次出现可在标题/括号注明英文，如「损失厌恶（loss aversion）」，但正文叙述用中文）。
- 结构：**反直觉的钩子或小故事开头** → `##` 小标题分段 → 多用破折号、短段落、口语化 → **结尾落到一个对读者的提问或可执行的小行动**。
- 调性：发人深省、引起共鸣；常借经典概念（梅多斯系统思维、卡尼曼、芒格、马克·吐温等）切入，再落到日常。
- 长度：每篇约 250–400 行 Markdown（含小标题），读来约 3–5 分钟。

### 推送（含限流应急方案）
正常：`git push origin main`（或带 PAT 的 HTTPS URL）。

> ⚠️ **已知坑**：同一会话短时间内推送多次，GitHub 会对 `git push` 端点触发**二级频率限制**，返回 **403**（但 `git fetch`/读操作仍正常、token 权限也正常）。这不是 token 失效，也不是被墙。
>
> **应急方案**：改用 **GitHub Contents API** 提交（不同端点，不受该限流影响）。对每个文件 `PUT /repos/sheephess9527/maodianblog/contents/<路径>`，body 为 `{"message","content"(base64),"branch":"main"}`；**更新已有文件**需先 `GET …/contents/<路径>?ref=main` 取 `sha` 一并带上。提交后用 `git fetch` + `git reset --hard FETCH_HEAD` 把本地同步到远端，保持历史干净。限流通常一小时内自解除。

### 架构红线（别踩，否则线上会坏）
- 🚫 **别把静态分享页改回「空壳 + 跳转」**。`articleMetaPlugin` 现在把每篇文章渲染成**完整自包含静态 HTML**（内联样式、无跳转、不依赖 SPA）。这是为根治**微信打开分享链接白屏**而做的——微信老旧 WebView 跑不起整个 SPA。改回去会重现白屏/死循环。
- 🚫 **关键渲染路径别依赖国内打不开的资源**。React 与 Tailwind CSS 均本地打包；首屏内容和样式**不得**依赖 `aistudiocdn`、Google Fonts、Tailwind CDN 等被墙/不稳定的外链才能显示。Google Fonts 异步加载，系统字体兜底。
- ⚠️ **路由**：SPA 用 hash 路由（`/#/post/slug`）；对外/分享链接用干净的 `/post/slug`（静态文章页）。新文章自动进入 `import.meta.glob` 懒加载，无需改代码。

### 验证白屏类问题（可选但推荐）
本环境预装 Playwright（全局 `/opt/node22/lib/node_modules/playwright`，Chromium 在 `/opt/pw-browsers/chromium`）。可 `cd dist && python3 -m http.server 8099` 起静态服务，再用 Playwright 冷加载 `http://localhost:8099/post/<slug>` 与 `/#/post/<slug>`，检查 `#root` 是否有内容、有无 `pageerror`，以此复现「冷启动/分享页」类问题。

---

## ✨ 功能

**阅读体验**
- 📝 **Markdown 文章**：支持标题、列表、表格、引用、代码块、链接、图片等
- 📑 **文章目录（TOC）**：桌面端右侧悬浮，移动端浮动按钮 + 底部抽屉
- 📊 **阅读进度条**：文章页顶部细线随滚动实时显示进度
- 🔖 **阅读位置记忆**：离开后再回到文章，自动恢复到上次读到的位置
- 🔗 **相关文章**：文章底部按相同标签推荐最多 3 篇
- 👁️ **阅读次数**：通过 [Abacus](https://abacus.jasoncameron.dev) 统计（无需后端）
- 💬 **评论区**：基于 giscus（GitHub Discussions），主题随明暗模式自动切换
- 📋 **代码复制按钮**：代码块右上角一键复制

**导航与发现**
- 🏷️ **标签筛选**：按板块（系统思维 / 决策 / 效率 / 思考）浏览，带"加载更多"分页
- 🔍 **全文搜索**：标题、摘要、标签、正文，支持键盘导航（↑↓ / Enter / Esc）
- 📡 **RSS 订阅**：`/rss.xml`，页脚提供订阅入口

**分享与 SEO**
- 🔗 **自包含静态文章页**：构建时为每篇文章生成 `/post/[slug]/index.html`，是一篇**完整、内联样式、不依赖 SPA/CDN 的静态文章**（含正文）+ 正确的 OG / Twitter meta。微信、爬虫、老旧浏览器都能直接读全文，不白屏；底部链接通往 App（评论 / 更多）。
- 🔁 **Web Share API**：原生分享，不支持时降级为复制链接

**外观与 PWA**
- 🌗 **明暗主题**一键切换（自动记忆偏好）
- 📱 **响应式**布局，手机 / 平板 / 电脑自适应
- 🏠 **PWA**：含 manifest 与定制 App 图标（靛蓝 + 涟漪 + 白锚），可加到主屏

**写作后台**
- ✍️ **Sveltia CMS**（`/admin`）：用 GitHub Token 登录的可视化写作后台，无需本地环境即可发文

## 🏗️ 架构要点

文章数量持续增长，因此采用了**元数据、正文与搜索分离 + 懒加载**的架构，避免正文和搜索摘录挤占首页主包：

- **`virtual:posts-meta`**（虚拟模块）：构建时由 `postsMetaPlugin` 读取所有 `.md` 的 frontmatter，生成列表元数据（标题、日期、标签、摘要、阅读时长），供列表 / 路由使用；正文的 500 字搜索摘录独立为 `virtual:posts-search`，只随搜索框下载，原搜索匹配范围和排序不变。主包不随正文大小增长，但仍随文章数量增长。
- **正文懒加载**：每篇文章的 Markdown 正文通过 `import.meta.glob` 拆成独立 JS chunk，加载映射在 `data/postContent.ts`，由 `PostPage` 在打开文章时按需加载，加载期间显示骨架屏；首页不再包含整份正文 chunk 映射。
- **页面与高亮分包**：文章、标签、关于和搜索按需加载，首页不再下载 highlight.js。现有代码围栏只有 `text` 与无标记，保留完整高亮语言集，避免改变无标记代码的自动检测结果。
- **构建期 CSS**：Tailwind CSS v3 经 PostCSS / Autoprefixer 生成本地 CSS（`index.css` → Vite），沿用原配色、字体和 class 暗色模式；`tailwind.config.js` 扫描入口、组件、工具和数据目录。条件分支使用完整类名，无需 safelist；新增动态拼接须补 safelist。未启用 typography 插件，与原无插件 CDN 一致。
- **封面与字体**：卡片使用同 seed 的 Picsum 600×400（`utils/cardCover.ts`），声明尺寸，头条高优先级且在入口 HTML 预加载，其余在距视口 300px 才设置 src，配合异步解码 / 原生懒加载（不支持 IntersectionObserver 时回退原生懒加载）。原始 1200×800 封面仍用于文章与 OG / 静态页。
- **首页字体字集**：Google Fonts 保持原字体 / 全部字重及 `display=swap`；构建时与首页共用 `utils/homeSections.ts` 选文，汇总卡片、全部标签、站点配置及首页组件固定文字，生成 `text=` 字集请求，避免为几百个字下载大量 CJK 分片。新文章自动更新，不需要构建时联网；字集 URL 过长时回退完整字体。进入其他路由 / 打开搜索时恢复完整字体样式，保持正文与结果中的任意文字显示；仍使用 print/onload 异步样式和 noscript 兜底。新增首页文字来源须同步纳入字集。

`vite.config.ts` 中的三个自定义插件：

| 插件 | 作用 |
| --- | --- |
| `postsMetaPlugin` | 生成列表元数据 / 懒加载搜索摘录，注入首页头条预加载与字体字集 |
| `rssPlugin` | 构建时生成 `dist/rss.xml`（最新 20 篇） |
| `articleMetaPlugin` | 为每篇文章生成**自包含静态文章页** `dist/post/[slug]/index.html`（含正文 + OG meta，内含构建期 Markdown→HTML 渲染器） |

## ✍️ 如何添加 / 修改内容

### 方式一：可视化后台（推荐）

访问线上的 `/admin`，用 GitHub Personal Access Token 登录，即可在浏览器里写 / 改 / 删文章，保存后自动提交到 GitHub，约 1–2 分钟后网站自动更新。

### 方式二：直接写 Markdown 文件

在 `content/posts/` 下新建一个 `your-slug.md`（文件名即 URL 标识），frontmatter 格式如下：

```markdown
---
title: 文章标题
date: 2026-06-23
author: 锚点
excerpt: 一句话摘要，用于列表和分享卡片。
tags:
  - 系统思维
cover: https://picsum.photos/seed/750/1200/800
---

正文用 Markdown 书写……
```

字段说明：
- `tags`：用板块名（系统思维 / 决策 / 效率 / 思考），第一个标签作为卡片分类显示
- `cover`：封面图 URL（缺失时卡片会退化为纯标题块，建议都填）
- 阅读时长根据正文字数自动计算，无需手写

### 站点配置

| 想做的事 | 改这个文件 |
| --- | --- |
| 站点名称、简介、社交链接、"关于"页面 | `data/site.ts` |
| 评论区开关与 giscus 配置 | `data/site.ts` 的 `comments` 字段 |

## 🚀 本地运行

**前置条件：** 已安装 Node.js

```bash
npm install      # 安装依赖
npm run dev      # 启动开发服务器（默认 http://localhost:3000）
```

## 📦 构建与部署

```bash
npm run build      # 产物输出到 dist/（含 rss.xml 与各文章 OG 页）
npm run preview    # 本地预览构建结果
```

性能相关单元测试：`node --experimental-strip-types --test tests/performance.test.mjs`（Node 22+）。跑移动 Lighthouse 时，新旧构建须使用相同的 gzip / Brotli 静态服务，三次取中位数；默认模拟限速的 LCP 与 breakdown 实测时间轴须分别标注，不能相加混用。

### 部署到 Cloudflare Workers

生产站点由 Workers Builds 构建，构建命令为 `npm run build`，`wrangler.jsonc` 把 `dist/` 配置为静态资源目录，无需 Worker 脚本。缓存策略见 `public/_headers`（HTML 入口禁缓存以避免白屏，带哈希的静态资源长期缓存）。

Vite 会把 `public/404.html` 复制到 `dist/404.html`；`assets.not_found_handling = "404-page"` 让未匹配的请求返回 HTTP 404 和该页面，而不是以 200 返回首页。标签（`/#/tag/标签`）、关于（`/#/about`）和首页的搜索弹窗仍由 SPA 处理，文章分享页和已有静态资源照常提供。

验证路由：先运行 `npm run build`，再运行 `npx wrangler dev --port 8787`，在另一终端运行 `node --test tests/routing.test.mjs`。普通的 Vite 预览不能验证 Cloudflare 的 404 状态码。

## 💬 评论区配置（giscus）

评论基于 GitHub Discussions，配置在 `data/site.ts` 的 `comments.giscus`：

1. 在仓库 **Settings → Features** 勾选 **Discussions**
2. 安装 [giscus app](https://github.com/apps/giscus) 并授权本仓库
3. 在 [giscus.app](https://giscus.app) 输入仓库，拿到 `repoId` 和 `categoryId` 填入配置
4. `enabled` 设为 `false` 可整体隐藏评论区

> 评论按文章 slug 一一映射（`data-mapping="specific"`），每篇文章独立讨论帖。

## 🗂️ 项目结构

```
├── index.html               # 入口 HTML（异步字体、PWA、内联样式）
├── index.css                # Tailwind 样式入口
├── tailwind.config.js       # 类名扫描、字体、品牌色与暗色配置
├── postcss.config.js        # Tailwind / Autoprefixer 构建管线
├── index.tsx                # React 挂载入口
├── App.tsx                  # 路由与整体布局
├── types.ts                 # 类型定义
├── virtual.d.ts             # virtual:posts-meta 类型声明
├── vite.config.ts           # 构建配置 + 三个自定义插件
├── content/posts/*.md       # 文章（Markdown + frontmatter）
├── data/
│   ├── site.ts              # 站点配置（名称、社交、评论）
│   ├── posts.ts             # 列表元数据导入
│   └── postContent.ts       # 文章正文懒加载映射
├── components/              # 页面与 UI 组件
│   ├── PostPage / PostCard / HomePage / TagPage / AboutPage
│   ├── Markdown             # 自研 Markdown 渲染（含代码高亮、复制按钮）
│   ├── Comments             # giscus 评论区
│   ├── SearchModal / TableOfContents / Header / Footer …
├── utils/                   # Hooks 与工具
│   ├── useHashRoute         # hash 路由
│   ├── useReadingPosition   # 阅读位置记忆
│   ├── useViewCount         # 阅读次数
│   ├── useDocumentMeta      # 动态 OG meta
│   └── extractHeadings / formatDate / readingTime
└── public/
    ├── icons/               # PWA / favicon 图标
    ├── manifest.webmanifest # PWA 清单
    ├── _headers             # Cloudflare 缓存策略
    └── admin/               # Sveltia CMS 写作后台
```

## 🛠️ 技术栈

- **React 19** + **TypeScript** + **Vite 6**
- **Tailwind CSS v3**（本地构建，配置于 `tailwind.config.js`）
- **highlight.js** 代码高亮
- 自研：hash 路由、Markdown 渲染、frontmatter 解析，零第三方 UI / 路由依赖
- **giscus** 评论、**Abacus** 阅读统计、**Sveltia CMS** 写作后台

## 📝 更新日志

### 移动端加载优化
- **压缩服务实测**：同机 Brotli / gzip 静态服务、Lighthouse 默认移动模拟，三次中位数：原 main 的性能 53 → 90，LCP 14.52 → 3.70 秒，FCP 2.63 → 0.80 秒，TBT 676 → 26 毫秒，传输 2.91 MB → 0.40 MB。主包 1564.62 → 295.72 kB（gzip 529.64 → 99.08 kB）；这是本地对照，不等同于线上真实网络。
- **第二轮**：按 Lighthouse 请求体积拆出仅搜索需要的正文摘录与文章加载映射；首页按实际文字请求字体字集，不删字重，其他路由 / 搜索仍加载完整字体；预加载头条，限制数屏外封面的提前下载。对照改用 gzip / Brotli 静态服务，保留自包含静态文章页。
- 移除运行时 Tailwind CDN 和未使用的 React importmap，样式改为本地构建；保留原内联样式与自包含静态文章页。
- 文章 / 高亮、标签、关于、搜索按需加载；首页卡片缩图与优先级优化；字体不再阻塞首屏渲染，最终外观保持原设计。

### 2026-06
- **修复微信分享白屏**：分享页从「空壳 + 跳转 SPA」改为**自包含静态文章页**（构建期把 Markdown 渲染成完整 HTML，内联样式、不依赖 SPA/CDN）。根因是微信老旧 WebView 跑不起整个 SPA。
- **评论区**：接入 giscus（GitHub Discussions），主题随明暗模式自动切换，按文章 slug 独立映射
- **阅读进度条**：文章页顶部细线随滚动实时显示
- **相关文章**：文章底部按相同标签推荐
- **代码复制按钮**：代码块右上角一键复制
- **RSS 订阅**：页脚入口 + `/rss.xml`，文章链接改为干净的 `/post/xxx`
- **架构优化**：文章元数据与正文分离，正文按需懒加载，主包体积不再随文章数增长
- **微信 / 社交分享卡片**：构建时生成每篇文章的静态 OG 页
- **App 图标重设计**：靛蓝渐变 + 涟漪同心圆 + 白锚
- **移动端目录**：浮动按钮 + 底部抽屉式 TOC
