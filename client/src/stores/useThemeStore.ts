import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  resolvedTheme: 'dark' | 'light';
}

const applyThemeToDOM = (theme: ThemeMode): 'dark' | 'light' => {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');

  let activeTheme: 'dark' | 'light' = 'dark';
  if (theme === 'system') {
    activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  } else {
    activeTheme = theme;
  }

  root.classList.add(activeTheme);
  return activeTheme;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      resolvedTheme: 'dark',
      setTheme: (theme) => {
        const resolved = applyThemeToDOM(theme);
        set({ theme, resolvedTheme: resolved });
      },
      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        const resolved = applyThemeToDOM(next);
        set({ theme: next, resolvedTheme: resolved });
      },
    }),
    {
      name: 'khananow_theme_store',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyThemeToDOM(state.theme);
        }
      },
    }
  )
);
