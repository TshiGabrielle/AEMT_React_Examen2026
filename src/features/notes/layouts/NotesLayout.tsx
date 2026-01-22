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
import { useHotkeys } from "react-hotkeys-hook";

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
  const [showDeleteNoteModal, setShowDeleteNoteModal] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<{ id: number; name: string } | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);

  const navigate = useNavigate();

  // ====== RACCOURCIS ======
  // sauvegarder une note
  useHotkeys(
    'ctrl+s',
    (event:any) => {
      event.preventDefault();
      console.log('Sauvegarde via Ctrl+S');
      if (selectedNote) {
        handleSave();
      }
    },
    {
      enableOnFormTags: true, 
    }
  );
  // créer une nvl note
  useHotkeys(
    'alt+n',
    (event: any) => {
      event.preventDefault();
      console.log("Création d'une nouvelle note via Ctrl+N");
      handleCreateNote(selectedFolderId);
    }, 
    {
      enableOnFormTags: true,
      preventDefault: true
    }
  );
  // créer un nv dossier
  useHotkeys(
    'alt+shift+n',
    (event: any) => {
      event.preventDefault();
      console.log("Création d'un nouveau dossier via Ctrl+Shift+N");
      setCreateFolderParentId(selectedFolderId);
      setShowCreateFolderModal(true);
    }
  );
  // supprimer une note
  useHotkeys(
    'ctrl+delete',
    (event: any) => {
      event.preventDefault();
      console.log("Suppression de la note via Ctrl+Delete");

      if (selectedNote) {
        handleDeleteNoteRequest(selectedNote.id, selectedNote.name);
      }
    }
  );

  // ====== RACCOURCIS MARKDOWN ======
  // gras
  useHotkeys(
    'ctrl+b',
    (event:any) => {
      event.preventDefault();
      setContent((prev) => prev + "**texte**");
      //console.log("Gras via Ctrl+B");
    },
    { enableOnFormTags: true, enableOnContentEditable: true, preventDefault: true, }
  );
  // italique
  useHotkeys(
    'ctrl+i',
    (event:any) => {
      event.preventDefault();
      setContent((prev) => prev + "*texte*");
      //console.log("Italique via Ctrl+I");
    }
    , { enableOnFormTags: true, enableOnContentEditable: true, preventDefault: true, }
  );
  // titre (h1)
  useHotkeys(
    'ctrl+1',
    (event:any) => {
      event.preventDefault();
      setContent((prev) => prev + "# Titre 1\n");
    }
    , { enableOnFormTags: true, enableOnContentEditable: true, preventDefault: true, }
  );
  // titre h2 
  useHotkeys(
    'ctrl+2',
    (event:any) => {  
      event.preventDefault();
      setContent((prev) => prev + "## Titre 2\n");
    }
    , { enableOnFormTags: true, enableOnContentEditable: true, preventDefault: true, }
  );
  // titre h3
  useHotkeys(
    'ctrl+3',
    (event:any) => {
      event.preventDefault();
      setContent((prev) => prev + "### Titre 3\n");
    }
    , { enableOnFormTags: true, enableOnContentEditable: true, preventDefault: true, }
  );
  // liste
  useHotkeys(
    'ctrl+shift+l',
    (event:any) => {
      event.preventDefault();
      setContent((prev) => prev + "- Élément de liste\n");
    } 
    , { enableOnFormTags: true, enableOnContentEditable: true, preventDefault: true, }
  );
  // code inline
  useHotkeys(
    'ctrl+shift+c',
    (event:any) => {
      event.preventDefault();
      setContent((prev) => prev + "`code inline`");
    }
    , { enableOnFormTags: true, enableOnContentEditable: true, preventDefault: true, }
  );
  // lien externe
  useHotkeys(
    'ctrl+k',
    (event:any) => {
      event.preventDefault();
      setContent((prev) => prev + "[texte du lien](https://exemple.com)");
    }
    , { enableOnFormTags: true, enableOnContentEditable: true, preventDefault: true, }
  );
  // lien interne
  useHotkeys(
    'ctrl+shift+k',
    (event:any) => {
      event.preventDefault();
      setContent((prev) => prev + "[[nom de la note]]");
    }
    , { enableOnFormTags: true, enableOnContentEditable: true, preventDefault: true, }
  );

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

  // Créer une note avec mise à jour locale
  const handleCreateNote = async (folderId: number | null = null) => {
    try {
      const newNote = await createNote(folderId);
      
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
    } catch (error) {
      setError('Erreur lors de la création de la note');
      console.error(error);
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
            onCreate={() => handleCreateNote(null)}
            onDelete={(id) => handleDeleteNoteRequest(id, "")}
            onCreateFolder={handleCreateFolder}
            onCreateNoteInFolder={(folderId) => handleCreateNote(folderId)}
            onRenameFolder={handleRenameFolder}
            onDeleteFolder={handleDeleteFolder}
            onDeleteNoteRequest={handleDeleteNoteRequest}
            onExpandFolderRef={handleExpandFolderRef}
            onFolderSelect={(folderId) => setSelectedFolderId(folderId)}
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