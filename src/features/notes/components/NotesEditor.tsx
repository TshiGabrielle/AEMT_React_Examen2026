
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  isEditMode: boolean;
  title: string;
  content: string;
  onTitleChange: (v: string) => void;
  onContentChange: (v: string) => void;
  onSave: () => void;
}

export function NotesEditor({
  isEditMode,
  title,
  content,
  onTitleChange,
  onContentChange,
  onSave
}: Props) {
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
        <button onClick={onSave} className="btn-save">
          💾 Enregistrer
        </button>
      </div>

      <div className="editor-content">
        {isEditMode ? (
          <textarea
            value={content}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onContentChange(e.target.value)}
            className="markdown-input"
            placeholder="Écrivez en Markdown..."
          />
        ) : (
          <div className="markdown-preview">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </main>
  );
}
