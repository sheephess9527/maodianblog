import React from 'react';
import { sortedPosts, getAllTags } from '../data/posts';
import { siteConfig } from '../data/site';
import PostCard from './PostCard';
import { homeSections } from '../utils/homeSections';

const HomePage: React.FC = () => {
  const [featured] = sortedPosts;
  const tags = getAllTags();

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-16">
      {/* 刊头：用 slogan 作为主视觉，不重复站名（站名已在顶部 Header 显示） */}
      <section className="mb-14 border-b border-slate-900/10 pb-12 dark:border-white/10">
        <h1 className="text-[1.75rem] font-bold leading-[1.4] tracking-tight text-slate-900 dark:text-white sm:text-[2.5rem] sm:leading-[1.35]">
          {siteConfig.description.split('，').map((part, i, arr) => (
            <span key={i} className="block">
              {part}
              {i < arr.length - 1 ? '，' : ''}
            </span>
          ))}
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

      {/* 按栏目分区展示，每个栏目只放最新几篇，更多进栏目页 */}
      <div className="mt-16 space-y-16">
        {homeSections(sortedPosts).map(({ section, posts: postsInSection }) => {
            if (postsInSection.length === 0) return null;

            return (
              <section key={section}>
                <div className="mb-8 flex items-baseline justify-between border-b border-slate-900/10 pb-3 dark:border-white/10">
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {section}
                  </h2>
                  <a
                    href={`#/tag/${encodeURIComponent(section)}`}
                    className="text-sm text-slate-400 transition-colors hover:text-brand-600 dark:hover:text-brand-400"
                  >
                    查看全部 →
                  </a>
                </div>
                <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                  {postsInSection.map((post) => (
                    <PostCard key={post.slug} post={post} category={section} />
                  ))}
                </div>
              </section>
            );
          })}
      </div>
    </div>
  );
};

export default HomePage;
