import { useEffect, useState } from 'react';
import './PdfViewer.css';

export default function PdfViewer({ url, title, downloadUrl, fileName = 'article.pdf' }) {
  const [blobUrl, setBlobUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    let objectUrl = '';

    setLoading(true);
    setError('');
    setBlobUrl('');

    fetch(url)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Could not load PDF (${res.status})`);
        }

        const buffer = await res.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        const signature = String.fromCharCode(...bytes.slice(0, 4));

        if (signature !== '%PDF') {
          throw new Error('The server did not return a valid PDF file.');
        }

        if (!active) return;

        const blob = new Blob([buffer], { type: 'application/pdf' });
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      })
      .catch((err) => {
        if (active) setError(err.message || 'Failed to load PDF.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  const handleDownload = () => {
    const href = blobUrl || downloadUrl || url;
    const link = document.createElement('a');
    link.href = href;
    link.download = fileName;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleOpen = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return <div className="pdf-viewer__loading">Loading PDF…</div>;
  }

  if (error) {
    return (
      <div className="pdf-viewer pdf-viewer--error">
        <p className="pdf-viewer__error">{error}</p>
        <div className="pdf-viewer__actions">
          <button type="button" className="pdf-viewer__button" onClick={handleOpen}>
            Open PDF in new tab
          </button>
          <a href={downloadUrl || url} className="pdf-viewer__open-link" download={fileName}>
            Download PDF
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="pdf-viewer">
      <div className="pdf-viewer__actions pdf-viewer__actions--top">
        <button type="button" className="pdf-viewer__button" onClick={handleOpen}>
          Open PDF in new tab
        </button>
        <button type="button" className="pdf-viewer__button pdf-viewer__button--secondary" onClick={handleDownload}>
          Download PDF
        </button>
      </div>
      <iframe
        src={blobUrl}
        title={title}
        className="pdf-viewer__iframe"
      />
    </div>
  );
}
