import React from 'react';

const NotFound: React.FC = () => (
  <div className="py-20 text-center">
    <p className="text-6xl font-bold text-brand-500">404</p>
    <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">页面走丢了</h1>
    <p className="mt-2 text-slate-500 dark:text-slate-400">
      你访问的页面不存在，也许它被移动或删除了。
    </p>
    <a
      href="#/"
      className="mt-6 inline-block rounded-full bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-500"
    >
      回到首页
    </a>
  </div>
);

export default NotFound;
