import React, { useState, useRef } from 'react';
import { X, Upload as UploadIcon, FileText, AlertCircle } from 'lucide-react';
import { fileService } from '../../services/fileService';
import { addToast } from '../../store/uiSlice';
import { formatBytes } from '../../utils/formatBytes';
import { useDispatch } from 'react-redux';

// Identifiant d'un fichier sélectionné (le nom seul peut être en double)
const fileKey = (file) => `${file.name}-${file.size}-${file.lastModified}`;

const UploadModal = ({ isOpen, onClose, currentFolderId = null }) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const needsRefreshRef = useRef(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadErrors, setUploadErrors] = useState({});

  if (!isOpen) return null;

  const addFiles = (files) => {
    setSelectedFiles((current) => [...current, ...files]);
  };

  const handleFileSelect = (e) => {
    addFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addFiles(Array.from(e.dataTransfer.files));
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const resetState = () => {
    setSelectedFiles([]);
    setUploadProgress({});
    setUploadErrors({});
  };

  // Fermer la fenêtre ; recharger la page si des fichiers ont été envoyés pour les afficher
  const handleClose = () => {
    const needsRefresh = needsRefreshRef.current;
    needsRefreshRef.current = false;
    resetState();
    onClose();
    if (needsRefresh) {
      window.location.reload();
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress({});
    setUploadErrors({});

    const failed = [];
    const errors = {};
    let successCount = 0;

    for (const file of selectedFiles) {
      const key = fileKey(file);

      try {
        await fileService.uploadFile(file, currentFolderId, (percent) => {
          setUploadProgress((prev) => ({ ...prev, [key]: percent }));
        });
        successCount++;
        setUploadProgress((prev) => ({ ...prev, [key]: 100 }));
      } catch (error) {
        console.error(`Erreur lors de l'upload de ${file.name}:`, error);
        errors[key] = error.response?.data?.message || error.message || 'Erreur lors de l\'upload';
        failed.push(file);
      }
    }

    if (successCount > 0) {
      needsRefreshRef.current = true;
    }

    setUploading(false);

    if (failed.length === 0) {
      dispatch(addToast({
        message: `${successCount} fichier(s) uploadé(s) avec succès`,
        type: 'success'
      }));
      handleClose();
      return;
    }

    // Des fichiers ont échoué : on garde la fenêtre ouverte pour afficher les erreurs
    setSelectedFiles(failed);
    setUploadErrors(errors);
    setUploadProgress({});
    dispatch(addToast({
      message: successCount > 0
        ? `${successCount} fichier(s) uploadé(s), ${failed.length} en échec`
        : `${failed.length} fichier(s) en échec`,
      type: 'error'
    }));
  };

  return (
    <div className="fixed inset-0 bg-brand-950/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="animate-scale-in bg-white rounded-2xl shadow-2xl shadow-brand-900/20 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Uploader des fichiers</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={uploading}
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Zone de drop */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-brand-500 hover:bg-brand-50 transition-colors mb-6"
          >
            <UploadIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              Glissez-déposez vos fichiers ici ou cliquez pour sélectionner
            </p>
            <p className="text-sm text-gray-500">
              Tous les types de fichiers sont acceptés, dans la limite de votre espace restant
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Liste des fichiers sélectionnés */}
          {selectedFiles.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Fichiers sélectionnés ({selectedFiles.length})
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedFiles.map((file, index) => {
                  const key = fileKey(file);
                  const error = uploadErrors[key];
                  const progress = uploadProgress[key] || 0;

                  return (
                    <div
                      key={`${key}-${index}`}
                      className={`p-3 rounded-lg ${error ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatBytes(file.size)}
                            </p>
                          </div>
                        </div>
                        {uploading ? (
                          <span className="text-xs text-gray-500 ml-3">{progress}%</span>
                        ) : (
                          <button
                            onClick={() => handleRemoveFile(index)}
                            className="p-1 hover:bg-red-100 rounded transition-colors ml-3"
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </button>
                        )}
                      </div>

                      {uploading && (
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-brand-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}

                      {error && (
                        <p className="flex items-start text-xs text-red-700 mt-2">
                          <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                          <span>{error}</span>
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            disabled={uploading}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {needsRefreshRef.current ? 'Fermer' : 'Annuler'}
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || selectedFiles.length === 0}
            className="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Upload en cours...' : 'Uploader'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
