import React from 'react';
import { sortedPosts } from '../data/posts';
import PostCard from './PostCard';
import { ArrowLeftIcon, TagIcon } from './Icons';

const TagPage: React.FC<{ tag: string }> = ({ tag }) => {
  const matched = sortedPosts.filter((p) => p.tags.includes(tag));

  return (
    <div>
      <a
        href="#/"
        className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        返回首页
      </a>

      <h1 className="mb-8 flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
        <TagIcon className="h-6 w-6 text-brand-500" />
        标签：{tag}
        <span className="text-base font-normal text-slate-400">（{matched.length} 篇）</span>
      </h1>

      {matched.length > 0 ? (
        <div className="space-y-6">
          {matched.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-slate-500 dark:text-slate-400">这个标签下还没有文章。</p>
      )}
    </div>
  );
};

export default TagPage;
