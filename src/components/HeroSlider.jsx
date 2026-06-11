import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getImage } from '../utils/getImage';
import './HeroSlider.css';

export default function HeroSlider({ data }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [imagesReady, setImagesReady] = useState({});
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const slides = data.heroSlides;
  const total = slides.length;

  const slideSources = slides.map((slide) => getImage(slide.image));

  useEffect(() => {
    const preload = document.createElement('link');
    preload.rel = 'preload';
    preload.as = 'image';
    preload.href = slideSources[0];
    preload.fetchPriority = 'high';
    document.head.appendChild(preload);
    return () => preload.remove();
  }, [slideSources[0]]);

  useEffect(() => {
    slideSources.forEach((src, index) => {
      const img = new Image();
      img.fetchPriority = index === 0 ? 'high' : 'low';
      img.onload = () => {
        setImagesReady((prev) => ({ ...prev, [index]: true }));
      };
      img.onerror = () => {
        setImagesReady((prev) => ({ ...prev, [index]: true }));
      };
      img.src = src;
    });
  }, [slideSources.join('|')]);

  const goTo = useCallback((index, dir = 1) => {
    setDirection(dir);
    setCurrent((index + total) % total);
  }, [total]);

  const next = useCallback(() => goTo(current + 1, 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1, -1), [current, goTo]);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) next();
      else prev();
    }
  };

  const handleNavClick = (href) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const slide = slides[current];
  const firstImageReady = imagesReady[0];

  const textVariants = {
    enter: { opacity: 0, y: 30 },
    center: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.15 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4 } },
  };

  return (
    <section
      id="home"
      className="hero"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="Hero slider"
    >
      <div className="hero__slides" aria-hidden="true">
        {!firstImageReady && <div className="hero__skeleton" />}
        {slides.map((s, index) => (
          <div
            key={s.id}
            className={`hero__slide ${index === current ? 'hero__slide--active' : ''}`}
          >
            <img
              src={slideSources[index]}
              alt=""
              className={`hero__image ${imagesReady[index] ? 'hero__image--loaded' : ''}`}
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding={index === 0 ? 'sync' : 'async'}
              fetchPriority={index === 0 ? 'high' : 'low'}
            />
            <div className="hero__overlay" aria-hidden="true" />
          </div>
        ))}
      </div>

      <div className="hero__content">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={textVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="hero__text"
          >
            <h1>{slide.title}</h1>
            <p className="hero__subtitle">{slide.subtitle}</p>
            <div className="hero__buttons">
              {data.heroButtons.map((btn, index) => (
                <a
                  key={btn.href}
                  href={btn.href}
                  className={`btn ${index === 0 ? 'btn--primary' : 'btn--outline-light'}`}
                  onClick={(e) => { e.preventDefault(); handleNavClick(btn.href); }}
                >
                  {btn.label}
                </a>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="hero__dots" role="tablist" aria-label="Slide navigation">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === current}
            aria-label={`Go to slide ${i + 1}`}
            className={`hero__dot ${i === current ? 'active' : ''}`}
            onClick={() => goTo(i, i > current ? 1 : -1)}
          />
        ))}
      </div>

      <button
        type="button"
        className="hero__arrow hero__arrow--prev"
        onClick={prev}
        aria-label="Previous slide"
      >
        ‹
      </button>
      <button
        type="button"
        className="hero__arrow hero__arrow--next"
        onClick={next}
        aria-label="Next slide"
      >
        ›
      </button>
    </section>
  );
}
