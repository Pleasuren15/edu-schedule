import { DAYS, type DayId } from '../../constants';
import { TIME_SLOTS } from '../../constants/days';
import { PRESET_COLORS } from '../../constants/colors';
import { SUBJECT_CATEGORIES } from '../../constants/subjects';
import { formatTime12Hour } from '../../utils/timeUtils';
import type { Entry } from '../../store';
import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

// Random color generator
const getRandomColor = () => PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];

interface EntryFormProps {
  onSubmit: (entry: Omit<Entry, 'id'>) => void;
  editingEntry: Entry | null;
  onCancelEdit: () => void;
  preselectedDay?: string;
  preselectedStartTime?: string;
}

export function EntryForm({ onSubmit, editingEntry, onCancelEdit, preselectedDay, preselectedStartTime }: EntryFormProps) {
  const [subject, setSubject] = useState(editingEntry?.subject || '');
  const [day, setDay] = useState(editingEntry?.day || '');
  const [startTime, setStartTime] = useState(editingEntry?.startTime || '');
  const [endTime, setEndTime] = useState(editingEntry?.endTime || '');
  const [color, setColor] = useState(editingEntry?.color || getRandomColor());
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Sync form fields whenever the entry being edited or preselection changes
  useEffect(() => {
    if (editingEntry) {
      setSubject(editingEntry.subject);
      setDay(editingEntry.day);
      setStartTime(editingEntry.startTime);
      setEndTime(editingEntry.endTime);
      setColor(editingEntry.color);
    } else {
      setSubject('');
      setDay(preselectedDay || '');
      setStartTime(preselectedStartTime || '');
      // Auto-set end time to one hour after preselected start
      if (preselectedStartTime) {
        const hour = parseInt(preselectedStartTime.split(':')[0]);
        const nextHour = (hour + 1).toString().padStart(2, '0');
        setEndTime(`${nextHour}:00`);
      } else {
        setEndTime('');
      }
      setColor(getRandomColor());
    }
    setShowColorPicker(false);
  }, [editingEntry, preselectedDay, preselectedStartTime]);

  // Auto-set end time to next hour when start time changes
  const handleStartTimeChange = (value: string) => {
    setStartTime(value);
    if (value) {
      const hour = parseInt(value.split(':')[0]);
      const nextHour = (hour + 1).toString().padStart(2, '0');
      setEndTime(`${nextHour}:00`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate time: end time must be after start time
    if (startTime >= endTime) {
      setErrorMessage('End time must be after start time');
      setShowErrorDialog(true);
      return;
    }
    
    if (!subject || !day || !startTime || !endTime) {
      setErrorMessage('Please fill in all fields');
      setShowErrorDialog(true);
      return;
    }
    
    const entry = {
      subject,
      day: day as DayId,
      startTime,
      endTime,
      color,
    };
    
    onSubmit(entry);
    
    // Reset form if not editing
    if (!editingEntry) {
      setSubject('');
      setDay('');
      setStartTime('');
      setEndTime('');
      setColor(getRandomColor());
    }
  };

  const handleCancelClick = () => {
    if (subject || day || startTime || endTime) {
      setShowCancelConfirm(true);
    } else {
      onCancelEdit();
    }
  };

  const confirmCancel = () => {
    setShowCancelConfirm(false);
    onCancelEdit();
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-3 lg:space-y-4">
        <div className="space-y-2">
          <label htmlFor="subject" className="text-sm font-medium">
            Subject
          </label>
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Enter or select subject" />
            </SelectTrigger>
            <SelectContent className="bg-[var(--bg-surface)] border border-[var(--border-color)] max-h-[300px]">
              {SUBJECT_CATEGORIES.map(category => (
                <div key={category.category}>
                  <div className="px-2 py-1 text-xs font-semibold text-[var(--text-secondary)] bg-[var(--bg-elevated)]">
                    {category.category}
                  </div>
                  {category.subjects.map(subj => (
                    <SelectItem key={subj} value={subj} className="cursor-pointer focus:bg-[var(--bg-elevated)]">
                      {subj}
                    </SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="day" className="text-sm font-medium">
            Day
          </label>
          <Select value={day} onValueChange={setDay} required>
            <SelectTrigger className="w-full" style={{ borderRadius: 0 }}>
              <SelectValue placeholder="Select day" />
            </SelectTrigger>
            <SelectContent className="bg-[var(--bg-surface)] border border-[var(--border-color)]">
              {DAYS.map(d => (
                <SelectItem key={d.id} value={d.id} className="cursor-pointer focus:bg-[var(--bg-elevated)]">{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label htmlFor="startTime" className="text-sm font-medium">
              Start Time
            </label>
            <Select value={startTime} onValueChange={handleStartTimeChange} required>
              <SelectTrigger className="w-full" style={{ borderRadius: 0 }}>
                <SelectValue placeholder="Start" />
              </SelectTrigger>
              <SelectContent className="bg-[var(--bg-surface)] border border-[var(--border-color)] max-h-[200px]">
                {TIME_SLOTS.map(time => (
                  <SelectItem key={time} value={time} className="cursor-pointer focus:bg-[var(--bg-elevated)]">{formatTime12Hour(time)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="endTime" className="text-sm font-medium">
              End Time
            </label>
            <Select value={endTime} onValueChange={setEndTime} required>
              <SelectTrigger className="w-full" style={{ borderRadius: 0 }}>
                <SelectValue placeholder="End" />
              </SelectTrigger>
              <SelectContent className="bg-[var(--bg-surface)] border border-[var(--border-color)] max-h-[200px]">
                {TIME_SLOTS.map(time => (
                  <SelectItem key={time} value={time} className="cursor-pointer focus:bg-[var(--bg-elevated)]">{formatTime12Hour(time)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Color</label>
          <div className="flex items-center gap-3 flex-wrap">
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-8 h-8 border-2 transition-transform hover:scale-110 cursor-pointer ${
                  color === c ? 'border-[var(--text-primary)] scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: c, borderRadius: '50%' }}
              />
            ))}
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className={`w-8 h-8 border-2 transition-transform hover:scale-110 cursor-pointer flex items-center justify-center text-xs ${
                !PRESET_COLORS.includes(color as any) ? 'border-[var(--text-primary)] scale-110' : 'border-dashed border-[var(--text-secondary)]'
              }`}
              style={{ backgroundColor: PRESET_COLORS.includes(color as any) ? '' : color, borderRadius: '50%' }}
            >
              {!PRESET_COLORS.includes(color as any) ? '✓' : '+'}
            </button>
          </div>
          
          {showColorPicker && (
            <div className="mt-3 p-3 bg-[var(--bg-elevated)] border border-[var(--border-color)]">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-10 cursor-pointer"
                style={{ borderRadius: 0 }}
              />
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#000000"
                  className="flex-1 px-2 py-1 text-sm bg-[var(--bg-primary)] border border-[var(--border-color)]"
                  style={{ borderRadius: 0 }}
                />
                <button
                  type="button"
                  onClick={() => setShowColorPicker(false)}
                  className="px-3 py-1 text-sm bg-[var(--accent-primary)] text-white cursor-pointer"
                  style={{ borderRadius: 0 }}
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="submit" className="flex-1 bg-[var(--accent-primary)] hover:opacity-90 cursor-pointer" style={{ borderRadius: 0 }}>
            {editingEntry ? 'Update Entry' : 'Add Entry'}
          </Button>
          
          {editingEntry && (
            <Button type="button" variant="outline" onClick={handleCancelClick} className="cursor-pointer" style={{ borderRadius: 0 }}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <DialogContent style={{ borderRadius: 0 }}>
          <DialogHeader>
            <DialogTitle>Cancel Editing?</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel? Your changes will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelConfirm(false)} className="cursor-pointer" style={{ borderRadius: 0 }}>
              Keep Editing
            </Button>
            <Button onClick={confirmCancel} className="bg-[var(--accent-primary)] cursor-pointer" style={{ borderRadius: 0 }}>
              Cancel Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent style={{ borderRadius: 0, backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 50 }} />
          <div style={{ position: 'relative', zIndex: 51 }}>
            <DialogHeader>
              <DialogTitle>Validation Error</DialogTitle>
              <DialogDescription>
                {errorMessage}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setShowErrorDialog(false)} className="bg-[var(--accent-primary)] cursor-pointer" style={{ borderRadius: 0 }}>
                OK
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
