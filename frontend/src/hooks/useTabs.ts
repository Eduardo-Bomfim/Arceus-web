import { useState, useEffect, useCallback } from 'react';

export type TabType = 'console' | 'problems' | 'ast' | 'symbols' | 'tokens' | 'cfg';

const VALID_TABS: Set<TabType> = new Set(['console', 'problems', 'ast', 'symbols', 'tokens', 'cfg']);

function getTabFromHash(): TabType {
  try {
    const rawHash = window.location.hash.replace(/^#\/?/, '').split('&')[0];
    if (VALID_TABS.has(rawHash as TabType)) {
      return rawHash as TabType;
    }
  } catch {
    // ignore
  }
  return 'console';
}

export function useTabs(defaultTab: TabType = 'console') {
  const [activeTab, setActiveTabState] = useState<TabType>(() => {
    const fromHash = getTabFromHash();
    return fromHash || defaultTab;
  });

  const setActiveTab = useCallback((tab: TabType) => {
    setActiveTabState(tab);
    try {
      // Preserva outros parâmetros do hash (como code=...) caso existam
      const currentHash = window.location.hash.replace(/^#\/?/, '');
      const codePart = currentHash.includes('code=')
        ? currentHash.substring(currentHash.indexOf('code='))
        : '';

      const newHash = codePart ? `${tab}&${codePart}` : tab;
      window.history.replaceState(null, '', `#${newHash}`);
    } catch {
      // ignore
    }
  }, []);

  // Sincroniza caso o hash da URL mude via navegação
  useEffect(() => {
    const handleHashChange = () => {
      const tab = getTabFromHash();
      setActiveTabState(tab);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return { activeTab, setActiveTab };
}
