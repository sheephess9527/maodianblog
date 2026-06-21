# 锚点 · Anchor

> 用系统对抗混乱，用逻辑重塑日常。

一个聚焦**系统思维、决策与效率**的个人博客，现代工业 / 生产力风格（效率蓝 + 活力橙），基于 **React 19 + Vite + Tailwind CSS** 构建，部署在 **Cloudflare Pages**，线上地址 [www.maodian.uk](https://www.maodian.uk)。

构建产物是**纯静态文件**，无服务端、无数据库。

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
- 🔗 **微信 / 社交分享卡片**：构建时为每篇文章生成静态 `/post/[slug]/index.html`，带正确的 OG / Twitter meta，解决 SPA + hash 路由抓取不到卡片的问题
- 🔁 **Web Share API**：原生分享，不支持时降级为复制链接

**外观与 PWA**
- 🌗 **明暗主题**一键切换（自动记忆偏好）
- 📱 **响应式**布局，手机 / 平板 / 电脑自适应
- 🏠 **PWA**：含 manifest 与定制 App 图标（靛蓝 + 涟漪 + 白锚），可加到主屏

**写作后台**
- ✍️ **Sveltia CMS**（`/admin`）：用 GitHub Token 登录的可视化写作后台，无需本地环境即可发文

## 🏗️ 架构要点

文章数量持续增长（目前 80+ 篇），因此采用了**元数据与正文分离 + 懒加载**的架构，保证主包体积不随文章数膨胀：

- **`virtual:posts-meta`**（虚拟模块）：构建时由 `postsMetaPlugin` 读取所有 `.md` 的 frontmatter，生成轻量元数据（标题、日期、标签、摘要、阅读时长、用于搜索的纯文本），打包进主包供列表 / 搜索 / 路由使用。
- **正文懒加载**：每篇文章的 Markdown 正文通过 `import.meta.glob` 拆成独立 JS chunk，由 `PostPage` 在打开文章时按需加载，加载期间显示骨架屏。

`vite.config.ts` 中的三个自定义插件：

| 插件 | 作用 |
| --- | --- |
| `postsMetaPlugin` | 生成 `virtual:posts-meta` 元数据模块 |
| `rssPlugin` | 构建时生成 `dist/rss.xml`（最新 20 篇） |
| `articleMetaPlugin` | 为每篇文章生成静态 OG 页 `dist/post/[slug]/index.html` |

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

### 部署到 Cloudflare Pages

1. [Cloudflare 控制台](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. 选择本仓库（支持私有仓库），构建设置：
   - **Framework preset**：`Vite`
   - **Build command**：`npm run build`
   - **Build output directory**：`dist`
3. **Save and Deploy**，几分钟后得到 `xxx.pages.dev` 网址
4. 绑定自有域名：项目 → **Custom domains** → **Set up a domain**

> 之后每次推送到 `main` 分支，Cloudflare 会自动重新构建并部署。缓存策略见 `public/_headers`（HTML 入口禁缓存以避免白屏，带哈希的静态资源长期缓存）。

## 💬 评论区配置（giscus）

评论基于 GitHub Discussions，配置在 `data/site.ts` 的 `comments.giscus`：

1. 在仓库 **Settings → Features** 勾选 **Discussions**
2. 安装 [giscus app](https://github.com/apps/giscus) 并授权本仓库
3. 在 [giscus.app](https://giscus.app) 输入仓库，拿到 `repoId` 和 `categoryId` 填入配置
4. `enabled` 设为 `false` 可整体隐藏评论区

> 评论按文章 slug 一一映射（`data-mapping="specific"`），每篇文章独立讨论帖。

## 🗂️ 项目结构

```
├── index.html               # 入口 HTML（字体、Tailwind 配置）
├── index.tsx                # React 挂载入口
├── App.tsx                  # 路由与整体布局
├── types.ts                 # 类型定义
├── virtual.d.ts             # virtual:posts-meta 类型声明
├── vite.config.ts           # 构建配置 + 三个自定义插件
├── content/posts/*.md       # 文章（Markdown + frontmatter）
├── data/
│   ├── site.ts              # 站点配置（名称、社交、评论）
│   └── posts.ts             # 元数据导入 + 正文懒加载逻辑
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
- **Tailwind CSS**（CDN 配置于 `index.html`）
- **highlight.js** 代码高亮
- 自研：hash 路由、Markdown 渲染、frontmatter 解析，零第三方 UI / 路由依赖
- **giscus** 评论、**Abacus** 阅读统计、**Sveltia CMS** 写作后台

## 📝 更新日志

### 2026-06
- **评论区**：接入 giscus（GitHub Discussions），主题随明暗模式自动切换，按文章 slug 独立映射
- **阅读进度条**：文章页顶部细线随滚动实时显示
- **相关文章**：文章底部按相同标签推荐
- **代码复制按钮**：代码块右上角一键复制
- **RSS 订阅**：页脚入口 + `/rss.xml`，文章链接改为干净的 `/post/xxx`
- **架构优化**：文章元数据与正文分离，正文按需懒加载，主包体积不再随文章数增长
- **微信 / 社交分享卡片**：构建时生成每篇文章的静态 OG 页
- **App 图标重设计**：靛蓝渐变 + 涟漪同心圆 + 白锚
- **移动端目录**：浮动按钮 + 底部抽屉式 TOC
