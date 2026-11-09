import React, { useState, useEffect } from 'react';
import { X, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { fileService } from '../../services/fileService';

const FileViewerModal = ({ isOpen, onClose, file, files = [], onNavigate }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);

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

    try {
      const blob = await fileService.downloadFile(file.id);
      const url = window.URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (err) {
      console.error('Erreur lors du chargement de la prévisualisation:', err);
      setError('Impossible de charger la prévisualisation');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const blob = await fileService.downloadFile(file.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    }
  };

  const isImage = file?.mimeType?.startsWith('image/');
  const isVideo = file?.mimeType?.startsWith('video/');
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
          ) : previewUrl ? (
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
