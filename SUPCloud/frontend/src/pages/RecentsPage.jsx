import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import MainLayout from '../components/layout/MainLayout';
import FileView from '../components/common/FileView';
import { setFiles, setLoading, setError } from '../store/filesSlice';
import { fileService } from '../services/fileService';

const RecentsPage = () => {
  const dispatch = useDispatch();
  const { files, loading } = useSelector((state) => state.files);

  // Charger les fichiers récents (tous les fichiers triés par date)
  useEffect(() => {
    const loadRecentFiles = async () => {
      dispatch(setLoading(true));
      try {
        const filesData = await fileService.getFiles();
        // Trier par date de modification décroissante
        const sortedFiles = (filesData.files || []).sort((a, b) => 
          new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        dispatch(setFiles(sortedFiles));
      } catch (error) {
        console.error('Erreur lors du chargement des fichiers récents:', error);
        dispatch(setError('Erreur lors du chargement des fichiers récents'));
      } finally {
        dispatch(setLoading(false));
      }
    };

    loadRecentFiles();
  }, [dispatch]);

  const breadcrumbs = [
    { label: 'Accueil', path: '/home' },
    { label: 'Récents', path: '/recents' },
  ];

  return (
    <MainLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Fichiers récents</h2>
        <p className="text-gray-600">Vos fichiers les plus récemment modifiés</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      ) : (
        <FileView
          folders={[]}
          files={files}
          currentFolder={null}
          breadcrumbs={breadcrumbs}
        />
      )}
    </MainLayout>
  );
};

export default RecentsPage;
