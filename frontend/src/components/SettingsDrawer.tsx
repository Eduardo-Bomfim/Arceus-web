import React, { useState, useEffect } from 'react';
import {
  X,
  Palette,
  Type,
  Keyboard,
  Check,
  Sparkles,
  Sliders,
  Code2,
  FileCode,
} from 'lucide-react';
import { useTheme, THEMES } from '../context/ThemeContext';
import type { ThemeId, EditorFontSize, EditorFontFamily } from '../types';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'appearance' | 'editor' | 'shortcuts';

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme, settings, updateSettings } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('appearance');

  // Fechar gaveta ao pressionar a tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop semi-transparente que não esconde totalmente o editor à esquerda */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Painel lateral deslizante */}
      <div
        className="relative z-10 w-full max-w-2xl h-full bg-[var(--bg-panel)] border-l border-[var(--border-color)] shadow-2xl flex flex-col transform transition-transform duration-300 ease-out animate-slideInRight"
        style={{
          boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.45)',
        }}
      >
        {/* Cabeçalho da Gaveta */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-header)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-glow)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent-primary)]">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-[var(--text-main)] flex items-center gap-2">
                Configurações da Web IDE
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[var(--accent-glow)] text-[var(--accent-primary)] font-semibold border border-[var(--border-color)]">
                  Arceus OS
                </span>
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Personalize o ambiente de desenvolvimento e sinta as mudanças em tempo real
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition-colors border border-transparent hover:border-[var(--border-color)]"
            title="Fechar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Navegação por Abas */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-0 border-b border-[var(--border-color)] bg-[var(--bg-surface)]">
          <button
            onClick={() => setActiveTab('appearance')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-all ${
              activeTab === 'appearance'
                ? 'border-[var(--accent-primary)] text-[var(--accent-primary)] font-semibold'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            Aparência & Guardiões
            <span className="text-[10px] px-1.5 py-0.2 bg-[var(--bg-subtle)] text-[var(--text-muted)] rounded">
              {THEMES.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-all ${
              activeTab === 'editor'
                ? 'border-[var(--accent-primary)] text-[var(--accent-primary)] font-semibold'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            Editor & Tipografia
          </button>

          <button
            onClick={() => setActiveTab('shortcuts')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-all ${
              activeTab === 'shortcuts'
                ? 'border-[var(--accent-primary)] text-[var(--accent-primary)] font-semibold'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            Atalhos de Teclado
          </button>
        </div>

        {/* Conteúdo das Abas (Scrollável) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ==================================================== */}
          {/* ABA 1: APARÊNCIA & TEMAS (BENTO GRID MODERNO)        */}
          {/* ==================================================== */}
          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-main)] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[var(--accent-primary)]" />
                  Galeria dos Guardiões da Criação
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Selecione uma paleta inspirada nas divindades de Sinnoh e Unova. O editor reflete a aura e cores instantaneamente.
                </p>
              </div>

              {/* Bento Grid dos Temas (2 colunas) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {THEMES.map((t) => {
                  const isSelected = theme === t.id;
                  const [cBg, cSurface, cPrimary, cAccent] = t.previewColors;

                  return (
                    <div
                      key={t.id}
                      onClick={() => setTheme(t.id as ThemeId)}
                      className={`group relative p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                        isSelected
                          ? 'border-[var(--accent-primary)] bg-[var(--bg-subtle)] shadow-lg'
                          : 'border-[var(--border-color)] bg-[var(--bg-surface)] hover:border-[var(--text-muted)]/40 hover:bg-[var(--bg-subtle)]/70'
                      }`}
                      style={{
                        outline: isSelected ? `2px solid ${t.primaryColor}` : 'none',
                        outlineOffset: '2px',
                      }}
                    >
                      {/* Topo do Card: Nome e Selo de Seleção */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-[var(--text-main)] tracking-tight">
                            {t.name}
                          </span>
                          {isSelected && (
                            <span
                              className="w-5 h-5 rounded-full flex items-center justify-center text-white"
                              style={{ backgroundColor: t.primaryColor }}
                            >
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-[var(--text-muted)] line-clamp-1 mb-2.5">
                          {t.subtitle}
                        </p>
                      </div>

                      {/* Swatches de Cores (4 Pilares Visuais) */}
                      <div className="flex items-center gap-1.5 mb-3">
                        <div
                          className="w-4 h-4 rounded-full border border-black/20 shadow-sm"
                          style={{ backgroundColor: cBg }}
                          title="Fundo"
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-black/20 shadow-sm"
                          style={{ backgroundColor: cSurface }}
                          title="Superfície"
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-black/20 shadow-sm"
                          style={{ backgroundColor: cPrimary }}
                          title="Acento Primário"
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-black/20 shadow-sm"
                          style={{ backgroundColor: cAccent }}
                          title="Acento Secundário"
                        />

                        <span className="text-[10px] ml-auto font-mono text-[var(--text-muted)]">
                          {t.isDark ? 'Dark' : 'Light'}
                        </span>
                      </div>

                      {/* Mini Mockup Sintático de Código MiniLang */}
                      <div
                        className="p-2.5 rounded-lg border text-[10px] font-mono leading-relaxed"
                        style={{
                          backgroundColor: cBg,
                          borderColor: cPrimary + '40',
                          color: t.isDark ? '#e2e8f0' : '#1e293b',
                        }}
                      >
                        <div>
                          <span style={{ color: cPrimary, fontWeight: 600 }}>programa</span>{' '}
                          <span style={{ color: t.isDark ? '#f8fafc' : '#0f172a' }}>demo</span>{' '}
                          {'{'}
                        </div>
                        <div className="pl-3">
                          <span style={{ color: cPrimary, fontWeight: 600 }}>var</span>{' '}
                          <span>x</span>{' '}
                          <span style={{ color: cAccent, fontWeight: 600 }}>inteiro</span>;
                        </div>
                        <div className="pl-3">
                          <span>x = 42;</span>
                        </div>
                        <div className="pl-3">
                          <span style={{ color: cPrimary, fontWeight: 600 }}>escreva</span> x;
                        </div>
                        <div>{'}'} <span style={{ color: cPrimary, fontWeight: 600 }}>fim</span>.</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* ABA 2: EDITOR & TIPOGRAFIA                           */}
          {/* ==================================================== */}
          {activeTab === 'editor' && (
            <div className="space-y-6">
              {/* Tamanho da Fonte */}
              <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider">
                      Tamanho da Fonte no Editor
                    </h4>
                    <p className="text-xs text-[var(--text-muted)]">
                      Ajuste a escala visual do código para máxima legibilidade
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-[var(--accent-primary)] px-2.5 py-1 rounded bg-[var(--accent-glow)] border border-[var(--border-color)]">
                    {settings.fontSize}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-1">
                  {(['12px', '14px', '16px', '18px'] as EditorFontSize[]).map((size) => (
                    <button
                      key={size}
                      onClick={() => updateSettings({ fontSize: size })}
                      className={`py-2 px-3 rounded-lg text-xs font-mono font-medium border transition-all ${
                        settings.fontSize === size
                          ? 'border-[var(--accent-primary)] bg-[var(--accent-glow)] text-[var(--accent-primary)] font-bold'
                          : 'border-[var(--border-color)] bg-[var(--bg-panel)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Família da Fonte */}
              <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider">
                    Família Tipográfica Local
                  </h4>
                  <p className="text-xs text-[var(--text-muted)]">
                    Fontes técnicas integradas via pacotes locais sem latência externa
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  {(['JetBrains Mono', 'Fira Code'] as EditorFontFamily[]).map((font) => (
                    <button
                      key={font}
                      onClick={() => updateSettings({ fontFamily: font })}
                      className={`p-3 rounded-lg text-left border transition-all flex flex-col justify-between ${
                        settings.fontFamily === font
                          ? 'border-[var(--accent-primary)] bg-[var(--accent-glow)] text-[var(--accent-primary)] font-bold'
                          : 'border-[var(--border-color)] bg-[var(--bg-panel)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                      }`}
                    >
                      <span className="text-xs font-bold">{font}</span>
                      <span
                        className="text-xs mt-2 opacity-80"
                        style={{ fontFamily: font }}
                      >
                        {font === 'Fira Code' ? '-> === !== >= <=' : 'func main() { ... }'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Switches do Editor */}
              <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] divide-y divide-[var(--border-color)]">
                {/* Ligaduras */}
                <div className="flex items-center justify-between py-3 first:pt-0">
                  <div>
                    <h5 className="text-xs font-semibold text-[var(--text-main)]">
                      Ligaduras Tipográficas
                    </h5>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      Combina símbolos matemáticos e operadores lógicos (ex: -&gt;, ==, !=)
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableLigatures}
                      onChange={(e) => updateSettings({ enableLigatures: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-[var(--bg-subtle)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--accent-primary)]"></div>
                  </label>
                </div>

                {/* Quebra de Linha (Line Wrapping) */}
                <div className="flex items-center justify-between py-3">
                  <div>
                    <h5 className="text-xs font-semibold text-[var(--text-main)]">
                      Quebra Automática de Linha (Word Wrap)
                    </h5>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      Ajusta linhas compridas na largura visual do editor sem rolagem horizontal
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.editorLineWrapping}
                      onChange={(e) => updateSettings({ editorLineWrapping: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-[var(--bg-subtle)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--accent-primary)]"></div>
                  </label>
                </div>

                {/* Minimapa */}
                <div className="flex items-center justify-between py-3 last:pb-0">
                  <div>
                    <h5 className="text-xs font-semibold text-[var(--text-main)]">
                      Exibir Minimapa de Código
                    </h5>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      Visão panorâmica em miniatura para navegação rápida em arquivos longos
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showMinimap}
                      onChange={(e) => updateSettings({ showMinimap: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-[var(--bg-subtle)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--accent-primary)]"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* ABA 3: ATALHOS DE TECLADO                            */}
          {/* ==================================================== */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-main)] flex items-center gap-2">
                  <Keyboard className="w-4 h-4 text-[var(--accent-primary)]" />
                  Atalhos Essenciais da Web IDE
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Acelere seu fluxo de trabalho com teclas de atalho inspiradas em IDEs modernas
                </p>
              </div>

              <div className="rounded-xl border border-[var(--border-color)] overflow-hidden bg-[var(--bg-surface)]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--bg-header)] text-[var(--text-muted)] uppercase tracking-wider font-mono text-[10px] border-b border-[var(--border-color)]">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Comando</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Atalho</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-main)] font-medium">
                    <tr className="hover:bg-[var(--bg-subtle)]/50 transition-colors">
                      <td className="py-2.5 px-4 flex items-center gap-2">
                        <Code2 className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                        Executar Compilação e Código
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <kbd className="px-2 py-0.5 rounded bg-[var(--bg-panel)] border border-[var(--border-color)] font-mono text-[11px] shadow-sm">
                          F9
                        </kbd>
                        <span className="mx-1 text-[var(--text-muted)]">ou</span>
                        <kbd className="px-2 py-0.5 rounded bg-[var(--bg-panel)] border border-[var(--border-color)] font-mono text-[11px] shadow-sm">
                          Ctrl+Enter
                        </kbd>
                      </td>
                    </tr>
                    <tr className="hover:bg-[var(--bg-subtle)]/50 transition-colors">
                      <td className="py-2.5 px-4">Paleta de Comandos Rápidos</td>
                      <td className="py-2.5 px-4 text-right">
                        <kbd className="px-2 py-0.5 rounded bg-[var(--bg-panel)] border border-[var(--border-color)] font-mono text-[11px] shadow-sm">
                          Ctrl+K
                        </kbd>
                      </td>
                    </tr>
                    <tr className="hover:bg-[var(--bg-subtle)]/50 transition-colors">
                      <td className="py-2.5 px-4">Abrir Configurações & Temas</td>
                      <td className="py-2.5 px-4 text-right">
                        <kbd className="px-2 py-0.5 rounded bg-[var(--bg-panel)] border border-[var(--border-color)] font-mono text-[11px] shadow-sm">
                          Ctrl+,
                        </kbd>
                      </td>
                    </tr>
                    <tr className="hover:bg-[var(--bg-subtle)]/50 transition-colors">
                      <td className="py-2.5 px-4">Alternar Painel Inferior</td>
                      <td className="py-2.5 px-4 text-right">
                        <kbd className="px-2 py-0.5 rounded bg-[var(--bg-panel)] border border-[var(--border-color)] font-mono text-[11px] shadow-sm">
                          Alt+4
                        </kbd>
                      </td>
                    </tr>
                    <tr className="hover:bg-[var(--bg-subtle)]/50 transition-colors">
                      <td className="py-2.5 px-4">Alternar Barra de Projetos</td>
                      <td className="py-2.5 px-4 text-right">
                        <kbd className="px-2 py-0.5 rounded bg-[var(--bg-panel)] border border-[var(--border-color)] font-mono text-[11px] shadow-sm">
                          Alt+1
                        </kbd>
                      </td>
                    </tr>
                    <tr className="hover:bg-[var(--bg-subtle)]/50 transition-colors">
                      <td className="py-2.5 px-4">Formatar Código MiniLang</td>
                      <td className="py-2.5 px-4 text-right">
                        <kbd className="px-2 py-0.5 rounded bg-[var(--bg-panel)] border border-[var(--border-color)] font-mono text-[11px] shadow-sm">
                          Shift+Alt+F
                        </kbd>
                      </td>
                    </tr>
                    <tr className="hover:bg-[var(--bg-subtle)]/50 transition-colors">
                      <td className="py-2.5 px-4">Fechar Janela / Cancelar Foco</td>
                      <td className="py-2.5 px-4 text-right">
                        <kbd className="px-2 py-0.5 rounded bg-[var(--bg-panel)] border border-[var(--border-color)] font-mono text-[11px] shadow-sm">
                          Esc
                        </kbd>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé da Gaveta */}
        <div className="px-6 py-3 border-t border-[var(--border-color)] bg-[var(--bg-header)] flex items-center justify-between text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-[var(--accent-primary)]" />
            <span>Preferências salvas localmente no navegador</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[var(--accent-primary)] text-black font-semibold hover:opacity-90 transition-opacity"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
