import React from 'react';
import { siteConfig } from '../data/site';
import { AnchorIcon } from './Icons';
import ThemeToggle from './ThemeToggle';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-900/10 bg-slate-50/85 backdrop-blur dark:border-white/10 dark:bg-slate-950/85">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-8">
        <a href="#/" className="group flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-600 text-white transition-transform group-hover:scale-105">
            <AnchorIcon className="h-[18px] w-[18px]" />
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            {siteConfig.title}
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
