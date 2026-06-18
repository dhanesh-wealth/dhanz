import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import './PdfViewer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function NativePdfViewer({ url, title, downloadUrl }) {
  return (
    <div className="pdf-viewer pdf-viewer--fallback">
      <iframe
        src={`${url}#toolbar=1&navpanes=0`}
        title={title}
        className="pdf-viewer__iframe"
      />
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

export default function PdfViewer({ url, title, downloadUrl }) {
  const [numPages, setNumPages] = useState(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [pdfData, setPdfData] = useState(null);
  const [useFallback, setUseFallback] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setNumPages(null);
    setPdfData(null);
    setUseFallback(false);

    const controller = new AbortController();

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.arrayBuffer();
      })
      .then((buffer) => setPdfData({ data: buffer }))
      .catch((err) => {
        if (err.name !== 'AbortError') setUseFallback(true);
      });

    return () => controller.abort();
  }, [url]);

  useEffect(() => {
    if (useFallback || !pdfData) return undefined;

    const node = containerRef.current;
    if (!node) return undefined;

    const updateWidth = () => {
      setContainerWidth(node.getBoundingClientRect().width);
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(node);
    window.addEventListener('resize', updateWidth);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateWidth);
    };
  }, [useFallback, pdfData]);

  if (useFallback) {
    return <NativePdfViewer url={url} title={title} downloadUrl={downloadUrl} />;
  }

  if (!pdfData) {
    return <div className="pdf-viewer__loading">Loading PDF…</div>;
  }

  const pageWidth = containerWidth > 0
    ? Math.min(containerWidth, 900)
    : Math.min(Math.max(window.innerWidth - 40, 280), 900);

  return (
    <div className="pdf-viewer" ref={containerRef}>
      <Document
        file={pdfData}
        onLoadSuccess={({ numPages: total }) => setNumPages(total)}
        onLoadError={() => setUseFallback(true)}
        loading={<div className="pdf-viewer__loading">Rendering pages…</div>}
        error={<div className="pdf-viewer__error">Failed to render PDF.</div>}
        aria-label={title}
      >
        {numPages &&
          Array.from({ length: numPages }, (_, i) => (
            <div key={`page_${i + 1}`} className="pdf-viewer__page-wrap">
              <span className="pdf-viewer__page-label">Page {i + 1}</span>
              <Page
                pageNumber={i + 1}
                width={pageWidth}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </div>
          ))}
      </Document>
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
