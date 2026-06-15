# 锚点 · Anchor

> 用系统对抗混乱，用逻辑重塑日常。

一个聚焦**系统思维、决策与效率**的个人博客，采用现代工业 / 生产力风格（效率蓝 + 活力橙），基于 **React + Vite + Tailwind CSS** 构建。

## ✨ 功能

- 📝 用 **Markdown** 写文章（支持标题、列表、**表格**、引用、代码块、链接、图片等）
- 🏷️ 按**标签**筛选文章
- 🌗 **明暗主题**一键切换（自动记忆偏好）
- 📱 **响应式**布局，手机 / 平板 / 电脑都好看
- ⚡ 构建产物是**纯静态文件**，可免费部署到 GitHub Pages / Vercel / Netlify
- 🔌 零第三方 UI 依赖，自带轻量路由和 Markdown 渲染

## 🚀 本地运行

**前置条件：** 已安装 Node.js

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev
```

然后在浏览器打开终端里显示的地址（默认 http://localhost:3000）。

## 📦 构建与部署

```bash
npm run build      # 产物输出到 dist/
npm run preview    # 本地预览构建结果
```

把 `dist/` 目录上传到任意静态托管平台即可。

### 部署到 Cloudflare Pages（推荐，支持自有域名）

1. 登录 [Cloudflare 控制台](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. 选择本仓库（支持私有仓库，无需公开代码），构建设置：
   - **Framework preset**：`Vite`
   - **Build command**：`npm run build`
   - **Build output directory**：`dist`
3. 点击 **Save and Deploy**，几分钟后会得到一个 `xxx.pages.dev` 网址
4. 绑定自有域名：进入该 Pages 项目 → **Custom domains** → **Set up a domain** → 输入你的域名，按提示添加 DNS 记录（域名在 Cloudflare 托管时会自动配置）

> 之后每次推送到 `main` 分支，Cloudflare 会自动重新构建并部署。

## ✍️ 如何添加 / 修改内容

| 想做的事 | 改这个文件 |
| --- | --- |
| 站点名称、简介、社交链接、"关于"页面 | `data/site.ts` |
| 新增或编辑文章 | `data/posts.ts` |

**新增一篇文章**：在 `data/posts.ts` 的 `posts` 数组里复制一个对象，修改 `slug`（URL 标识）、`title`、`date`、`tags` 和 `content`（Markdown 正文）即可。

## 🗂️ 项目结构

```
├── index.html          # 入口 HTML（字体、Tailwind 配置）
├── index.tsx           # React 挂载入口
├── App.tsx             # 路由与整体布局
├── types.ts            # 类型定义
├── data/
│   ├── site.ts         # 站点配置
│   └── posts.ts        # 文章数据
├── components/         # 页面与 UI 组件
└── utils/              # 路由、日期、阅读时长、Markdown 工具
```
