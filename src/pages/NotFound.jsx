import './NotFound.css';

export default function NotFound() {
  return (
    <div className="not-found">
      <div className="not-found__content">
        <p className="not-found__code">404</p>
        <h1 className="not-found__title">Page not found</h1>
        <p className="not-found__text">
          The page you are looking for does not exist or may have been moved.
        </p>
      </div>
    </div>
  );
}
