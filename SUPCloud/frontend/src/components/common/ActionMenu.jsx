import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical } from 'lucide-react';

const SCREEN_MARGIN = 8;
const BUTTON_GAP = 4;

/**
 * Menu d'actions « trois points ».
 * Le menu est affiché au-dessus du reste de la page (portail) pour ne jamais être coupé par
 * un conteneur, et s'ouvre vers le haut quand il n'y a pas assez de place en dessous.
 *
 * items : [{ label, icon, onClick, danger }]
 */
const ActionMenu = ({ items }) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const close = () => {
    setOpen(false);
    setPosition(null);
  };

  // Positionner le menu avant l'affichage : sous le bouton s'il y a la place, sinon au-dessus
  useLayoutEffect(() => {
    if (!open || !buttonRef.current || !menuRef.current) return;

    const button = buttonRef.current.getBoundingClientRect();
    const menu = menuRef.current.getBoundingClientRect();

    const spaceBelow = window.innerHeight - button.bottom - SCREEN_MARGIN;
    const spaceAbove = button.top - SCREEN_MARGIN;
    const openUpwards = menu.height + BUTTON_GAP > spaceBelow && spaceAbove > spaceBelow;

    const idealTop = openUpwards ? button.top - menu.height - BUTTON_GAP : button.bottom + BUTTON_GAP;
    const top = Math.max(SCREEN_MARGIN, Math.min(idealTop, window.innerHeight - menu.height - SCREEN_MARGIN));
    const left = Math.max(
      SCREEN_MARGIN,
      Math.min(button.right - menu.width, window.innerWidth - menu.width - SCREEN_MARGIN)
    );

    setPosition({ top, left });
  }, [open]);

  // Fermer le menu : clic en dehors, touche Échap, défilement ou redimensionnement
  useEffect(() => {
    if (!open) return undefined;

    const handleMouseDown = (e) => {
      if (menuRef.current?.contains(e.target) || buttonRef.current?.contains(e.target)) return;
      close();
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') close();
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  return (
    <div className="relative flex-shrink-0">
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          if (open) close();
          else setOpen(true);
        }}
        aria-label="Actions"
        aria-haspopup="menu"
        aria-expanded={open}
        className={`p-1 hover:bg-gray-100 rounded-lg transition-opacity ${
          open ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        <MoreVertical size={16} className="text-gray-500" />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: position?.top ?? 0,
              left: position?.left ?? 0,
              visibility: position ? 'visible' : 'hidden',
            }}
            className="bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[160px]"
          >
            {items.map(({ label, icon: Icon, onClick, danger }) => (
              <button
                key={label}
                role="menuitem"
                onClick={(e) => {
                  e.stopPropagation();
                  close();
                  onClick();
                }}
                className={`flex items-center w-full px-3 py-2 text-sm ${
                  danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon size={16} className="mr-2" />
                {label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
};

export default ActionMenu;
