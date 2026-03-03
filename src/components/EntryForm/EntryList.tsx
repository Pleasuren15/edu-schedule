import { useState } from 'react';
import { useEntries } from '../../hooks';
import { DAYS } from '../../constants';
import { formatTime12Hour } from '../../utils/timeUtils';
import type { Entry } from '../../store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';

interface EntryListProps {
  onEdit: (entry: Entry) => void;
}

export function EntryList({ onEdit }: EntryListProps) {
  const { entries, deleteEntry, clearAll } = useEntries();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClearAll = () => {
    clearAll();
    setShowClearConfirm(false);
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-10 text-[var(--text-secondary)] text-base leading-relaxed">
        No entries yet.<br />Add your first schedule entry!
      </div>
    );
  }

  return (
    <div className="space-y-2 lg:space-y-3">
      <div className="flex justify-between items-center mb-3 lg:mb-4">
        <h3 className="font-semibold text-base lg:text-lg">Entries ({entries.length})</h3>
        {entries.length > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="text-sm text-[var(--error-color)] hover:underline cursor-pointer py-1 px-2"
            style={{ minHeight: 36 }}
          >
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-2 max-h-[240px] md:max-h-[300px] overflow-y-auto">
        {entries.map(entry => {
          const day = DAYS.find(d => d.id === entry.day);
          return (
            <div
              key={entry.id}
              className="flex items-center gap-3 p-3 bg-[var(--bg-elevated)] border border-[var(--border-color)]"
            >
              <div
                className="w-3 h-10 flex-shrink-0"
                style={{ backgroundColor: entry.color }}
              />

              <div className="flex-1 min-w-0">
                <div className="font-medium text-base truncate leading-snug">{entry.subject}</div>
                <div className="text-sm text-[var(--text-secondary)] mt-0.5">
                  {day?.name} • {formatTime12Hour(entry.startTime)} - {formatTime12Hour(entry.endTime)}
                </div>
              </div>

              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => onEdit(entry)}
                  className="hover:bg-[var(--bg-primary)] transition-colors flex items-center justify-center"
                  aria-label="Edit"
                  style={{ minWidth: 44, minHeight: 44 }}
                >
                  <img src="https://img.icons8.com/ios-filled/20/202020/pencil.png" alt="Edit" className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteEntry(entry.id)}
                  className="hover:bg-[var(--bg-primary)] transition-colors flex items-center justify-center text-[var(--error-color)]"
                  aria-label="Delete"
                  style={{ minWidth: 44, minHeight: 44 }}
                >
                  <img src="https://img.icons8.com/ios-filled/20/ef4444/trash.png" alt="Delete" className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Clear All Confirmation Dialog */}
      <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <DialogContent style={{ borderRadius: 0, backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 50 }} />
          <div style={{ position: 'relative', zIndex: 51 }}>
            <DialogHeader>
              <DialogTitle>Clear All Entries</DialogTitle>
              <DialogDescription>
                Are you sure you want to clear all entries? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowClearConfirm(false)}
                className="cursor-pointer"
                style={{ borderRadius: 0 }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleClearAll}
                className="cursor-pointer bg-[var(--error-color)]"
                style={{ borderRadius: 0 }}
              >
                Clear All
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
