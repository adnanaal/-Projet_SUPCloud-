import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Folder, ChevronRight } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import FileList from '../components/common/FileList';
import RenameModal from '../components/common/RenameModal';
import FileViewerModal from '../components/common/FileViewerModal';
import { setFiles } from '../store/filesSlice';
import { searchService } from '../services/searchService';
import { addToast, closeRenameModal, closeFileViewerModal, openFileViewerModal } from '../store/uiSlice';

const SearchPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = (searchParams.get('q') || '').trim();
  const fileToOpen = searchParams.get('open');
  const { files } = useSelector((state) => state.files);
  const { renameModalOpen, fileViewerModalOpen, selectedItem, itemType } = useSelector((state) => state.ui);
  const [folders, setFolders] = useState([]);
  const [totals, setTotals] = useState({ folders: 0, files: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      dispatch(setFiles([]));
      setFolders([]);
      setTotals({ folders: 0, files: 0 });
      return undefined;
    }
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await searchService.search(query);
        if (cancelled) return;
        dispatch(setFiles(data.files));
        setFolders(data.folders);
        setTotals({ folders: data.totalFolders, files: data.totalFiles });
      } catch (error) {
        if (!cancelled) {
          dispatch(addToast({ message: error.response?.data?.message || 'Erreur lors de la recherche', type: 'error' }));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [query, dispatch]);

  // Fichier choisi dans les suggestions : l'ouvrir une fois les résultats chargés
  useEffect(() => {
    if (!fileToOpen || loading) return;
    const file = files.find((f) => f.id === fileToOpen);
    if (file) dispatch(openFileViewerModal(file));
    setSearchParams({ q: query }, { replace: true });
  }, [fileToOpen, files, loading, query, dispatch, setSearchParams]);

  const total = totals.folders + totals.files;
  const truncated = folders.length < totals.folders || files.length < totals.files;

  return (
    <MainLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 break-words">
          {query ? <>Résultats pour « {query} »</> : 'Recherche'}
        </h2>
        <p className="text-gray-600">
          {!query
            ? 'Saisissez un nom de fichier ou de dossier dans la barre de recherche'
            : loading
              ? 'Recherche en cours...'
              : `${total} résultat${total > 1 ? 's' : ''} : ${totals.folders} dossier${totals.folders > 1 ? 's' : ''}, ${totals.files} fichier${totals.files > 1 ? 's' : ''}`}
        </p>
        {truncated && !loading && (
          <p className="text-sm text-gray-500 mt-1">Seuls les résultats les plus récents sont affichés : précisez votre recherche.</p>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-50 to-brand-100 rounded-2xl mb-4 shadow-sm ring-1 ring-brand-100 animate-float">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
          </div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      ) : query && total === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-50 to-brand-100 rounded-2xl mb-4 shadow-sm ring-1 ring-brand-100 animate-float">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-2">Aucun fichier ni dossier ne correspond à « {query} »</p>
          <p className="text-sm text-gray-500">Les éléments de la corbeille ne sont pas inclus dans la recherche</p>
        </div>
      ) : query ? (
        <div className="space-y-8">
          {folders.length > 0 && (
            <section>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Dossiers</h3>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => navigate(`/folders/${folder.id}`)}
                    className="w-full flex items-center px-4 sm:px-6 py-3 text-left hover:bg-gray-50"
                  >
                    <Folder className="h-5 w-5 text-brand-600 flex-shrink-0" />
                    <span className="ml-4 min-w-0 flex-1">
                      <span className="block text-sm font-medium text-gray-900 truncate" title={folder.name}>{folder.name}</span>
                      <span className="block text-xs text-gray-500 truncate">
                        Dans {folder.parent ? folder.parent.name : 'Mes fichiers'}
                      </span>
                    </span>
                    <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </section>
          )}
          {files.length > 0 && (
            <section>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Fichiers</h3>
              <FileList files={files} variant="recent" />
            </section>
          )}
        </div>
      ) : null}

      {/* Modal de renommage */}
      <RenameModal
        isOpen={renameModalOpen}
        onClose={() => dispatch(closeRenameModal())}
        item={selectedItem}
        itemType={itemType}
      />

      {/* Modal de visionneuse de fichiers */}
      <FileViewerModal
        isOpen={fileViewerModalOpen}
        onClose={() => dispatch(closeFileViewerModal())}
        file={selectedItem}
        files={files}
        onNavigate={(file) => dispatch(openFileViewerModal(file))}
      />
    </MainLayout>
  );
};

export default SearchPage;
