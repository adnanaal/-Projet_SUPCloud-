import React from 'react';
import { File, MoreVertical, Download, Trash2, Edit, Move } from 'lucide-react';
import FileIcon from './FileIcon';
import { formatBytes } from '../../utils/formatBytes';

const FileList = ({ files }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nom
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Taille
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Modifié
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {files.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                Aucun fichier
              </td>
            </tr>
          ) : (
            files.map((file) => (
              <FileListItem key={file.id} file={file} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

const FileListItem = ({ file }) => {
  const [showMenu, setShowMenu] = React.useState(false);

  const handleDownload = () => {
    // TODO: Implémenter le téléchargement
    console.log('Download file:', file.id);
  };

  const handleDelete = () => {
    // TODO: Implémenter la suppression
    console.log('Delete file:', file.id);
  };

  const handleRename = () => {
    // TODO: Implémenter le renommage
    console.log('Rename file:', file.id);
  };

  const handleMove = () => {
    // TODO: Implémenter le déplacement
    console.log('Move file:', file.id);
  };

  return (
    <tr className="hover:bg-gray-50 group">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <FileIcon type={file.mimeType} size={20} className="text-indigo-600" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 truncate max-w-xs" title={file.name}>
              {file.name}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">{formatBytes(Number(file.size))}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">{file.mimeType}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">
          {new Date(file.updatedAt).toLocaleDateString('fr-FR')}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="relative inline-block">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical size={16} className="text-gray-500" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[160px]">
              <button
                onClick={() => {
                  handleDownload();
                  setShowMenu(false);
                }}
                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Download size={16} className="mr-2" />
                Télécharger
              </button>
              <button
                onClick={() => {
                  handleRename();
                  setShowMenu(false);
                }}
                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Edit size={16} className="mr-2" />
                Renommer
              </button>
              <button
                onClick={() => {
                  handleMove();
                  setShowMenu(false);
                }}
                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Move size={16} className="mr-2" />
                Déplacer
              </button>
              <button
                onClick={() => {
                  handleDelete();
                  setShowMenu(false);
                }}
                className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 size={16} className="mr-2" />
                Supprimer
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

export default FileList;
