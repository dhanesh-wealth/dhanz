import { useEffect } from 'react';
import Navbar from '../components/Navbar';
import HeroSlider from '../components/HeroSlider';
import MarketTicker from '../components/MarketTicker';
import About from '../components/About';
import ServicesGrid from '../components/ServicesGrid';
import ServiceDetails from '../components/ServiceDetails';
import ContactCTA from '../components/ContactCTA';
import Footer from '../components/Footer';
import FloatingButtons from '../components/FloatingButtons';
import websiteData from '../data/websiteData.json';

export default function Home() {
  useEffect(() => {
    const scrollTo = sessionStorage.getItem('scrollTo');
    if (scrollTo) {
      sessionStorage.removeItem('scrollTo');
      requestAnimationFrame(() => {
        document.querySelector(scrollTo)?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }, []);

  return (
    <>
      <MarketTicker />
      <Navbar data={websiteData} className="navbar--with-ticker" />
      <main>
        <HeroSlider data={websiteData} />
        <About data={websiteData} />
        <ServicesGrid data={websiteData} />
        <ServiceDetails data={websiteData} />
        <ContactCTA data={websiteData} />
      </main>
      <Footer data={websiteData} />
      <FloatingButtons data={websiteData} />
    </>
  );
}
