import { useState, useEffect } from 'react';
import { useNotes } from '../../../services/NotesService.js';
import { useFolders } from '../../../services/FoldersService.js';
import { NotesSidebar } from '../components/NotesSidebar.js';
import { NotesEditor } from '../components/NotesEditor.js';
import { EmptyState } from '../components/EmptyState.js';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../../../services/AuthService.js';

export function NotesLayout() {
  const {
    folders,
    rootNotes,
    fetchFolders,
    loading,
    createFolder
  } = useFolders();

  const {
    selectedNote,
    loadNote,
    createNote,
    updateNote,
    deleteNote
  } = useNotes();

  const [isEditMode, setIsEditMode] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.name);
      setContent(selectedNote.content_markdown);
    } else {
      setTitle('');
      setContent('');
    }
  }, [selectedNote]);

  // Debug: afficher les données chargées
  useEffect(() => {
    console.log('Folders:', folders);
    console.log('Root notes:', rootNotes);
    console.log('Selected note:', selectedNote);
  }, [folders, rootNotes, selectedNote]);

  // Rafraîchir les dossiers après création/suppression de note
  const handleCreateNote = async (folderId: number | null = null) => {
    await createNote(folderId);
    await fetchFolders();
  };

  const handleDeleteNote = async (id: number) => {
    await deleteNote(id);
    await fetchFolders();
  };

  const handleCreateFolder = async (parentId: number | null = null) => {
    const name = prompt('Nom du dossier:');
    if (name && name.trim()) {
      try {
        await createFolder(name.trim(), parentId);
      } catch (error) {
        setError('Erreur lors de la création du dossier');
        console.error(error);
      }
    }
  };

    function handleLogout() {
    AuthService.logout();
    navigate('/auth/login');
  }

  return (
    <div className="app">
      <header className="header" style={{ display: 'flex', alignItems: 'center' }}>
        
        {/* Gauche : déconnexion */}
        <div style={{ width: '120px' }}>
          <button
            onClick={handleLogout}
            style={{
              background: '#b00020',
              color: 'white',
              border: 'none',
              padding: '0.4rem 0.7rem',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Déconnexion
          </button>
        </div>

        {/* Centre : titre */}
        <h1 style={{ margin: 0, textAlign: 'center', flex: 1 }}>
          🎃 Spooky Notes
        </h1>

        {/* Droite : modes */}
        <div className="mode-toggle" style={{ width: '120px', textAlign: 'right' }}>
          <button
            className={isEditMode ? 'active' : ''}
            onClick={() => setIsEditMode(true)}
          >
            ✏️
          </button>

          <button
            className={!isEditMode ? 'active' : ''}
            onClick={() => setIsEditMode(false)}
          >
            👁️
          </button>
        </div>

      </header>



      {error && (
        <div style={{ 
          background: '#ff4444', 
          color: 'white', 
          padding: '1rem', 
          textAlign: 'center' 
        }}>
          Erreur: {error}
        </div>
      )}

      <div className="main-content">
        {loading ? (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: '300px',
            background: '#1a0d2e',
            color: '#ff8c00',
            fontSize: '1.2rem'
          }}>
            Chargement...
          </div>
        ) : (
          <NotesSidebar
            folders={folders}
            rootNotes={rootNotes}
            selectedId={selectedNote?.id}
            onSelect={loadNote}
            onCreate={() => handleCreateNote(null)}
            onDelete={handleDeleteNote}
            onCreateFolder={handleCreateFolder}
            onCreateNoteInFolder={(folderId) => handleCreateNote(folderId)}
          />
        )}

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