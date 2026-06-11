import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  adminFetchArticles,
  adminCreateArticle,
  adminUpdateArticle,
  adminDeleteArticle,
} from '../api/articles';
import {
  adminFetchVideos,
  adminCreateVideo,
  adminUpdateVideo,
  adminDeleteVideo,
} from '../api/videos';
import './Admin.css';

const STORAGE_KEY = 'dhanz_cms_password';
const MAX_PDF_BYTES = 1024 * 1024;
const MAX_ARTICLES = 4;

export default function Admin() {
  const [password, setPassword] = useState(() => sessionStorage.getItem(STORAGE_KEY) || '');
  const [authenticated, setAuthenticated] = useState(false);
  const [tab, setTab] = useState('articles');
  const [articles, setArticles] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [published, setPublished] = useState(true);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const fileRef = useRef(null);

  const loadAll = async (pwd = password) => {
    setLoading(true);
    setError('');
    try {
      const [articleData, videoData] = await Promise.all([
        adminFetchArticles(pwd),
        adminFetchVideos(pwd),
      ]);
      setArticles(articleData);
      setVideos(videoData);
      setAuthenticated(true);
      sessionStorage.setItem(STORAGE_KEY, pwd);
    } catch (err) {
      setAuthenticated(false);
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (password) loadAll(password);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    loadAll(password);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setPassword('');
    setAuthenticated(false);
    setArticles([]);
    setVideos([]);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPublished(true);
    setYoutubeUrl('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleArticleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (articles.length >= MAX_ARTICLES) {
      setError(`Maximum ${MAX_ARTICLES} PDF articles allowed. Delete one before uploading.`);
      return;
    }

    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError('Please select a PDF file.');
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      setError('PDF must be 1 MB or smaller.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('published', published);
    formData.append('pdf', file);

    try {
      await adminCreateArticle(password, formData);
      resetForm();
      setSuccess('Article published successfully.');
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleVideoSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await adminCreateVideo(password, { title, description, youtubeUrl, published });
      resetForm();
      setSuccess('Video added successfully.');
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleArticlePublish = async (article) => {
    try {
      await adminUpdateArticle(password, article.id, { published: !article.published });
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleVideoPublish = async (video) => {
    try {
      await adminUpdateVideo(password, video.id, { published: !video.published });
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteArticle = async (id) => {
    if (!confirm('Delete this article and its PDF?')) return;
    try {
      await adminDeleteArticle(password, id);
      setSuccess('Article deleted.');
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteVideo = async (id) => {
    if (!confirm('Delete this video?')) return;
    try {
      await adminDeleteVideo(password, id);
      setSuccess('Video deleted.');
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!authenticated) {
    return (
      <div className="admin admin--login">
        <div className="admin__card">
          <h1>CMS Login</h1>
          <p>Enter your CMS password to manage content.</p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="CMS Password"
              required
              autoComplete="current-password"
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
          {error && <p className="admin__error">{error}</p>}
          <Link to="/" className="admin__home-link">← Back to website</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin">
      <header className="admin__header">
        <div className="admin__header-inner">
          <h1>Content CMS</h1>
          <div className="admin__header-actions">
            <Link to="/articles">Articles</Link>
            <Link to="/videos">Videos</Link>
            <button type="button" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      <div className="admin__tabs">
        <button
          type="button"
          className={tab === 'articles' ? 'active' : ''}
          onClick={() => { setTab('articles'); setError(''); setSuccess(''); }}
        >
          Articles ({articles.length})
        </button>
        <button
          type="button"
          className={tab === 'videos' ? 'active' : ''}
          onClick={() => { setTab('videos'); setError(''); setSuccess(''); }}
        >
          Videos ({videos.length})
        </button>
      </div>

      <div className="admin__body container">
        {tab === 'articles' && (
          <>
            <section className="admin__form-section">
              <h2>Upload New Article (PDF)</h2>
              <p className="admin__hint">
                Max {MAX_ARTICLES} articles · PDF up to 1 MB each ({articles.length}/{MAX_ARTICLES} used)
              </p>
              <form onSubmit={handleArticleSubmit} className="admin__form">
                <label>
                  Title *
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </label>
                <label>
                  Description
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                </label>
                <label>
                  PDF File * (max 1 MB)
                  <input
                    ref={fileRef}
                    type="file"
                    accept="application/pdf"
                    required
                    disabled={articles.length >= MAX_ARTICLES}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f && f.size > MAX_PDF_BYTES) {
                        setError('PDF must be 1 MB or smaller.');
                        e.target.value = '';
                      } else {
                        setError('');
                      }
                    }}
                  />
                </label>
                <label className="admin__checkbox">
                  <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
                  Publish immediately
                </label>
                <button
                  type="submit"
                  className="admin__submit"
                  disabled={articles.length >= MAX_ARTICLES}
                >
                  Upload & Publish
                </button>
              </form>
            </section>

            <section className="admin__list-section">
              <h2>All Articles</h2>
              {articles.length === 0 ? (
                <p className="admin__empty">No articles yet.</p>
              ) : (
                <ul className="admin__list">
                  {articles.map((article) => (
                    <li key={article.id} className="admin__item">
                      <div className="admin__item-info">
                        <strong>{article.title}</strong>
                        <span className={`admin__badge ${article.published ? 'published' : 'draft'}`}>
                          {article.published ? 'Published' : 'Draft'}
                        </span>
                        <small>{article.slug}</small>
                      </div>
                      <div className="admin__item-actions">
                        {article.published && (
                          <Link to={`/articles/${article.slug}`} target="_blank">View</Link>
                        )}
                        <button type="button" onClick={() => toggleArticlePublish(article)}>
                          {article.published ? 'Unpublish' : 'Publish'}
                        </button>
                        <button type="button" className="danger" onClick={() => handleDeleteArticle(article.id)}>
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}

        {tab === 'videos' && (
          <>
            <section className="admin__form-section">
              <h2>Add YouTube Video</h2>
              <form onSubmit={handleVideoSubmit} className="admin__form">
                <label>
                  Title *
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Video title" />
                </label>
                <label>
                  Description
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Short description (optional)" />
                </label>
                <label>
                  YouTube URL *
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    required
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </label>
                <label className="admin__checkbox">
                  <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
                  Publish immediately
                </label>
                <button type="submit" className="admin__submit">Add Video</button>
              </form>
            </section>

            <section className="admin__list-section">
              <h2>All Videos</h2>
              {videos.length === 0 ? (
                <p className="admin__empty">No videos yet.</p>
              ) : (
                <ul className="admin__list">
                  {videos.map((video) => (
                    <li key={video.id} className="admin__item">
                      <div className="admin__item-info">
                        <strong>{video.title}</strong>
                        <span className={`admin__badge ${video.published ? 'published' : 'draft'}`}>
                          {video.published ? 'Published' : 'Draft'}
                        </span>
                        <small>{video.videoId}</small>
                      </div>
                      <div className="admin__item-actions">
                        {video.published && (
                          <Link to="/videos" target="_blank">View</Link>
                        )}
                        <button type="button" onClick={() => toggleVideoPublish(video)}>
                          {video.published ? 'Unpublish' : 'Publish'}
                        </button>
                        <button type="button" className="danger" onClick={() => handleDeleteVideo(video.id)}>
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}

        {error && <p className="admin__error admin__message">{error}</p>}
        {success && <p className="admin__success admin__message">{success}</p>}
      </div>
    </div>
  );
}
