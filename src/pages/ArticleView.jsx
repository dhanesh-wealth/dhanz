import { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout, { PageHeader } from '../components/Layout';
import PdfViewerErrorBoundary from '../components/PdfViewerErrorBoundary';

const PdfViewer = lazy(() => import('../components/PdfViewer'));
import { fetchArticle, getArticlePdfUrl } from '../api/articles';
import './ArticleView.css';

export default function ArticleView() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchArticle(slug)
      .then(setArticle)
      .catch(() => setError('Article not found.'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="article-view__status container">Loading article…</div>
      </Layout>
    );
  }

  if (error || !article) {
    return (
      <Layout>
        <div className="article-view__error container">
          <p>{error}</p>
          <Link to="/articles">← Back to Articles</Link>
        </div>
      </Layout>
    );
  }

  const pdfViewUrl = getArticlePdfUrl(article.slug);
  const pdfDownloadUrl = getArticlePdfUrl(article.slug, { download: true });

  return (
    <Layout>
      <PageHeader
        eyebrow="Publication"
        title={article.title}
        description={article.description}
      />
      <section className="article-view section">
        <div className="container">
          <div className="article-view__meta">
            <time dateTime={article.publishedAt}>
              Published {new Date(article.publishedAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            <a
              href={pdfDownloadUrl}
              className="article-view__download"
              download
            >
              Download PDF
            </a>
          </div>
          <PdfViewerErrorBoundary
            url={pdfViewUrl}
            title={article.title}
            downloadUrl={pdfDownloadUrl}
          >
            <Suspense fallback={<div className="article-view__status">Loading PDF viewer…</div>}>
              <PdfViewer
                url={pdfViewUrl}
                title={article.title}
                downloadUrl={pdfDownloadUrl}
              />
            </Suspense>
          </PdfViewerErrorBoundary>
        </div>
      </section>
    </Layout>
  );
}
