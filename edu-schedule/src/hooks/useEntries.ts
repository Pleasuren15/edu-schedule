import { useEntriesStore } from '../store';

export function useEntries() {
  const {
    entries,
    addEntry,
    updateEntry,
    deleteEntry,
    clearAll,
    loadEntries,
  } = useEntriesStore();

  return {
    entries,
    addEntry,
    updateEntry,
    deleteEntry,
    clearAll,
    loadEntries,
  };
}
