import React, { useState, useEffect } from 'react';
import './PDFViewer.css';

const PDFViewer = ({ fileUrl, fileName, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    // Check if the PDF URL is valid
    if (!fileUrl) {
      setError('No PDF file URL provided');
      setLoading(false);
      return;
    }

    // Test if the URL is accessible
    const testPDF = async () => {
      try {
        const response = await fetch(fileUrl, { method: 'HEAD' });
        if (!response.ok) {
          throw new Error('PDF file not found');
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to load PDF file');
        setLoading(false);
      }
    };

    testPDF();
  }, [fileUrl]);

  const handleFullscreenToggle = () => {
    setFullscreen(!fullscreen);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName || 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const printWindow = window.open(fileUrl, '_blank');
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  if (loading) {
    return (
      <div className="pdf-viewer">
        <div className="pdf-header">
          <div className="pdf-title">
            <h3>Loading PDF...</h3>
          </div>
          <button onClick={onClose} className="close-btn">
            ✕ Close
          </button>
        </div>
        <div className="pdf-loading">
          <div className="loading-spinner"></div>
          <p>Loading PDF document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pdf-viewer">
        <div className="pdf-header">
          <div className="pdf-title">
            <h3>Error Loading PDF</h3>
          </div>
          <button onClick={onClose} className="close-btn">
            ✕ Close
          </button>
        </div>
        <div className="pdf-error">
          <div className="error-icon">📄</div>
          <h3>Unable to Load PDF</h3>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={() => window.location.reload()} className="retry-btn">
              Retry
            </button>
            <button onClick={onClose} className="back-btn">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`pdf-viewer ${fullscreen ? 'fullscreen' : ''}`}>
      <div className="pdf-header">
        <div className="pdf-title">
          <h3>{fileName || 'PDF Document'}</h3>
          <span className="file-info">PDF Document</span>
        </div>
        
        <div className="pdf-controls">
          <button 
            onClick={handleDownload} 
            className="control-btn download-btn"
            title="Download PDF"
          >
            📥 Download
          </button>
          
          <button 
            onClick={handlePrint} 
            className="control-btn print-btn"
            title="Print PDF"
          >
            🖨️ Print
          </button>
          
          <button 
            onClick={handleFullscreenToggle} 
            className="control-btn fullscreen-btn"
            title={fullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {fullscreen ? '🗗' : '🗖'} {fullscreen ? 'Exit' : 'Fullscreen'}
          </button>
          
          <button onClick={onClose} className="close-btn">
            ✕ Close
          </button>
        </div>
      </div>
      
      <div className="pdf-content">
        <iframe
          src={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1`}
          title={fileName || 'PDF Document'}
          className="pdf-iframe"
          onLoad={() => setLoading(false)}
          onError={() => setError('Failed to display PDF')}
        />
        
        {/* Fallback for browsers that don't support iframe PDF viewing */}
        <div className="pdf-fallback">
          <div className="fallback-content">
            <div className="fallback-icon">📄</div>
            <h3>PDF Viewer Not Supported</h3>
            <p>Your browser doesn't support inline PDF viewing.</p>
            <div className="fallback-actions">
              <button onClick={handleDownload} className="download-fallback-btn">
                📥 Download PDF
              </button>
              <a 
                href={fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="open-new-tab-btn"
              >
                🔗 Open in New Tab
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Progress indicator */}
      <div className="pdf-progress">
        <div className="progress-info">
          <span>📖 Reading: {fileName}</span>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;