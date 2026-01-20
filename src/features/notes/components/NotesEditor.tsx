
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

interface Props {
  isEditMode: boolean;
  title: string;
  content: string;
  onTitleChange: (v: string) => void;
  onContentChange: (v: string) => void;
  onSave: () => void;
}

function MarkdownHelp({ onClose }: { onClose: () => void }) {
  return (
    <div className="markdown-help-backdrop">
      <div className="markdown-help-window">
        <h2>📘 Aide Markdown</h2>

        <ul>
          <li># Titre</li>
          <li>## Sous‑titre</li>
          <li>**Gras**, *Italique*</li>
          <li>- Liste</li>
          <li>`Code inline`</li>
          <li>```js ... ``` Bloc de code</li>
        </ul>

        <button className="btn-close" onClick={onClose}>
          Fermer
        </button>
      </div>
    </div>
  );
}

export function NotesEditor({
  isEditMode,
  title,
  content,
  onTitleChange,
  onContentChange,
  onSave
}: Props) {

  const [stats, setStats] = useState({
    chars: 0,
    words: 0,
    lines: 0,
    bytes: 0
  });

  const [showHelp, setShowHelp] = useState(false);

  function computeStats(text: string) {
    const chars = text.length;
    const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
    const lines = text === "" ? 0 : text.split("\n").length;
    const bytes = new Blob([text]).size;

    setStats({ chars, words, lines, bytes });
  }

  useEffect(() => {
    computeStats(content);
  }, [content]);

  const allowed = [
    "p",
    "strong",
    "em",
    "h1",
    "h2",
    "h3",
    "ul",
    "ol",
    "li",
    "a",
    "code",
    "pre",
    "blockquote",
    "br"
  ];

  return (
    <main className="editor">

      {/* Toolbar */}
      <div className="editor-toolbar">
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="title-input"
          placeholder="Titre de la note..."
          disabled={!isEditMode}
        />

        <button className="btn-help" onClick={() => setShowHelp(true)}>
          ❓ Markdown
        </button>

        <button className="btn-save" onClick={onSave}>
          💾 Enregistrer
        </button>
      </div>

      {/* ZONE PRINCIPALE */}
      <div className="editor-content" style={{ display: "flex" }}>

        {/* MODE ÉCRITURE = textarea + preview */}
        {isEditMode && (
          <textarea
            value={content}
            onChange={(e) => {
              onContentChange(e.target.value);
              computeStats(e.target.value);
            }}
            className="markdown-input"
            placeholder="Écrivez en Markdown..."
            style={{ width: "50%" }}
          />
        )}

        {/* APERCU HTML LIVE (toujours visible) */}
        <div
          className="markdown-preview"
          style={{
            width: isEditMode ? "50%" : "100%",
            borderLeft: "2px solid #ff8c00"
          }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
            allowedElements={allowed}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>

      {/* Panneau métadonnées */}
      <div className="metadata-panel">
        <p><strong>Lignes :</strong> {stats.lines}</p>
        <p><strong>Mots :</strong> {stats.words}</p>
        <p><strong>Caractères :</strong> {stats.chars}</p>
        <p><strong>Taille :</strong> {stats.bytes} octets</p>
      </div>

      {showHelp && <MarkdownHelp onClose={() => setShowHelp(false)} />}
    </main>
  );
}
