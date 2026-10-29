import React, { useState, useRef, useEffect } from 'react';
import { Plus, File, FolderPlus, X } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { openUploadModal, openCreateFolderModal } from '../../store/uiSlice';

const FloatingActionButton = () => {
  const dispatch = useDispatch();
  const [showDropdown, setShowDropdown] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 100, y: window.innerHeight - 100 });
  const [isDragging, setIsDragging] = useState(false);
  const buttonRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleNewFile = () => {
    dispatch(openUploadModal());
    setShowDropdown(false);
  };

  const handleNewFolder = () => {
    dispatch(openCreateFolderModal());
    setShowDropdown(false);
  };

  const handleMouseDown = (e) => {
    if (e.target.closest('.dropdown-menu')) return;
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const newX = e.clientX - dragOffset.current.x;
    const newY = e.clientY - dragOffset.current.y;
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Fermer le dropdown si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div
      ref={buttonRef}
      className="fixed z-50"
      style={{ left: position.x, top: position.y }}
      onMouseDown={handleMouseDown}
    >
      {/* Bouton principal */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-200 flex items-center justify-center ${
          isDragging ? 'cursor-grabbing scale-110' : 'cursor-grab'
        } ${showDropdown ? 'rotate-45' : ''}`}
      >
        {showDropdown ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </button>

      {/* Dropdown menu */}
      {showDropdown && (
        <div className="dropdown-menu absolute bottom-16 right-0 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
          <button
            onClick={handleNewFile}
            className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <File className="h-5 w-5 mr-3" />
            <span>Nouveau fichier</span>
          </button>
          <button
            onClick={handleNewFolder}
            className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <FolderPlus className="h-5 w-5 mr-3" />
            <span>Nouveau dossier</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default FloatingActionButton;
