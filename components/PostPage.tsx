import React, { useState } from 'react';
import { getPostBySlug, sortedPosts } from '../data/posts';
import { formatDate } from '../utils/formatDate';
import { estimateReadingMinutes } from '../utils/readingTime';
import { useReadingPosition } from '../utils/useReadingPosition';
import { useViewCount } from '../utils/useViewCount';
import { useDocumentMeta } from '../utils/useDocumentMeta';
import { extractHeadings } from '../utils/extractHeadings';
import { Markdown } from './Markdown';
import NotFound from './NotFound';
import TableOfContents from './TableOfContents';
import { ArrowLeftIcon, ClockIcon, EyeIcon, ShareIcon, CheckIcon } from './Icons';

const PostPage: React.FC<{ slug: string }> = ({ slug }) => {
  useReadingPosition(slug);
  const views = useViewCount(slug);

  const post = getPostBySlug(slug);

  // OG meta（Hook 必须在所有 return 前调用）
  useDocumentMeta({
    title: post?.title,
    description: post?.excerpt,
    image: post?.cover,
    slug: post ? slug : undefined,
    type: 'article',
  });

  if (!post) return <NotFound />;

  const minutes = post.readingMinutes ?? estimateReadingMinutes(post.content);
  const headings = extractHeadings(post.content);

  const [copied, setCopied] = useState(false);
  const shareUrl = `https://www.maodian.uk/post/${slug}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: shareUrl,
        });
        return;
      } catch {
        // 用户取消分享，不做处理
        return;
      }
    }
    // 降级：复制链接
    await navigator.clipboard.writeText(shareUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 上一篇 / 下一篇（sortedPosts 已按日期倒序）
  const idx = sortedPosts.findIndex((p) => p.slug === slug);
  const newer = idx > 0 ? sortedPosts[idx - 1] : null;
  const older = idx >= 0 && idx < sortedPosts.length - 1 ? sortedPosts[idx + 1] : null;

  return (
    <div className="relative">
      {/* 文章内容 */}
      <article className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
        <a
          href="#/"
          className="mb-12 inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-brand-600 dark:text-slate-500 dark:hover:text-brand-400"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          返回首页
        </a>

        <header className="mb-10">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              {post.title}
            </h1>
            <button
              onClick={handleShare}
              title={copied ? '链接已复制！' : '分享文章'}
              className="no-print mt-2 shrink-0 flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-400 transition-colors hover:border-brand-400 hover:text-brand-600 dark:border-slate-700 dark:hover:border-brand-500 dark:hover:text-brand-400"
            >
              {copied
                ? <><CheckIcon className="h-3.5 w-3.5 text-green-500" /><span className="text-green-500">已复制</span></>
                : <><ShareIcon className="h-3.5 w-3.5" /><span className="hidden sm:inline">分享</span></>
              }
            </button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-400">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span>·</span>
            <span>{post.author}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <ClockIcon className="h-3.5 w-3.5" />
              {minutes} 分钟阅读
            </span>
            {views !== null && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <EyeIcon className="h-3.5 w-3.5" />
                  {views.toLocaleString()} 次阅读
                </span>
              </>
            )}
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

        {/* 上一篇 / 下一篇导航 */}
        {(newer || older) && (
          <nav className="mt-16 grid gap-4 border-t border-slate-200 pt-8 dark:border-slate-800 sm:grid-cols-2">
            {older ? (
              <a
                href={`#/post/${older.slug}`}
                className="group flex flex-col gap-1 rounded-xl border border-slate-200 p-4 transition-colors hover:border-brand-300 dark:border-slate-800 dark:hover:border-brand-700"
              >
                <span className="text-xs text-slate-400">← 上一篇</span>
                <span className="line-clamp-2 text-sm font-medium text-slate-700 transition-colors group-hover:text-brand-600 dark:text-slate-300 dark:group-hover:text-brand-400">
                  {older.title}
                </span>
              </a>
            ) : <div />}
            {newer ? (
              <a
                href={`#/post/${newer.slug}`}
                className="group flex flex-col gap-1 rounded-xl border border-slate-200 p-4 text-right transition-colors hover:border-brand-300 dark:border-slate-800 dark:hover:border-brand-700"
              >
                <span className="text-xs text-slate-400">下一篇 →</span>
                <span className="line-clamp-2 text-sm font-medium text-slate-700 transition-colors group-hover:text-brand-600 dark:text-slate-300 dark:group-hover:text-brand-400">
                  {newer.title}
                </span>
              </a>
            ) : <div />}
          </nav>
        )}

        <div className="mt-8 border-t border-slate-200 pt-8 dark:border-slate-800">
          <a
            href="#/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 transition-colors hover:text-brand-500 dark:text-brand-400"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            阅读更多文章
          </a>
        </div>
      </article>

      {/* 悬浮目录：宽屏下显示在文章右侧 */}
      {headings.length >= 2 && (
        <div className="fixed right-4 top-28 hidden w-52 xl:block 2xl:right-8">
          <div className="max-h-[calc(100vh-8rem)] overflow-y-auto rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
            <TableOfContents headings={headings} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PostPage;
