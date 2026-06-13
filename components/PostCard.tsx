import React from 'react';
import { Post } from '../types';
import { formatDate } from '../utils/formatDate';
import { estimateReadingMinutes } from '../utils/readingTime';
import { ClockIcon } from './Icons';

const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  const minutes = post.readingMinutes ?? estimateReadingMinutes(post.content);

  return (
    <article className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-500/40">
      <a href={`#/post/${post.slug}`} className="block">
        {post.cover && (
          <div className="mb-4 overflow-hidden rounded-md">
            <img
              src={post.cover}
              alt={post.title}
              loading="lazy"
              className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}

        <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span className="flex items-center gap-1">
            <ClockIcon className="h-3.5 w-3.5" />
            {minutes} 分钟阅读
          </span>
        </div>

        <h2 className="text-xl font-bold text-slate-900 transition-colors group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
          {post.title}
        </h2>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {post.excerpt}
        </p>
      </a>

      <div className="mt-4 flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <a
            key={tag}
            href={`#/tag/${encodeURIComponent(tag)}`}
            className="rounded-md bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-300 dark:hover:bg-brand-500/20"
          >
            # {tag}
          </a>
        ))}
      </div>
    </article>
  );
};

export default PostCard;
