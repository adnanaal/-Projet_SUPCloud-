import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Folder, MoreVertical, Edit, Move, Trash2 } from 'lucide-react';

const FolderCard = ({ folder }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showMenu, setShowMenu] = React.useState(false);

  const handleClick = () => {
    navigate(`/folders/${folder.id}`);
  };

  const handleRename = () => {
    // TODO: Implémenter le renommage
    console.log('Rename folder:', folder.id);
  };

  const handleMove = () => {
    // TODO: Implémenter le déplacement
    console.log('Move folder:', folder.id);
  };

  const handleDelete = () => {
    // TODO: Implémenter la suppression
    console.log('Delete folder:', folder.id);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group"
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Folder size={32} className="text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate" title={folder.name}>
                  {folder.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">Dossier</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical size={16} className="text-gray-500" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[160px]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRename();
                    setShowMenu(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Edit size={16} className="mr-2" />
                  Renommer
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMove();
                    setShowMenu(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Move size={16} className="mr-2" />
                  Déplacer
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
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
        </div>
      </div>
    </div>
  );
};

export default FolderCard;
