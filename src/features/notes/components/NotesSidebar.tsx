import type { Folder, FolderNote } from '../../../services/FoldersService.js';

interface Props {
  folders: Folder[];          // Dossiers organisés en arbre
  rootNotes: FolderNote[];    // Notes à la racine (pas dans un dossier)
  selectedId: number | undefined;
  onSelect: (id: number) => void;
  onCreate: () => void;
  onDelete: (id: number) => void;
}

// --- Rendu récursif d'un dossier ---
interface FolderTreeProps {
  folder: Folder;
  selectedId: number | undefined;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
}

function FolderTree({
  folder,
  selectedId,
  onSelect,
  onDelete
}: FolderTreeProps) {
  return (
    <div className="folder-block">
      <div className="folder-title">
        📁 {folder.name}
      </div>

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
          />
        ))}
      </div>
    </div>
  );
}

export function NotesSidebar({
  folders,
  rootNotes,
  selectedId,
  onSelect,
  onCreate,
  onDelete
}: Props) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Notes</h2>
        <button onClick={onCreate} className="btn-create">
          + Nouvelle note
        </button>
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