import { useImperativeHandle, forwardRef, useMemo, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import type { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView, keymap } from '@codemirror/view';
import { miniLangLanguage } from './minilang-syntax';
import { createErrorLinter } from './linter';
import type { ErrorItem } from '../types';

export interface CodeEditorRef {
  goToLine: (line: number, column?: number) => void;
  focus: () => void;
}

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  errors?: ErrorItem[];
  readOnly?: boolean;
  onRunShortcut?: () => void;
}

const customEditorTheme = EditorView.theme({
  '&': {
    height: '100%',
    fontSize: '14px',
    backgroundColor: '#0f141c',
  },
  '.cm-scroller': {
    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
    lineHeight: '1.6',
  },
  '.cm-gutters': {
    backgroundColor: '#0b0f17',
    color: '#4b5563',
    borderRight: '1px solid #1f293d',
    paddingRight: '6px',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#1a2436',
    color: '#93c5fd',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
  },
  '.cm-cursor': {
    borderLeftColor: '#38bdf8',
    borderLeftWidth: '2px',
  },
  '.cm-selectionBackground, ::selection': {
    backgroundColor: 'rgba(56, 189, 248, 0.25) !important',
  },
  '.cm-tooltip-lint': {
    backgroundColor: '#1e293b',
    border: '1px solid #ef4444',
    color: '#f8fafc',
    borderRadius: '4px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
  },
});

export const CodeEditor = forwardRef<CodeEditorRef, CodeEditorProps>(
  ({ value, onChange, errors = [], readOnly = false, onRunShortcut }, ref) => {
    const cmRef = useRef<ReactCodeMirrorRef>(null);

    useImperativeHandle(ref, () => ({
      goToLine(line: number, column = 1) {
        const view = cmRef.current?.view;
        if (!view) return;

        const doc = view.state.doc;
        const lineNum = Math.min(Math.max(line, 1), doc.lines);
        const lineObj = doc.line(lineNum);
        const pos = Math.min(lineObj.from + Math.max(column - 1, 0), lineObj.to);

        view.dispatch({
          selection: { anchor: pos },
          scrollIntoView: true,
        });
        view.focus();
      },
      focus() {
        cmRef.current?.view?.focus();
      },
    }));

    const extensions = useMemo(() => {
      const ext = [
        miniLangLanguage,
        oneDark,
        customEditorTheme,
        createErrorLinter(errors),
      ];

      if (onRunShortcut) {
        ext.push(
          keymap.of([
            {
              key: 'Ctrl-Enter',
              run: () => {
                onRunShortcut();
                return true;
              },
            },
            {
              key: 'F9',
              run: () => {
                onRunShortcut();
                return true;
              },
            },
          ])
        );
      }

      return ext;
    }, [errors, onRunShortcut]);

    return (
      <div className="h-full w-full overflow-hidden">
        <CodeMirror
          ref={cmRef}
          value={value}
          height="100%"
          theme="dark"
          extensions={extensions}
          onChange={onChange}
          readOnly={readOnly}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightSpecialChars: true,
            history: true,
            foldGutter: true,
            drawSelection: true,
            dropCursor: true,
            allowMultipleSelections: false,
            indentOnInput: true,
            syntaxHighlighting: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            crosshairCursor: true,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            closeBracketsKeymap: true,
            defaultKeymap: true,
            searchKeymap: true,
            historyKeymap: true,
            foldKeymap: true,
            completionKeymap: true,
            lintKeymap: true,
          }}
        />
      </div>
    );
  }
);
