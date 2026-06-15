import React from 'react';
import { siteConfig } from '../data/site';
import { GithubIcon, MailIcon, TwitterIcon } from './Icons';

const Footer: React.FC = () => {
  const { social } = siteConfig;
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-slate-200 dark:border-slate-800">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-5 py-10 text-center">
        <div className="flex items-center gap-2">
          {social.github && (
            <a
              href={social.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="rounded-full p-2 text-slate-400 transition-colors hover:text-brand-600 dark:hover:text-brand-400"
            >
              <GithubIcon className="h-4 w-4" />
            </a>
          )}
          {social.twitter && (
            <a
              href={social.twitter}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="rounded-full p-2 text-slate-400 transition-colors hover:text-brand-600 dark:hover:text-brand-400"
            >
              <TwitterIcon className="h-4 w-4" />
            </a>
          )}
          {social.email && (
            <a
              href={social.email}
              aria-label="Email"
              className="rounded-full p-2 text-slate-400 transition-colors hover:text-brand-600 dark:hover:text-brand-400"
            >
              <MailIcon className="h-4 w-4" />
            </a>
          )}
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-600">
          © {year} {siteConfig.title}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
