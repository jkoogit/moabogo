import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark' | 'dawn' | 'system';

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark' | 'dawn';
  isDark: boolean;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  resolvedTheme: 'dark',
  isDark: true,
  setTheme: () => {},
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('moabogo_theme') as ThemeMode;
    return saved === 'light' || saved === 'dark' || saved === 'dawn' || saved === 'system'
      ? saved
      : 'dark';
  });

  const [systemIsDark, setSystemIsDark] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Determine active visual palette
  const resolvedTheme: 'light' | 'dark' | 'dawn' =
    theme === 'system' ? (systemIsDark ? 'dark' : 'light') : theme;

  // 야간(다크) 모드만 순수 다크로 취급 (여명 블루는 산뜻하고 시원한 별도 오션 블루 팔레트)
  const isDark = resolvedTheme === 'dark';

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    localStorage.setItem('moabogo_theme', mode);
  };

  const toggleTheme = () => {
    // Cycle: light -> dark -> dawn -> light
    const cycleMap: Record<ThemeMode, ThemeMode> = {
      light: 'dark',
      dark: 'dawn',
      dawn: 'light',
      system: 'dark',
    };
    setTheme(cycleMap[theme]);
  };

  // Sync classes and attributes on documentElement
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'dawn', 'theme-dark', 'theme-dawn', 'theme-light');
    root.classList.add(resolvedTheme);
    root.classList.add(`theme-${resolvedTheme}`);
    root.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, isDark, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
