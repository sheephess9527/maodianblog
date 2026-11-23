import React, { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { siteConfig } from '../data/site';
import ThemeToggle from './ThemeToggle';
import { SearchIcon } from './Icons';

const SearchModal = lazy(() => import('./SearchModal'));

const Header: React.FC = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const open  = useCallback(() => setSearchOpen(true),  []);
  const close = useCallback(() => setSearchOpen(false), []);

  // 快捷键 / 或 Cmd+K 打开搜索
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) ||
          (e.key === 'k' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        open();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-slate-900/10 bg-slate-50/85 backdrop-blur dark:border-white/10 dark:bg-slate-950/85 no-print">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-8">
          <a href="#/" className="group flex items-baseline gap-2">
            <span className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
              {siteConfig.title}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400 transition-colors group-hover:text-brand-600 dark:group-hover:text-brand-400">
              {siteConfig.subtitle}
            </span>
          </a>

          <nav className="flex items-center gap-4 sm:gap-6">
            {siteConfig.nav.map((item) => (
              <a
                key={item.route}
                href={item.route}
                className="text-[15px] text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                {item.label}
              </a>
            ))}
            {/* 搜索按钮 */}
            <button
              onClick={open}
              aria-label="搜索"
              title="搜索（/ 或 Ctrl+K）"
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[13px] text-slate-400 transition-colors hover:border-brand-400 hover:text-brand-600 dark:border-slate-700 dark:hover:border-brand-500 dark:hover:text-brand-400"
            >
              <SearchIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">搜索</span>
              <kbd className="hidden rounded bg-slate-100 px-1 py-0.5 text-[10px] text-slate-400 dark:bg-slate-800 sm:inline">⌘K</kbd>
            </button>
            <ThemeToggle />
          </nav>
        </div>
      </header>
      {searchOpen && <Suspense fallback={null}><SearchModal onClose={close} /></Suspense>}
    </>
  );
};

export default Header;
