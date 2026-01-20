
import { useEffect, useState } from 'react';

export interface Note {
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

const API = 'http://localhost:8080/api/notes';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  // --- Récupère toutes les notes (liste latérale)
  async function fetchNotes() {
    const res = await fetch(API);
    const data: Note[] = await res.json();
    setNotes(data);
  }

  // --- Charge une note par id (ouvre l’éditeur)
  async function loadNote(id: number) {
    const res = await fetch(`${API}/${id}`);
    const data: Note = await res.json();
    setSelectedNote(data);
  }

  // --- Crée une note SANS popup, l’ouvre directement dans l’éditeur
  async function createNote() {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Nouvelle note',       // nom par défaut
        content_markdown: '',        // contenu vide
        idFolder: 0                  // racine (à ajuster si tu utilises des dossiers)
      })
    });

    const created: { id: number } = await res.json();

    // rafraîchir la liste et ouvrir la note nouvellement créée
    await fetchNotes();
    await loadNote(created.id);
  }

  // --- Met à jour le titre et le contenu markdown de la note
  async function updateNote(id: number, name: string, content: string) {
    await fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name,
        contentMarkdown: content
      })
    });

    // rafraîchir la liste et recharger la note
    await fetchNotes();
    await loadNote(id);
  }

  // --- Supprime une note par id
  async function deleteNote(id: number) {
    if (!confirm('Supprimer cette note ?')) return;

    await fetch(`${API}/${id}`, { method: 'DELETE' });

    // si la note supprimée était sélectionnée, on vide l’éditeur
    setSelectedNote(null);
    await fetchNotes();
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
