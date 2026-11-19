import { linter } from '@codemirror/lint';
import type { Diagnostic } from '@codemirror/lint';
import type { EditorView } from '@codemirror/view';
import type { ErrorItem } from '../types';

export function createErrorLinter(errors: ErrorItem[]) {
  return linter((view: EditorView) => {
    const diagnostics: Diagnostic[] = [];
    const doc = view.state.doc;
    const linesCount = doc.lines;

    for (const err of errors) {
      if (!err.line || err.line < 1) continue;

      const lineNum = Math.min(err.line, linesCount);
      const line = doc.line(lineNum);
      const col = Math.max(err.column || 1, 1);

      const fromPos = Math.min(line.from + col - 1, line.to);
      const toPos = Math.min(fromPos + 1, line.to);

      diagnostics.push({
        from: fromPos,
        to: Math.max(fromPos, toPos),
        severity: 'error',
        message: `[${err.phase}] ${err.message}`,
        source: 'Arceus',
      });
    }

    return diagnostics;
  });
}
