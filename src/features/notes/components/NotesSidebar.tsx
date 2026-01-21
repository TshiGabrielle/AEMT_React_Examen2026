import { useState } from 'react';
import type { Folder, FolderNote } from '../../../services/FoldersService.js';

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
  setHoveredFolderId
}: FolderTreeProps) {
  const isExpanded = expandedIds.includes(folder.id);
  const isHovered = hoveredFolderId === folder.id;
  const [showMenu, setShowMenu] = useState(false);

  const handleRename = () => {
    const newName = prompt('Nouveau nom du dossier:', folder.name);
    if (newName && newName.trim() && newName !== folder.name) {
      onRenameFolder?.(folder.id, newName.trim());
    }
  };

  const handleDeleteFolder = () => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le dossier "${folder.name}" ?`)) {
      onDeleteFolder?.(folder.id);
    }
  };

  return (
    <div className="folder-block">
      <div
        className="folder-title"
        onClick={() => toggleFolder(folder.id)}
        onMouseEnter={() => setHoveredFolderId(folder.id)}
        onMouseLeave={() => setHoveredFolderId(null)}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
      >
        <span>{isExpanded ? '📂' : '📁'}</span>
        <span className="folder-name-text">{folder.name}</span>
        
        {/* Menu Burger */}
        <div className="folder-menu-container">
          <button
            className="btn-folder-menu"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            title="Actions"
          >
            ⋮
          </button>
          
          {showMenu && (
            <div className="folder-menu-dropdown">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateNoteInFolder?.(folder.id);
                  setShowMenu(false);
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
                }}
                className="menu-item"
              >
                ✏️ Renommer
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteFolder?.();
                  setShowMenu(false);
                }}
                className="menu-item menu-item-danger"
              >
                🗑️ Supprimer
              </button>
            </div>
          )}
        </div>
      </div>

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
                  onDelete(note.id);
                }}
                className="btn-delete"
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
  onDeleteFolder
}: Props) {
  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const [hoveredFolderId, setHoveredFolderId] = useState<number | null>(null);

  const toggleFolder = (id: number) => {
    setExpandedIds((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    );
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Notes</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button onClick={onCreate} className="btn-create">
            📝 Nouvelle note
          </button>
          <button 
            onClick={() => onCreateFolder?.(null)} 
            className="btn-create"
            style={{ background: 'rgba(138, 43, 226, 0.5)' }}
          >
            📁 Nouveau dossier
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
                    onDelete(note.id);
                  }}
                  className="btn-delete"
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