import React, { useEffect, useRef } from 'react';

// Make hljs available on the window object for TypeScript
declare global {
  interface Window {
    hljs?: {
      highlightElement: (element: HTMLElement) => void;
    };
  }
}

interface CodeBlockProps {
  language: string;
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Ensure hljs is loaded and the ref is available
    if (codeRef.current && window.hljs) {
      window.hljs.highlightElement(codeRef.current);
    }
  }, [code, language]); // Rerun effect if code or language changes

  const langClass = `language-${language}`;

  return (
    // The <pre> tag is for preformatted text, crucial for code blocks.
    // The library's CSS targets `pre code`.
    <pre>
      <code ref={codeRef} className={langClass}>
        {code}
      </code>
    </pre>
  );
};

export default CodeBlock;