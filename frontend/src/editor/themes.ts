import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';
import type { Extension } from '@codemirror/state';
import type { ThemeId } from '../types';

// ==========================================
// 1. TEMA ESPECIAL: ARCEUS DIVINO (DARK)
// ==========================================
const arceusEditorViewTheme = EditorView.theme({
  '&': {
    height: '100%',
    backgroundColor: '#0c1017',
    color: '#f8fafc',
  },
  '.cm-scroller': {
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
// 2. TEMA ARCEUS LIGHT (LUZ DA CRIAÇÃO - LIGHT ELEGANTE)
// ==========================================
const arceusLightEditorViewTheme = EditorView.theme({
  '&': {
    height: '100%',
    backgroundColor: '#ffffff',
    color: '#0f172a',
  },
  '.cm-scroller': {
    lineHeight: '1.65',
  },
  '.cm-gutters': {
    backgroundColor: '#f8fafc',
    color: '#64748b',
    borderRight: '1px solid #e2e8f0',
    paddingRight: '8px',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'rgba(217, 119, 6, 0.12)',
    color: '#b45309',
    fontWeight: 'bold',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(217, 119, 6, 0.04)',
  },
  '.cm-cursor': {
    borderLeftColor: '#d97706',
    borderLeftWidth: '2.5px',
    boxShadow: '0 0 6px rgba(217, 119, 6, 0.5)',
  },
  '.cm-selectionBackground, ::selection': {
    backgroundColor: 'rgba(217, 119, 6, 0.2) !important',
  },
  '.cm-tooltip-lint': {
    backgroundColor: '#ffffff',
    border: '1px solid #d97706',
    color: '#0f172a',
    borderRadius: '6px',
    boxShadow: '0 8px 16px -2px rgba(0, 0, 0, 0.1)',
  },
});

const arceusLightHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: '#b45309', fontWeight: '600' }, // Ouro Âmbar Escuro (WCAG AA > 4.5:1)
  { tag: t.typeName, color: '#047857', fontWeight: '600' }, // Esmeralda Sagrada
  { tag: t.bool, color: '#b91c1c', fontWeight: '600' }, // Rubi Intenso
  { tag: t.number, color: '#c2410c' }, // Laranja Âmbar
  { tag: t.operator, color: '#9a3412' }, // Bronze
  { tag: t.punctuation, color: '#475569' }, // Ardósia
  { tag: t.comment, color: '#64748b', fontStyle: 'italic' }, // Cinza Grafite Suave
  { tag: t.variableName, color: '#0f172a' }, // Grafite Profundo
  { tag: t.invalid, color: '#dc2626', textDecoration: 'underline wavy #dc2626' },
]);

// ==========================================
// 3. TEMA VÁCUO CÓSMICO (DEFAULT DARK)
// ==========================================
const voidEditorViewTheme = EditorView.theme({
  '&': {
    height: '100%',
    backgroundColor: '#0a0e14',
    color: '#f1f5f9',
  },
  '.cm-scroller': {
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
// 4. TEMA DIALGA TEMPORAL (AÇO & DIAMANTE)
// ==========================================
const dialgaEditorViewTheme = EditorView.theme({
  '&': {
    height: '100%',
    backgroundColor: '#080d1a',
    color: '#f0f9ff',
  },
  '.cm-scroller': {
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
// 5. TEMA GIRATINA (MUNDO DISTORÇÃO)
// ==========================================
const giratinaEditorViewTheme = EditorView.theme({
  '&': {
    height: '100%',
    backgroundColor: '#100b0e',
    color: '#fff1f2',
  },
  '.cm-scroller': {
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

// ==========================================
// 6. TEMA PALKIA (DIMENSIONAL CÓSMICO)
// ==========================================
const palkiaEditorViewTheme = EditorView.theme({
  '&': {
    height: '100%',
    backgroundColor: '#130920',
    color: '#faf5ff',
  },
  '.cm-scroller': {
    lineHeight: '1.65',
  },
  '.cm-gutters': {
    backgroundColor: '#0c0515',
    color: '#6b4885',
    borderRight: '1px solid #261240',
    paddingRight: '8px',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#2a1347',
    color: '#c084fc',
    fontWeight: 'bold',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(168, 85, 247, 0.07)',
  },
  '.cm-cursor': {
    borderLeftColor: '#c084fc',
    borderLeftWidth: '2.5px',
    boxShadow: '0 0 8px rgba(192, 132, 252, 0.65)',
  },
  '.cm-selectionBackground, ::selection': {
    backgroundColor: 'rgba(168, 85, 247, 0.3) !important',
  },
});

const palkiaHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: '#c084fc', fontWeight: '600' }, // Ametista Espacial
  { tag: t.typeName, color: '#f472b6', fontWeight: '600' }, // Rosa Pérola Sideral
  { tag: t.bool, color: '#e879f9' }, // Fúcsia Dimensional
  { tag: t.number, color: '#a78bfa' }, // Púrpura Nebulosa
  { tag: t.operator, color: '#e879f9' }, // Fenda Espacial
  { tag: t.punctuation, color: '#a855f7' }, // Luz Dimensional
  { tag: t.comment, color: '#7c5896', fontStyle: 'italic' }, // Poeira Cósmica
  { tag: t.variableName, color: '#faf5ff' }, // Cristal Dimensional
]);

// ==========================================
// 7. TEMA RAYQUAZA (GUARDIÃO CELESTE)
// ==========================================
const rayquazaEditorViewTheme = EditorView.theme({
  '&': {
    height: '100%',
    backgroundColor: '#091813',
    color: '#ecfdf5',
  },
  '.cm-scroller': {
    lineHeight: '1.65',
  },
  '.cm-gutters': {
    backgroundColor: '#040d0a',
    color: '#2d6a54',
    borderRight: '1px solid #143328',
    paddingRight: '8px',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#12382c',
    color: '#34d399',
    fontWeight: 'bold',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(16, 185, 129, 0.07)',
  },
  '.cm-cursor': {
    borderLeftColor: '#34d399',
    borderLeftWidth: '2.5px',
    boxShadow: '0 0 8px rgba(52, 211, 153, 0.7)',
  },
  '.cm-selectionBackground, ::selection': {
    backgroundColor: 'rgba(16, 185, 129, 0.28) !important',
  },
});

const rayquazaHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: '#34d399', fontWeight: '600' }, // Verde Dragão Celeste
  { tag: t.typeName, color: '#fbbf24', fontWeight: '600' }, // Ouro Relâmpago
  { tag: t.bool, color: '#f87171' }, // Olhos do Dragão
  { tag: t.number, color: '#6ee7b7' }, // Jade Luminoso
  { tag: t.operator, color: '#f59e0b' }, // Escamas Douradas
  { tag: t.punctuation, color: '#86efac' }, // Estratosfera
  { tag: t.comment, color: '#3f7762', fontStyle: 'italic' }, // Vento da Camada de Ozônio
  { tag: t.variableName, color: '#ecfdf5' }, // Corpo Jade Abissal
]);

// ==========================================
// 8. TEMA ZEKROM (IDEAIS & RAIOS OLED)
// ==========================================
const zekromEditorViewTheme = EditorView.theme({
  '&': {
    height: '100%',
    backgroundColor: '#05070a',
    color: '#f8fafc',
  },
  '.cm-scroller': {
    lineHeight: '1.65',
  },
  '.cm-gutters': {
    backgroundColor: '#000000',
    color: '#374151',
    borderRight: '1px solid #1f2937',
    paddingRight: '8px',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#0f172a',
    color: '#00e5ff',
    fontWeight: 'bold',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(0, 229, 255, 0.05)',
  },
  '.cm-cursor': {
    borderLeftColor: '#00e5ff',
    borderLeftWidth: '2.5px',
    boxShadow: '0 0 10px rgba(0, 229, 255, 0.8)',
  },
  '.cm-selectionBackground, ::selection': {
    backgroundColor: 'rgba(0, 229, 255, 0.25) !important',
  },
});

const zekromHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: '#00e5ff', fontWeight: '600' }, // Raio Elétrico Puro
  { tag: t.typeName, color: '#38bdf8', fontWeight: '600' }, // Plasma Azul
  { tag: t.bool, color: '#f43f5e' }, // Olhos Carmesim de Zekrom
  { tag: t.number, color: '#7dd3fc' }, // Faísca Cinética
  { tag: t.operator, color: '#22d3ee' }, // Gerador de Fusão
  { tag: t.punctuation, color: '#94a3b8' }, // Turbina Escura
  { tag: t.comment, color: '#4b5563', fontStyle: 'italic' }, // Silêncio Negro
  { tag: t.variableName, color: '#f8fafc' }, // Armadura Negra
]);

// ==========================================
// 9. TEMA RESHIRAM (VERDADE DAS CHAMAS - LIGHT SOLAR)
// ==========================================
const reshiramEditorViewTheme = EditorView.theme({
  '&': {
    height: '100%',
    backgroundColor: '#ffffff',
    color: '#1c1917',
  },
  '.cm-scroller': {
    lineHeight: '1.65',
  },
  '.cm-gutters': {
    backgroundColor: '#fafaf9',
    color: '#78716c',
    borderRight: '1px solid #e7e5e4',
    paddingRight: '8px',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'rgba(234, 88, 12, 0.12)',
    color: '#c2410c',
    fontWeight: 'bold',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(234, 88, 12, 0.04)',
  },
  '.cm-cursor': {
    borderLeftColor: '#ea580c',
    borderLeftWidth: '2.5px',
    boxShadow: '0 0 6px rgba(234, 88, 12, 0.5)',
  },
  '.cm-selectionBackground, ::selection': {
    backgroundColor: 'rgba(234, 88, 12, 0.2) !important',
  },
});

const reshiramHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: '#c2410c', fontWeight: '600' }, // Chama Solar Escura (WCAG AA)
  { tag: t.typeName, color: '#b45309', fontWeight: '600' }, // Brasa Dourada
  { tag: t.bool, color: '#0284c7' }, // Olhos Ciano de Reshiram
  { tag: t.number, color: '#d97706' }, // Fogo Vivo
  { tag: t.operator, color: '#ea580c' }, // Fusão Térmica
  { tag: t.punctuation, color: '#57534e' }, // Plumas de Pedra
  { tag: t.comment, color: '#78716c', fontStyle: 'italic' }, // Cinza Fumaça Suave
  { tag: t.variableName, color: '#1c1917' }, // Branco Puro Texto Grafite
]);

export function getEditorThemeExtension(theme: ThemeId): Extension[] {
  switch (theme) {
    case 'arceus':
      return [arceusEditorViewTheme, syntaxHighlighting(arceusHighlightStyle)];
    case 'arceus-light':
      return [arceusLightEditorViewTheme, syntaxHighlighting(arceusLightHighlightStyle)];
    case 'dialga':
      return [dialgaEditorViewTheme, syntaxHighlighting(dialgaHighlightStyle)];
    case 'giratina':
      return [giratinaEditorViewTheme, syntaxHighlighting(giratinaHighlightStyle)];
    case 'palkia':
      return [palkiaEditorViewTheme, syntaxHighlighting(palkiaHighlightStyle)];
    case 'rayquaza':
      return [rayquazaEditorViewTheme, syntaxHighlighting(rayquazaHighlightStyle)];
    case 'zekrom':
      return [zekromEditorViewTheme, syntaxHighlighting(zekromHighlightStyle)];
    case 'reshiram':
      return [reshiramEditorViewTheme, syntaxHighlighting(reshiramHighlightStyle)];
    case 'void':
    default:
      return [voidEditorViewTheme, syntaxHighlighting(voidHighlightStyle)];
  }
}
