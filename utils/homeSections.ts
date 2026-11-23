import type { Post } from '../types';

export const HOME_SECTIONS = ['系统思维', '决策', '效率', '思考'];

export function homeSections<T extends Pick<Post, 'slug' | 'tags'>>(posts: T[]) {
  const [featured, ...rest] = posts;
  const seen = new Set(featured ? [featured.slug] : []);
  return HOME_SECTIONS.map((section) => {
    const selected = rest.filter((p) => p.tags.includes(section) && !seen.has(p.slug)).slice(0, 3);
    selected.forEach((p) => seen.add(p.slug));
    return { section, posts: selected };
  });
}
