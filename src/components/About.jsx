import { motion } from 'framer-motion';
import { fadeUp, fadeLeft, fadeRight, staggerContainer } from '../utils/animations';
import './About.css';

export default function About({ data }) {
  const { about } = data;

  return (
    <section id="about" className="about section">
      <div className="container">
        <motion.div
          className="about__intro"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
        >
          <span className="section-eyebrow">About Us</span>
          <h2 className="section-title">{about.title}</h2>
          <p className="section-description">{about.description}</p>
        </motion.div>

        <div className="about__grid">
          <motion.div
            className="about__block"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeLeft}
          >
            <h3 className="about__subtitle">{about.objective.title}</h3>
            <p>{about.objective.description}</p>
          </motion.div>

          <motion.div
            className="about__block"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeRight}
          >
            <h3 className="about__subtitle">{about.values.title}</h3>
            <p className="about__values-intro">{about.values.description}</p>
            <motion.ul
              className="about__values"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
            >
              {about.values.items.map((value) => (
                <motion.li key={value.title} variants={fadeUp}>
                  <strong>{value.title}</strong>
                  <span>{value.description}</span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
