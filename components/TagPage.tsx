import React, { useState, useEffect } from 'react';
import { sortedPosts } from '../data/posts';
import PostCard from './PostCard';
import { ArrowLeftIcon } from './Icons';

// 主要栏目的简介，给栏目页一句编辑视角的引导语。
const SECTION_INTRO: Record<string, string> = {
  系统思维: '用系统的眼光看世界——反馈回路、结构、杠杆与涌现，理解事物为何如此运转。',
  决策: '在不确定中做出更好的选择，少踩坑、少后悔，把判断力变成一种可练习的能力。',
  效率: '把有限的时间和精力，用在真正重要的事情上，而不是看起来很忙的事情上。',
  思考: '关于思考本身——如何想得更清楚、更独立，也更自由。',
};

const PAGE_SIZE = 9;

const TagPage: React.FC<{ tag: string }> = ({ tag }) => {
  const matched = sortedPosts.filter((p) => p.tags.includes(tag));
  const [visible, setVisible] = useState(PAGE_SIZE + 1); // +1 给头条大卡
  const intro = SECTION_INTRO[tag];

  // 切换栏目时重置可见数量
  useEffect(() => {
    setVisible(PAGE_SIZE + 1);
  }, [tag]);

  const [lead, ...others] = matched;
  const shownOthers = others.slice(0, Math.max(0, visible - 1));
  const hasMore = others.length > shownOthers.length;

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-16">
      <a
        href="#/"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-brand-600 dark:text-slate-500 dark:hover:text-brand-400"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        返回首页
      </a>

      {/* 栏目刊头 */}
      <header className="mb-14 border-b border-slate-900/10 pb-10 dark:border-white/10">
        <div className="flex items-baseline gap-3">
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white sm:text-5xl">
            <span className="text-accent-500">#</span>
            {tag}
          </h1>
          <span className="text-sm font-medium text-slate-400">{matched.length} 篇</span>
        </div>
        {intro && (
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-500 dark:text-slate-400">
            {intro}
          </p>
        )}
      </header>

      {matched.length === 0 && (
        <p className="text-slate-500 dark:text-slate-400">这个标签下还没有文章。</p>
      )}

      {/* 头条大卡 */}
      {lead && <PostCard post={lead} featured category={tag} />}

      {/* 其余文章网格 */}
      {shownOthers.length > 0 && (
        <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {shownOthers.map((post) => (
            <PostCard key={post.slug} post={post} category={tag} />
          ))}
        </div>
      )}

      {/* 加载更多 */}
      {hasMore && (
        <div className="mt-16 flex justify-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="rounded-full border border-slate-300 px-7 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-brand-500 hover:text-brand-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-brand-400 dark:hover:text-brand-400"
          >
            加载更多
          </button>
        </div>
      )}
    </div>
  );
};

export default TagPage;
