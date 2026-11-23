import React, { useEffect, useRef, useState } from 'react';
import { sortedPosts } from '../data/posts';
import { Post } from '../types';
import { SearchIcon, XIcon } from './Icons';
import { loadFullFonts } from '../utils/loadFullFonts';
import searchText from 'virtual:posts-search';

interface Props {
  onClose: () => void;
}

function search(query: string): Post[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return sortedPosts.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.excerpt.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q)) ||
      (searchText[p.slug] ?? '').toLowerCase().includes(q),
  ).slice(0, 8);
}

const SearchModal: React.FC<Props> = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Post[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(loadFullFonts, []);

  useEffect(() => {
    setResults(search(query));
    setActiveIdx(0);
  }, [query]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const navigate = (slug: string) => {
    window.location.hash = `/post/${slug}`;
    onClose();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, results.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && results[activeIdx]) navigate(results[activeIdx].slug);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/50 pt-[10vh] backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="no-print mx-4 w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 搜索框 */}
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3.5 dark:border-slate-700">
          <SearchIcon className="h-5 w-5 shrink-0 text-slate-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="搜索文章标题、内容、标签…"
            className="min-w-0 flex-1 bg-transparent text-[15px] text-slate-800 outline-none placeholder:text-slate-400 dark:text-white"
          />
          <button onClick={onClose} className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        {/* 结果列表 */}
        {results.length > 0 && (
          <ul className="max-h-[60vh] overflow-y-auto py-2">
            {results.map((post, i) => (
              <li key={post.slug}>
                <button
                  onClick={() => navigate(post.slug)}
                  onMouseEnter={() => setActiveIdx(i)}
                  className={`w-full px-5 py-3 text-left transition-colors ${
                    i === activeIdx
                      ? 'bg-brand-50 dark:bg-brand-900/30'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-baseline gap-2">
                    {post.tags[0] && (
                      <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-accent-500">
                        {post.tags[0]}
                      </span>
                    )}
                    <span className="truncate text-[15px] font-medium text-slate-800 dark:text-white">
                      {post.title}
                    </span>
                  </div>
                  {post.excerpt && (
                    <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">{post.excerpt}</p>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}

        {query && results.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-slate-400">没有找到「{query}」相关的文章</p>
        )}

        {!query && (
          <p className="px-5 py-6 text-center text-xs text-slate-400">
            输入关键字搜索，↑↓ 键导航，Enter 进入文章，Esc 关闭
          </p>
        )}
      </div>
    </div>
  );
};

export default SearchModal;
