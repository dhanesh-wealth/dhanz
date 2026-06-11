import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { fetchVideos } from '../api/videos';
import { getYouTubeEmbedUrl } from '../utils/youtube';
import { fadeUp, staggerContainer } from '../utils/animations';
import './Videos.css';

export default function Videos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    fetchVideos()
      .then((data) => {
        setVideos(data);
        if (data.length > 0) setActiveId(data[0].id);
      })
      .catch(() => setError('Unable to load videos. Please try again later.'))
      .finally(() => setLoading(false));
  }, []);

  const activeVideo = videos.find((v) => v.id === activeId) || videos[0];

  return (
    <Layout>
      <section className="videos-page section">
        <div className="container">
          <motion.div
            className="videos-page__header"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <span className="section-eyebrow">Media</span>
            <h1 className="section-title">Videos</h1>
            <p className="section-description">
              Market insights, educational content, and updates from Dhanz Wealth.
            </p>
          </motion.div>

          {loading && <p className="videos-page__status">Loading videos…</p>}
          {error && <p className="videos-page__error">{error}</p>}

          {!loading && !error && videos.length === 0 && (
            <p className="videos-page__empty">No videos published yet. Check back soon.</p>
          )}

          {activeVideo && (
            <motion.div
              className="videos-page__player"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              <div className="video-player">
                <iframe
                  src={getYouTubeEmbedUrl(activeVideo.videoId)}
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="video-player__info">
                <h2>{activeVideo.title}</h2>
                {activeVideo.description && <p>{activeVideo.description}</p>}
              </div>
            </motion.div>
          )}

          {videos.length > 1 && (
            <motion.div
              className="videos-grid"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {videos.map((video) => (
                <motion.button
                  key={video.id}
                  type="button"
                  className={`video-card ${activeVideo?.id === video.id ? 'video-card--active' : ''}`}
                  variants={fadeUp}
                  onClick={() => setActiveId(video.id)}
                >
                  <div className="video-card__thumb">
                    <img
                      src={`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`}
                      alt=""
                      loading="lazy"
                    />
                    <span className="video-card__play" aria-hidden="true">▶</span>
                  </div>
                  <div className="video-card__body">
                    <h3>{video.title}</h3>
                    {video.description && <p>{video.description}</p>}
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </Layout>
  );
}
