# CLAUDE.md

给 Claude Code 的项目操作指令。**动手前先读这份 + README 的「🤝 接手指南」章节。**

## 项目速览
- 个人中文博客「锚点 · Anchor」，聚焦 **系统思维 / 决策 / 效率 / 思考**。
- 仓库 `sheephess9527/maodianblog`，开发分支 **`main`**。
- 推到 `main` → **Cloudflare Pages 自动构建部署** → [www.maodian.uk](https://www.maodian.uk)，约 1–2 分钟生效。
- React 19 + TypeScript + Vite 6，纯静态、无后端。`dist/` 由云端构建，**不要提交**。

## 常用命令
```bash
npm install
npm run dev          # 本地开发 http://localhost:3000
npm run build        # 构建到 dist/（顺带生成 rss.xml 和各文章静态页）
npm run preview      # 预览构建结果
```

## 最高频任务：发布文章
用户常说「**写/更新今天的四篇**」= 四个板块各一篇（系统思维 / 决策 / 效率 / 思考；有时只要两篇或指定方向）。

1. **先列已有 slug 防重复**：`ls content/posts/`。
2. 每篇新建 `content/posts/<英文-slug>.md`，frontmatter：
   ```markdown
   ---
   title: 文章标题
   date: YYYY-MM-DD
   author: 锚点
   excerpt: 一句话摘要（用于列表与分享卡片）。
   tags:
     - 系统思维      # 板块名：系统思维 / 决策 / 效率 / 思考
   cover: https://picsum.photos/seed/N/1200/800
   ---
   正文……
   ```
3. **封面必填**。`N` 取比现有最大 seed 大的数：
   `rg -oN --no-filename "seed/(\d+)/" content/posts -r '$1' | sort -n | tail -1`（当前最大 **757**，依次往后取）。缺封面卡片会退化成纯标题块。
4. `npm run build` 验证无错。
5. 提交并推送（见下）。

**草稿审阅**：用户说「先不发，我认可后再发」时，只写本地文件，**不要 build/commit/push**，等确认。Stop hook 提示「未提交/未跟踪」属预期，忽略。

## 文风规范
- **全程中文**，正文**不夹生硬英文**（概念可在标题/括号注英文，如「损失厌恶（loss aversion）」，正文叙述用中文）。
- 结构：**反直觉钩子或小故事开头** → `##` 小标题分段 → 多用破折号、短段落 → **结尾落到对读者的提问或可执行的小行动**。
- 调性：发人深省、引共鸣；常借经典概念（梅多斯、卡尼曼、芒格、马克·吐温等）切入再落到日常。
- 篇幅：每篇约 250–400 行 Markdown，读约 3–5 分钟。

## 推送（含限流应急 ⚠️）
正常：`git push origin main`。

**已知坑**：同一会话频繁推送会触发 GitHub 对 `git push` 端点的**二级频率限制 → 403**（但 `git fetch`/读、token 权限都正常；不是 token 失效、不是被墙）。

**应急方案**：改用 **GitHub Contents API**（不同端点，不受此限流）：
- 对每个文件 `PUT /repos/sheephess9527/maodianblog/contents/<路径>`，body `{"message","content"(base64),"branch":"main"}`。
- **更新已有文件**要先 `GET …/contents/<路径>?ref=main` 取 `sha` 一并带上。
- 提交后 `git fetch` + `git reset --hard FETCH_HEAD` 同步本地。
- 限流通常一小时内自解除。

凭据：需有 push 权限的 **GitHub Token**，由会话环境提供，**绝不写进仓库/CLAUDE.md/README**。

## 架构红线（别踩，踩了线上会坏）
- 🚫 **别把静态分享页改回「空壳 + 跳转」**。`vite.config.ts` 的 `articleMetaPlugin` 把每篇文章渲染成**完整自包含静态 HTML**（内联样式、无跳转、不依赖 SPA）。这是根治**微信打开分享链接白屏**的关键——微信老旧 WebView 跑不起整个 SPA。改回去会重现白屏/死循环。
- 🚫 **关键渲染路径别依赖国内打不开的资源**（aistudiocdn、Google Fonts、Tailwind CDN 等被墙/不稳定的外链）。React 已打包进 bundle；正文内容不得依赖外链才能显示（Tailwind 现走 CDN，仅影响样式、可降级）。
- ⚠️ **路由**：SPA 用 hash 路由 `/#/post/slug`；对外/分享链接用干净的 `/post/slug`（静态文章页）。新文章自动进入 `import.meta.glob` 懒加载，无需改代码。

## 架构要点
- **元数据/正文分离 + 懒加载**：`postsMetaPlugin` 构建时把所有 `.md` 的 frontmatter 生成 `virtual:posts-meta`（打进主包）；正文经 `import.meta.glob` 拆成独立 chunk，`PostPage` 按需加载。主包体积不随文章数增长。
- `vite.config.ts` 三个插件：`postsMetaPlugin`（元数据虚拟模块）、`rssPlugin`（`dist/rss.xml`）、`articleMetaPlugin`（自包含静态文章页 + OG meta，内含构建期 Markdown→HTML 渲染器）。

## 关键文件
| 路径 | 作用 |
| --- | --- |
| `content/posts/*.md` | 文章（Markdown + frontmatter） |
| `data/site.ts` | 站点配置：名称、社交、`comments.giscus` 评论开关 |
| `data/posts.ts` | 元数据导入 + 正文懒加载 |
| `vite.config.ts` | 构建配置 + 三个自定义插件（含静态文章页生成）|
| `components/PostPage.tsx` | 文章页（进度条、相关文章、评论、TOC）|
| `components/Markdown.tsx` | 前端自研 Markdown 渲染（代码高亮 + 复制按钮）|
| `components/Comments.tsx` | giscus 评论 |
| `public/admin/` | Sveltia CMS 写作后台（`/admin`，GitHub Token 登录）|

## 验证白屏类问题（推荐）
预装 Playwright（全局 `/opt/node22/lib/node_modules/playwright`，Chromium `/opt/pw-browsers/chromium`）。
`cd dist && python3 -m http.server 8099`，再用 Playwright 冷加载 `http://localhost:8099/post/<slug>` 与 `/#/post/<slug>`，检查 `#root` 是否有内容、有无 `pageerror`，复现「冷启动/分享页」类问题。

> 临时文件写到会话 scratchpad 目录，别用 `/tmp`（会被清理）。
