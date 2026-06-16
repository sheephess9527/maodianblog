import React from 'react';
import { Post } from '../types';
import { formatDate } from '../utils/formatDate';

// 杂志网格卡片。featured=true 时为首页头条大卡（图文左右排）。
// category：可指定显示的板块标签（在某个栏目下展示时传入，保证标签与当前栏目一致）。
const PostCard: React.FC<{ post: Post; featured?: boolean; category?: string }> = ({
  post,
  featured = false,
  category: categoryProp,
}) => {
  const category = categoryProp ?? post.tags[0];

  const Cover = (
    <div
      className={`relative overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 ${
        featured ? 'aspect-[16/10]' : 'aspect-[4/3]'
      }`}
    >
      {post.cover ? (
        <img
          src={post.cover}
          alt={post.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center p-6 text-center">
          <span className="text-2xl font-black leading-tight text-slate-300 dark:text-slate-600">
            {post.title}
          </span>
        </div>
      )}
    </div>
  );

  const Text = (
    <div className={featured ? 'flex flex-col justify-center' : 'mt-4'}>
      {category && (
        <span className="text-xs font-bold uppercase tracking-[0.15em] text-accent-600 dark:text-accent-400">
          {category}
        </span>
      )}
      <h2
        className={`mt-2 font-black leading-tight tracking-tight text-slate-900 transition-colors group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400 ${
          featured ? 'text-3xl sm:text-4xl' : 'text-lg sm:text-xl'
        }`}
      >
        {post.title}
      </h2>
      <p
        className={`mt-3 text-slate-500 dark:text-slate-400 ${
          featured ? 'text-base leading-relaxed' : 'line-clamp-2 text-sm leading-relaxed'
        }`}
      >
        {post.excerpt}
      </p>
      <time dateTime={post.date} className="mt-4 block text-xs text-slate-400 dark:text-slate-500">
        {formatDate(post.date)}
      </time>
    </div>
  );

  if (featured) {
    return (
      <a href={`#/post/${post.slug}`} className="group grid gap-6 sm:grid-cols-2 sm:gap-10">
        {Cover}
        {Text}
      </a>
    );
  }

  return (
    <a href={`#/post/${post.slug}`} className="group block">
      {Cover}
      {Text}
    </a>
  );
};

export default PostCard;
