import './PdfViewer.css';

export default function PdfViewer({ url, title, downloadUrl }) {
  const viewUrl = `${url}#toolbar=1&navpanes=0&view=FitH`;

  return (
    <div className="pdf-viewer">
      <object
        data={viewUrl}
        type="application/pdf"
        title={title}
        className="pdf-viewer__embed"
      >
        <iframe
          src={viewUrl}
          title={title}
          className="pdf-viewer__iframe"
        />
      </object>
      <div className="pdf-viewer__actions">
        <a href={downloadUrl || url} className="pdf-viewer__open-link" download>
          Download PDF
        </a>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="pdf-viewer__open-link"
        >
          Open in new tab
        </a>
      </div>
    </div>
  );
}
