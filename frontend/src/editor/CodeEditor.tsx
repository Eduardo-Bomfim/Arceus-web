import { useImperativeHandle, forwardRef, useMemo, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import type { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { keymap, EditorView } from '@codemirror/view';
import { autocompletion } from '@codemirror/autocomplete';
import { showMinimap } from '@replit/codemirror-minimap';
import { miniLangLanguage } from './minilang-syntax';
import { createErrorLinter } from './linter';
import { getEditorThemeExtension } from './themes';
import { createMiniLangCompletionSource } from './completion';
import { useTheme } from '../context/ThemeContext';
import type { ErrorItem, SymbolInfo, ThemeId } from '../types';

export interface CodeEditorRef {
  goToLine: (line: number, column?: number) => void;
  focus: () => void;
}

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  errors?: ErrorItem[];
  symbols?: SymbolInfo[];
  readOnly?: boolean;
  onRunShortcut?: () => void;
  onFormatShortcut?: () => void;
  theme?: ThemeId;
  onCursorChange?: (line: number, column: number) => void;
  showMinimap?: boolean;
  lineWrapping?: boolean;
}

export const CodeEditor = forwardRef<CodeEditorRef, CodeEditorProps>(
  (
    {
      value,
      onChange,
      errors = [],
      symbols = [],
      readOnly = false,
      onRunShortcut,
      onFormatShortcut,
      theme = 'arceus',
      onCursorChange,
      showMinimap: showMinimapProp,
      lineWrapping,
    },
    ref
  ) => {
    const cmRef = useRef<ReactCodeMirrorRef>(null);
    const { settings } = useTheme();

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

    const typographyExtension = useMemo(() => {
      return EditorView.theme({
        '&': {
          fontSize: settings.fontSize,
        },
        '.cm-scroller': {
          fontFamily: `'${settings.fontFamily}', monospace !important`,
          fontFeatureSettings: settings.enableLigatures ? '"calt" 1, "liga" 1' : '"calt" 0, "liga" 0',
          fontVariantLigatures: settings.enableLigatures ? 'normal' : 'none',
        },
        '.cm-content': {
          fontFamily: `'${settings.fontFamily}', monospace !important`,
        },
      });
    }, [settings.fontSize, settings.fontFamily, settings.enableLigatures]);

    const extensions = useMemo(() => {
      const ext = [
        miniLangLanguage,
        ...getEditorThemeExtension(theme),
        createErrorLinter(errors),
        typographyExtension,
        autocompletion({
          override: [createMiniLangCompletionSource(symbols)],
          defaultKeymap: true,
        }),
      ];

      const effectiveLineWrapping = lineWrapping !== undefined ? lineWrapping : settings.editorLineWrapping;
      if (effectiveLineWrapping) {
        ext.push(EditorView.lineWrapping);
      }

      const effectiveMinimap = showMinimapProp !== undefined ? showMinimapProp : settings.showMinimap;
      if (effectiveMinimap) {
        ext.push(
          showMinimap.compute(['doc'], () => ({
            create: () => ({ dom: document.createElement('div') }),
            displayText: 'blocks',
            showOverlay: 'always',
          }))
        );
      }

      const keymaps = [];

      if (onRunShortcut) {
        keymaps.push(
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
          }
        );
      }

      if (onFormatShortcut) {
        keymaps.push({
          key: 'Shift-Alt-f',
          run: () => {
            onFormatShortcut();
            return true;
          },
        });
      }

      if (keymaps.length > 0) {
        ext.push(keymap.of(keymaps));
      }

      return ext;
    }, [
      theme,
      errors,
      symbols,
      onRunShortcut,
      onFormatShortcut,
      showMinimapProp,
      lineWrapping,
      settings.showMinimap,
      settings.editorLineWrapping,
      typographyExtension,
    ]);

    return (
      <div className="h-full w-full overflow-hidden bg-[var(--bg-surface)] flex flex-col">
        <CodeMirror
          ref={cmRef}
          value={value}
          height="100%"
          className="h-full w-full flex-1"
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
            autocompletion: false,
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
