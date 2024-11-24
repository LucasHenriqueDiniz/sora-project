import React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { dracula } from "@uiw/codemirror-theme-dracula";
import type { CodeEditorProps } from "../types/editor";

const CodeEditor: React.FC<CodeEditorProps> = ({ file, content, className = "", style }) => {
  return (
    <div
      className={`h-full ${className}`}
      style={style}
    >
      <CodeMirror
        value={content}
        height="100%"
        theme={dracula}
        extensions={[python()]}
        onChange={() => {}}
      />
    </div>
  );
};

export default CodeEditor;
