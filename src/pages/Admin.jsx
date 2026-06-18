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
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [published, setPublished] = useState(true);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const fileRef = useRef(null);

  const isBusy = loading || uploading || Boolean(deletingId);

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

    setUploading(true);
    try {
      await adminCreateArticle(password, formData);
      resetForm();
      setSuccess('Article published successfully.');
      await loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleVideoSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    setUploading(true);
    try {
      await adminCreateVideo(password, { title, description, youtubeUrl, published });
      resetForm();
      setSuccess('Video added successfully.');
      await loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
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

  const openDeleteModal = (type, id, itemTitle) => {
    setDeleteTarget({ type, id, title: itemTitle });
  };

  const closeDeleteModal = () => {
    if (deletingId) return;
    setDeleteTarget(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    const { type, id } = deleteTarget;
    setDeletingId(id);
    setError('');
    setSuccess('');

    try {
      if (type === 'article') {
        await adminDeleteArticle(password, id);
        setSuccess('Article deleted.');
      } else {
        await adminDeleteVideo(password, id);
        setSuccess('Video deleted.');
      }
      setDeleteTarget(null);
      await loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (!authenticated) {
    return (
      <div className="admin admin--login">
        <div className="admin__card">
          <h1>Dhanz Wealth Admin</h1>
          <p>Enter your Admin password to manage content.</p>
          <form onSubmit={handleLogin}>
            <div className="admin__password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin Password"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="admin__password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
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
      {(uploading || deletingId) && (
        <div className="admin__loader" role="status" aria-live="polite">
          <div className="admin__loader-card">
            <span className="admin__spinner" aria-hidden="true" />
            <p>{uploading ? 'Uploading…' : 'Deleting…'}</p>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="admin__modal-backdrop" onClick={closeDeleteModal} role="presentation">
          <div
            className="admin__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-delete-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="admin-delete-title">Delete {deleteTarget.type === 'article' ? 'article' : 'video'}?</h2>
            <p>
              {deleteTarget.type === 'article'
                ? `This will permanently delete "${deleteTarget.title}" and its PDF file.`
                : `This will permanently delete "${deleteTarget.title}".`}
            </p>
            <div className="admin__modal-actions">
              <button type="button" className="admin__modal-cancel" onClick={closeDeleteModal} disabled={Boolean(deletingId)}>
                Cancel
              </button>
              <button type="button" className="admin__modal-delete" onClick={confirmDelete} disabled={Boolean(deletingId)}>
                {deletingId ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="admin__header">
        <div className="admin__header-inner">
          <h1>Content CMS</h1>
          <div className="admin__header-actions">
            <Link to="/articles">Articles</Link>
            <Link to="/videos">Videos</Link>
            <button type="button" onClick={handleLogout} disabled={isBusy}>Logout</button>
          </div>
        </div>
      </header>

      <div className="admin__tabs">
        <button
          type="button"
          className={tab === 'articles' ? 'active' : ''}
          onClick={() => { setTab('articles'); setError(''); setSuccess(''); }}
          disabled={isBusy}
        >
          Articles ({articles.length})
        </button>
        <button
          type="button"
          className={tab === 'videos' ? 'active' : ''}
          onClick={() => { setTab('videos'); setError(''); setSuccess(''); }}
          disabled={isBusy}
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
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required disabled={uploading} />
                </label>
                <label>
                  Description
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} disabled={uploading} />
                </label>
                <label>
                  PDF File * (max 1 MB)
                  <input
                    ref={fileRef}
                    type="file"
                    accept="application/pdf"
                    required
                    disabled={articles.length >= MAX_ARTICLES || uploading}
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
                  <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} disabled={uploading} />
                  Publish immediately
                </label>
                <button
                  type="submit"
                  className="admin__submit"
                  disabled={articles.length >= MAX_ARTICLES || uploading}
                >
                  {uploading ? 'Uploading…' : 'Upload & Publish'}
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
                        <button type="button" onClick={() => toggleArticlePublish(article)} disabled={isBusy}>
                          {article.published ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          type="button"
                          className="danger"
                          onClick={() => openDeleteModal('article', article.id, article.title)}
                          disabled={isBusy}
                        >
                          {deletingId === article.id ? 'Deleting…' : 'Delete'}
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
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Video title" disabled={uploading} />
                </label>
                <label>
                  Description
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Short description (optional)" disabled={uploading} />
                </label>
                <label>
                  YouTube URL *
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    required
                    placeholder="https://www.youtube.com/watch?v=... or /live/..."
                    disabled={uploading}
                  />
                </label>
                <label className="admin__checkbox">
                  <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} disabled={uploading} />
                  Publish immediately
                </label>
                <button type="submit" className="admin__submit" disabled={uploading}>
                  {uploading ? 'Adding…' : 'Add Video'}
                </button>
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
                        <button type="button" onClick={() => toggleVideoPublish(video)} disabled={isBusy}>
                          {video.published ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          type="button"
                          className="danger"
                          onClick={() => openDeleteModal('video', video.id, video.title)}
                          disabled={isBusy}
                        >
                          {deletingId === video.id ? 'Deleting…' : 'Delete'}
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
