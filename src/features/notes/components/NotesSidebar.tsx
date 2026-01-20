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
}

function FolderTree({
  folder,
  selectedId,
  onSelect,
  onDelete,
  expandedIds,
  toggleFolder,
  onCreateFolder,
  onCreateNoteInFolder
}: FolderTreeProps) {
  const isExpanded = expandedIds.includes(folder.id);

  return (
    <div className="folder-block">
      <div
        className="folder-title"
        onClick={() => toggleFolder(folder.id)}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        <span>{isExpanded ? '📂' : '📁'}</span>
        <span style={{ flex: 1 }}>{folder.name}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCreateFolder?.(folder.id);
          }}
          className="btn-create-small"
          title="Créer un sous-dossier"
        >
          📁+
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCreateNoteInFolder?.(folder.id);
          }}
          className="btn-create-small"
          title="Créer une note"
        >
          📝+
        </button>
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
  onCreateNoteInFolder
}: Props) {
  const [expandedIds, setExpandedIds] = useState<number[]>([]);

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