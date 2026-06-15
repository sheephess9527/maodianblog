import React, { useEffect, useState } from 'react';

// 一个很小的刷新按钮，只在「添加到主屏幕」的独立(PWA)模式下显示。
// 普通浏览器里本来就有刷新按钮，所以不显示，避免干扰阅读。
const RefreshButton: React.FC = () => {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // iOS Safari 用的是这个非标准属性
      (window.navigator as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);
  }, []);

  if (!isStandalone) return null;

  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      aria-label="刷新页面"
      title="刷新"
      className="fixed bottom-5 right-5 z-50 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-slate-500 shadow-md ring-1 ring-slate-900/10 backdrop-blur transition hover:bg-white hover:text-brand-600 active:scale-95 dark:bg-slate-800/80 dark:text-slate-400 dark:ring-white/10 dark:hover:text-brand-400"
      style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
        <path d="M3 21v-5h5" />
      </svg>
    </button>
  );
};

export default RefreshButton;
