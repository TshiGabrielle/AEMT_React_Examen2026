import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";


interface Props {
  content: string;
  onInternalLinkClick: (noteTitle: string) => void;
}

export function NoteLinksRenderer({ content, onInternalLinkClick }: Props) {
  const safeContent = typeof content === "string" ? content : "";

  // Transformer [[Note]] en <a>
  function transformInternalLinks(text: string) {
    return text.replace(/\[\[(.+?)\]\]/g, (_, title) => {
      return `[${title}](internal:${encodeURIComponent(title)})`;

    });
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkDirective]}
      // Autorise le protocole "internal:" pour les liens internes
      urlTransform={(uri: string) => {
        // Garder les liens internes tels quels
        if (uri.startsWith("internal:")) {
          return uri;
        }
        // Conserver les autres liens normalement
        return uri;
      }}
      
      components={{
        a({ href, children }) {
          // Gérer les liens internes vers une note
          if (href?.startsWith("internal:")) {
            const noteTitle = decodeURIComponent(
                href.replace("internal:", "")
            );

            return (
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onInternalLinkClick(noteTitle);
                }}
                style={{ color: "#ff8c00", fontWeight: "bold" }}
              >
                 {children}
              </a>
            );
          }

          // Lien externe normal
          return (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          );
        }
      }}
    >
      {transformInternalLinks(safeContent)}
    </ReactMarkdown>
  );
}
