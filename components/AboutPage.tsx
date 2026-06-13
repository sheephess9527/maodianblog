import React from 'react';
import { siteConfig } from '../data/site';
import { Markdown } from './Markdown';
import { ArrowLeftIcon } from './Icons';

const AboutPage: React.FC = () => (
  <div>
    <a
      href="#/"
      className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
    >
      <ArrowLeftIcon className="h-4 w-4" />
      返回首页
    </a>
    <div className="text-[1.05rem]">
      <Markdown source={siteConfig.about} />
    </div>
  </div>
);

export default AboutPage;
