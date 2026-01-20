import { use, useEffect, useState } from 'react';
import { AuthService } from './AuthService.js';

// ---- Types envoyés par le backend ----

// Une note simple dans l'arborescence des dossiers
export interface FolderNote {
  id: number;
  name: string;  // Utilisé pour l'affichage dans la sidebar
  title: string; // Gardé pour compatibilité backend
}

// Un dossier dans l'arborescence
export interface Folder {
  id: number;
  name: string;
  parentId: number | null;   // null = dossier à la racine
  notes: FolderNote[];       // notes directement dans ce dossier
  children: Folder[];        // sous-dossiers
}

// Structure complète renvoyée par ton endpoint
export interface GetFoldersTreeOutput {
  folders: Folder[];         // tous les dossiers organisés en arbre
  rootNotes: FolderNote[];   // notes qui ne sont dans aucun dossier
}

const API = 'http://localhost:8080/api/folders';

export function useFolders() {
  // Liste des dossiers (arbre complet)
  const [folders, setFolders] = useState<Folder[]>([]);

  // Notes qui ne sont dans aucun dossier
  const [rootNotes, setRootNotes] = useState<FolderNote[]>([]);

  // État de chargement
  const [loading, setLoading] = useState<boolean>(true);

  // Chargement automatique au montage du composant
  useEffect(() => {
    fetchFolders();
  }, []);

  // Récupère l'arborescence depuis le backend
  async function fetchFolders() {
    setLoading(true);
    try {

      const userId = AuthService.getUser();
      if (!userId) {
        throw new Error('Utilisateur non connecté');
      }

      console.log('Fetching folders from:', API);
      const res = await fetch(`${API}?userId=${userId}`);
      
      if (!res.ok) {
        console.error('Erreur HTTP:', res.status, res.statusText);
        const errorText = await res.text();
        console.error('Réponse erreur:', errorText);
        setFolders([]);
        setRootNotes([]);
        setLoading(false);
        return;
      }
      
      const data: GetFoldersTreeOutput = await res.json();
      console.log('Données reçues du backend (brutes):', JSON.stringify(data, null, 2));

      // Transforme les données pour uniformiser les noms
      // Le backend retourne Note avec "title", on le mappe vers "name" pour l'affichage
      const transformNotes = (notes: any[]): FolderNote[] => 
        notes.map(note => ({
          id: note.id,
          name: note.title || note.name || 'Sans titre', // Le backend utilise "title"
          title: note.title || note.name || 'Sans titre'
        }));

      const transformFolder = (folder: any): Folder => ({
        id: folder.id,
        name: folder.name,
        parentId: folder.parentId,
        notes: transformNotes(folder.notes || []),
        children: (folder.children || []).map(transformFolder)
      });

      const transformedFolders = data.folders ? data.folders.map(transformFolder) : [];
      const transformedRootNotes = transformNotes(data.rootNotes || []);
      
      console.log('Folders transformés:', transformedFolders);
      console.log('Root notes transformées:', transformedRootNotes);
      console.log('Nombre de dossiers:', transformedFolders.length);
      console.log('Nombre de notes racine:', transformedRootNotes.length);
      
      setFolders(transformedFolders);
      setRootNotes(transformedRootNotes);
    } catch (error) {
      console.error('Erreur lors du chargement des dossiers:', error);
      // En cas d'erreur, initialiser avec des tableaux vides pour éviter les erreurs de rendu
      setFolders([]);
      setRootNotes([]);
    } finally {
      setLoading(false);
    }
  }

  // Créer un dossier
  async function createFolder(name: string, parentId: number | null = null) {
    try {

      const userId = AuthService.getUser();
      if (!userId) {
        throw new Error('Utilisateur non connecté');
      }

      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          userId: userId,
          parentId: parentId
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Erreur lors de la création du dossier:', errorText);
        throw new Error('Erreur lors de la création du dossier');
      }

      const result = await res.json();
      console.log('Dossier créé:', result);
      
      // Rafraîchir l'arborescence
      await fetchFolders();
      return result;
    } catch (error) {
      console.error('Erreur lors de la création du dossier:', error);
      throw error;
    }
  }

  return { folders, rootNotes, fetchFolders, loading, createFolder };
}