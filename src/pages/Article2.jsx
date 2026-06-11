import { motion } from 'framer-motion';
import Layout, { PageHeader } from '../components/Layout';
import LazyImage from '../components/LazyImage';
import { getImage } from '../utils/getImage';
import { fadeUp } from '../utils/animations';
import websiteData from '../data/websiteData.json';
import './Article2.css';

export default function Article2() {
  const article = websiteData.article2;

  return (
    <Layout>
      <PageHeader
        eyebrow={article.category}
        title={article.title}
        description={article.subtitle}
      />

      <article className="article2 section">
        <div className="container">
          <motion.div
            className="article2__meta"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <span>By {article.author}</span>
            <time dateTime={article.publishedAt}>
              {new Date(article.publishedAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            <span>{article.readTime}</span>
          </motion.div>

          <motion.div
            className="article2__hero-image"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <LazyImage
              src={getImage(article.image)}
              alt={article.title}
              className="article2__image"
            />
          </motion.div>

          <div className="article2__content">
            {article.sections.map((section, index) => (
              <motion.section
                key={section.heading}
                className="article2__section"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                variants={fadeUp}
                transition={{ delay: index * 0.05 }}
              >
                <h2>{section.heading}</h2>
                <p>{section.body}</p>
              </motion.section>
            ))}
          </div>
        </div>
      </article>
    </Layout>
  );
}
