import { useImperativeHandle, forwardRef, useMemo, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import type { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { keymap } from '@codemirror/view';
import { showMinimap } from '@replit/codemirror-minimap';
import { miniLangLanguage } from './minilang-syntax';
import { createErrorLinter } from './linter';
import { getEditorThemeExtension } from './themes';
import type { ErrorItem, ThemeId } from '../types';

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
  theme?: ThemeId;
  onCursorChange?: (line: number, column: number) => void;
  showMinimap?: boolean;
}

export const CodeEditor = forwardRef<CodeEditorRef, CodeEditorProps>(
  (
    {
      value,
      onChange,
      errors = [],
      readOnly = false,
      onRunShortcut,
      theme = 'arceus',
      onCursorChange,
      showMinimap: enableMinimap = true,
    },
    ref
  ) => {
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
        ...getEditorThemeExtension(theme),
        createErrorLinter(errors),
      ];

      if (enableMinimap) {
        ext.push(
          showMinimap.compute(['doc'], () => ({
            create: () => ({ dom: document.createElement('div') }),
            displayText: 'blocks',
            showOverlay: 'always',
          }))
        );
      }

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
    }, [theme, errors, onRunShortcut, enableMinimap]);

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
          onUpdate={(viewUpdate) => {
            if (onCursorChange && viewUpdate.selectionSet) {
              const head = viewUpdate.state.selection.main.head;
              const line = viewUpdate.state.doc.lineAt(head);
              const col = head - line.from + 1;
              onCursorChange(line.number, col);
            }
          }}
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
