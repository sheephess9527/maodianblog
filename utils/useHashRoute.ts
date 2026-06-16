import { useEffect, useState } from 'react';
import { Route } from '../types';

// 把 location.hash 解析成一个 Route 对象。
// 支持的路径：
//   #/                -> 首页
//   #/post/:slug      -> 文章详情
//   #/tag/:tag        -> 标签筛选
//   #/about           -> 关于
export function parseHash(hash: string): Route {
  const clean = hash.replace(/^#\/?/, '').replace(/\/$/, '');
  if (clean === '' ) return { name: 'home' };

  const [section, ...rest] = clean.split('/');
  const param = decodeURIComponent(rest.join('/'));

  switch (section) {
    case 'post':
      return param ? { name: 'post', slug: param } : { name: 'notFound' };
    case 'tag':
      return param ? { name: 'tag', tag: param } : { name: 'notFound' };
    case 'about':
      return { name: 'about' };
    default:
      return { name: 'notFound' };
  }
}

export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));

  // 关闭浏览器的自动滚动恢复，避免手机上切换文章时停留在旧的滚动位置。
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  // 在新页面内容渲染完成后再滚动到顶部（而不是在 hashchange 时立即滚动，
  // 那时旧内容还在，滚动会作用在错误的布局上）。
  // 文章页除外：它由 PostPage 自己恢复用户上次的阅读位置。
  useEffect(() => {
    if (route.name === 'post') return;
    window.scrollTo(0, 0);
  }, [route.name, (route as { slug?: string }).slug, (route as { tag?: string }).tag]);

  return route;
}
