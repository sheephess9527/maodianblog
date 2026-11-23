import React, { lazy, Suspense, useEffect } from 'react';
import { useHashRoute } from './utils/useHashRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import NotFound from './components/NotFound';
import RefreshButton from './components/RefreshButton';

const PostPage = lazy(() => import('./components/PostPage'));
const TagPage = lazy(() => import('./components/TagPage'));
const AboutPage = lazy(() => import('./components/AboutPage'));

const App: React.FC = () => {
  const route = useHashRoute();

  // 非文章页的 document.title（文章页由 PostPage 自己设）
  useEffect(() => {
    if (route.name === 'post') return;
    if (route.name === 'about') document.title = '关于 · 锚点';
    else if (route.name === 'tag') document.title = `${(route as { tag: string }).tag} · 锚点`;
    else document.title = '锚点 · Anchor';
  }, [route]);

  const renderRoute = () => {
    switch (route.name) {
      case 'home':
        return <HomePage />;
      case 'post':
        return <PostPage slug={route.slug} />;
      case 'tag':
        return <TagPage tag={route.tag} />;
      case 'about':
        return <AboutPage />;
      default:
        return <NotFound />;
    }
  };

  const routeKey = `${route.name}-${'slug' in route ? route.slug : ''}-${'tag' in route ? route.tag : ''}`;

  // 各页面自行控制内容宽度：首页/标签页用宽网格，文章页用窄栏便于阅读。
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="w-full flex-1">
        <div key={routeKey} className="page-enter">
          <Suspense fallback={<div className="min-h-screen" />}>{renderRoute()}</Suspense>
        </div>
      </main>
      <Footer />
      <RefreshButton />
    </div>
  );
};

export default App;
