import { useState, useEffect, useRef } from 'react';
import type { Folder, FolderNote } from '../../../services/FoldersService.js';
import { InputModal } from './InputModal.js';
import { ConfirmModal } from './ConfirmModal.js';
import { FoldersExportService } from '../../../services/FoldersExportService.js';
import { useHotkeys } from 'react-hotkeys-hook';

// instance du service d'exportation pour les dossiers
const foldersExportService = new FoldersExportService();

interface Props {
  folders: Folder[];          // Dossiers organisés en arbre
  rootNotes: FolderNote[];    // Notes à la racine (pas dans un dossier)
  selectedId: number | undefined;
  onSelect: (id: number) => void;
  onCreate: () => void;
  onDelete: (id: number) => void;
  onCreateFolder?: (parentId: number | null) => void;
  onCreateNoteInFolder?: (folderId: number) => void;
  onRenameFolder?: (folderId: number, newName: string) => void;
  onDeleteFolder?: (folderId: number) => void;
  onExpandFolder?: (folderId: number) => void; // Callback pour ouvrir un dossier
  onDeleteNoteRequest?: (id: number, name: string) => void; // Callback pour demander confirmation de suppression
  onExpandFolderRef?: (expandFn: (id: number) => void) => void; // Callback pour exposer la fonction expandFolder
  onFolderSelect?: (folderId: number) => void; // Callback lors de la sélection d'un dossier
}

// --- Rendu récursif d'un dossier ---
interface FolderTreeProps {
  folder: Folder;
  selectedId: number | undefined;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
  expandedIds: number[];
  toggleFolder: (id: number) => void;
  onCreateFolder?: ((parentId: number) => void) | undefined;
  onCreateNoteInFolder?: ((folderId: number) => void) | undefined;
  onRenameFolder?: ((folderId: number, newName: string) => void) | undefined;
  onDeleteFolder?: ((folderId: number) => void) | undefined;
  hoveredFolderId: number | null;
  setHoveredFolderId: (id: number | null) => void;
  onExpandFolder: (folderId: number) => void;
  onDeleteNoteRequest?: (id: number, name: string) => void;
  openMenuId?: number | null;
  setOpenMenuId?: (id: number | null) => void;
  onFolderSelect?: (folderId: number) => void;
}

function FolderTree({
  folder,
  selectedId,
  onSelect,
  onDelete,
  expandedIds,
  toggleFolder,
  onCreateFolder,
  onCreateNoteInFolder,
  onRenameFolder,
  onDeleteFolder,
  hoveredFolderId,
  setHoveredFolderId,
  onExpandFolder,
  onDeleteNoteRequest,
  openMenuId,
  setOpenMenuId,
  onFolderSelect
}: FolderTreeProps) {
  const isExpanded = expandedIds.includes(folder.id);
  const isHovered = hoveredFolderId === folder.id;
  const [showMenu, setShowMenu] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [folderToDelete, setFolderToDelete] = useState<number | null>(null);



  // Fermer ce menu si un autre menu est ouvert
  useEffect(() => {
    if (openMenuId !== null && openMenuId !== folder.id && showMenu) {
      setShowMenu(false);
    }
  }, [openMenuId, folder.id, showMenu]);

  // Fermer le menu quand on clique ailleurs
  useEffect(() => {
    if (!showMenu) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
        setOpenMenuId?.(null);
      }
    };

    // Petit délai pour éviter de fermer immédiatement après l'ouverture
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 10);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu, setOpenMenuId]);

  const handleRename = () => {
    setShowRenameModal(true);
  };

  const handleRenameConfirm = (newName: string) => {
    if (newName && newName.trim() && newName !== folder.name) {
      onRenameFolder?.(folder.id, newName.trim());
    }
  };

  const handleDeleteFolder = (id: number) => {
    setFolderToDelete(id);
    setShowDeleteModal(true);
  };


  const handleDeleteConfirm = () => {
    if (folderToDelete !== null) {
      onDeleteFolder?.(folderToDelete);
    }
  };


  async function handleExportFolder(folderId: number) {
    const blob = await foldersExportService.downloadZip(folderId);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${folder.name}.zip`;
    a.click();
  }


  return (
    <div className="folder-block">
      <div
        className="folder-title"
        onClick={() => {
          toggleFolder(folder.id)
          onFolderSelect?.(folder.id);
        }}
        onMouseEnter={() => setHoveredFolderId(folder.id)}
        onMouseLeave={() => setHoveredFolderId(null)}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
      >
        <span>{isExpanded ? '📂' : '📁'}</span>
        <span className="folder-name-text">{folder.name}</span>
        
        {/* Menu Burger */}
        <div className="folder-menu-container" ref={menuRef}>
          <button
            className="btn-folder-menu"
            onClick={(e) => {
              e.stopPropagation();
              // Fermer tous les autres menus d'abord
              setOpenMenuId?.(null);
              // Puis ouvrir/fermer ce menu
              setShowMenu(!showMenu);
            }}
            title="Actions"
          >
            ⋮
          </button>
          
          {showMenu && (
            <div className="folder-menu-dropdown" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onExpandFolder?.(folder.id); // Ouvrir le dossier avant de créer la note
                  onCreateNoteInFolder?.(folder.id);
                  setShowMenu(false);
                  setOpenMenuId?.(null);
                }}
                className="menu-item"
              >
                📝 Nouvelle note
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateFolder?.(folder.id);
                  setShowMenu(false);
                  setOpenMenuId?.(null);
                }}
                className="menu-item"
              >
                📁 Nouveau dossier
              </button>
              <div className="menu-separator"></div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRename?.();
                  setShowMenu(false);
                  setOpenMenuId?.(null);
                }}
                className="menu-item"
              >
                ✏️ Renommer
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteFolder?.(folder.id);
                  setShowMenu(false);
                  setOpenMenuId?.(null);
                }}
                className="menu-item menu-item-danger"
              >
                🗑️ Supprimer
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleExportFolder(folder.id);
                  setShowMenu(false);
                  setOpenMenuId?.(null);
                }}
                className="menu-item"
              >
                📦 Exporter
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modales pour renommer et supprimer */}
      <InputModal
        isOpen={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        onConfirm={handleRenameConfirm}
        title="Renommer le dossier"
        label="Nouveau nom du dossier"
        placeholder="Entrez le nouveau nom..."
        defaultValue={folder.name}
        confirmText="Renommer"
        cancelText="Annuler"
      />
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Supprimer le dossier"
        message={`Êtes-vous sûr de vouloir supprimer le dossier "${folder.name}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        danger={true}
      />

      {isExpanded && (
        <>
          {/* Notes dans ce dossier */}
          {folder.notes.map((note: FolderNote) => (
            <div
              key={note.id}
              className={`note-item ${selectedId === note.id ? 'selected' : ''}`}
              onClick={() => onSelect(note.id)}
            >
              <span className="note-name">{note.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteNoteRequest?.(note.id, note.name);
                }}
                className="btn-delete"
                title="Supprimer la note"
              >
                ❌
              </button>
            </div>
          ))}

          {/* Sous-dossiers */}
          <div className="folder-children">
            {folder.children.map((child: Folder) => (
              <FolderTree
                key={child.id}
                folder={child}
                selectedId={selectedId}
                onSelect={onSelect}
                onDelete={onDelete}
                expandedIds={expandedIds}
                toggleFolder={toggleFolder}
                onCreateFolder={onCreateFolder}
                onCreateNoteInFolder={onCreateNoteInFolder}
                onRenameFolder={onRenameFolder}
                onDeleteFolder={onDeleteFolder}
                hoveredFolderId={hoveredFolderId}
                setHoveredFolderId={setHoveredFolderId}
                onExpandFolder={onExpandFolder}
                onDeleteNoteRequest={onDeleteNoteRequest}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function NotesSidebar({
  folders,
  rootNotes,
  selectedId,
  onSelect,
  onCreate,
  onDelete,
  onCreateFolder,
  onCreateNoteInFolder,
  onRenameFolder,
  onDeleteFolder,
  onExpandFolder,
  onDeleteNoteRequest,
  onExpandFolderRef,
  onFolderSelect
}: Props) {
  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const [hoveredFolderId, setHoveredFolderId] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const previousFoldersRef = useRef<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);

  function findFolderNameById(folders: Folder[], id: number): string | null {
  for (const f of folders) {
    if (f.id === id) return f.name;
    const inChild = findFolderNameById(f.children, id);
    if (inChild) return inChild;
  }
  return null;
}


useHotkeys('ctrl+f', (e: any) => {
  e.preventDefault();

  if (selectedFolderId !== null) {
    const name = findFolderNameById(folders, selectedFolderId) ?? 'dossier';

    foldersExportService.downloadZip(selectedFolderId).then(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name}.zip`;
      a.click();
    });
  }
});


useHotkeys('ctrl+shift+delete', (e: any) => {
  e.preventDefault();

  if (selectedFolderId !== null) {
    onDeleteFolder?.(selectedFolderId);
  }
});

  
  // Fonction pour ouvrir un dossier (utilisée lors de la création d'une note ou d'un dossier)
  const expandFolder = (id: number) => {
    if (!expandedIds.includes(id)) {
      setExpandedIds((current) => [...current, id]);
    }
  };

  // Exposer la fonction expandFolder via le callback
  useEffect(() => {
    if (onExpandFolderRef) {
      onExpandFolderRef(expandFolder);
    }
  }, [onExpandFolderRef]);

  // Fonction récursive pour obtenir tous les IDs de dossiers
  const getAllFolderIds = (folders: Folder[]): number[] => {
    let ids: number[] = [];
    folders.forEach(folder => {
      ids.push(folder.id);
      if (folder.children.length > 0) {
        ids = ids.concat(getAllFolderIds(folder.children));
      }
    });
    return ids;
  };

  // Maintenir l'état des dossiers ouverts même après un refresh
  useEffect(() => {
    const currentFolderIds = getAllFolderIds(folders);
    const previousFolderIds = getAllFolderIds(previousFoldersRef.current);
    
    // Si les dossiers ont changé mais que certains IDs existent toujours, on les garde ouverts
    if (previousFoldersRef.current.length > 0) {
      setExpandedIds((current) => {
        // Garder seulement les IDs qui existent toujours dans la nouvelle structure
        return current.filter(id => currentFolderIds.includes(id));
      });
    }
    
    previousFoldersRef.current = folders;
  }, [folders]);

  const toggleFolder = (id: number) => {
    setExpandedIds((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    );
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title-section">
          <h2>📚 Mes Notes</h2>
          <p className="sidebar-subtitle">Organisez vos idées</p>
        </div>
        <div className="sidebar-actions">
          <button onClick={onCreate} className="btn-create btn-create-primary" title="Créer une nouvelle note">
            <span className="btn-icon">📝</span>
            <span className="btn-text">Nouvelle note</span>
          </button>
          <button 
            onClick={() => onCreateFolder?.(null)} 
            className="btn-create btn-create-secondary"
            title="Créer un nouveau dossier"
          >
            <span className="btn-icon">📁</span>
            <span className="btn-text">Nouveau dossier</span>
          </button>
        </div>
      </div>

      <div className="notes-list">
        {/* Notes à la racine */}
        {rootNotes.length > 0 && (
          <>
            {rootNotes.map((note: FolderNote) => (
              <div
                key={note.id}
                className={`note-item ${selectedId === note.id ? 'selected' : ''}`}
                onClick={() => onSelect(note.id)}
              >
                <span className="note-name">{note.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteNoteRequest?.(note.id, note.name);
                  }}
                  className="btn-delete"
                  title="Supprimer la note"
                >
                  ❌
                </button>
              </div>
            ))}
          </>
        )}

        {/* Dossiers */}
        {folders.length > 0 && (
          <>
            {folders.map((folder: Folder) => (
              <FolderTree
                key={folder.id}
                folder={folder}
                selectedId={selectedId}
                onSelect={onSelect}
                onDelete={onDelete}
                expandedIds={expandedIds}
                toggleFolder={toggleFolder}
                onCreateFolder={onCreateFolder}
                onCreateNoteInFolder={onCreateNoteInFolder}
                onRenameFolder={onRenameFolder}
                onDeleteFolder={onDeleteFolder}
                hoveredFolderId={hoveredFolderId}
                setHoveredFolderId={setHoveredFolderId}
                onExpandFolder={expandFolder}
                onDeleteNoteRequest={onDeleteNoteRequest}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
                onFolderSelect={(id) => setSelectedFolderId(id)}
              />
            ))}
          </>
        )}

        {/* Message si aucune donnée */}
        {rootNotes.length === 0 && folders.length === 0 && (
          <div style={{ 
            padding: '2rem', 
            textAlign: 'center', 
            color: '#d4a5ff',
            fontSize: '0.9rem'
          }}>
            <p>📝 Aucune note ou dossier</p>
            <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', opacity: 0.7 }}>
              Créez une note pour commencer
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}