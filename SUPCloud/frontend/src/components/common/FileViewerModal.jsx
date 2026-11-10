import React, { useState, useEffect } from 'react';
import { X, Download, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { fileService } from '../../services/fileService';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configuration du worker PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const FileViewerModal = ({ isOpen, onClose, file, files = [], onNavigate }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [textContent, setTextContent] = useState('');

  // Trouver l'index du fichier actuel dans la liste
  useEffect(() => {
    if (file && files.length > 0) {
      const index = files.findIndex(f => f.id === file.id);
      setCurrentIndex(index);
    }
  }, [file, files]);

  // Gérer les touches du clavier
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        handlePrevious();
      } else if (e.key === 'ArrowRight' && currentIndex < files.length - 1) {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, files.length]);

  useEffect(() => {
    if (isOpen && file) {
      loadPreview();
    } else {
      setPreviewUrl(null);
      setError(null);
    }
  }, [isOpen, file]);

  const handlePrevious = () => {
    if (currentIndex > 0 && onNavigate) {
      onNavigate(files[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < files.length - 1 && onNavigate) {
      onNavigate(files[currentIndex + 1]);
    }
  };

  const loadPreview = async () => {
    setLoading(true);
    setError(null);
    setTextContent('');

    try {
      if (file?.mimeType === 'text/plain' || file?.mimeType === 'text/markdown' || file?.mimeType === 'text/html') {
        // Pour les fichiers texte, charger le contenu en texte
        const blob = await fileService.downloadFile(file.id);
        const text = await blob.text();
        setTextContent(text);
      } else {
        // Pour les autres types, charger en blob
        const blob = await fileService.downloadFile(file.id);
        const url = window.URL.createObjectURL(blob);
        setPreviewUrl(url);
      }
    } catch (err) {
      console.error('Erreur lors du chargement de la prévisualisation:', err);
      setError('Impossible de charger la prévisualisation');
    } finally {
      setLoading(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setError(null);
  };

  const onDocumentLoadError = (error) => {
    console.error('Erreur lors du chargement du PDF:', error);
    setError('Impossible de charger le PDF');
  };

  const changePage = (offset) => {
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
  };

  const previousPage = () => {
    changePage(-1);
  };

  const nextPage = () => {
    changePage(1);
  };

  const zoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.2, 3.0));
  };

  const zoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.2, 0.5));
  };

  const isImage = file?.mimeType?.startsWith('image/');
  const isVideo = file?.mimeType?.startsWith('video/');
  const isPdf = file?.mimeType === 'application/pdf';
  const isText = file?.mimeType === 'text/plain' || file?.mimeType === 'text/markdown' || file?.mimeType === 'text/html';
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < files.length - 1;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 truncate flex-1 mr-4">
            {file?.name}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Télécharger"
            >
              <Download size={20} className="text-gray-600" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Fermer"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-gray-50 relative">
          {loading ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
              <p className="text-gray-600">Chargement...</p>
            </div>
          ) : error ? (
            <div className="text-center">
              <p className="text-red-600">{error}</p>
            </div>
          ) : previewUrl || isText ? (
            <div className="flex items-center justify-center w-full h-full">
              {isImage ? (
                <img
                  src={previewUrl}
                  alt={file?.name}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                />
              ) : isVideo ? (
                <video
                  src={previewUrl}
                  controls
                  className="max-w-full max-h-[70vh] rounded-lg"
                  preload="metadata"
                  controlsList="nodownload"
                >
                  Votre navigateur ne supporte pas la lecture de vidéos.
                </video>
              ) : isPdf ? (
                <div className="flex flex-col items-center w-full">
                  {/* Contrôles PDF */}
                  <div className="flex items-center space-x-4 mb-4 bg-white p-2 rounded-lg shadow-sm">
                    <button
                      onClick={zoomOut}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Zoom arrière"
                    >
                      <ZoomOut size={18} className="text-gray-600" />
                    </button>
                    <span className="text-sm text-gray-600 min-w-[60px] text-center">
                      {Math.round(scale * 100)}%
                    </span>
                    <button
                      onClick={zoomIn}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Zoom avant"
                    >
                      <ZoomIn size={18} className="text-gray-600" />
                    </button>
                    {numPages && (
                      <span className="text-sm text-gray-600">
                        Page {pageNumber} sur {numPages}
                      </span>
                    )}
                  </div>
                  {/* Document PDF */}
                  <div className="flex items-center justify-center w-full max-h-[65vh] overflow-auto">
                    <Document
                      file={previewUrl}
                      onLoadSuccess={onDocumentLoadSuccess}
                      onLoadError={onDocumentLoadError}
                      loading={
                        <div className="text-center py-12">
                          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                          </div>
                          <p className="text-gray-600">Chargement du PDF...</p>
                        </div>
                      }
                    >
                      <Page
                        pageNumber={pageNumber}
                        scale={scale}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                      />
                    </Document>
                  </div>
                  {/* Navigation PDF */}
                  {numPages && numPages > 1 && (
                    <div className="flex items-center space-x-4 mt-4">
                      <button
                        onClick={previousPage}
                        disabled={pageNumber <= 1}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        ← Précédent
                      </button>
                      <button
                        onClick={nextPage}
                        disabled={pageNumber >= numPages}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Suivant →
                      </button>
                    </div>
                  )}
                </div>
              ) : isText ? (
                <div className="flex flex-col w-full max-h-[70vh]">
                  <div className="bg-white p-4 rounded-lg shadow-sm w-full overflow-auto flex-1">
                    <pre className="text-sm text-gray-800 font-mono whitespace-pre-wrap">
                      {textContent || 'Contenu vide'}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-600">Type de fichier non supporté pour la prévisualisation</p>
                  <p className="text-sm text-gray-500 mt-2">{file?.mimeType}</p>
                </div>
              )}
            </div>
          ) : null}

          {/* Boutons de navigation */}
          {hasPrevious && (
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full shadow-lg transition-all"
              title="Fichier précédent (←)"
            >
              <ChevronLeft size={24} className="text-gray-700" />
            </button>
          )}
          {hasNext && (
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full shadow-lg transition-all"
              title="Fichier suivant (→)"
            >
              <ChevronRight size={24} className="text-gray-700" />
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              <span className="font-medium">Type :</span> {file?.mimeType}
            </div>
            {files.length > 1 && (
              <div className="text-center">
                <span className="font-medium">{currentIndex + 1}</span> sur <span className="font-medium">{files.length}</span>
              </div>
            )}
            <div>
              <span className="font-medium">Taille :</span> {(file?.size / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileViewerModal;
