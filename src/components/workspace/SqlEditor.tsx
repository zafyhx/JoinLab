"use client";

import React, { useRef } from "react";
import Editor, { OnMount } from "@monaco-editor/react";

interface SqlEditorProps {
  value: string;
  onChange: (val: string) => void;
  onRun: () => void;
  disabled?: boolean;
}

export function SqlEditor({ value, onChange, onRun, disabled }: SqlEditorProps) {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onRun();
    });
  };

  return (
    <div className="relative h-[260px] w-full overflow-hidden rounded-md border border-ink-border bg-ink font-mono text-sm">
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
