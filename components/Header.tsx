import React from 'react';
import { siteConfig } from '../data/site';
import ThemeToggle from './ThemeToggle';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-900/10 bg-slate-50/85 backdrop-blur dark:border-white/10 dark:bg-slate-950/85">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-8">
        <a href="#/" className="group flex items-baseline gap-2">
          <span className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            {siteConfig.title}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400 transition-colors group-hover:text-brand-600 dark:group-hover:text-brand-400">
            {siteConfig.subtitle}
          </span>
        </a>

        <nav className="flex items-center gap-5 sm:gap-7">
          {siteConfig.nav.map((item) => (
            <a
              key={item.route}
              href={item.route}
              className="text-[15px] text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              {item.label}
            </a>
          ))}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
};

export default Header;
