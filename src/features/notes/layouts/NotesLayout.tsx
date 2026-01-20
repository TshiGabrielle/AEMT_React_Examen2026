import { useState, useEffect } from 'react';
import { useNotes } from '../../../services/NotesService.js';
import { NotesSidebar } from '../components/NotesSidebar.js';
import { NotesEditor } from '../components/NotesEditor.js';
import { EmptyState } from '../components/EmptyState.js';

export function NotesLayout() {
  const {
    notes,
    selectedNote,
    loadNote,
    createNote,
    updateNote,
    deleteNote
  } = useNotes();

  const [isEditMode, setIsEditMode] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.name);
      setContent(selectedNote.content_markdown);
    }
  }, [selectedNote]);

  return (
    <div className="app">
      <header className="header">
        <h1>🎃 Spooky Notes</h1>
        <div className="mode-toggle">
          <button className={isEditMode ? 'active' : ''} onClick={() => setIsEditMode(true)}>✏️</button>
          <button className={!isEditMode ? 'active' : ''} onClick={() => setIsEditMode(false)}>👁️</button>
        </div>
      </header>

      <div className="main-content">
        <NotesSidebar
          notes={notes}
          selectedId={selectedNote?.id}
          onSelect={loadNote}
          onCreate={createNote}
          onDelete={deleteNote}
        />

        {selectedNote ? (
          <NotesEditor
            isEditMode={isEditMode}
            title={title}
            content={content}
            onTitleChange={setTitle}
            onContentChange={setContent}
            onSave={() => updateNote(selectedNote.id, title, content)}
          />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}