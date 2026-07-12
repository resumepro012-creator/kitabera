import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const PdfReader = () => {
  const { id } = useParams(); // id is filename
  const [pdf, setPdf] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const canvasRef = useRef(null);

  const fileUrl = `/api/view/${id}`;

  // Load PDF
  useEffect(() => {
    console.log('[PdfReader] Loading PDF from:', fileUrl);
    if (!id) {
      setError('File not found');
      setLoading(false);
      return;
    }

    const loadPdf = async () => {
      try {
        setLoading(true);
        setError('');
        const loadingTask = pdfjsLib.getDocument(fileUrl);
        const pdfDoc = await loadingTask.promise;
        console.log('[PdfReader] PDF loaded, pages:', pdfDoc.numPages);
        setPdf(pdfDoc);
        setNumPages(pdfDoc.numPages);
        setPageNum(1);
      } catch (err) {
        console.error('[PdfReader] Error loading PDF:', err);
        setError('Failed to load PDF: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadPdf();
  }, [id]);

  // Render page
  useEffect(() => {
    if (!pdf || !canvasRef.current) return;

    const renderPage = async () => {
      try {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const context = canvas.getContext('2d');
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };

        await page.render(renderContext).promise;
      } catch (err) {
        setError('Failed to render page: ' + err.message);
        console.error(err);
      }
    };

    renderPage();
  }, [pdf, pageNum, scale]);

  const goToPrevPage = () => {
    if (pageNum <= 1) return;
    setPageNum(pageNum - 1);
  };

  const goToNextPage = () => {
    if (pageNum >= numPages) return;
    setPageNum(pageNum + 1);
  };

  const zoomIn = () => setScale(prev => Math.min(prev + 0.25, 3.0));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
  const resetZoom = () => setScale(1.0);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: '1rem' }}>
        <div style={{ width: '50px', height: '50px', border: '5px solid var(--plum-200)', borderTop: '5px solid var(--plum-700)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <div style={{ color: 'var(--plum-700)', fontWeight: 500 }}>Loading PDF...</div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: '1rem', padding: '2rem' }}>
        <div style={{ color: 'var(--plum-700)', fontWeight: 600, fontSize: '1.2rem' }}>{error}</div>
        <Link to="/" className="secondary-button" style={{ marginTop: '1rem' }}>Go Home</Link>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: '1.5rem', 
      padding: '2rem 1rem', 
      width: 'min(100%, 1200px)',
      margin: '0 auto'
    }}>
      {/* Top Navigation */}
      <div style={{ 
        width: '100%', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        gap: '1rem', 
        flexWrap: 'wrap' 
      }}>
        <Link to="/" className="secondary-button" style={{ fontSize: '0.9rem' }}>
          ← Back to Home
        </Link>
        {fileUrl && (
          <a 
            href={`/api/download/${fileUrl.split('/').pop()}`} 
            className="primary-button"
            style={{ fontSize: '0.9rem' }}
          >
            Download PDF
          </a>
        )}
      </div>

      {/* Controls */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '0.75rem', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '1rem',
        background: 'white',
        borderRadius: '1rem',
        boxShadow: 'var(--shadow)',
        border: '1px solid rgba(88, 63, 88, 0.14)',
        width: '100%'
      }}>
        <button 
          onClick={goToPrevPage} 
          disabled={pageNum <= 1}
          className="secondary-button"
          style={{ minHeight: '2.5rem', padding: '0.5rem 1rem' }}
        >
          ← Previous
        </button>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          padding: '0.5rem 1rem', 
          background: 'var(--plum-50)', 
          borderRadius: '0.75rem',
          border: '1px solid rgba(88, 63, 88, 0.14)'
        }}>
          <span style={{ color: 'var(--plum-700)', fontWeight: 500 }}>Page</span>
          <span style={{ color: 'var(--plum-900)', fontWeight: 700 }}>{pageNum}</span>
          <span style={{ color: 'var(--plum-500)' }}>/</span>
          <span style={{ color: 'var(--plum-900)', fontWeight: 700 }}>{numPages}</span>
        </div>
        <button 
          onClick={goToNextPage} 
          disabled={pageNum >= numPages}
          className="secondary-button"
          style={{ minHeight: '2.5rem', padding: '0.5rem 1rem' }}
        >
          Next →
        </button>
        <div style={{ width: '1px', height: '2rem', background: 'rgba(88, 63, 88, 0.14)' }}></div>
        <button 
          onClick={zoomOut} 
          className="secondary-button"
          style={{ minHeight: '2.5rem', padding: '0.5rem 1rem' }}
        >
          Zoom Out
        </button>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          padding: '0.5rem 1rem', 
          background: 'var(--plum-50)', 
          borderRadius: '0.75rem',
          border: '1px solid rgba(88, 63, 88, 0.14)'
        }}>
          <span style={{ color: 'var(--plum-700)', fontWeight: 500 }}>{Math.round(scale * 100)}%</span>
        </div>
        <button 
          onClick={zoomIn} 
          className="secondary-button"
          style={{ minHeight: '2.5rem', padding: '0.5rem 1rem' }}
        >
          Zoom In
        </button>
        <button 
          onClick={resetZoom} 
          className="secondary-button"
          style={{ minHeight: '2.5rem', padding: '0.5rem 1rem' }}
        >
          Reset Zoom
        </button>
      </div>

      {/* PDF Canvas */}
      <div style={{ 
        overflow: 'auto', 
        width: '100%', 
        padding: '1rem', 
        background: 'var(--plum-50)', 
        borderRadius: '1rem', 
        border: '1px solid rgba(88, 63, 88, 0.14)',
        boxShadow: 'var(--shadow)'
      }}>
        <canvas 
          ref={canvasRef} 
          style={{ 
            display: 'block', 
            margin: '0 auto', 
            maxWidth: '100%',
            height: 'auto'
          }} 
        />
      </div>
    </div>
  );
};

export default PdfReader;
