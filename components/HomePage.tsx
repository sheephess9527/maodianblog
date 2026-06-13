import React from 'react';
import { sortedPosts, getAllTags } from '../data/posts';
import { siteConfig } from '../data/site';
import PostCard from './PostCard';

const HomePage: React.FC = () => {
  const tags = getAllTags();

  return (
    <div>
      {/* 顶部欢迎区 —— 模块化区块 */}
      <section className="mb-10 overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-10">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-accent-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-accent-600 dark:bg-accent-500/10 dark:text-accent-400">
          {siteConfig.subtitle}
        </span>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          {siteConfig.title}
        </h1>
        <div className="mt-4 flex items-start gap-3">
          <span className="mt-1 h-12 w-1 shrink-0 rounded-full bg-brand-600" />
          <p className="max-w-xl text-lg font-medium leading-relaxed text-slate-600 dark:text-slate-300">
            {siteConfig.description}
          </p>
        </div>
      </section>

      {/* 标签筛选 */}
      {tags.length > 0 && (
        <div className="mb-8 flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-slate-400">标签</span>
          {tags.map(({ tag, count }) => (
            <a
              key={tag}
              href={`#/tag/${encodeURIComponent(tag)}`}
              className="rounded-md border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-brand-500/50 dark:hover:bg-brand-500/10 dark:hover:text-brand-300"
            >
              {tag} <span className="text-slate-400">{count}</span>
            </a>
          ))}
        </div>
      )}

      <h2 className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
        <span className="h-4 w-1 rounded-full bg-accent-500" />
        最新文章
      </h2>

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
