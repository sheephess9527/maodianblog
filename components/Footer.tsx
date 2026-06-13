import React from 'react';
import { siteConfig } from '../data/site';
import { GithubIcon, MailIcon, TwitterIcon } from './Icons';

const Footer: React.FC = () => {
  const { social } = siteConfig;
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-slate-200 dark:border-slate-800">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-5 py-10 text-center">
        <div className="flex items-center gap-3">
          {social.github && (
            <a
              href={social.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800 dark:hover:text-brand-400"
            >
              <GithubIcon className="h-5 w-5" />
            </a>
          )}
          {social.twitter && (
            <a
              href={social.twitter}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800 dark:hover:text-brand-400"
            >
              <TwitterIcon className="h-5 w-5" />
            </a>
          )}
          {social.email && (
            <a
              href={social.email}
              aria-label="Email"
              className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800 dark:hover:text-brand-400"
            >
              <MailIcon className="h-5 w-5" />
            </a>
          )}
        </div>
        <p className="text-sm text-slate-400">
          © {year} {siteConfig.title} · {siteConfig.description}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
