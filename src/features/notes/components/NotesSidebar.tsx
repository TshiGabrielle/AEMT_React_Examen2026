import type { Note } from '../../../services/NotesService.js';


interface Props {
  notes: Note[];
  selectedId: number | undefined;
  onSelect: (id: number) => void;
  onCreate: () => void;
  onDelete: (id: number) => void;
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
        {notes.map(note => (
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
      </div>
    </aside>
  );
}