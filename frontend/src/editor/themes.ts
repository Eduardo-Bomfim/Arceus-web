import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';
import type { Extension } from '@codemirror/state';
import type { ThemeId } from '../types';

// ==========================================
// 1. TEMA ESPECIAL: ARCEUS DIVINO
// ==========================================
const arceusEditorViewTheme = EditorView.theme({
  '&': {
    height: '100%',
    fontSize: '14px',
    backgroundColor: '#0c1017',
    color: '#f8fafc',
  },
  '.cm-scroller': {
    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
    lineHeight: '1.65',
  },
  '.cm-gutters': {
    backgroundColor: '#080c12',
    color: '#475569',
    borderRight: '1px solid #1e2837',
    paddingRight: '8px',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    color: '#fbbf24',
    fontWeight: 'bold',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
  },
  '.cm-cursor': {
    borderLeftColor: '#fbbf24',
    borderLeftWidth: '2.5px',
    boxShadow: '0 0 8px rgba(251, 191, 36, 0.6)',
  },
  '.cm-selectionBackground, ::selection': {
    backgroundColor: 'rgba(245, 158, 11, 0.25) !important',
  },
  '.cm-tooltip-lint': {
    backgroundColor: '#161e2b',
    border: '1px solid #f59e0b',
    color: '#f8fafc',
    borderRadius: '6px',
    boxShadow: '0 8px 16px -2px rgba(0, 0, 0, 0.6)',
  },
});

const arceusHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: '#fbbf24', fontWeight: '600' }, // Ouro Divino
  { tag: t.typeName, color: '#34d399', fontWeight: '600' }, // Gema Esmeralda
  { tag: t.bool, color: '#f87171', fontWeight: '600' }, // Olhos Rubi de Arceus
  { tag: t.number, color: '#fde047' }, // Âmbar Dourado
  { tag: t.operator, color: '#f59e0b' }, // Ouro Forjado
  { tag: t.punctuation, color: '#94a3b8' }, // Platina Suave
  { tag: t.comment, color: '#64748b', fontStyle: 'italic' }, // Névoa Celestial
  { tag: t.variableName, color: '#f1f5f9' }, // Corpo Branco Pérola
  { tag: t.invalid, color: '#ef4444', textDecoration: 'underline wavy #ef4444' },
]);

// ==========================================
// 2. TEMA VÁCUO CÓSMICO (DEFAULT DARK)
// ==========================================
const voidEditorViewTheme = EditorView.theme({
  '&': {
    height: '100%',
    fontSize: '14px',
    backgroundColor: '#0a0e14',
    color: '#f1f5f9',
  },
  '.cm-scroller': {
    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
    lineHeight: '1.65',
  },
  '.cm-gutters': {
    backgroundColor: '#070a0e',
    color: '#475569',
    borderRight: '1px solid #1a2230',
    paddingRight: '8px',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#162030',
    color: '#38bdf8',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(56, 189, 248, 0.04)',
  },
  '.cm-cursor': {
    borderLeftColor: '#38bdf8',
    borderLeftWidth: '2.5px',
    boxShadow: '0 0 8px rgba(56, 189, 248, 0.6)',
  },
  '.cm-selectionBackground, ::selection': {
    backgroundColor: 'rgba(56, 189, 248, 0.25) !important',
  },
});

const voidHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: '#38bdf8', fontWeight: '600' },
  { tag: t.typeName, color: '#818cf8', fontWeight: '600' },
  { tag: t.bool, color: '#c084fc' },
  { tag: t.number, color: '#a7f3d0' },
  { tag: t.operator, color: '#67e8f9' },
  { tag: t.punctuation, color: '#94a3b8' },
  { tag: t.comment, color: '#4b5563', fontStyle: 'italic' },
  { tag: t.variableName, color: '#f1f5f9' },
  { tag: t.invalid, color: '#ef4444', textDecoration: 'underline wavy #ef4444' },
]);

// ==========================================
// 3. TEMA DIALGA TEMPORAL (AÇO & DIAMANTE)
// ==========================================
const dialgaEditorViewTheme = EditorView.theme({
  '&': {
    height: '100%',
    fontSize: '14px',
    backgroundColor: '#080d1a',
    color: '#f0f9ff',
  },
  '.cm-scroller': {
    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
    lineHeight: '1.65',
  },
  '.cm-gutters': {
    backgroundColor: '#050912',
    color: '#334155',
    borderRight: '1px solid #152238',
    paddingRight: '8px',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#0e1d38',
    color: '#06b6d4',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(6, 182, 212, 0.06)',
  },
  '.cm-cursor': {
    borderLeftColor: '#06b6d4',
    borderLeftWidth: '2.5px',
    boxShadow: '0 0 8px rgba(6, 182, 212, 0.6)',
  },
  '.cm-selectionBackground, ::selection': {
    backgroundColor: 'rgba(6, 182, 212, 0.25) !important',
  },
});

const dialgaHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: '#06b6d4', fontWeight: '600' }, // Diamante Temporal
  { tag: t.typeName, color: '#38bdf8', fontWeight: '600' }, // Aço Metálico
  { tag: t.bool, color: '#60a5fa' },
  { tag: t.number, color: '#67e8f9' },
  { tag: t.operator, color: '#22d3ee' },
  { tag: t.punctuation, color: '#94a3b8' },
  { tag: t.comment, color: '#475569', fontStyle: 'italic' },
  { tag: t.variableName, color: '#f0f9ff' },
]);

// ==========================================
// 4. TEMA GIRATINA (MUNDO DISTORÇÃO)
// ==========================================
const giratinaEditorViewTheme = EditorView.theme({
  '&': {
    height: '100%',
    fontSize: '14px',
    backgroundColor: '#100b0e',
    color: '#fff1f2',
  },
  '.cm-scroller': {
    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
    lineHeight: '1.65',
  },
  '.cm-gutters': {
    backgroundColor: '#0a0608',
    color: '#4c2e39',
    borderRight: '1px solid #26141c',
    paddingRight: '8px',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#261219',
    color: '#f43f5e',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(244, 63, 94, 0.06)',
  },
  '.cm-cursor': {
    borderLeftColor: '#f43f5e',
    borderLeftWidth: '2.5px',
    boxShadow: '0 0 8px rgba(244, 63, 94, 0.6)',
  },
  '.cm-selectionBackground, ::selection': {
    backgroundColor: 'rgba(244, 63, 94, 0.25) !important',
  },
});

const giratinaHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: '#f43f5e', fontWeight: '600' }, // Carmesim Distorção
  { tag: t.typeName, color: '#fbbf24', fontWeight: '600' }, // Ouro Sombrio
  { tag: t.bool, color: '#fb7185' },
  { tag: t.number, color: '#fca5a5' },
  { tag: t.operator, color: '#f87171' },
  { tag: t.punctuation, color: '#9f7d87' },
  { tag: t.comment, color: '#573d45', fontStyle: 'italic' },
  { tag: t.variableName, color: '#fff1f2' },
]);

export function getEditorThemeExtension(theme: ThemeId): Extension[] {
  switch (theme) {
    case 'arceus':
      return [arceusEditorViewTheme, syntaxHighlighting(arceusHighlightStyle)];
    case 'dialga':
      return [dialgaEditorViewTheme, syntaxHighlighting(dialgaHighlightStyle)];
    case 'giratina':
      return [giratinaEditorViewTheme, syntaxHighlighting(giratinaHighlightStyle)];
    case 'void':
    default:
      return [voidEditorViewTheme, syntaxHighlighting(voidHighlightStyle)];
  }
}
