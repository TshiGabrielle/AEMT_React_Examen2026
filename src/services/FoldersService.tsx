import { useEffect, useState } from 'react';

// ---- Types envoyés par le backend ----

// Une note simple (id + titre)
export interface Note {
  id: number
  title: string
}

// Un dossier dans l'arborescence
export interface Folder {
  id: number
  name: string
  parentId: number | null   // null = dossier à la racine
  notes: Note[]             // notes directement dans ce dossier
  children: Folder[]        // sous-dossiers
}

// Structure complète renvoyée par ton endpoint
export interface GetFoldersTreeOutput {
  folders: Folder[]         // tous les dossiers organisés en arbre
  rootNotes: Note[]         // notes qui ne sont dans aucun dossier
}

const API = 'http://localhost:8080/api/folders';

export function useFolders() {

  // Liste des dossiers (arbre complet)
  const [folders, setFolders] = useState<Folder[]>([]);

  // Notes qui ne sont dans aucun dossier
  const [rootNotes, setRootNotes] = useState<Note[]>([]);

  // Chargement automatique au montage du composant
  useEffect(() => {
    fetchFolders();
  }, []);

  // Récupère l'arborescence depuis le backend
  async function fetchFolders() {
    const res = await fetch(API);

    const data: GetFoldersTreeOutput = await res.json();

    // On stocke les données dans les states
    setFolders(data.folders);
    setRootNotes(data.rootNotes);
  }

  return { folders, rootNotes };
}
