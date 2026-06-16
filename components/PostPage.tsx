import React from 'react';
import { getPostBySlug } from '../data/posts';
import { formatDate } from '../utils/formatDate';
import { estimateReadingMinutes } from '../utils/readingTime';
import { useReadingPosition } from '../utils/useReadingPosition';
import { Markdown } from './Markdown';
import NotFound from './NotFound';
import { ArrowLeftIcon, ClockIcon } from './Icons';

const PostPage: React.FC<{ slug: string }> = ({ slug }) => {
  // 恢复 / 记录这篇文章的阅读位置（Hook 必须在任何 return 之前调用）。
  useReadingPosition(slug);

  const post = getPostBySlug(slug);
  if (!post) return <NotFound />;

  const minutes = post.readingMinutes ?? estimateReadingMinutes(post.content);

  return (
    <article className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <a
        href="#/"
        className="mb-12 inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-brand-600 dark:text-slate-500 dark:hover:text-brand-400"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        返回首页
      </a>

      <header className="mb-10">
        <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          {post.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-400">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span>·</span>
          <span>{post.author}</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <ClockIcon className="h-3.5 w-3.5" />
            {minutes} 分钟阅读
          </span>
        </div>
        {post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-x-3">
            {post.tags.map((tag) => (
              <a
                key={tag}
                href={`#/tag/${encodeURIComponent(tag)}`}
                className="text-xs text-slate-400 transition-colors hover:text-brand-600 dark:hover:text-brand-400"
              >
                #{tag}
              </a>
            ))}
          </div>
        )}
      </header>

      {post.cover && (
        <img
          src={post.cover}
          alt={post.title}
          className="mb-10 max-h-96 w-full rounded-lg object-cover"
        />
      )}

      <div className="text-[1.125rem] leading-[1.9]">
        <Markdown source={post.content} />
      </div>

      <div className="mt-16 border-t border-slate-200 pt-8 dark:border-slate-800">
        <a
          href="#/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 transition-colors hover:text-brand-500 dark:text-brand-400"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          阅读更多文章
        </a>
      </div>
    </article>
  );
};

export default PostPage;
