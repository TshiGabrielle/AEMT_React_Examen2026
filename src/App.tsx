import { useState, useEffect } from 'react';
import './App.css';

interface Note {
  id: number;
  name: string;
  content_markdown: string;
  content_html: string;
  idFolder: number;
  created_at: string;
  updated_at: string;
  taille_octet: number;
  nblines: number;
  nbmots: number;
  nbcaract: number;
}

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditMode, setIsEditMode] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Charger toutes les notes au démarrage
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/notes');
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error('Erreur lors du chargement des notes:', error);
    }
  };

  const handleCreateNote = async () => {
    const name = prompt('Nom de la nouvelle note:');
    if (!name) return;

    try {
      const response = await fetch('http://localhost:8080/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          content_markdown: '',
          idFolder: 0
        })
      });
      const newNote = await response.json();
      fetchNotes();
      loadNote(newNote.id);
    } catch (error) {
      console.error('Erreur lors de la création de la note:', error);
    }
  };

  const loadNote = async (noteId: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/notes/${noteId}`);
      const note = await response.json();
      setSelectedNote(note);
      setTitle(note.name);
      setContent(note.content_markdown);
    } catch (error) {
      console.error('Erreur lors du chargement de la note:', error);
    }
  };

  const handleUpdateNote = async () => {
    if (!selectedNote) return;

    try {
      await fetch(`http://localhost:8080/api/notes/${selectedNote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: title,
          contentMarkdown: content
        })
      });
      fetchNotes();
      loadNote(selectedNote.id);
      alert('Note sauvegardée !');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!confirm('Supprimer cette note ?')) return;

    try {
      await fetch(`http://localhost:8080/api/notes/${noteId}`, {
        method: 'DELETE'
      });
      setSelectedNote(null);
      setTitle('');
      setContent('');
      fetchNotes();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const convertMarkdownToHtml = (markdown: string): string => {
    let html = markdown;
    
    // Titres
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Gras et italique
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
    
    // Liens
    html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/gim, '<a href="$2">$1</a>');
    
    // Code
    html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');
    
    // Listes
    html = html.replace(/^\s*[-*]\s+(.*)$/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>');
    
    // Paragraphes
    html = html.replace(/\n\n/gim, '</p><p>');
    html = html.replace(/\n/gim, '<br>');
    
    if (!html.startsWith('<')) {
      html = '<p>' + html + '</p>';
    }
    
    return html;
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🎃 Spooky Notes</h1>
        <div className="mode-toggle">
          <button 
            className={isEditMode ? 'active' : ''}
            onClick={() => setIsEditMode(true)}
          >
            ✏️ Écriture
          </button>
          <button 
            className={!isEditMode ? 'active' : ''}
            onClick={() => setIsEditMode(false)}
          >
            👁️ Lecture
          </button>
        </div>
      </header>

      <div className="main-content">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <h2>Notes</h2>
            <button onClick={handleCreateNote} className="btn-create">
              + Nouvelle note
            </button>
          </div>
          <div className="notes-list">
            {notes.map(note => (
              <div
                key={note.id}
                className={`note-item ${selectedNote?.id === note.id ? 'selected' : ''}`}
                onClick={() => loadNote(note.id)}
              >
                <span className="note-name">{note.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNote(note.id);
                  }}
                  className="btn-delete"
                >
                  ❌
                </button>
              </div>
            ))}
          </div>
        </aside>

        {/* EDITOR */}
        <main className="editor">
          {selectedNote ? (
            <>
              <div className="editor-toolbar">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="title-input"
                  placeholder="Titre de la note..."
                  disabled={!isEditMode}
                />
                <button onClick={handleUpdateNote} className="btn-save">
                  💾 Enregistrer
                </button>
              </div>

              <div className="editor-content">
                {isEditMode ? (
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="markdown-input"
                    placeholder="Écrivez en Markdown...&#10;# Titre&#10;## Sous-titre&#10;**Gras** *Italique*"
                  />
                ) : (
                  <div 
                    className="markdown-preview"
                    dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(content) }}
                  />
                )}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <h2>👻 Sélectionnez une note</h2>
              <p>ou créez-en une nouvelle</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;