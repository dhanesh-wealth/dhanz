import { motion } from 'framer-motion';
import { getImage } from '../utils/getImage';
import { fadeUp, fadeLeft, fadeRight } from '../utils/animations';
import LazyImage from './LazyImage';
import './ServiceDetails.css';

const DETAIL_IDS = [ 7, 8, 9, 10, 11, 12, 13];

export default function ServiceDetails({ data }) {
  const detailServices = data.services.filter((s) => DETAIL_IDS.includes(s.id));

  return (
    <section id="services" className="service-details section">
      <div className="container">
        <motion.div
          className="service-details__header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
        >
          <span className="section-eyebrow">Our Expertise</span>
          <h2 className="section-title">{data.serviceDetails.title}</h2>
          <p className="section-description">{data.serviceDetails.subtitle}</p>
        </motion.div>

        <div className="service-details__list">
          {detailServices.map((service, index) => {
            const isEven = index % 2 === 0;
            const animVariant = isEven ? fadeLeft : fadeRight;

            return (
              <motion.article
                key={service.id}
                className="detail-card"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
                variants={animVariant}
              >
                <div className="detail-card__image-wrap">
                  <LazyImage
                    src={getImage(service.image)}
                    alt={service.title}
                    className="detail-card__image"
                  />
                </div>
                <div className="detail-card__content">
                  <h3>{service.title}</h3>
                  <div className="detail-card__divider" aria-hidden="true" />
                  <p>{service.fullDescription}</p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
