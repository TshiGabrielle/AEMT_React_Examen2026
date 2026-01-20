import type { Note } from '../../../services/NotesService.js';

interface Props {
  notes: Note[]; // ici tu passeras rootNotes + folders
  selectedId: number | undefined;
  onSelect: (id: number) => void;
  onCreate: () => void;
  onDelete: (id: number) => void;
}

// --- Rendu récursif d’un dossier ---
function FolderTree({
  folder,
  selectedId,
  onSelect,
  onDelete
}: any) {
  return (
    <div className="folder-block">
      <div className="folder-title">
        📁 {folder.name}
      </div>

      {/* Notes dans ce dossier */}
      {folder.notes.map((note: Note) => (
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
        {folder.children.map((child: any) => (
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
  notes,
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
        {notes
          .filter((n: any) => !n.children) // notes simples
          .map((note: Note) => (
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

        {/* Dossiers */}
        {notes
          .filter((n: any) => n.children) // folders
          .map((folder: any) => (
            <FolderTree
              key={folder.id}
              folder={folder}
              selectedId={selectedId}
              onSelect={onSelect}
              onDelete={onDelete}
            />
          ))}
      </div>
    </aside>
  );
}