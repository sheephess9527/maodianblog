import React from 'react';
import { useHashRoute } from './utils/useHashRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import PostPage from './components/PostPage';
import TagPage from './components/TagPage';
import AboutPage from './components/AboutPage';
import NotFound from './components/NotFound';
import RefreshButton from './components/RefreshButton';

const App: React.FC = () => {
  const route = useHashRoute();

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

  // 各页面自行控制内容宽度：首页/标签页用宽网格，文章页用窄栏便于阅读。
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="w-full flex-1">{renderRoute()}</main>
      <Footer />
      <RefreshButton />
    </div>
  );
};

export default App;
