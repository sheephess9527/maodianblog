import React from 'react';
import { sortedPosts, getAllTags } from '../data/posts';
import { siteConfig } from '../data/site';
import PostCard from './PostCard';

const HomePage: React.FC = () => {
  const [featured, ...rest] = sortedPosts;
  const tags = getAllTags();

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-16">
      {/* 刊头：用 slogan 作为主视觉，不重复站名 */}
      <section className="mb-14 border-b border-slate-900/10 pb-12 dark:border-white/10">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
          {siteConfig.subtitle}
        </p>
        <h1 className="mt-5 max-w-3xl text-3xl font-bold leading-[1.25] tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          {siteConfig.description}
        </h1>
        {tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2">
            {tags.map(({ tag }) => (
              <a
                key={tag}
                href={`#/tag/${encodeURIComponent(tag)}`}
                className="text-sm text-slate-400 transition-colors hover:text-brand-600 dark:hover:text-brand-400"
              >
                {tag}
              </a>
            ))}
          </div>
        )}
      </section>

      {/* 头条大卡 */}
      {featured && <PostCard post={featured} featured />}

      {/* 网格列表 */}
      {rest.length > 0 && (
        <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
