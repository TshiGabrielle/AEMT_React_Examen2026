import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import rehypeSanitize from "rehype-sanitize";

interface Props {
  content: string;
  onInternalLinkClick: (noteTitle: string) => void;
}

export function NoteLinksRenderer({ content, onInternalLinkClick }: Props) {

  // Transformer [[Note]] en <a>
  function transformInternalLinks(text: string) {
    return text.replace(/\[\[(.+?)\]\]/g, (_, title) => {
      return `[${title}](internal:${title})`;
    });
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkDirective]}
      rehypePlugins={[rehypeSanitize]}
      components={{
        a({ href, children }) {
          if (href?.startsWith("internal:")) {
            const noteTitle = href.replace("internal:", "");
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

          // lien externe normal
          return (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          );
        }
      }}
    >
      {transformInternalLinks(content)}
    </ReactMarkdown>
  );
}
