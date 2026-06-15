import React from 'react';
import { sortedPosts } from '../data/posts';
import { siteConfig } from '../data/site';
import PostCard from './PostCard';

const HomePage: React.FC = () => {
  return (
    <div>
      {/* 编辑风格介绍区 —— 纯文字，无卡片 */}
      <section className="mb-16 pt-8">
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          {siteConfig.title}
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-slate-500 dark:text-slate-400">
          {siteConfig.description}
        </p>
      </section>

      {/* 分隔线 */}
      <hr className="mb-2 border-slate-200 dark:border-slate-800" />

      {/* 文章列表 */}
      <div>
        {sortedPosts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
