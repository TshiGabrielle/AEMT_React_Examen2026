import { NotesExportService } from "../../../services/NotesExportService.js";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { useHotkeys } from "react-hotkeys-hook";

// instance du service d’exportation
const notesExportService = new NotesExportService();

interface Props {
  isEditMode: boolean;              // mode édition ou lecture
  title: string;                    // titre de la note
  content: string;                  // contenu Markdown de la note
  onTitleChange: (v: string) => void;   // callback modification du titre
  onContentChange: (v: string) => void; // callback modification du contenu
  onSave: () => void;               // action lors du clic "Enregistrer"
  noteId: number;                   // ID de la note courante
  updatedAt: string;
  createdAt: string;
}

// Petite fenêtre d'aide Markdown
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
  onSave,
  noteId,
  updatedAt,
  createdAt
}: Props) {

  // Métadonnées : mots, lignes, etc.
  const [stats, setStats] = useState({
    chars: 0,
    words: 0,
    lines: 0,
    bytes: 0
  });

  // Affichage de l’aide Markdown
  const [showHelp, setShowHelp] = useState(false);  // Message de sauvegarde réussie
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  // Fonction interne : calcule les métadonnées
  function computeStats(text: string) {
    const chars = text.length;
    const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
    const lines = text === "" ? 0 : text.split("\n").length;
    const bytes = new Blob([text]).size;

    setStats({ chars, words, lines, bytes });
  }

  // ==== RACCOURCIS CLAVIER ====
  // exportation pdf (note)
  useHotkeys(
    "ctrl+e",
    (event:any) => {
      event.preventDefault();
      if (noteId) {
        handleDownloadPdf();
      }
    }
  );
  
  // À chaque changement du contenu → recalcule les stats
  useEffect(() => {
    computeStats(content);
  }, [content]);

  // Balises HTML autorisées dans le Markdown (sécurité)
  const allowed = [
    "p", "strong", "em", "h1", "h2", "h3",
    "ul", "ol", "li", "a", "code", "pre",
    "blockquote", "br"
  ];

  async function handleDownloadPdf() {
    const blob = await notesExportService.downloadPdf(noteId);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "note"}.pdf`;
    a.click();
  }

  async function handleDownloadZip() {
    const blob = await notesExportService.downloadZip(noteId);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "note"}.zip`;
    a.click();
  }

  const formattedDate = new Date(updatedAt).toLocaleString("fr-BE", {
  dateStyle: "medium",
  timeStyle: "short",
  });

  const formattedCreatedDate = new Date(createdAt).toLocaleString("fr-BE", {
  dateStyle: "medium",
  timeStyle: "short",
  });

  // Fonction pour afficher la notification de succès
  function handleSaveWithFeedback() {
    onSave();
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  }

  return (
    <main className="editor">
      {/* Notification de sauvegarde */}
      {showSaveSuccess && (
        <div className="save-success-notification">
          <span>✓ Note enregistrée avec succès</span>
        </div>
      )}
      {/* Barre d’outils */}
      <div className="editor-toolbar">
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="title-input"
          placeholder="Titre de la note..."
          disabled={!isEditMode}
        />

        <div className="toolbar-buttons-group">
          <button className="btn-help" onClick={() => setShowHelp(true)} title="Aide Markdown">
            ❓
          </button>

          <button className="btn-save" onClick={handleSaveWithFeedback} title="Enregistrer">
            💾
          </button>

          <button className="btn-export" onClick={handleDownloadPdf} title="Export PDF">
            📄
          </button>

          <button className="btn-export" onClick={handleDownloadZip} title="Export ZIP">
            🗂️
          </button>
        </div>

      </div>

      {/* Zone principale */}
      <div className="editor-content" style={{ display: "flex" }}>

        {/* Mode édition : textarea visible */}
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

        {/* Preview HTML en temps réel */}
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

      {/* Métadonnées */}
      <div className="metadata-panel">
        <p><strong>Dernière modification :</strong> {formattedDate}</p>
        <p><strong>Date de création :</strong> {formattedCreatedDate}</p>
        <p><strong>Lignes :</strong> {stats.lines}</p>
        <p><strong>Mots :</strong> {stats.words}</p>
        <p><strong>Caractères :</strong> {stats.chars}</p>
        <p><strong>Taille :</strong> {stats.bytes} octets</p>
      </div>

      {/* Aide Markdown */}
      {showHelp && <MarkdownHelp onClose={() => setShowHelp(false)} />}
    </main>
  );
}
