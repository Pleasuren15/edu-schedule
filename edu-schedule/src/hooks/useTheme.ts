import { useEffect } from 'react';
import { useThemeStore } from '../store';

export function useTheme() {
  const { theme, toggleTheme } = useThemeStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return { theme, toggleTheme };
}
