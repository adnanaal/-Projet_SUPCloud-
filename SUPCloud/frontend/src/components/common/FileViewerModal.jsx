import React, { useState, useEffect, useRef } from 'react';
import { X, Download, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { fileService } from '../../services/fileService';
// import { Document, Page, pdfjs } from 'react-pdf';
// import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
// import 'react-pdf/dist/esm/Page/TextLayer.css';

// // Configuration du worker PDF.js
// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const FileViewerModal = ({ isOpen, onClose, file, files = [], onNavigate }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [textContent, setTextContent] = useState('');
  const [errorDetails, setErrorDetails] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const cacheRef = useRef({});

  // Variables de détection de type de fichier
  const isImage = file?.mimeType?.startsWith('image/');
  const isVideo = file?.mimeType?.startsWith('video/');
  const isPdf = file?.mimeType === 'application/pdf';
  const isText = file?.mimeType === 'text/plain' || file?.mimeType === 'text/markdown' || file?.mimeType === 'text/html';
  const isAudio = file?.mimeType?.startsWith('audio/');
  const isSupported = isImage || isVideo || isPdf || isText || isAudio;
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < files.length - 1;

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
    if (!file) return;

    // Vérifier le cache
    if (cacheRef.current[file.id]) {
      setPreviewUrl(cacheRef.current[file.id]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    setErrorDetails(null);
    setTextContent('');

    try {
      if (file?.mimeType === 'text/plain' || file?.mimeType === 'text/markdown' || file?.mimeType === 'text/html') {
        // Pour les fichiers texte, charger le contenu en texte
        const blob = await fileService.downloadFile(file.id);
        const text = await blob.text();
        setTextContent(text);
        // Pas de cache pour les textes (peu volumineux mais variable)
      } else {
        // Pour les autres types, charger en blob avec timeout
        const blob = await Promise.race([
          fileService.downloadFile(file.id),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout: Le fichier met trop de temps à charger')), 30000)
          )
        ]);
        const url = window.URL.createObjectURL(blob);
        setPreviewUrl(url);
        // Mettre en cache le blob URL
        cacheRef.current[file.id] = url;
      }
    } catch (err) {
      console.error('Erreur lors du chargement de la prévisualisation:', err);

      // Gestion spécifique des erreurs
      if (err.message.includes('Timeout')) {
        setError('Le fichier met trop de temps à charger. Vérifiez votre connexion.');
        setErrorDetails('Timeout après 30 secondes');
      } else if (err.response?.status === 404) {
        setError('Le fichier est introuvable ou a été supprimé.');
        setErrorDetails('Erreur 404: Fichier introuvable');
      } else if (err.response?.status === 403) {
        setError('Vous n\'avez pas la permission d\'accéder à ce fichier.');
        setErrorDetails('Erreur 403: Accès refusé');
      } else if (err.response?.status === 413) {
        setError('Le fichier est trop volumineux pour être prévisualisé.');
        setErrorDetails('Erreur 413: Fichier trop grand');
      } else if (err.message.includes('network')) {
        setError('Erreur de connexion. Vérifiez votre connexion internet.');
        setErrorDetails('Erreur réseau');
      } else {
        setError('Impossible de charger la prévisualisation.');
        setErrorDetails(err.message || 'Erreur inconnue');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    loadPreview();
  };

  // Nettoyer le cache quand le modal se ferme
  useEffect(() => {
    if (!isOpen) {
      // Libérer les URLs blob du cache
      Object.values(cacheRef.current).forEach(url => {
        if (url && url.startsWith('blob:')) {
          window.URL.revokeObjectURL(url);
        }
      });
      cacheRef.current = {};
    }
  }, [isOpen]);

  // Précharger les fichiers adjacents pour la navigation
  useEffect(() => {
    if (isOpen && currentIndex >= 0 && files.length > 1) {
      const preloadFile = async (index) => {
        if (index < 0 || index >= files.length) return;
        const adjacentFile = files[index];
        if (cacheRef.current[adjacentFile.id]) return;

        try {
          const blob = await fileService.downloadFile(adjacentFile.id);
          const url = window.URL.createObjectURL(blob);
          cacheRef.current[adjacentFile.id] = url;
        } catch (err) {
          // Ignorer les erreurs de préchargement
        }
      };

      // Précharger le fichier précédent et suivant
      if (currentIndex > 0) {
        preloadFile(currentIndex - 1);
      }
      if (currentIndex < files.length - 1) {
        preloadFile(currentIndex + 1);
      }
    }
  }, [isOpen, currentIndex, files]);

  // Charger les dimensions de l'image
  useEffect(() => {
    if (previewUrl && isImage) {
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = previewUrl;
    }
  }, [previewUrl, isImage]);

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
            <div className="text-center px-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                <p className="text-red-600 font-medium mb-2">{error}</p>
                {errorDetails && (
                  <p className="text-red-500 text-sm mb-4">{errorDetails}</p>
                )}
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Réessayer
                </button>
              </div>
            </div>
          ) : previewUrl || isText ? (
            <div className="flex items-center justify-center w-full h-full">
              {isImage ? (
                <div className="flex flex-col items-center">
                  <img
                    src={previewUrl}
                    alt={file?.name}
                    className="max-w-full max-h-[70vh] object-contain rounded-lg"
                    loading="lazy"
                    decoding="async"
                  />
                  {imageDimensions.width > 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      {imageDimensions.width} × {imageDimensions.height} pixels
                    </p>
                  )}
                </div>
              ) : isVideo ? (
                <video
                  src={previewUrl}
                  controls
                  className="max-w-full max-h-[70vh] rounded-lg"
                  preload="metadata"
                  controlsList="nodownload"
                  loading="lazy"
                >
                  Votre navigateur ne supporte pas la lecture de vidéos.
                </video>
              ) : isPdf ? (
                <div className="flex flex-col items-center w-full">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md text-center">
                    <p className="text-gray-600 mb-2">Prévisualisation PDF désactivée temporairement</p>
                    <p className="text-sm text-gray-500 mb-4">{file?.name}</p>
                    <button
                      onClick={handleDownload}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Télécharger le PDF
                    </button>
                  </div>
                </div>
              ) : isText ? (
                <div className="flex flex-col w-full max-h-[70vh]">
                  <div className="bg-white p-4 rounded-lg shadow-sm w-full overflow-auto flex-1">
                    <pre className="text-sm text-gray-800 font-mono whitespace-pre-wrap">
                      {textContent || 'Contenu vide'}
                    </pre>
                  </div>
                </div>
              ) : isAudio ? (
                <div className="flex flex-col items-center justify-center w-full max-h-[70vh]">
                  <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                    <div className="mb-4">
                      <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Fichier audio</h4>
                    <p className="text-sm text-gray-500 mb-4">{file?.name}</p>
                    <audio
                      src={previewUrl}
                      controls
                      className="w-full max-w-md"
                    >
                      Votre navigateur ne supporte pas la lecture audio.
                    </audio>
                  </div>
                </div>
              ) : isSupported ? (
                <div className="text-center px-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md">
                    <div className="mb-4">
                      <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Prévisualisation non disponible</h4>
                    <p className="text-sm text-gray-500 mb-4">Ce type de fichier ne peut pas être prévisualisé.</p>
                    <button
                      onClick={handleDownload}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Télécharger le fichier
                    </button>
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
