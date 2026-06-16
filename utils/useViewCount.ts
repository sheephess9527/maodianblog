import { useEffect, useState } from 'react';

// 阅读量计数：使用免费、开源、免注册的 Abacus 计数服务（countapi 的精神继任者）。
// 命名空间用站点域名以避免与他人冲突，key 用文章 slug。
// 计数服务不可用时静默忽略，绝不影响正文阅读。
const NAMESPACE = 'maodian-uk';
const BASE = 'https://abacus.jasoncameron.dev';

export function useViewCount(slug: string): number | null {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    // 同一浏览器会话内，同一篇只 +1 一次（刷新/再次进入只读取，避免灌水）。
    const sessionKey = `anchor:viewed:${slug}`;
    const alreadyViewed = sessionStorage.getItem(sessionKey) === '1';
    const endpoint = alreadyViewed ? 'get' : 'hit';

    fetch(`${BASE}/${endpoint}/${NAMESPACE}/${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: { value: number }) => {
        if (cancelled) return;
        if (!alreadyViewed) sessionStorage.setItem(sessionKey, '1');
        if (typeof data.value === 'number') setCount(data.value);
      })
      .catch(() => {
        /* 计数服务不可用，静默忽略 */
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return count;
}
