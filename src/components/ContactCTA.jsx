import { motion } from 'framer-motion';
import { fadeUp, staggerContainer } from '../utils/animations';
import { getWhatsAppUrl } from '../utils/whatsapp';
import './ContactCTA.css';

export default function ContactCTA({ data }) {
  const { contact } = data;

  return (
    <section id="contact" className="contact section">
      <div className="container">
        <motion.div
          className="contact__wrapper"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={staggerContainer}
        >
          <motion.div className="contact__header" variants={fadeUp}>
            <span className="section-eyebrow section-eyebrow--light">Get In Touch</span>
            <h2 className="section-title section-title--light">{contact.title}</h2>
            <p className="section-description section-description--light">{contact.subtitle}</p>
          </motion.div>

          <motion.div className="contact__info" variants={fadeUp}>
            <div className="contact__item">
              <span className="contact__icon" aria-hidden="true">P</span>
              <div>
                <strong>Phone</strong>
                <a href={`tel:${contact.phone.replace(/\s/g, '')}`}>{contact.phone}</a>
              </div>
            </div>
            <div className="contact__item">
              <span className="contact__icon" aria-hidden="true">E</span>
              <div>
                <strong>Email</strong>
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </div>
            </div>
            <div className="contact__item">
              <span className="contact__icon" aria-hidden="true">A</span>
              <div>
                <strong>Address</strong>
                <address>{contact.address}</address>
              </div>
            </div>
          </motion.div>

          <motion.div className="contact__cta" variants={fadeUp}>
            <a
              href={getWhatsAppUrl(contact.whatsapp, contact.whatsappGreeting)}
              className="btn btn--primary"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Schedule a consultation via WhatsApp"
            >
              {contact.ctaText}
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
