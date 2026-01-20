import { useEffect, useState } from 'react';
import { AuthService } from './AuthService.js';

export interface Note {
  id: number;
  name: string;
  content_markdown: string;
  content_html: string;
  folderId: number | null;  // null si la note est à la racine (correspond au backend)
  created_at: string;
  updated_at: string;
  taille_octet: number;
  nblines: number;
  nbmots: number;
  nbcaract: number;
}

const API = 'http://localhost:8080/api/notes';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  // --- Récupère toutes les notes (liste latérale)
  // Note: Le backend retourne ListNotesOutput[] (juste id et name)
  // On ne stocke que les infos minimales pour la liste
  async function fetchNotes() {
    try {
      const userId = AuthService.getUser();
      if (!userId) {
        throw new Error('Utilisateur non connecté');
      }

      const res = await fetch(`${API}?userId=${userId}`);
      const data: { id: number; name: string }[] = await res.json();

      // Convertir en format Note pour la compatibilité
      const notesList: Note[] = data.map(n => ({
        id: n.id,
        name: n.name,
        content_markdown: '',
        content_html: '',
        folderId: null,
        created_at: '',
        updated_at: '',
        taille_octet: 0,
        nblines: 0,
        nbmots: 0,
        nbcaract: 0
      }));
      setNotes(notesList);
    } catch (error) {
      console.error('Erreur lors du chargement des notes:', error);
    }
  }

  // --- Charge une note par id (ouvre l'éditeur)
  async function loadNote(id: number) {
    try {

      const userId = AuthService.getUser();
      if (!userId) {
        throw new Error('Utilisateur non connecté');
      }

      const res = await fetch(`${API}/${id}?userId=${userId}`);
      if (!res.ok) {
        console.error('Note non trouvée');
        setSelectedNote(null);
        return;
      }
      const data = await res.json();
      // Le backend retourne GetNoteOutput avec folderId (pas idFolder)
      const note: Note = {
        id: data.id,
        name: data.name,
        content_markdown: data.content_markdown || '',
        content_html: data.content_html || '',
        folderId: data.folderId,  // Le backend utilise folderId
        created_at: data.created_at || '',
        updated_at: data.updated_at || '',
        taille_octet: data.taille_octet || 0,
        nblines: data.nblines || 0,
        nbmots: data.nbmots || 0,
        nbcaract: data.nbcaract || 0
      };
      setSelectedNote(note);
    } catch (error) {
      console.error('Erreur lors du chargement de la note:', error);
      setSelectedNote(null);
    }
  }

  // --- Crée une note SANS popup, l'ouvre directement dans l'éditeur
  async function createNote(folderId: number | null = null) {
    try {

      const userId = AuthService.getUser();
      if (!userId) {
        throw new Error('Utilisateur non connecté');
      }

      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Nouvelle note',
          content_markdown: '',
          idFolder: folderId,
          userId: userId   
        })
      });


      if (!res.ok) {
        throw new Error('Erreur lors de la création de la note');
      }

      const created = await res.json();

      // rafraîchir la liste et ouvrir la note nouvellement créée
      await fetchNotes();
      await loadNote(created.id);
    } catch (error) {
      console.error('Erreur lors de la création de la note:', error);
    }
  }

  // --- Met à jour le titre et le contenu markdown de la note
  async function updateNote(id: number, name: string, content: string) {
    try {

      const userId = AuthService.getUser();
      if (!userId) {
        throw new Error('Utilisateur non connecté');
      }

      await fetch(`${API}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          contentMarkdown: content,
          userId: userId
        })
      });


      // rafraîchir la liste et recharger la note
      await fetchNotes();
      await loadNote(id);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la note:', error);
    }
  }

  // --- Supprime une note par id
  async function deleteNote(id: number) {
    if (!confirm('Supprimer cette note ?')) return;

    try {

      const userId = AuthService.getUser();
      if (!userId) {
        throw new Error('Utilisateur non connecté');
      }

      await fetch(`${API}/${id}?userId=${userId}`, { method: 'DELETE' });

      // si la note supprimée était sélectionnée, on vide l'éditeur
      setSelectedNote(null);
      await fetchNotes();
    } catch (error) {
      console.error('Erreur lors de la suppression de la note:', error);
    }
  }

  return {
    // états
    notes,
    selectedNote,
    setSelectedNote,

    // actions
    fetchNotes,
    loadNote,
    createNote,
    updateNote,
    deleteNote
  };
}