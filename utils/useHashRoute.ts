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

  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash(window.location.hash));
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return route;
}
