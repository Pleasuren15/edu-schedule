import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Entry } from '../../store';
import { DAYS, type DayId } from '../../constants';
import { TIME_SLOTS } from '../../constants/days';
import { PRESET_COLORS } from '../../constants/colors';
import { SUBJECT_CATEGORIES } from '../../constants/subjects';
import { formatTime12Hour } from '../../utils/timeUtils';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (entry: Omit<Entry, 'id'>) => void;
  editingEntry: Entry | null;
  onCancelEdit: () => void;
  preselectedDay?: DayId | '';
  preselectedStartTime?: string;
}

const getRandomColor = () => PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];

export function MobileModal({
  isOpen,
  onClose,
  onSubmit,
  editingEntry,
  onCancelEdit: _onCancelEdit,
  preselectedDay = '',
  preselectedStartTime = '',
}: MobileModalProps) {
  const [subject, setSubject] = useState('');
  const [day, setDay] = useState<string>('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [color, setColor] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Sync form whenever modal opens or editing entry changes
  useEffect(() => {
    if (!isOpen) return;
    if (editingEntry) {
      setSubject(editingEntry.subject);
      setDay(editingEntry.day);
      setStartTime(editingEntry.startTime);
      setEndTime(editingEntry.endTime);
      setColor(editingEntry.color);
    } else {
      setSubject('');
      setDay(preselectedDay);
      setStartTime(preselectedStartTime);
      if (preselectedStartTime) {
        const hour = parseInt(preselectedStartTime.split(':')[0]);
        setEndTime(`${(hour + 1).toString().padStart(2, '0')}:00`);
      } else {
        setEndTime('');
      }
      setColor(getRandomColor());
    }
  }, [isOpen, editingEntry, preselectedDay, preselectedStartTime]);

  const handleStartTimeChange = (value: string) => {
    setStartTime(value);
    if (value) {
      const hour = parseInt(value.split(':')[0]);
      setEndTime(`${(hour + 1).toString().padStart(2, '0')}:00`);
    }
  };

  const resetForm = () => {
    setSubject('');
    setDay('');
    setStartTime('');
    setEndTime('');
    setColor(getRandomColor());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !day || !startTime || !endTime) {
      setErrorMessage('Please fill in all fields');
      setShowErrorDialog(true);
      return;
    }
    if (startTime >= endTime) {
      setErrorMessage('End time must be after start time');
      setShowErrorDialog(true);
      return;
    }
    onSubmit({ subject, day: day as DayId, startTime, endTime, color });
    resetForm();
    onClose();
  };

  const isDirty = !!(subject || (day && day !== preselectedDay) || startTime || endTime);

  const handleClose = () => {
    if (isDirty) {
      setShowCancelConfirm(true);
    } else {
      resetForm();
      onClose();
    }
  };

  const confirmCancel = () => {
    setShowCancelConfirm(false);
    resetForm();
    onClose();
  };

  return (
    <>
      {/* Main sheet */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:items-center md:justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={handleClose}
          />

          {/* Sheet — slides up on mobile, centered on desktop */}
          <div
            className="relative w-full md:max-w-lg bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-2xl flex flex-col"
            style={{
              borderRadius: 0,
              maxHeight: '92dvh',
            }}
          >
            {/* Handle bar (mobile only) */}
            <div className="md:hidden flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 bg-[var(--border-color)] rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-color)] shrink-0">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                {editingEntry ? 'Edit Entry' : 'Add Entry'}
              </h2>
              <button
                onClick={handleClose}
                className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                aria-label="Close"
                style={{ minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Scrollable form body */}
            <div className="overflow-y-auto flex-1 px-5 py-4">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Subject */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[var(--text-primary)]">Subject</label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger className="w-full h-11" style={{ borderRadius: 0 }}>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent className="bg-[var(--bg-surface)] border border-[var(--border-color)] max-h-52">
                      {SUBJECT_CATEGORIES.map(category => (
                        <div key={category.category}>
                          <div className="px-2 py-1 text-xs font-semibold text-[var(--text-secondary)] bg-[var(--bg-elevated)]">
                            {category.category}
                          </div>
                          {category.subjects.map(subj => (
                            <SelectItem key={subj} value={subj} className="cursor-pointer py-2.5">{subj}</SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Day */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[var(--text-primary)]">Day</label>
                  <Select value={day} onValueChange={setDay}>
                    <SelectTrigger className="w-full h-11" style={{ borderRadius: 0 }}>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent className="bg-[var(--bg-surface)] border border-[var(--border-color)]">
                      {DAYS.map(d => (
                        <SelectItem key={d.id} value={d.id} className="cursor-pointer py-2.5">{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Start + End time */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[var(--text-primary)]">Start</label>
                    <Select value={startTime} onValueChange={handleStartTimeChange}>
                      <SelectTrigger className="h-11" style={{ borderRadius: 0 }}>
                        <SelectValue placeholder="Start" />
                      </SelectTrigger>
                      <SelectContent className="bg-[var(--bg-surface)] border border-[var(--border-color)] max-h-52">
                        {TIME_SLOTS.map(t => (
                          <SelectItem key={t} value={t} className="cursor-pointer py-2.5">{formatTime12Hour(t)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[var(--text-primary)]">End</label>
                    <Select value={endTime} onValueChange={setEndTime}>
                      <SelectTrigger className="h-11" style={{ borderRadius: 0 }}>
                        <SelectValue placeholder="End" />
                      </SelectTrigger>
                      <SelectContent className="bg-[var(--bg-surface)] border border-[var(--border-color)] max-h-52">
                        {TIME_SLOTS.map(t => (
                          <SelectItem key={t} value={t} className="cursor-pointer py-2.5">{formatTime12Hour(t)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Color */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[var(--text-primary)]">Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {PRESET_COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`w-9 h-9 border-2 cursor-pointer transition-transform ${
                          color === c ? 'border-[var(--text-primary)] scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c, borderRadius: '50%' }}
                        aria-label={`Color ${c}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-1 pb-2">
                  <Button
                    type="submit"
                    className="flex-1 bg-[var(--accent-primary)] text-white cursor-pointer"
                    style={{ borderRadius: 0, minHeight: 48 }}
                  >
                    {editingEntry ? 'Update Entry' : 'Add Entry'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    className="cursor-pointer"
                    style={{ borderRadius: 0, minHeight: 48 }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Cancel confirmation */}
      <Dialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <DialogContent style={{ borderRadius: 0, backgroundColor: 'var(--bg-surface)' }}>
          <DialogHeader>
            <DialogTitle>Discard Changes?</DialogTitle>
            <p className="text-sm text-[var(--text-secondary)]">
              Are you sure you want to close? Your changes will be lost.
            </p>
          </DialogHeader>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setShowCancelConfirm(false)} className="cursor-pointer" style={{ borderRadius: 0, minHeight: 44 }}>
              Keep Editing
            </Button>
            <Button onClick={confirmCancel} className="bg-[var(--accent-primary)] cursor-pointer" style={{ borderRadius: 0, minHeight: 44 }}>
              Discard
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error dialog */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent style={{ borderRadius: 0, backgroundColor: 'var(--bg-surface)' }}>
          <DialogHeader>
            <DialogTitle>Validation Error</DialogTitle>
            <p className="text-sm text-[var(--text-secondary)]">{errorMessage}</p>
          </DialogHeader>
          <div className="flex justify-end pt-2">
            <Button onClick={() => setShowErrorDialog(false)} className="bg-[var(--accent-primary)] cursor-pointer" style={{ borderRadius: 0, minHeight: 44 }}>
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
