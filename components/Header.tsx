import React from 'react';
import { siteConfig } from '../data/site';
import { AnchorIcon } from './Icons';
import ThemeToggle from './ThemeToggle';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-slate-50/80 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/80">
      <div className="mx-auto flex h-20 max-w-3xl items-center justify-between px-5">
        <a href="#/" className="group flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white transition-transform group-hover:scale-105">
            <AnchorIcon className="h-5 w-5" />
          </span>
          <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white">
            {siteConfig.title}
          </span>
        </a>

        <nav className="flex items-center gap-2">
          {siteConfig.nav.map((item) => (
            <a
              key={item.route}
              href={item.route}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-brand-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-brand-400"
            >
              {item.label}
            </a>
          ))}
          <span className="mx-2 h-5 w-px bg-slate-200 dark:bg-slate-700" />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
};

export default Header;
