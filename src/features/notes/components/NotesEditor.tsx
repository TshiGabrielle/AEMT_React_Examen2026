
import { useEffect, useState } from "react";
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

/* ----------------------------- HELP POPUP ----------------------------- */

function MarkdownHelp({ onClose }: { onClose: () => void }) {
  return (
    <div className="markdown-help-backdrop">
      <div className="markdown-help-window">
        <h2>📘 Aide Markdown</h2>

        <p>Voici les bases du Markdown :</p>

        <ul>
          <li><code>#</code> Titre → <strong>H1</strong></li>
          <li><code>##</code> Sous‑titre → <strong>H2</strong></li>
          <li><code>**gras**</code> → texte en gras</li>
          <li><code>*italique*</code> → texte en italique</li>
          <li><code>- élément</code> → liste à puces</li>
          <li><code>1. élément</code> → liste ordonnée</li>
          <li><code>https://lien.com</code> → lien cliquable</li>
          <li><code>`code`</code> → code inline</li>
          <li><code>```js ... ```</code> → bloc de code</li>
        </ul>

        <p>Exemple :</p>
        <pre>
{`# Titre principal
## Sous-titre
- Élément
**Texte en gras**
https://example.com
\`Code inline\`
`}
        </pre>

        <button className="btn-close" onClick={onClose}>
          Fermer
        </button>
      </div>
    </div>
  );
}

/* ----------------------------- MAIN COMPONENT ----------------------------- */

export function NotesEditor({
  isEditMode,
  title,
  content,
  onTitleChange,
  onContentChange,
  onSave
}: Props) {

  /* ---------- ÉTAT DES MÉTADONNÉES ---------- */

  const [stats, setStats] = useState({
    chars: 0,
    words: 0,
    lines: 0,
    bytes: 0
  });

  const [showHelp, setShowHelp] = useState(false);

  /* ---------- FONCTION DE CALCUL DES MÉTADONNÉES ----------- */

  function computeStats(text: string) {
    const chars = text.length;
    const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
    const lines = text === "" ? 0 : text.split("\n").length;
    const bytes = new Blob([text]).size;

    setStats({ chars, words, lines, bytes });
  }

  /* ---------- MET À JOUR LES MÉTADONNÉES LORSQUE LA NOTE CHANGE (LOAD) ---------- */

  useEffect(() => {
    computeStats(content);
  }, [content]);

  /* ---------- LISTE DES ÉLÉMENTS HTML AUTORISÉS DANS LE MARKDOWN ---------- */

  const allowed = [
    "p", "strong", "em",
    "h1", "h2", "h3",
    "ul", "ol", "li",
    "a",
    "code", "pre",
    "blockquote",
    "br"
  ];

  /* ---------------------------- RENDER ---------------------------- */

  return (
    <main className="editor">

      {/* ---------- BARRE D'OUTILS ---------- */}
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

        <button onClick={onSave} className="btn-save">
          💾 Enregistrer
        </button>
      </div>

      {/* ---------- ZONE D'ÉDITION / PRÉVISUALISATION ---------- */}
      <div className="editor-content">
        {isEditMode ? (
          <textarea
            value={content}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              onContentChange(e.target.value);
              computeStats(e.target.value); // Mise à jour en temps réel
            }}
            className="markdown-input"
            placeholder="Écrivez en Markdown..."
          />
        ) : (
          <div className="markdown-preview">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSanitize]}
              allowedElements={allowed}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* ---------- PANNEAU MÉTADONNÉES ---------- */}
      <div className="metadata-panel">
        <p><strong>Lignes :</strong> {stats.lines}</p>
        <p><strong>Mots :</strong> {stats.words}</p>
        <p><strong>Caractères :</strong> {stats.chars}</p>
        <p><strong>Taille :</strong> {stats.bytes} octets</p>
      </div>

      {/* MODALE AIDE MARKDOWN */}
      {showHelp && <MarkdownHelp onClose={() => setShowHelp(false)} />}
    </main>
  );
}
