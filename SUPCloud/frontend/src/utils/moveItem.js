import { fileService } from '../services/fileService';
import { folderService } from '../services/folderService';
import { removeFile } from '../store/filesSlice';
import { removeFolder } from '../store/foldersSlice';
import { addToast } from '../store/uiSlice';

/**
 * Lit l'élément glissé depuis l'événement de drop (null si ce n'est pas un élément SUPCloud)
 */
export const getDraggedItem = (event) => {
  const type = event.dataTransfer.getData('type');
  const id = event.dataTransfer.getData('id');
  return type && id ? { type, id } : null;
};

/**
 * Indique si l'événement de drag transporte un élément SUPCloud (déplaçable)
 */
export const isSupCloudDrag = (event) => Array.from(event.dataTransfer.types || []).includes('type');

/**
 * Déplace un fichier ou un dossier vers un dossier cible (null = racine),
 * puis le retire de la vue courante puisqu'il n'y est plus.
 */
export const moveItemToFolder = async (dispatch, { type, id }, targetFolderId) => {
  if (type === 'folder' && id === targetFolderId) return false;

  try {
    if (type === 'file') {
      await fileService.moveFile(id, targetFolderId);
      dispatch(removeFile(id));
      dispatch(addToast({ message: 'Fichier déplacé avec succès', type: 'success' }));
    } else if (type === 'folder') {
      await folderService.moveFolder(id, targetFolderId);
      dispatch(removeFolder(id));
      dispatch(addToast({ message: 'Dossier déplacé avec succès', type: 'success' }));
    } else {
      return false;
    }
    return true;
  } catch (error) {
    console.error('Erreur lors du déplacement:', error);
    dispatch(addToast({
      message: error.response?.data?.message || 'Erreur lors du déplacement',
      type: 'error',
    }));
    return false;
  }
};
