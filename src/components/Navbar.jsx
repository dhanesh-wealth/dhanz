import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo';
import './Navbar.css';

function NavLink({ item, onClick }) {
  const isRoute = item.href.startsWith('/');

  if (isRoute) {
    return (
      <Link to={item.href} onClick={onClick}>
        {item.label}
      </Link>
    );
  }

  return (
    <a
      href={item.href}
      onClick={(e) => {
        e.preventDefault();
        onClick(item.href);
      }}
    >
      {item.label}
    </a>
  );
}

export default function Navbar({ data, className = '' }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleNavClick = (href) => {
    setMenuOpen(false);
    if (href.startsWith('/')) {
      navigate(href);
      return;
    }
    if (location.pathname !== '/') {
      sessionStorage.setItem('scrollTo', href);
      navigate('/');
      return;
    }
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    setMenuOpen(false);
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''} ${className}`.trim()} role="banner">
      <div className="navbar__container">
        <a
          href="/"
          className="navbar__logo"
          onClick={handleLogoClick}
          aria-label={`${data.site.name} - Home`}
        >
          <Logo data={data} />
        </a>

        <nav className="navbar__desktop" aria-label="Main navigation">
          <ul>
            {data.navigation.map((item) => (
              <li key={item.href + item.label}>
                <NavLink item={item} onClick={() => handleNavClick(item.href)} />
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          className={`navbar__hamburger ${menuOpen ? 'active' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <nav
        id="mobile-menu"
        className={`navbar__mobile ${menuOpen ? 'open' : ''}`}
        aria-label="Mobile navigation"
        aria-hidden={!menuOpen}
      >
        <ul>
          {data.navigation.map((item) => (
            <li key={item.href + item.label}>
              <NavLink item={item} onClick={() => handleNavClick(item.href)} />
            </li>
          ))}
        </ul>
      </nav>

      {menuOpen && (
        <div
          className="navbar__overlay"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </header>
  );
}
