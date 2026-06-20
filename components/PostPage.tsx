import React, { useEffect, useState } from 'react';
import { getPostBySlug, loadPostContent, sortedPosts } from '../data/posts';
import { formatDate } from '../utils/formatDate';
import { useReadingPosition } from '../utils/useReadingPosition';
import { useViewCount } from '../utils/useViewCount';
import { useDocumentMeta } from '../utils/useDocumentMeta';
import { extractHeadings } from '../utils/extractHeadings';
import { Markdown } from './Markdown';
import NotFound from './NotFound';
import TableOfContents from './TableOfContents';
import Comments from './Comments';
import { ArrowLeftIcon, ClockIcon, EyeIcon, ShareIcon, CheckIcon, ListIcon, XIcon } from './Icons';

const PostPage: React.FC<{ slug: string }> = ({ slug }) => {
  useReadingPosition(slug);
  const views = useViewCount(slug);

  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min(100, (window.scrollY / docHeight) * 100) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [slug]);

  const post = getPostBySlug(slug);

  // 正文按需懒加载
  const [content, setContent] = useState<string | null>(null);
  useEffect(() => {
    setContent(null);
    loadPostContent(slug).then(setContent);
  }, [slug]);

  // OG meta（Hook 必须在所有 return 前调用）
  useDocumentMeta({
    title: post?.title,
    description: post?.excerpt,
    image: post?.cover,
    slug: post ? slug : undefined,
    type: 'article',
  });

  if (!post) return <NotFound />;

  const minutes = post.readingMinutes;
  const headings = content ? extractHeadings(content) : [];

  const [copied, setCopied] = useState(false);
  const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);
  const shareUrl = `https://www.maodian.uk/post/${slug}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, text: post.excerpt, url: shareUrl });
        return;
      } catch {
        return;
      }
    }
    await navigator.clipboard.writeText(shareUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const idx = sortedPosts.findIndex((p) => p.slug === slug);
  const newer = idx > 0 ? sortedPosts[idx - 1] : null;
  const older = idx >= 0 && idx < sortedPosts.length - 1 ? sortedPosts[idx + 1] : null;

  const relatedPosts = sortedPosts
    .filter((p) => p.slug !== slug && p.tags.some((t) => post.tags.includes(t)))
    .slice(0, 3);

  return (
    <div className="relative">
      {/* 阅读进度条 */}
      <div
        className="no-print fixed left-0 top-0 z-50 h-0.5 bg-brand-500 transition-[width] duration-75"
        style={{ width: `${progress}%` }}
      />

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

        {/* 正文：加载中显示骨架，加载完渲染 Markdown */}
        {content === null ? (
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 10 }, (_, i) => (
              <div
                key={i}
                className={`h-4 rounded bg-slate-200 dark:bg-slate-700 ${
                  i % 4 === 3 ? 'w-2/3' : i % 4 === 2 ? 'w-5/6' : 'w-full'
                }`}
              />
            ))}
          </div>
        ) : (
          <div className="text-[1.125rem] leading-[1.9]">
            <Markdown source={content} />
          </div>
        )}

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

        {/* 相关文章 */}
        {relatedPosts.length > 0 && (
          <div className="mt-12 border-t border-slate-200 pt-8 dark:border-slate-800">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-400">相关文章</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {relatedPosts.map((p) => (
                <a
                  key={p.slug}
                  href={`#/post/${p.slug}`}
                  className="group flex flex-col gap-1 rounded-xl border border-slate-200 p-4 transition-colors hover:border-brand-300 dark:border-slate-800 dark:hover:border-brand-700"
                >
                  {p.tags[0] && (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-accent-500">
                      {p.tags[0]}
                    </span>
                  )}
                  <span className="line-clamp-2 text-sm font-medium text-slate-700 transition-colors group-hover:text-brand-600 dark:text-slate-300 dark:group-hover:text-brand-400">
                    {p.title}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* 评论区（Giscus，配置好后显示） */}
        <Comments slug={slug} />

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

      {/* 悬浮目录：内容加载完后出现 */}
      {/* 移动端目录按钮 */}
      {headings.length >= 2 && (
        <button
          onClick={() => setIsMobileTocOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white shadow-lg xl:hidden dark:border-slate-700 dark:bg-slate-900"
          aria-label="打开目录"
        >
          <ListIcon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
        </button>
      )}

      {/* 移动端目录抽屉 */}
      {isMobileTocOpen && headings.length >= 2 && (
        <div className="fixed inset-0 z-[60] xl:hidden" onClick={() => setIsMobileTocOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div 
            className="absolute bottom-0 left-0 right-0 max-h-[70vh] overflow-y-auto rounded-t-2xl border-t border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
            onClick={e => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-widest text-slate-400">目录</span>
              <button onClick={() => setIsMobileTocOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <TableOfContents headings={headings} />
          </div>
        </div>
      )}
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
