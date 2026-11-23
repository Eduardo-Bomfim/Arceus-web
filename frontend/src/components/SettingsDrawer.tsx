import React, { useState, useEffect } from 'react';
import {
  X,
  Palette,
  Type,
  Keyboard,
  Check,
  Code2,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useTheme, THEMES } from '../context/ThemeContext';
import type { ThemeId, EditorFontSize, EditorFontFamily } from '../types';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsSection = 'appearance' | 'font' | 'general' | 'keymap';

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme, settings, updateSettings } = useTheme();
  const [activeSection, setActiveSection] = useState<SettingsSection>('appearance');

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none font-sans">
      {/* JetBrains Settings Dialog Window */}
      <div
        className="w-full max-w-3xl h-[600px] bg-[#2b2d30] border border-[#393b40] rounded-[8px] shadow-2xl flex flex-col overflow-hidden text-xs text-[#dfe1e5]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header do Diálogo de Configurações */}
        <div className="h-10 px-4 bg-[#2b2d30] border-b border-[#393b40] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-[#3574f0]" />
            <span className="font-semibold text-sm text-[#dfe1e5]">Settings</span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-[4px] text-[#868a91] hover:text-[#dfe1e5] hover:bg-[#35373c] transition"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Corpo com Split: Barra Lateral de Categorias à Esquerda + Conteúdo à Direita */}
        <div className="flex-1 flex overflow-hidden">
          {/* Navegação por Categorias à Esquerda estilo IntelliJ IDEA */}
          <div className="w-56 bg-[#1e1f22] border-r border-[#393b40] p-2 flex flex-col gap-0.5 shrink-0 overflow-y-auto">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#868a91]">
              IDE Settings
            </div>

            <button
              onClick={() => setActiveSection('appearance')}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] text-xs transition text-left ${
                activeSection === 'appearance'
                  ? 'bg-[#2e436e] text-white font-medium'
                  : 'text-[#bcbec4] hover:text-[#dfe1e5] hover:bg-[#35373c]'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-[#3574f0]" />
              <span>Appearance & Themes</span>
            </button>

            <button
              onClick={() => setActiveSection('font')}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] text-xs transition text-left ${
                activeSection === 'font'
                  ? 'bg-[#2e436e] text-white font-medium'
                  : 'text-[#bcbec4] hover:text-[#dfe1e5] hover:bg-[#35373c]'
              }`}
            >
              <Type className="w-3.5 h-3.5 text-[#59a869]" />
              <span>Editor &gt; Font</span>
            </button>

            <button
              onClick={() => setActiveSection('general')}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] text-xs transition text-left ${
                activeSection === 'general'
                  ? 'bg-[#2e436e] text-white font-medium'
                  : 'text-[#bcbec4] hover:text-[#dfe1e5] hover:bg-[#35373c]'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-[#e5a83b]" />
              <span>Editor &gt; General</span>
            </button>

            <button
              onClick={() => setActiveSection('keymap')}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] text-xs transition text-left ${
                activeSection === 'keymap'
                  ? 'bg-[#2e436e] text-white font-medium'
                  : 'text-[#bcbec4] hover:text-[#dfe1e5] hover:bg-[#35373c]'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5 text-[#a855f7]" />
              <span>Keymap (Shortcuts)</span>
            </button>
          </div>

          {/* Painel de Conteúdo de Configuração à Direita */}
          <div className="flex-1 bg-[#2b2d30] p-5 overflow-y-auto">
            {/* SEÇÃO 1: APARÊNCIA & TEMAS */}
            {activeSection === 'appearance' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#dfe1e5]">Color Scheme & Appearance</h3>
                  <p className="text-[11px] text-[#868a91] mt-0.5">
                    Select a color scheme for the editor and IDE interface.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {THEMES.map((t) => {
                    const isSelected = theme === t.id;
                    const [cBg, cSurface, cPrimary, cAccent] = t.previewColors;

                    return (
                      <div
                        key={t.id}
                        onClick={() => setTheme(t.id as ThemeId)}
                        className={`p-3 rounded-[6px] border text-left cursor-pointer transition flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#3574f0] bg-[#1e1f22]'
                            : 'border-[#393b40] bg-[#1e1f22]/60 hover:border-[#868a91] hover:bg-[#1e1f22]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-semibold text-xs text-[#dfe1e5]">{t.name}</span>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-[#3574f0] text-white flex items-center justify-center">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-[#868a91] line-clamp-1 mb-2">
                          {t.subtitle}
                        </p>

                        {/* Swatches */}
                        <div className="flex items-center gap-1.5">
                          <div className="w-3.5 h-3.5 rounded-full border border-black/30" style={{ backgroundColor: cBg }} />
                          <div className="w-3.5 h-3.5 rounded-full border border-black/30" style={{ backgroundColor: cSurface }} />
                          <div className="w-3.5 h-3.5 rounded-full border border-black/30" style={{ backgroundColor: cPrimary }} />
                          <div className="w-3.5 h-3.5 rounded-full border border-black/30" style={{ backgroundColor: cAccent }} />
                          <span className="text-[10px] ml-auto font-mono text-[#868a91]">
                            {t.isDark ? 'Dark' : 'Light'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SEÇÃO 2: FONTE DO EDITOR */}
            {activeSection === 'font' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#dfe1e5]">Editor Font</h3>
                  <p className="text-[11px] text-[#868a91] mt-0.5">
                    Configure the primary typography for code editing.
                  </p>
                </div>

                {/* Família */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#dfe1e5]">Font Family</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['JetBrains Mono', 'Fira Code'] as EditorFontFamily[]).map((font) => (
                      <button
                        key={font}
                        onClick={() => updateSettings({ fontFamily: font })}
                        className={`p-2.5 rounded-[4px] border text-left transition ${
                          settings.fontFamily === font
                            ? 'border-[#3574f0] bg-[#1e1f22] text-white font-semibold'
                            : 'border-[#393b40] bg-[#1e1f22]/60 text-[#868a91] hover:text-[#dfe1e5]'
                        }`}
                      >
                        <div className="font-semibold text-xs">{font}</div>
                        <div className="text-[11px] mt-1 opacity-70" style={{ fontFamily: font }}>
                          func main() {'{'} a = 42; {'}'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tamanho da Fonte */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-semibold text-[#dfe1e5]">Font Size</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['12px', '14px', '16px', '18px'] as EditorFontSize[]).map((size) => (
                      <button
                        key={size}
                        onClick={() => updateSettings({ fontSize: size })}
                        className={`py-1.5 px-3 rounded-[4px] border font-mono text-center transition ${
                          settings.fontSize === size
                            ? 'border-[#3574f0] bg-[#1e1f22] text-[#3574f0] font-bold'
                            : 'border-[#393b40] bg-[#1e1f22]/60 text-[#868a91] hover:text-[#dfe1e5]'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ligaduras */}
                <div className="flex items-center justify-between p-3 rounded-[4px] border border-[#393b40] bg-[#1e1f22]/60 mt-3">
                  <div>
                    <div className="font-semibold text-xs text-[#dfe1e5]">Enable Font Ligatures</div>
                    <div className="text-[11px] text-[#868a91]">Combines operators like -&gt;, ==, !=</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableLigatures}
                    onChange={(e) => updateSettings({ enableLigatures: e.target.checked })}
                    className="w-4 h-4 accent-[#3574f0] rounded cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* SEÇÃO 3: EDITOR GENERAL */}
            {activeSection === 'general' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#dfe1e5]">General Editor Settings</h3>
                  <p className="text-[11px] text-[#868a91] mt-0.5">
                    Configure code wrap, minimap, and display preferences.
                  </p>
                </div>

                {/* Word Wrap */}
                <div className="flex items-center justify-between p-3 rounded-[4px] border border-[#393b40] bg-[#1e1f22]/60">
                  <div>
                    <div className="font-semibold text-xs text-[#dfe1e5]">Soft-Wrap (Line Wrapping)</div>
                    <div className="text-[11px] text-[#868a91]">Wrap long lines automatically without horizontal scrolling</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.editorLineWrapping}
                    onChange={(e) => updateSettings({ editorLineWrapping: e.target.checked })}
                    className="w-4 h-4 accent-[#3574f0] rounded cursor-pointer"
                  />
                </div>

                {/* Minimap */}
                <div className="flex items-center justify-between p-3 rounded-[4px] border border-[#393b40] bg-[#1e1f22]/60">
                  <div>
                    <div className="font-semibold text-xs text-[#dfe1e5]">Show Code Minimap</div>
                    <div className="text-[11px] text-[#868a91]">Display miniature code overview on the right edge</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showMinimap}
                    onChange={(e) => updateSettings({ showMinimap: e.target.checked })}
                    className="w-4 h-4 accent-[#3574f0] rounded cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* SEÇÃO 4: KEYMAP */}
            {activeSection === 'keymap' && (
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-[#dfe1e5]">Keymap</h3>
                  <p className="text-[11px] text-[#868a91] mt-0.5">
                    Default JetBrains keybindings supported in this environment.
                  </p>
                </div>

                <div className="border border-[#393b40] rounded-[4px] overflow-hidden bg-[#1e1f22]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#2b2d30] text-[#868a91] uppercase tracking-wider font-mono text-[10px] border-b border-[#393b40]">
                      <tr>
                        <th className="py-2 px-3 font-semibold">Action</th>
                        <th className="py-2 px-3 font-semibold text-right">Shortcut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#393b40]/50 text-[#dfe1e5]">
                      <tr className="hover:bg-[#35373c]/50">
                        <td className="py-2 px-3">Run Program</td>
                        <td className="py-2 px-3 text-right font-mono text-[#868a91]">F9 / Ctrl+Enter</td>
                      </tr>
                      <tr className="hover:bg-[#35373c]/50">
                        <td className="py-2 px-3">Reformat Code</td>
                        <td className="py-2 px-3 text-right font-mono text-[#868a91]">Shift+Alt+F / Ctrl+Alt+L</td>
                      </tr>
                      <tr className="hover:bg-[#35373c]/50">
                        <td className="py-2 px-3">Search Everywhere</td>
                        <td className="py-2 px-3 text-right font-mono text-[#868a91]">Double Shift / Ctrl+K</td>
                      </tr>
                      <tr className="hover:bg-[#35373c]/50">
                        <td className="py-2 px-3">Toggle Project Window</td>
                        <td className="py-2 px-3 text-right font-mono text-[#868a91]">Alt+1</td>
                      </tr>
                      <tr className="hover:bg-[#35373c]/50">
                        <td className="py-2 px-3">Toggle Run / Terminal</td>
                        <td className="py-2 px-3 text-right font-mono text-[#868a91]">Alt+4</td>
                      </tr>
                      <tr className="hover:bg-[#35373c]/50">
                        <td className="py-2 px-3">Toggle Problems</td>
                        <td className="py-2 px-3 text-right font-mono text-[#868a91]">Alt+6</td>
                      </tr>
                      <tr className="hover:bg-[#35373c]/50">
                        <td className="py-2 px-3">Clear Console</td>
                        <td className="py-2 px-3 text-right font-mono text-[#868a91]">Ctrl+L</td>
                      </tr>
                      <tr className="hover:bg-[#35373c]/50">
                        <td className="py-2 px-3">Open Settings</td>
                        <td className="py-2 px-3 text-right font-mono text-[#868a91]">Ctrl+,</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. Rodapé Estilo JetBrains: Botões OK / Cancel / Apply */}
        <div className="h-11 px-4 bg-[#2b2d30] border-t border-[#393b40] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-[#868a91]">
            Arceus Web IDE • JetBrains Edition
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1 rounded-[4px] bg-[#393b40] hover:bg-[#43454a] text-[#dfe1e5] transition font-medium text-xs"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1 rounded-[4px] bg-[#3574f0] hover:bg-[#3064d0] text-white transition font-medium text-xs shadow-sm"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
