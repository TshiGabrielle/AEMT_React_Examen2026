import { useState } from "react";
import "./App.css";

const API_URL = "http://localhost:8080/api/notes";

function App() {
  const [id, setId] = useState<number>(0);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");

  // CREATE
  const createNote = async () => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name,
        content_markdown: content,
        idFolder: 0
      })
    });

    const data = await res.json();
    alert("Note créée avec l'id : " + data.id);
    setId(data.id);
  };

  // GET
  const getNote = async () => {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) {
      alert("Note introuvable");
      return;
    }
    const data = await res.json();
    setName(data.name);
    setContent(data.content_markdown);
  };

  // UPDATE
  const updateNote = async () => {
    await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name,
        contentMarkdown: content
      })
    });
    alert("Note modifiée");
  };

  // DELETE
  const deleteNote = async () => {
    await fetch(`${API_URL}/${id}`, {
      method: "DELETE"
    });
    alert("Note supprimée");
    setName("");
    setContent("");
  };

  return (
    <div className="container">
      <h1>🦇 Spooky Notes</h1>

      <input
        type="number"
        placeholder="ID de la note"
        value={id}
        onChange={e => setId(Number(e.target.value))}
      />

      <input
        type="text"
        placeholder="Nom de la note"
        value={name}
        onChange={e => setName(e.target.value)}
      />

      <textarea
        placeholder="Contenu markdown"
        value={content}
        onChange={e => setContent(e.target.value)}
      />

      <div className="buttons">
        <button onClick={createNote}>Créer</button>
        <button onClick={getNote}>Charger</button>
        <button onClick={updateNote}>Modifier</button>
        <button onClick={deleteNote}>Supprimer</button>
      </div>
    </div>
  );
}

export default App;
