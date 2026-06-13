import React from 'react';
import { getPostBySlug } from '../data/posts';
import { formatDate } from '../utils/formatDate';
import { estimateReadingMinutes } from '../utils/readingTime';
import { Markdown } from './Markdown';
import NotFound from './NotFound';
import { ArrowLeftIcon, ClockIcon } from './Icons';

const PostPage: React.FC<{ slug: string }> = ({ slug }) => {
  const post = getPostBySlug(slug);
  if (!post) return <NotFound />;

  const minutes = post.readingMinutes ?? estimateReadingMinutes(post.content);

  return (
    <article>
      <a
        href="#/"
        className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        返回首页
      </a>

      <header className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-400">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span>·</span>
          <span>{post.author}</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <ClockIcon className="h-4 w-4" />
            {minutes} 分钟阅读
          </span>
        </div>
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          {post.title}
        </h1>
        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <a
              key={tag}
              href={`#/tag/${encodeURIComponent(tag)}`}
              className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-300 dark:hover:bg-brand-500/20"
            >
              # {tag}
            </a>
          ))}
        </div>
      </header>

      {post.cover && (
        <img
          src={post.cover}
          alt={post.title}
          className="mb-8 max-h-96 w-full rounded-2xl object-cover shadow-sm"
        />
      )}

      <div className="text-[1.05rem]">
        <Markdown source={post.content} />
      </div>

      <div className="mt-12 border-t border-slate-200 pt-6 dark:border-slate-800">
        <a
          href="#/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          阅读更多文章
        </a>
      </div>
    </article>
  );
};

export default PostPage;
