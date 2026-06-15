import React from 'react';
import { Post } from '../types';
import { formatDate } from '../utils/formatDate';

const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  return (
    <div className="border-b border-slate-100 py-6 dark:border-slate-800/60">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <a href={`#/post/${post.slug}`} className="group block">
            <h2 className="text-xl font-semibold text-slate-900 transition-colors group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
              {post.title}
            </h2>
          </a>
          {post.tags.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-x-3">
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
        </div>
        <time
          dateTime={post.date}
          className="shrink-0 text-sm text-slate-400 dark:text-slate-500"
        >
          {formatDate(post.date)}
        </time>
      </div>
    </div>
  );
};

export default PostCard;
