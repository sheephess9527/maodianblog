import React from 'react';
import { useHashRoute } from './utils/useHashRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import PostPage from './components/PostPage';
import TagPage from './components/TagPage';
import AboutPage from './components/AboutPage';
import NotFound from './components/NotFound';

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

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10">{renderRoute()}</main>
      <Footer />
    </div>
  );
};

export default App;
