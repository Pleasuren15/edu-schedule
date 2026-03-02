import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DayId } from '../constants';

export interface Entry {
  id: string;
  subject: string;
  day: DayId;
  startTime: string;
  endTime: string;
  color: string;
}

interface EntriesState {
  entries: Entry[];
  addEntry: (entry: Omit<Entry, 'id'>) => void;
  updateEntry: (id: string, entry: Partial<Omit<Entry, 'id'>>) => void;
  deleteEntry: (id: string) => void;
  clearAll: () => void;
  loadEntries: (entries: Entry[]) => void;
}

export const useEntriesStore = create<EntriesState>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: (entry) =>
        set((state) => ({
          entries: [
            ...state.entries,
            { ...entry, id: crypto.randomUUID() },
          ],
        })),
      updateEntry: (id, updatedEntry) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === id ? { ...e, ...updatedEntry } : e
          ),
        })),
      deleteEntry: (id) =>
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
        })),
      clearAll: () => set({ entries: [] }),
      loadEntries: (entries) => set({ entries }),
    }),
    {
      name: 'timegrid-entries',
    }
  )
);

interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
    }),
    {
      name: 'timegrid-theme',
    }
  )
);

interface NotificationState {
  message: string | null;
  type: 'success' | 'error' | 'info';
  show: (message: string, type?: 'success' | 'error' | 'info') => void;
  clear: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  message: null,
  type: 'info',
  show: (message, type = 'info') => set({ message, type }),
  clear: () => set({ message: null }),
}));
