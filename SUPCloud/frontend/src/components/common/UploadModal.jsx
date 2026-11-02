import React, { useState, useRef } from 'react';
import { X, Upload as UploadIcon, FileText } from 'lucide-react';
import { fileService } from '../../services/fileService';
import { addToast } from '../../store/uiSlice';
import { useDispatch } from 'react-redux';

const UploadModal = ({ isOpen, onClose, currentFolderId = null }) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState([]);

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles([...selectedFiles, ...files]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles([...selectedFiles, ...files]);
  };

  const handleRemoveFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadedFiles([]);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const formData = new FormData();
        formData.append('file', file);
        if (currentFolderId) {
          formData.append('folderId', currentFolderId);
        }

        try {
          await fileService.uploadFile(formData);
          setUploadedFiles([...uploadedFiles, file.name]);
          setUploadProgress({ ...uploadProgress, [file.name]: 100 });
        } catch (error) {
          console.error(`Erreur lors de l'upload de ${file.name}:`, error);
          dispatch(addToast({
            message: `Erreur lors de l'upload de ${file.name}`,
            type: 'error'
          }));
        }
      }

      dispatch(addToast({
        message: `${uploadedFiles.length} fichier(s) uploadé(s) avec succès`,
        type: 'success'
      }));

      setSelectedFiles([]);
      setUploadProgress({});
      setUploadedFiles([]);
      onClose();
      window.location.reload(); // Recharger pour voir les nouveaux fichiers
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      dispatch(addToast({
        message: 'Erreur lors de l\'upload',
        type: 'error'
      }));
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Uploader des fichiers</h2>
          <button
            onClick={onClose}
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
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors mb-6"
          >
            <UploadIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              Glissez-déposez vos fichiers ici ou cliquez pour sélectionner
            </p>
            <p className="text-sm text-gray-500">
              Vous pouvez sélectionner plusieurs fichiers
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
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    {!uploading && (
                      <button
                        onClick={() => handleRemoveFile(index)}
                        className="p-1 hover:bg-red-100 rounded transition-colors"
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progression */}
          {uploading && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Upload en cours...
              </h3>
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <span className="text-xs text-gray-500">
                        {uploadProgress[file.name] || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress[file.name] || 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Annuler
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || selectedFiles.length === 0}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Upload en cours...' : 'Uploader'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
