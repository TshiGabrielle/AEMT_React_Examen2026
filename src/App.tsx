import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:8080/api/notes";

/* ===== Types ===== */

type NoteListItem = {
  id: number;
  name: string;
};

type Note = {
  id: number;
  name: string;
  content_markdown: string;
};

/* ===== App ===== */

function App() {
  const [notes, setNotes] = useState<NoteListItem[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  /* -------- Charger la liste -------- */
  const loadNotes = () => {
    fetch(API)
      .then(res => res.json())
      .then(data => setNotes(data));
  };

  useEffect(() => {
    loadNotes();
  }, []);

  /* -------- Charger une note -------- */
  const loadNote = (id: number) => {
    fetch(`${API}/${id}`)
      .then(res => res.json())
      .then(data => {
        setSelectedNote(data);
        setNewTitle(data.name);
        setNewContent(data.content_markdown);
      });
  };

  /* -------- Créer une note -------- */
  const createNote = async () => {
  const response = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Nouvelle note",
      content_markdown: "",
      idFolder: 0
    })
  });

  console.log("Status:", response.status);

  loadNotes();
};


  /* -------- Modifier une note -------- */
  const updateNote = async () => {
    if (!selectedNote) return;

    await fetch(`${API}/${selectedNote.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newTitle,
        contentMarkdown: newContent
      })
    });

    loadNotes();
  };

  /* -------- Supprimer une note -------- */
  const deleteNote = async () => {
    if (!selectedNote) return;

    await fetch(`${API}/${selectedNote.id}`, {
      method: "DELETE"
    });

    setSelectedNote(null);
    loadNotes();
  };

  return (
    <div className="container">

      {/* ===== COLONNE GAUCHE ===== */}
      <div className="sidebar">
        <h3>Notes</h3>

        <button onClick={createNote}>➕ Nouvelle note</button>

        {notes.map(note => (
          <div
            key={note.id}
            className="note-item"
            onClick={() => loadNote(note.id)}
          >
            {note.name}
          </div>
        ))}
      </div>

      {/* ===== COLONNE DROITE ===== */}
      <div className="content">
        {selectedNote ? (
          <>
            <input
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
            />

            <textarea
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
            />

            <div className="actions">
              <button onClick={updateNote}>💾 Enregistrer</button>
              <button onClick={deleteNote}>🗑 Supprimer</button>
            </div>
          </>
        ) : (
          <p>Sélectionne une note à gauche</p>
        )}
      </div>

    </div>
  );
}

export default App;
