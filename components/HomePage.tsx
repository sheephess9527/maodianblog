import React from 'react';
import { sortedPosts, getAllTags } from '../data/posts';
import { siteConfig } from '../data/site';
import PostCard from './PostCard';

const HomePage: React.FC = () => {
  const tags = getAllTags();

  return (
    <div>
      {/* 顶部欢迎区 */}
      <section className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          {siteConfig.title}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-500 dark:text-slate-400">
          {siteConfig.description}
        </p>
      </section>

      {/* 标签云 */}
      {tags.length > 0 && (
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {tags.map(({ tag, count }) => (
            <a
              key={tag}
              href={`#/tag/${encodeURIComponent(tag)}`}
              className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600 transition-colors hover:border-brand-300 hover:text-brand-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-brand-500/50 dark:hover:text-brand-400"
            >
              # {tag} <span className="text-slate-400">({count})</span>
            </a>
          ))}
        </div>
      )}

      {/* 文章列表 */}
      <div className="space-y-6">
        {sortedPosts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
