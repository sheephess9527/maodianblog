import type { Post } from '../types';
// @ts-ignore – 类型声明见 virtual.d.ts
import postsMeta from 'virtual:posts-meta';

type PostMeta = Omit<Post, 'content'>;

// 元数据列表（不含正文），用于首页、标签页、搜索
export const posts: PostMeta[] = postsMeta as PostMeta[];
export const sortedPosts = [...posts].sort((a, b) => b.date.localeCompare(a.date));

export function getPostBySlug(slug: string): PostMeta | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getAllTags(): { tag: string; count: number }[] {
  const map = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags) {
      map.set(tag, (map.get(tag) ?? 0) + 1);
    }
  }
  return [...map.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}
