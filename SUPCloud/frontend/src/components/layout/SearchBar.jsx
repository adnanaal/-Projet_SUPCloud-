import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, X, Folder } from 'lucide-react';
import FileIcon from '../common/FileIcon';
import { searchService } from '../../services/searchService';

const SUGGESTION_LIMIT = 5;
const DEBOUNCE_MS = 250;

/**
 * Barre de recherche de la Navbar : suggestions pendant la saisie,
 * page de résultats complète avec Entrée
 */
const SearchBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Garder le champ synchronisé avec la page de résultats
  useEffect(() => {
    if (location.pathname === '/search') {
      setQuery(new URLSearchParams(location.search).get('q') || '');
    }
    setOpen(false);
  }, [location.pathname, location.search]);

  // Suggestions avec un délai pour ne pas interroger le serveur à chaque touche
  useEffect(() => {
    const term = query.trim();
    if (!term) {
      setResults(null);
      return undefined;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setResults(await searchService.search(term, { limit: SUGGESTION_LIMIT, signal: controller.signal }));
        setActiveIndex(-1);
      } catch (error) {
        if (error.name !== 'CanceledError') setResults(null);
      }
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  // Liste refermée : oublier la suggestion survolée, sinon Entrée la rouvrirait au lieu de lancer la recherche
  useEffect(() => {
    if (!open) setActiveIndex(-1);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const handleMouseDown = (e) => {
      if (!containerRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [open]);

  const suggestions = results
    ? [
        ...results.folders.map((item) => ({ type: 'folder', item })),
        ...results.files.map((item) => ({ type: 'file', item })),
      ]
    : [];

  const goToResults = () => {
    const term = query.trim();
    if (!term) return;
    setOpen(false);
    inputRef.current?.blur();
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  const openSuggestion = ({ type, item }) => {
    setOpen(false);
    inputRef.current?.blur();
    if (type === 'folder') navigate(`/folders/${item.id}`);
    else navigate(`/search?q=${encodeURIComponent(query.trim())}&open=${item.id}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    } else if (e.key === 'ArrowDown' && suggestions.length) {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp' && suggestions.length) {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (open && activeIndex >= 0 && suggestions[activeIndex]) openSuggestion(suggestions[activeIndex]);
      else goToResults();
    }
  };

  const total = results ? results.totalFolders + results.totalFiles : 0;
  const getLocationName = (item, type) => {
    const parent = type === 'folder' ? item.parent : item.folder;
    return parent ? parent.name : 'Mes fichiers';
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        ref={inputRef}
        type="search"
        role="combobox"
        aria-expanded={open && Boolean(query.trim())}
        aria-label="Rechercher des fichiers et dossiers"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        maxLength={100}
        className="block w-full pl-10 pr-9 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 [&::-webkit-search-cancel-button]:hidden"
        placeholder="Rechercher..."
      />
      {query && (
        <button
          type="button"
          onClick={() => {
            setQuery('');
            inputRef.current?.focus();
          }}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          aria-label="Effacer la recherche"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {open && query.trim() && results && (
        <div className="absolute left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-h-[70vh] overflow-y-auto">
          {suggestions.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-500">Aucun résultat pour « {query.trim()} »</p>
          ) : (
            suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.type}-${suggestion.item.id}`}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => openSuggestion(suggestion)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`w-full flex items-center px-4 py-2 text-left ${index === activeIndex ? 'bg-brand-50' : 'hover:bg-gray-50'}`}
              >
                <span className="flex-shrink-0 text-brand-600">
                  {suggestion.type === 'folder' ? <Folder size={18} /> : <FileIcon type={suggestion.item.mimeType} size={18} />}
                </span>
                <span className="ml-3 min-w-0">
                  <span className="block text-sm font-medium text-gray-900 truncate">{suggestion.item.name}</span>
                  <span className="block text-xs text-gray-500 truncate">{getLocationName(suggestion.item, suggestion.type)}</span>
                </span>
              </button>
            ))
          )}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={goToResults}
            className="w-full px-4 py-2 mt-1 border-t border-gray-100 text-left text-sm font-medium text-brand-600 hover:bg-gray-50"
          >
            {total > 0 ? `Voir tous les résultats (${total})` : 'Ouvrir la page de résultats'}
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
