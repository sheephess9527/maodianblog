import React from 'react';
import { sortedPosts, getAllTags } from '../data/posts';
import { siteConfig } from '../data/site';
import PostCard from './PostCard';

// 首页展示的栏目顺序（其余标签仍可通过标签行进入）
const SECTIONS = ['系统思维', '决策', '效率', '思考'];
const PER_SECTION = 3;

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
        <h1 className="mt-6 text-[1.75rem] font-bold leading-[1.4] tracking-tight text-slate-900 dark:text-white sm:text-[2.5rem] sm:leading-[1.35]">
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
        {(() => {
          const seen = new Set<string>();
          if (featured) seen.add(featured.slug);
          return SECTIONS.map((section) => {
            const postsInSection = rest
              .filter((p) => p.tags.includes(section) && !seen.has(p.slug))
              .slice(0, PER_SECTION);
            if (postsInSection.length === 0) return null;
            postsInSection.forEach((p) => seen.add(p.slug));

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
                    <PostCard key={post.slug} post={post} />
                  ))}
                </div>
              </section>
            );
          });
        })()}
      </div>
    </div>
  );
};

export default HomePage;
