import fs from 'fs';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

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
          const data = parseFm(fs.readFileSync(path.join(postsDir, f), 'utf-8'));
          return { slug, ...data };
        })
        .filter((p) => p.title);

      for (const p of articles) {
        const url     = `${base}/post/${p.slug}`;
        const title   = `${p.title} · 锚点`;
        const desc    = p.excerpt ?? '用系统对抗混乱，用逻辑重塑日常。';
        const img     = p.cover ?? `${base}/icons/icon-512.png`;
        const dir     = path.join(outDir, 'post', p.slug);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(
          path.join(dir, 'index.html'),
          `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta property="og:type" content="article">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:image" content="${img}">
<meta property="og:url" content="${url}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="${img}">
<meta http-equiv="refresh" content="0;url=${url}">
<script>location.replace('${url}');</script>
</head>
<body></body>
</html>`,
          'utf-8',
        );
      }
      console.log(`✓ ${articles.length} article meta pages generated`);
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
  plugins: [react(), postsMetaPlugin(), rssPlugin(), articleMetaPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
