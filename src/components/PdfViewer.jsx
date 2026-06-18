import './PdfViewer.css';

function isIos() {
  if (typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export default function PdfViewer({ url, title, downloadUrl, fileName = 'article.pdf' }) {
  const previewUrl = `${url}#toolbar=1&navpanes=0&view=FitH`;
  const ios = isIos();

  const handleOpen = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="pdf-viewer">
      <div className="pdf-viewer__actions pdf-viewer__actions--top">
        <button type="button" className="pdf-viewer__button" onClick={handleOpen}>
          Open PDF in new tab
        </button>
        <a
          href={downloadUrl || url}
          className="pdf-viewer__button pdf-viewer__button--secondary"
          download={fileName}
        >
          Download PDF
        </a>
      </div>

      {ios ? (
        <div className="pdf-viewer__mobile-card">
          <div className="pdf-viewer__mobile-icon" aria-hidden="true">PDF</div>
          <p className="pdf-viewer__mobile-title">{fileName}</p>
          <p className="pdf-viewer__mobile-hint">
            iPhone and iPad open PDFs in a separate viewer. Tap below to read this article.
          </p>
          <button type="button" className="pdf-viewer__button" onClick={handleOpen}>
            View PDF
          </button>
        </div>
      ) : (
        <iframe
          src={previewUrl}
          title={title}
          className="pdf-viewer__iframe"
        />
      )}
    </div>
  );
}
