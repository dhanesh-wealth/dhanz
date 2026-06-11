import { motion } from 'framer-motion';
import { getImage } from '../utils/getImage';
import { fadeUp, staggerContainer } from '../utils/animations';
import LazyImage from './LazyImage';
import './ServicesGrid.css';

const OFFER_IDS = [1, 2, 3, 4, 5, 6];

export default function ServicesGrid({ data }) {
  const offerServices = data.services.filter((s) => OFFER_IDS.includes(s.id));

  return (
    <section id="what-we-offer" className="services-grid section">
      <div className="container">
        <motion.div
          className="services-grid__header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
        >
          <span className="section-eyebrow">Our Solutions</span>
          <h2 className="section-title">{data.whatWeOffer.title}</h2>
          <p className="section-description">{data.whatWeOffer.subtitle}</p>
        </motion.div>

        <motion.div
          className="services-grid__cards"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {offerServices.map((service) => (
            <motion.article
              key={service.id}
              className="service-card"
              variants={fadeUp}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <div className="service-card__image-wrap">
                <LazyImage
                  src={getImage(service.image)}
                  alt={service.title}
                  className="service-card__image"
                />
              </div>
              <div className="service-card__body">
                <h3>{service.title}</h3>
                <p>{service.shortDescription}</p>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
