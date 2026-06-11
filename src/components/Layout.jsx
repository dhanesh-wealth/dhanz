import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import websiteData from '../data/websiteData.json';

export default function Layout({ children, showFloating = false }) {
  return (
    <>
      <Navbar data={websiteData} />
      <main className="layout-main">{children}</main>
      <Footer data={websiteData} />
      {showFloating && null}
    </>
  );
}

export function PageHeader({ eyebrow, title, description, backTo = '/articles', backLabel = 'Back to Articles' }) {
  return (
    <div className="page-header">
      <div className="container">
        <Link to={backTo} className="page-header__back">← {backLabel}</Link>
        {eyebrow && <span className="section-eyebrow">{eyebrow}</span>}
        <h1 className="page-header__title">{title}</h1>
        {description && <p className="page-header__desc">{description}</p>}
      </div>
    </div>
  );
}
