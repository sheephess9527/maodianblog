import assert from 'node:assert/strict';
import { test } from 'node:test';

const origin = process.env.SITE_URL ?? 'http://localhost:8787';
const request = (path) => fetch(new URL(path, origin), { signal: AbortSignal.timeout(10000) });

test('unknown pages, articles and assets return the branded HTTP 404', async () => {
  for (const path of ['/no-such-page', '/post/no-such-article/', '/assets/no-such-asset.js']) {
    const response = await request(path);
    assert.equal(response.status, 404, path);
    assert.match(response.headers.get('content-type') ?? '', /^text\/html\b/, path);
    const html = await response.text();
    assert.match(html, /<h1>页面走丢了<\/h1>/, path);
    assert.match(html, /<a\b[^>]*href="\/">回到首页<\/a>/, path);
  }
});

test('homepage, hash routes, article, feeds and static assets remain available', async () => {
  for (const path of [
    '/', '/#/about', '/#/tag/系统思维', '/#/post/utilization-cliff',
    '/post/utilization-cliff', '/post/utilization-cliff/', '/rss.xml', '/sitemap.xml',
    '/robots.txt', '/icons/favicon-32.png', '/manifest.webmanifest', '/admin/',
  ]) {
    const response = await request(path);
    assert.equal(response.status, 200, path);
    await response.body.cancel();
  }

  const homepage = await (await request('/')).text();
  const entry = homepage.match(/<script\b[^>]*\bsrc="([^"]+)"[^>]*>/)?.[1];
  assert.ok(entry, 'homepage has a built script');
  const script = await request(entry);
  assert.equal(script.status, 200, entry);
  assert.match(script.headers.get('content-type') ?? '', /javascript/, entry);
  await script.body.cancel();
});
