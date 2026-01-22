import { useState, useEffect, useRef } from 'react';
import { useNotes } from '../../../services/NotesService.js';
import { useFolders, type Folder, type FolderNote } from '../../../services/FoldersService.js';
import { NotesSidebar } from '../components/NotesSidebar.js';
import { NotesEditor } from '../components/NotesEditor.js';
import { EmptyState } from '../components/EmptyState.js';
import { InputModal } from '../components/InputModal.js';
import { ConfirmModal } from '../components/ConfirmModal.js';
import { ModeSwitch } from '../components/ModeSwitch.js';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../../../services/AuthService.js';

export function NotesLayout() {
  const {
    folders,
    rootNotes,
    fetchFolders,
    loading,
    createFolder,
    renameFolder,
    deleteFolder,
    setFolders,
    setRootNotes
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
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [createFolderParentId, setCreateFolderParentId] = useState<number | null>(null);
  const [showCreateNoteModal, setShowCreateNoteModal] = useState(false);
  const [createNoteParentId, setCreateNoteParentId] = useState<number | null>(null);
  const [showDeleteNoteModal, setShowDeleteNoteModal] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<{ id: number; name: string } | null>(null);

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

  // Fonctions utilitaires pour mettre à jour l'arborescence localement
  const removeNoteFromTree = (noteId: number, folders: Folder[], rootNotes: FolderNote[]) => {
    // Retirer de rootNotes
    const newRootNotes = rootNotes.filter(n => n.id !== noteId);
    
    // Retirer des dossiers récursivement
    const removeFromFolder = (folder: Folder): Folder => ({
      ...folder,
      notes: folder.notes.filter(n => n.id !== noteId),
      children: folder.children.map(removeFromFolder)
    });
    
    const newFolders = folders.map(removeFromFolder);
    return { folders: newFolders, rootNotes: newRootNotes };
  };

  const updateFolderName = (folderId: number, newName: string, folders: Folder[]) => {
    const updateFolder = (folder: Folder): Folder => {
      if (folder.id === folderId) {
        return { ...folder, name: newName };
      }
      return {
        ...folder,
        children: folder.children.map(updateFolder)
      };
    };
    return folders.map(updateFolder);
  };

  const removeFolderFromTree = (folderId: number, folders: Folder[]) => {
    const removeFolder = (folderList: Folder[]): Folder[] => {
      return folderList
        .filter(f => f.id !== folderId)
        .map(folder => ({
          ...folder,
          children: removeFolder(folder.children)
        }));
    };
    return removeFolder(folders);
  };

  const addFolderToTree = (newFolder: any, parentId: number | null, folders: Folder[]) => {
    const folderToAdd: Folder = {
      id: newFolder.id,
      name: newFolder.name,
      parentId: parentId,
      notes: [],
      children: []
    };

    if (parentId === null) {
      return [...folders, folderToAdd];
    }

    const addToFolder = (folderList: Folder[]): Folder[] => {
      return folderList.map(folder => {
        if (folder.id === parentId) {
          return {
            ...folder,
            children: [...folder.children, folderToAdd]
          };
        }
        return {
          ...folder,
          children: addToFolder(folder.children)
        };
      });
    };

    return addToFolder(folders);
  };

  const addNoteToTree = (newNote: { id: number; name: string; folderId: number | null }, folders: Folder[], rootNotes: FolderNote[]) => {
    const noteToAdd: FolderNote = {
      id: newNote.id,
      name: newNote.name,
      title: newNote.name
    };

    if (newNote.folderId === null) {
      // Ajouter à rootNotes
      return {
        folders,
        rootNotes: [...rootNotes, noteToAdd]
      };
    }

    // Ajouter au dossier parent
    const addToFolder = (folderList: Folder[]): Folder[] => {
      return folderList.map(folder => {
        if (folder.id === newNote.folderId) {
          return {
            ...folder,
            notes: [...folder.notes, noteToAdd]
          };
        }
        return {
          ...folder,
          children: addToFolder(folder.children)
        };
      });
    };

    return {
      folders: addToFolder(folders),
      rootNotes
    };
  };

  const handleCreateNoteRequest = (folderId: number | null = null) => {
    setCreateNoteParentId(folderId);

    setShowCreateNoteModal(true);
  };

  // Créer une note avec mise à jour locale
  const handleCreateNoteConfirm = async (name: string) => {
    try {
      const folderId = createNoteParentId;
      const noteName = name?.trim() || 'Nouvelle note';
      const newNote = await createNote(folderId, noteName);
      
      if (newNote) {
        // Mise à jour locale de l'arborescence
        const result = addNoteToTree(newNote, folders, rootNotes);
        setFolders(result.folders);
        setRootNotes(result.rootNotes);
        
        // Si la note est créée dans un dossier, ouvrir le dossier parent APRÈS la mise à jour
        if (folderId !== null) {
          setTimeout(() => {
            expandFolderRef.current?.(folderId);
          }, 50);
        }
      }
      setShowCreateNoteModal(false);
      setCreateNoteParentId(null);
    } catch (error) {
      setError('Erreur lors de la création de la note');
      console.error(error);
      setShowCreateNoteModal(false);
      setCreateNoteParentId(null);
    }
  };

  const handleDeleteNoteRequest = (id: number, name: string) => {
    setNoteToDelete({ id, name });
    setShowDeleteNoteModal(true);
  };

  const handleDeleteNoteConfirm = async () => {
    if (!noteToDelete) return;
    
    try {
      await deleteNote(noteToDelete.id);
      
      // Mise à jour locale - utiliser les valeurs actuelles de manière synchrone
      const result = removeNoteFromTree(noteToDelete.id, folders, rootNotes);
      setFolders(result.folders);
      setRootNotes(result.rootNotes);
      
      setShowDeleteNoteModal(false);
      setNoteToDelete(null);
    } catch (error) {
      setError('Erreur lors de la suppression de la note');
      console.error(error);
      setShowDeleteNoteModal(false);
      setNoteToDelete(null);
    }
  };

  const handleCreateFolder = async (parentId: number | null = null) => {
    setCreateFolderParentId(parentId);
    setShowCreateFolderModal(true);
  };

  // Référence pour pouvoir ouvrir un dossier depuis l'extérieur
  const expandFolderRef = useRef<((id: number) => void) | null>(null);
  
  // Callback pour recevoir la fonction expandFolder depuis NotesSidebar
  const handleExpandFolderRef = (expandFn: (id: number) => void) => {
    expandFolderRef.current = expandFn;
  };

  const handleCreateFolderConfirm = async (name: string) => {
    try {
      const parentId = createFolderParentId;
      
      const newFolder = await createFolder(name, parentId);
      
      // Mise à jour locale avec les valeurs actuelles
      const updatedFolders = addFolderToTree(newFolder, parentId, folders);
      setFolders(updatedFolders);
      
      // Si le dossier est créé dans un dossier parent, ouvrir le parent APRÈS l'ajout
      if (parentId !== null) {
        // Petit délai pour s'assurer que l'état est mis à jour
        setTimeout(() => {
          expandFolderRef.current?.(parentId);
        }, 50);
      }
      
      setShowCreateFolderModal(false);
      setCreateFolderParentId(null);
    } catch (error) {
      setError('Erreur lors de la création du dossier');
      console.error(error);
      setShowCreateFolderModal(false);
      setCreateFolderParentId(null);
    }
  };

  // Renommer un dossier
  const handleRenameFolder = async (folderId: number, newName: string) => {
    try {
      await renameFolder(folderId, newName);
      
      // Mise à jour locale avec les valeurs actuelles
      const updatedFolders = updateFolderName(folderId, newName, folders);
      setFolders(updatedFolders);
    } catch (error) {
      setError('Erreur lors du renommage du dossier');
      console.error(error);
     }
  };

  // Supprimer un dossier
  const handleDeleteFolder = async (folderId: number) => {
    try {
      await deleteFolder(folderId);
      
      // Mise à jour locale avec les valeurs actuelles
      const updatedFolders = removeFolderFromTree(folderId, folders);
      setFolders(updatedFolders);
    } catch (error) {
      setError('Erreur lors de la suppression du dossier');
      console.error(error);
    }
  };

  // Fonction de sauvegarde qui met à jour et recharge la note
  const handleSave = async () => {
    try {
      await updateNote(selectedNote!.id, title, content);
      // Recharger la note pour que l'en-tête se mette à jour
      await loadNote(selectedNote!.id);
      // Mise à jour locale du nom dans l'arborescence
      setFolders((currentFolders) => {
        const updateNoteInFolder = (folder: Folder): Folder => ({
          ...folder,
          notes: folder.notes.map(n => n.id === selectedNote!.id ? { ...n, name: title } : n),
          children: folder.children.map(updateNoteInFolder)
        });
        return currentFolders.map(updateNoteInFolder);
      });
      setRootNotes((currentRootNotes) =>
        currentRootNotes.map(n => n.id === selectedNote!.id ? { ...n, name: title } : n)
      );
    } catch (error) {
      setError('Erreur lors de la sauvegarde');
      console.error(error);
    }
  };

  function handleLogout() {
    AuthService.logout();
    navigate('/auth/login');
  }

  //Fonction pour trouver note par titre et retourner son ID
  function findNoteIdByTitle(title: string): number | null {

    // 1) Chercher dans les notes racines
    const root = rootNotes.find(
    n => n.name.toLowerCase() === title.toLowerCase()
    );
    if (root) return root.id;

    // 2) Chercher récursivement dans les dossiers
    const searchInFolders = (folders: Folder[]): number | null => {
      for (const folder of folders) {
        const found = folder.notes.find(
          n => n.name.toLowerCase() === title.toLowerCase()
        );
        if (found) return found.id;

        const child = searchInFolders(folder.children);
        if (child !== null) return child;
      }
      return null;
    };

    return searchInFolders(folders);
  }


  //Fonction gérer lien interne clicqué
  function handleInternalLinkClick(noteTitle: string) {
    const id = findNoteIdByTitle(noteTitle);

    if (id === null) {
      alert(`La note "${noteTitle}" n'existe pas`);
      return;
    }
    loadNote(id);
  }



  
  return (
    <div className="app">
      <header className="header" style={{ display: 'flex', alignItems: 'center' }}>
        
        {/* Gauche : déconnexion */}
        <div style={{ width: '120px' }}>
          <button
            onClick={handleLogout}
            className="btn-logout"
          >
            Déconnexion
          </button>
        </div>

        {/* Centre : titre */}
        <h1 style={{ margin: 0, textAlign: 'center', flex: 1 }}>
          🎃 Spooky Notes
        </h1>

        {/* Droite : switch mode */}
        <div className="header-mode-switch">
          <ModeSwitch 
            isEditMode={isEditMode} 
            onToggle={() => setIsEditMode(!isEditMode)} 
          />
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

      {/* Modale pour créer un dossier */}
      <InputModal
        isOpen={showCreateFolderModal}
        onClose={() => {
          setShowCreateFolderModal(false);
          setCreateFolderParentId(null);
        }}
        onConfirm={handleCreateFolderConfirm}
        title="Créer un nouveau dossier"
        label="Nom du dossier"
        placeholder="Entrez le nom du dossier..."
        defaultValue=""
        confirmText="Créer"
        cancelText="Annuler"
      />

      {/* Modale pour créer une note */}
      <InputModal
        isOpen={showCreateNoteModal}
        onClose={() => {
          setShowCreateNoteModal(false);
          setCreateNoteParentId(null);
        }}
        onConfirm={handleCreateNoteConfirm}
        title="Créer une nouvelle note"
        label="Nom de la note"
        placeholder="Entrez le nom de la note..."
        defaultValue="Nouvelle note"
        confirmText="Créer"
        cancelText="Annuler"
      />

      {/* Modale pour supprimer une note */}
      <ConfirmModal
        isOpen={showDeleteNoteModal}
        onClose={() => {
          setShowDeleteNoteModal(false);
          setNoteToDelete(null);
        }}
        onConfirm={handleDeleteNoteConfirm}
        title="Supprimer la note"
        message={`Êtes-vous sûr de vouloir supprimer la note "${noteToDelete?.name}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        danger={true}
      />

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
            onCreate={() => handleCreateNoteRequest(null)}
            onDelete={(id) => handleDeleteNoteRequest(id, "")}
            onCreateFolder={handleCreateFolder}
            onCreateNoteInFolder={(folderId) => handleCreateNoteRequest(folderId)}
            onRenameFolder={handleRenameFolder}
            onDeleteFolder={handleDeleteFolder}
            onDeleteNoteRequest={handleDeleteNoteRequest}
            onExpandFolderRef={handleExpandFolderRef}
          />
        )}

        {selectedNote ? (
          <NotesEditor
            isEditMode={isEditMode}
            title={title}
            content={content}
            onTitleChange={setTitle}
            onContentChange={setContent}
            onSave={handleSave}
            noteId={selectedNote.id}
            updatedAt={selectedNote.updated_at}
            createdAt={selectedNote.created_at}
            onInternalLinkClick={handleInternalLinkClick}
          />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}