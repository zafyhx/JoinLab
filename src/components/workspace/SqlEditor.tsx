"use client";

import React, { useEffect, useRef } from "react";
import Editor, { OnMount } from "@monaco-editor/react";

interface SqlEditorProps {
  value: string;
  onChange: (val: string) => void;
  onRun: () => void;
  disabled?: boolean;
}

export function SqlEditor({ value, onChange, onRun, disabled }: SqlEditorProps) {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Register Ctrl+Enter / Cmd+Enter shortcut
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onRun();
    });
  };

  return (
    <div className="relative w-full h-[260px] border rounded-lg overflow-hidden bg-slate-950 font-mono text-sm shadow-inner">
      <Editor
        height="100%"
        defaultLanguage="sql"
        theme="vs-dark"
        value={value}
        onChange={(val) => onChange(val || "")}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          readOnly: disabled,
          tabSize: 2,
          wordWrap: "on",
          padding: { top: 10, bottom: 10 },
        }}
      />
    </div>
  );
}
