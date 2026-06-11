import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Articles from './pages/Articles';
import ArticleView from './pages/ArticleView';
import Admin from './pages/Admin';
import Article2 from './pages/Article2';
import Videos from './pages/Videos';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/articles/:slug" element={<ArticleView />} />
        {/* <Route path="/article2" element={<Article2 />} /> */}
        <Route path="/videos" element={<Videos />} />
        <Route path="/admindhanz" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
