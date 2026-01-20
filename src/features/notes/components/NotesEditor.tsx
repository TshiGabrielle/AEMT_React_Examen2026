
import { useState } from "react";
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

        <p>Voici les bases du Markdown :</p>

        <ul>
          <li><code>#</code> Titre → <strong>H1</strong></li>
          <li><code>##</code> Sous‑titre → <strong>H2</strong></li>
          <li><code>**gras**</code> → texte en gras</li>
          <li><code>*italique*</code> → texte en italique</li>
          <li><code>- élément</code> → liste à puces</li>
          <li><code>1. élément</code> → liste numérotée</li>
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

export function NotesEditor({
  isEditMode,
  title,
  content,
  onTitleChange,
  onContentChange,
  onSave
}: Props) {
  const [showHelp, setShowHelp] = useState(false);

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

      <div className="editor-content">
        {isEditMode ? (
          <textarea
            value={content}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              onContentChange(e.target.value)
            }
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

      {showHelp && <MarkdownHelp onClose={() => setShowHelp(false)} />}
    </main>
  );
}
