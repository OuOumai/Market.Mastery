import React, { useState, useRef, useEffect } from 'react';
import { assets } from '../../assets/assets';

const PDFViewer = ({ 
  pdfUrl, 
  title, 
  description, 
  isPreview = false,
  className = "" 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const iframeRef = useRef(null);

  // Handle PDF load
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      setIsLoading(false);
      setError(null);
    };

    const handleError = () => {
      setError('Failed to load PDF');
      setIsLoading(false);
    };

    iframe.addEventListener('load', handleLoad);
    iframe.addEventListener('error', handleError);

    return () => {
      iframe.removeEventListener('load', handleLoad);
      iframe.removeEventListener('error', handleError);
    };
  }, [pdfUrl]);

  // Handle fullscreen
  const toggleFullscreen = () => {
    const container = iframeRef.current?.parentElement;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Handle download
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = title || 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle print
  const handlePrint = () => {
    window.open(pdfUrl, '_blank');
  };

  // Handle zoom
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleZoomReset = () => {
    setScale(1);
  };

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-8 text-center ${className}`}>
        <img src={assets.cross_icon} alt="Error" className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium text-red-800 mb-2">PDF Error</h3>
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden relative group ${className}`}>
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-800">{title || 'PDF Document'}</h3>
          {description && <p className="text-sm text-gray-600">{description}</p>}
        </div>
        <div className="flex items-center gap-2">
          {isPreview && (
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
              Preview
            </span>
          )}
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            title="Fullscreen"
          >
            <img src={assets.arrow_icon} alt="Fullscreen" className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-100 px-4 py-2 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title="Zoom Out"
          >
            <span className="text-lg">-</span>
          </button>
          <span className="text-sm text-gray-600 min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title="Zoom In"
          >
            <span className="text-lg">+</span>
          </button>
          <button
            onClick={handleZoomReset}
            className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors"
            title="Reset Zoom"
          >
            Reset
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition-colors"
            title="Print"
          >
            <img src={assets.file_upload_icon} alt="Print" className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded transition-colors"
            title="Download"
          >
            <img src={assets.file_upload_icon} alt="Download" className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      {/* PDF Container */}
      <div className="relative bg-gray-100" style={{ height: '600px' }}>
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Loading PDF...</p>
            </div>
          </div>
        )}

        {/* Preview Overlay */}
        {isPreview && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-20">
            <div className="text-center text-white">
              <img src={assets.file_upload_icon} alt="PDF" className="w-16 h-16 mx-auto mb-4 opacity-75" />
              <h3 className="text-xl font-semibold mb-2">Preview PDF</h3>
              <p className="text-sm opacity-90 mb-4">This is a preview. Enroll to access the full document.</p>
              <button
                onClick={() => window.open(pdfUrl, '_blank')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Preview
              </button>
            </div>
          </div>
        )}

        {/* PDF iframe */}
        <iframe
          ref={iframeRef}
          src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1&page=1&view=FitH`}
          className="w-full h-full border-0"
          style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
          title={title || 'PDF Document'}
        />
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-4 py-2 border-t flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <span>Page {pageNumber} of {totalPages || '?'}</span>
          <span>•</span>
          <span>PDF Document</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Use Ctrl + scroll to zoom</span>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;

