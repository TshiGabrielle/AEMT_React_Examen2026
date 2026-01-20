import { useState, useEffect } from 'react';

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

  async function fetchNotes() {
    const r = await fetch(API);
    setNotes(await r.json());
  }

  async function loadNote(id: number) {
    const r = await fetch(`${API}/${id}`);
    setSelectedNote(await r.json());
  }

  async function createNote() {
    const name = prompt('Nom de la nouvelle note:');
    if (!name) return;

    const r = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, content_markdown: '', idFolder: 0 })
    });

    const note = await r.json();
    await fetchNotes();
    await loadNote(note.id);
  }

  async function updateNote(id: number, name: string, content: string) {
    await fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, contentMarkdown: content })
    });
    await fetchNotes();
    await loadNote(id);
  }

  async function deleteNote(id: number) {
    if (!confirm('Supprimer cette note ?')) return;
    await fetch(`${API}/${id}`, { method: 'DELETE' });
    setSelectedNote(null);
    await fetchNotes();
  }

  return {
    notes,
    selectedNote,
    setSelectedNote,
    loadNote,
    createNote,
    updateNote,
    deleteNote
  };
}