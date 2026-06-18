import { Component } from 'react';
import './PdfViewer.css';

function NativePdfFallback({ url, title, downloadUrl }) {
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

export default class PdfViewerErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <NativePdfFallback
          url={this.props.url}
          title={this.props.title}
          downloadUrl={this.props.downloadUrl}
        />
      );
    }
    return this.props.children;
  }
}
