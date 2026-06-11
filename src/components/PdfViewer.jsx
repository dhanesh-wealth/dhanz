import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import './PdfViewer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PdfViewer({ url, title }) {
  const [numPages, setNumPages] = useState(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [pdfData, setPdfData] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [useFallback, setUseFallback] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setNumPages(null);
    setPdfData(null);
    setLoadError('');
    setUseFallback(false);

    const controller = new AbortController();

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.arrayBuffer();
      })
      .then((buffer) => setPdfData({ data: buffer }))
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setUseFallback(true);
        }
      });

    return () => controller.abort();
  }, [url]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return undefined;

    const observer = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    observer.observe(node);
    setContainerWidth(node.offsetWidth);
    return () => observer.disconnect();
  }, [useFallback]);

  const pageWidth = containerWidth ? Math.min(containerWidth, 900) : undefined;

  if (useFallback) {
    return (
      <div className="pdf-viewer pdf-viewer--fallback">
        <iframe
          src={`${url}#toolbar=1&navpanes=0`}
          title={title}
          className="pdf-viewer__iframe"
        />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="pdf-viewer pdf-viewer--fallback">
        <iframe
          src={`${url}#toolbar=1&navpanes=0`}
          title={title}
          className="pdf-viewer__iframe"
        />
      </div>
    );
  }

  if (!pdfData) {
    return <div className="pdf-viewer__loading">Loading PDF…</div>;
  }

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
                renderTextLayer
                renderAnnotationLayer
              />
            </div>
          ))}
      </Document>
    </div>
  );
}
