import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { fetchArticles } from '../api/articles';
import { fadeUp, staggerContainer } from '../utils/animations';
import websiteData from '../data/websiteData.json';
import './Articles.css';

export default function Articles() {
  const [cmsArticles, setCmsArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const predefined = (websiteData.predefinedArticles || []).map((a) => ({
    ...a,
    id: a.slug,
    isPredefined: true,
  }));

  useEffect(() => {
    fetchArticles()
      .then(setCmsArticles)
      .catch(() => setError('Unable to load uploaded articles.'))
      .finally(() => setLoading(false));
  }, []);

  const articles = [...predefined, ...cmsArticles];

  return (
    <Layout>
      <section className="articles-page section">
        <div className="container">
          <motion.div
            className="articles-page__header"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <span className="section-eyebrow">Insights</span>
            <h1 className="section-title">Articles & Publications</h1>
            <p className="section-description">
              Research reports, market insights, and publications from Dhanz Wealth.
            </p>
          </motion.div>

          {loading && cmsArticles.length === 0 && predefined.length === 0 && (
            <p className="articles-page__status">Loading articles…</p>
          )}
          {error && <p className="articles-page__error">{error}</p>}

          {!loading && articles.length === 0 && (
            <p className="articles-page__empty">No articles published yet. Check back soon.</p>
          )}

          <motion.div
            className="articles-grid"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {articles.map((article) => {
              const linkTo = article.isPredefined
                ? article.route
                : `/articles/${article.slug}`;

              return (
                <motion.article key={article.id} className="article-card" variants={fadeUp}>
                  <div className="article-card__icon" aria-hidden="true">
                    {article.isPredefined ? 'ART' : 'PDF'}
                  </div>
                  <div className="article-card__body">
                    <time dateTime={article.publishedAt}>
                      {new Date(article.publishedAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                    <h2>
                      <Link to={linkTo}>{article.title}</Link>
                    </h2>
                    {article.description && <p>{article.description}</p>}
                    <Link to={linkTo} className="article-card__link">
                      Read Article →
                    </Link>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
