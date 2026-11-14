import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ChevronRight, Home } from 'lucide-react';
import { getDraggedItem, isSupCloudDrag, moveItemToFolder } from '../../utils/moveItem';

const dropTargetClass = 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-300';

// Élément du fil d'Ariane, cible de dépôt si targetFolderId est défini (null = racine)
const DropZone = ({ enabled, targetFolderId, children, className = '', ...props }) => {
  const dispatch = useDispatch();
  const [isOver, setIsOver] = React.useState(false);

  if (!enabled) {
    return <span className={className} {...props}>{children}</span>;
  }

  return (
    <span
      {...props}
      className={`${className} rounded px-1 ${isOver ? dropTargetClass : ''}`}
      onDragOver={(e) => {
        if (!isSupCloudDrag(e)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={async (e) => {
        e.preventDefault();
        setIsOver(false);
        const item = getDraggedItem(e);
        if (item) await moveItemToFolder(dispatch, item, targetFolderId);
      }}
    >
      {children}
    </span>
  );
};

const Breadcrumbs = ({ items = [] }) => {
  const navigate = useNavigate();

  // On ne peut déposer vers un niveau supérieur que lorsqu'on est dans un dossier
  const insideFolder = items.some((item) => item.folderId);

  return (
    <nav className="flex items-center space-x-2 text-sm mb-6">
      <DropZone enabled={insideFolder} targetFolderId={null}>
        <button
          onClick={() => navigate('/home')}
          className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors"
          title={insideFolder ? 'Accueil (déposez ici pour déplacer à la racine)' : 'Accueil'}
        >
          <Home size={16} />
        </button>
      </DropZone>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight size={16} className="text-gray-400" />
          {index === items.length - 1 ? (
            <span className="text-gray-900 font-medium">{item.label}</span>
          ) : (
            <DropZone enabled={Boolean(item.folderId)} targetFolderId={item.folderId || null}>
              <button
                onClick={() => navigate(item.path)}
                className="text-gray-500 hover:text-indigo-600 transition-colors"
              >
                {item.label}
              </button>
            </DropZone>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
