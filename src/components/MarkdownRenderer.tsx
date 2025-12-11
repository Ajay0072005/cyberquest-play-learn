import ReactMarkdown, { Components } from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
  const components: Components = {
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      const codeString = String(children).replace(/\n$/, '');
      const isMultiLine = codeString.includes('\n');
      
      if (isMultiLine || language) {
        return (
          <div className="relative my-2 rounded-lg overflow-hidden">
            {language && (
              <div className="flex items-center justify-between bg-muted/80 px-3 py-1 text-xs text-muted-foreground border-b border-border">
                <span>{language}</span>
              </div>
            )}
            <SyntaxHighlighter
              style={oneDark}
              language={language || 'text'}
              PreTag="div"
              customStyle={{
                margin: 0,
                borderRadius: language ? 0 : '0.5rem',
                padding: '1rem',
                fontSize: '0.8rem',
              }}
            >
              {codeString}
            </SyntaxHighlighter>
          </div>
        );
      }
      
      return (
        <code
          className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-primary"
          {...props}
        >
          {children}
        </code>
      );
    },
    p({ children }) {
      return <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>;
    },
    ul({ children }) {
      return <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>;
    },
    ol({ children }) {
      return <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>;
    },
    li({ children }) {
      return <li className="text-foreground">{children}</li>;
    },
    h1({ children }) {
      return <h1 className="text-lg font-bold mb-2 text-foreground">{children}</h1>;
    },
    h2({ children }) {
      return <h2 className="text-base font-bold mb-2 text-foreground">{children}</h2>;
    },
    h3({ children }) {
      return <h3 className="text-sm font-bold mb-1 text-foreground">{children}</h3>;
    },
    blockquote({ children }) {
      return (
        <blockquote className="border-l-2 border-primary pl-3 my-2 text-muted-foreground italic">
          {children}
        </blockquote>
      );
    },
    a({ href, children }) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {children}
        </a>
      );
    },
    strong({ children }) {
      return <strong className="font-semibold text-foreground">{children}</strong>;
    },
  };

  return (
    <ReactMarkdown components={components}>
      {content}
    </ReactMarkdown>
  );
};
