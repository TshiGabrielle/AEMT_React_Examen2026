interface Props {
  isEditMode: boolean;
  title: string;
  content: string;
  onTitleChange: (v: string) => void;
  onContentChange: (v: string) => void;
  onSave: () => void;
}

function convertMarkdownToHtml(markdown: string): string {
  let html = markdown;

  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');

  html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/gim, '<a href="$2">$1</a>');
  html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');

  html = html.replace(/^\s*[-*]\s+(.*)$/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>');

  html = html.replace(/\n\n/gim, '</p><p>');
  html = html.replace(/\n/gim, '<br>');

  if (!html.startsWith('<')) {
    html = '<p>' + html + '</p>';
  }

  return html;
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
            onChange={(e) => onContentChange(e.target.value)}
            className="markdown-input"
            placeholder="Écrivez en Markdown..."
          />
        ) : (
          <div
            className="markdown-preview"
            dangerouslySetInnerHTML={{
              __html: convertMarkdownToHtml(content)
            }}
          />
        )}
      </div>
    </main>
  );
}