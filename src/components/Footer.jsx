import { Link, useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo';
import './Footer.css';

function FooterLink({ link }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (e) => {
    e.preventDefault();
    if (link.href.startsWith('/')) {
      navigate(link.href);
      return;
    }
    if (location.pathname !== '/') {
      sessionStorage.setItem('scrollTo', link.href);
      navigate('/');
      return;
    }
    document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
  };

  if (link.href.startsWith('/')) {
    return <Link to={link.href}>{link.label}</Link>;
  }

  return (
    <a href={link.href} onClick={handleClick}>
      {link.label}
    </a>
  );
}

export default function Footer({ data }) {
  const { footer, site, appLinks } = data;

  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <Logo data={data} className="footer__logo" alt={`${site.name} logo`} />
            <p>{footer.description}</p>
            {appLinks && (
              <div className="footer__apps">
                <h3>{appLinks.title}</h3>
                <div className="footer__app-badges">
                  <a
                    href={appLinks.appStore}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer__app-badge footer__app-badge--apple"
                    aria-label={appLinks.appStoreLabel}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                    </svg>
                    <span>
                      <small>Download on the</small>
                      App Store
                    </span>
                  </a>
                  <a
                    href={appLinks.playStore}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer__app-badge footer__app-badge--google"
                    aria-label={appLinks.playStoreLabel}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M3 20.5v-17c0-.83.94-1.3 1.6-.8l14.01 8.5c.57.35.57 1.15 0 1.5L4.6 21.3c-.66.5-1.6.03-1.6-.8z" />
                    </svg>
                    <span>
                      <small>Get it on</small>
                      Google Play
                    </span>
                  </a>
                </div>
              </div>
            )}
          </div>

          <nav className="footer__links" aria-label="Quick links">
            <h3>Quick Links</h3>
            <ul>
              {footer.quickLinks.map((link) => (
                <li key={link.href + link.label}>
                  <FooterLink link={link} />
                </li>
              ))}
            </ul>
          </nav>

          <nav className="footer__links" aria-label="Services links">
            <h3>Services</h3>
            <ul>
              {footer.serviceLinks.map((link) => (
                <li key={link.href + link.label}>
                  <FooterLink link={link} />
                </li>
              ))}
            </ul>
          </nav>

          <div className="footer__contact">
            <h3>Contact Info</h3>
            <ul>
              <li>
                <a href={`tel:${data.contact.phone.replace(/\s/g, '')}`}>
                  {data.contact.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${data.contact.email}`}>
                  {data.contact.email}
                </a>
              </li>
              <li>
                <address>{data.contact.address}</address>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p>{footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
