import fs from 'fs';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

import { cloudflare } from "@cloudflare/vite-plugin";

// ── 公共 frontmatter 解析 ─────────────────────────────────
// 简版：只处理 key: value（RSS / OG 插件用）
function parseFm(raw: string): Record<string, string> {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw);
  if (!m) return {};
  const data: Record<string, string> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z0-9_]+):\s*(.+)$/.exec(line);
    if (kv) data[kv[1]] = kv[2].trim().replace(/^['"]|['"]$/g, '');
  }
  return data;
}

// 完整版：支持 block-sequence 数组（tags 用）
function parseFmFull(raw: string): Record<string, string | string[]> {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw);
  if (!m) return {};
  const data: Record<string, string | string[]> = {};
  const lines = m[1].split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    const kv = /^([A-Za-z0-9_]+):\s*(.*)$/.exec(line);
    if (!kv) { i++; continue; }
    const key = kv[1];
    const rest = kv[2].trim().replace(/^['"]|['"]$/g, '');
    if (rest === '') {
      const items: string[] = [];
      i++;
      while (i < lines.length && /^\s+-\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s+-\s+/, '').replace(/^['"]|['"]$/g, '').trim());
        i++;
      }
      data[key] = items;
    } else {
      data[key] = rest;
      i++;
    }
  }
  return data;
}

function toSearchText(body: string): string {
  return body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]+`/g, ' ')
    .replace(/#{1,6}\s+/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_~|>!\[\]()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500);
}

// ── 构建期 Markdown → HTML（用于生成自包含的静态文章页）──────
// 与前端 Markdown 组件等价的极简实现，供微信/爬虫等无法运行 SPA 的环境直接阅读。
function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/"/g, '&quot;');
}
function mdInline(text: string): string {
  let t = escapeHtml(text);
  t = t.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, a, s) => `<img src="${s}" alt="${a}" loading="lazy">`);
  t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, txt, href) => {
    const ext = /^https?:\/\//.test(href);
    return `<a href="${href}"${ext ? ' target="_blank" rel="noopener noreferrer"' : ''}>${txt}</a>`;
  });
  t = t.replace(/`([^`]+)`/g, (_m, c) => `<code>${c}</code>`);
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return t;
}
function mdToHtml(src: string): string {
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  let i = 0;
  const isListStart = (l: string) => /^[-*]\s+/.test(l.trim()) || /^\d+\.\s+/.test(l.trim());
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') { i++; continue; }
    // 代码块
    if (line.trim().startsWith('```')) {
      i++;
      const code: string[] = [];
      while (i < lines.length && !lines[i].trim().startsWith('```')) { code.push(lines[i]); i++; }
      i++;
      out.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);
      continue;
    }
    // 标题
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) { const lv = h[1].length; out.push(`<h${lv}>${mdInline(h[2])}</h${lv}>`); i++; continue; }
    // 分隔线
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) { out.push('<hr>'); i++; continue; }
    // 表格（GFM）
    if (line.trim().startsWith('|') && i + 1 < lines.length &&
        /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1]) && lines[i + 1].includes('-')) {
      const splitRow = (r: string) => r.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
      const headers = splitRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) { rows.push(splitRow(lines[i])); i++; }
      const thead = `<tr>${headers.map((c) => `<th>${mdInline(c)}</th>`).join('')}</tr>`;
      const tbody = rows.map((r) => `<tr>${r.map((c) => `<td>${mdInline(c)}</td>`).join('')}</tr>`).join('');
      out.push(`<table>${thead}${tbody}</table>`);
      continue;
    }
    // 引用
    if (line.trim().startsWith('>')) {
      const q: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) { q.push(lines[i].replace(/^\s*>\s?/, '')); i++; }
      out.push(`<blockquote>${mdInline(q.join(' '))}</blockquote>`);
      continue;
    }
    // 有序列表
    if (/^\d+\.\s+/.test(line.trim())) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) { items.push(lines[i].trim().replace(/^\d+\.\s+/, '')); i++; }
      out.push(`<ol>${items.map((it) => `<li>${mdInline(it)}</li>`).join('')}</ol>`);
      continue;
    }
    // 无序列表
    if (/^[-*]\s+/.test(line.trim())) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) { items.push(lines[i].trim().replace(/^[-*]\s+/, '')); i++; }
      out.push(`<ul>${items.map((it) => `<li>${mdInline(it)}</li>`).join('')}</ul>`);
      continue;
    }
    // 段落
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() !== '' && !lines[i].trim().startsWith('```') &&
           !/^#{1,4}\s/.test(lines[i]) && !lines[i].trim().startsWith('>') && !lines[i].trim().startsWith('|') &&
           !isListStart(lines[i]) && !/^(-{3,}|\*{3,}|_{3,})$/.test(lines[i].trim())) {
      para.push(lines[i]); i++;
    }
    out.push(`<p>${mdInline(para.join(' '))}</p>`);
  }
  return out.join('\n');
}

function rssPlugin(): Plugin {
  return {
    name: 'generate-rss',
    apply: 'build',
    closeBundle() {
      const postsDir = path.resolve(__dirname, 'content/posts');
      const outDir   = path.resolve(__dirname, 'dist');
      if (!fs.existsSync(postsDir)) return;

      const base = 'https://www.maodian.uk';
      const items = fs
        .readdirSync(postsDir)
        .filter((f) => f.endsWith('.md'))
        .map((f) => {
          const slug = f.replace(/\.md$/, '');
          const data = parseFm(fs.readFileSync(path.join(postsDir, f), 'utf-8'));
          return { slug, ...data };
        })
        .filter((p) => p.title && p.date)
        .sort((a, b) => String(b.date).localeCompare(String(a.date)))
        .slice(0, 20)
        .map(
          (p) => `
    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>${base}/post/${p.slug}</link>
      <guid isPermaLink="true">${base}/post/${p.slug}</guid>
      <description><![CDATA[${p.excerpt ?? ''}]]></description>
      <pubDate>${new Date(String(p.date)).toUTCString()}</pubDate>
    </item>`,
        )
        .join('');

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>锚点 · Anchor</title>
    <link>${base}</link>
    <atom:link href="${base}/rss.xml" rel="self" type="application/rss+xml"/>
    <description>用系统对抗混乱，用逻辑重塑日常。</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, 'rss.xml'), xml, 'utf-8');
      console.log('✓ rss.xml generated');
    },
  };
}
// ── 静态文章 OG 页生成插件 ───────────────────────────────
function articleMetaPlugin(): Plugin {
  return {
    name: 'generate-article-meta',
    apply: 'build',
    closeBundle() {
      const postsDir = path.resolve(__dirname, 'content/posts');
      const outDir   = path.resolve(__dirname, 'dist');
      if (!fs.existsSync(postsDir)) return;

      const base = 'https://www.maodian.uk';

      const articles = fs
        .readdirSync(postsDir)
        .filter((f) => f.endsWith('.md'))
        .map((f) => {
          const slug = f.replace(/\.md$/, '');
          const raw  = fs.readFileSync(path.join(postsDir, f), 'utf-8');
          const data = parseFm(raw);
          const bm   = /^---[\s\S]*?\n---\r?\n?([\s\S]*)$/.exec(raw);
          const body = bm ? bm[1].trim() : '';
          return { slug, body, ...data };
        })
        .filter((p) => p.title);

      const fmtDate = (d: string) => {
        const m = /(\d{4})-(\d{2})-(\d{2})/.exec(d || '');
        return m ? `${m[1]} 年 ${+m[2]} 月 ${+m[3]} 日` : (d || '');
      };

      for (const p of articles) {
        // 分享页本身就是一篇完整、自包含的静态文章：内联样式、不依赖任何 CDN、
        // 不依赖 SPA 启动 —— 微信/老旧 WebView/爬虫都能直接阅读，不再白屏。
        // 不做强制跳转；底部提供进入 App 的链接（评论、更多文章）。
        const url     = `${base}/post/${p.slug}`;
        const appUrl  = `${base}/#/post/${p.slug}`;
        const pageT   = `${p.title} · 锚点`;
        const desc    = p.excerpt ?? '用系统对抗混乱，用逻辑重塑日常。';
        const img     = p.cover ?? `${base}/icons/icon-512.png`;
        const author  = p.author ?? '锚点';
        const chinese = (p.body.match(/[一-龥]/g) ?? []).length;
        const en      = (p.body.match(/[A-Za-z0-9]+/g) ?? []).length;
        const minutes = Math.max(1, Math.round(chinese / 350 + en / 200));
        const bodyHtml  = mdToHtml(p.body);
        const coverHtml = p.cover ? `<img class="cover" src="${escapeAttr(p.cover)}" alt="">` : '';
        const dir     = path.join(outDir, 'post', p.slug);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(
          path.join(dir, 'index.html'),
          `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${escapeHtml(pageT)}</title>
<meta name="description" content="${escapeAttr(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article">
<meta property="og:title" content="${escapeAttr(pageT)}">
<meta property="og:description" content="${escapeAttr(desc)}">
<meta property="og:image" content="${escapeAttr(img)}">
<meta property="og:url" content="${url}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeAttr(pageT)}">
<meta name="twitter:description" content="${escapeAttr(desc)}">
<meta name="twitter:image" content="${escapeAttr(img)}">
<link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32.png">
<style>
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:#f8fafc;color:#1e293b;
  font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei','Noto Sans SC',sans-serif;
  font-size:18px;line-height:1.9;-webkit-font-smoothing:antialiased}
a{color:#4338ca;text-decoration:none}
.bar{border-bottom:1px solid #e2e8f0;background:#fff}
.bar div{max-width:720px;margin:0 auto;padding:14px 20px;font-weight:800;letter-spacing:.02em}
.bar a{color:#0f172a}
main{max-width:720px;margin:0 auto;padding:28px 20px 64px}
h1{font-size:1.9rem;line-height:1.3;font-weight:900;letter-spacing:-.01em;margin:.2em 0 .4em}
.meta{color:#94a3b8;font-size:.9rem;margin-bottom:1.4em}
.meta b{color:#64748b;font-weight:600}
.cover{width:100%;max-height:380px;object-fit:cover;border-radius:12px;margin:0 0 1.6em}
article{font-size:1.06rem}
article h1,article h2,article h3,article h4{line-height:1.35;font-weight:800;color:#0f172a;margin:1.8em 0 .6em}
article h2{font-size:1.4rem}article h3{font-size:1.18rem}article h4{font-size:1.05rem}
article p{margin:1.1em 0}
article strong{color:#0f172a;font-weight:700}
article a{text-decoration:underline;text-underline-offset:2px;text-decoration-color:#c7d2fe}
article ul,article ol{padding-left:1.4em;margin:1.1em 0}
article li{margin:.5em 0}
article blockquote{margin:1.6em 0;padding:.4em 1.1em;border-left:4px solid #fb923c;color:#64748b;font-style:italic}
article code{background:#eef2ff;color:#4338ca;padding:.1em .4em;border-radius:4px;font-size:.88em}
article pre{background:#0f172a;color:#e2e8f0;padding:1.1em;border-radius:10px;overflow-x:auto;font-size:.86rem;line-height:1.6}
article pre code{background:none;color:inherit;padding:0}
article img{max-width:100%;border-radius:10px;margin:1.6em 0}
article hr{border:none;border-top:1px solid #e2e8f0;margin:2.4em 0}
article table{width:100%;border-collapse:collapse;margin:1.6em 0;font-size:.92rem}
article th,article td{border:1px solid #e2e8f0;padding:.5em .8em;text-align:left}
article th{background:#f1f5f9;font-weight:700}
.cta{margin:3em 0 0;padding-top:1.6em;border-top:1px solid #e2e8f0}
.cta a{display:inline-block;font-weight:600}
.foot{color:#cbd5e1;font-size:.8rem;text-align:center;padding:2em 0}
@media(prefers-color-scheme:dark){
  body{background:#0f172a;color:#cbd5e1}.bar{background:#0b1120;border-color:#1e293b}.bar a{color:#fff}
  h1,article h1,article h2,article h3,article h4,article strong{color:#fff}
  article code{background:#1e293b;color:#a5b4fc}.cta,article hr,.bar{border-color:#1e293b}
  article th{background:#1e293b}article th,article td{border-color:#1e293b}
}
</style>
</head>
<body>
<div class="bar"><div><a href="/">锚点 · Anchor</a></div></div>
<main>
<article>
<h1>${escapeHtml(p.title)}</h1>
<div class="meta">${fmtDate(p.date)} · <b>${escapeHtml(author)}</b> · ${minutes} 分钟阅读</div>
${coverHtml}
${bodyHtml}
</article>
<div class="cta"><a href="${appUrl}">在「锚点」阅读更多 · 参与评论 →</a></div>
</main>
<div class="foot">© 锚点 · Anchor</div>
</body>
</html>`,
          'utf-8',
        );
      }
      console.log(`✓ ${articles.length} static article pages generated`);
    },
  };
}
// ── 文章元数据虚拟模块插件 ────────────────────────────────
// 构建时读取所有 .md 的 frontmatter，生成 virtual:posts-meta 模块。
// 正文不打包进主 bundle，改由 PostPage 按需懒加载。
function postsMetaPlugin(): Plugin {
  const virtualId = 'virtual:posts-meta';
  const resolvedId = '\0' + virtualId;
  return {
    name: 'posts-meta',
    resolveId(id) {
      if (id === virtualId) return resolvedId;
    },
    load(id) {
      if (id !== resolvedId) return;
      const postsDir = path.resolve(__dirname, 'content/posts');
      if (!fs.existsSync(postsDir)) return 'export default []';

      const posts = fs
        .readdirSync(postsDir)
        .filter((f) => f.endsWith('.md'))
        .map((f) => {
          const slug = f.replace(/\.md$/, '');
          const raw  = fs.readFileSync(path.join(postsDir, f), 'utf-8');
          const fm   = parseFmFull(raw);

          const bodyMatch = /^---[\s\S]*?\n---\r?\n?([\s\S]*)$/.exec(raw);
          const body = bodyMatch ? bodyMatch[1].trim() : '';

          const chineseChars  = (body.match(/[一-龥]/g) ?? []).length;
          const englishWords  = (body.match(/[A-Za-z0-9]+/g)    ?? []).length;
          const readingMinutes = Math.max(1, Math.round(chineseChars / 350 + englishWords / 200));

          const tags = Array.isArray(fm.tags)
            ? fm.tags as string[]
            : fm.tags ? [String(fm.tags)] : [];

          return {
            slug,
            title:          String(fm.title   ?? slug),
            excerpt:        String(fm.excerpt  ?? ''),
            date:           String(fm.date     ?? ''),
            author:         String(fm.author   ?? '锚点'),
            tags,
            cover:          fm.cover ? String(fm.cover) : undefined,
            readingMinutes,
            searchText:     toSearchText(body),
          };
        })
        .filter((p) => p.title);

      return `export default ${JSON.stringify(posts)}`;
    },
  };
}
// ─────────────────────────────────────────────────────────

export default defineConfig({
  base: './',
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react(), postsMetaPlugin(), rssPlugin(), articleMetaPlugin(), cloudflare()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});