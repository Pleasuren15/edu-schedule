import { useState, useEffect } from 'react';
import type { Entry } from '../../store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { DAYS, type DayId } from '../../constants';
import { TIME_SLOTS } from '../../constants/days';
import { PRESET_COLORS } from '../../constants/colors';
import { SUBJECT_CATEGORIES } from '../../constants/subjects';
import { formatTime12Hour } from '../../utils/timeUtils';
import { Button } from '../ui/button';
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

// Random color generator
const getRandomColor = () => PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];

export function MobileModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingEntry, 
  onCancelEdit: _onCancelEdit,
  preselectedDay = '',
  preselectedStartTime = ''
}: MobileModalProps) {
  const [subject, setSubject] = useState(editingEntry?.subject || '');
  const [day, setDay] = useState<string>(editingEntry?.day || preselectedDay);
  const [startTime, setStartTime] = useState(editingEntry?.startTime || preselectedStartTime);
  const [endTime, setEndTime] = useState(editingEntry?.endTime || '');
  const [color, setColor] = useState(editingEntry?.color || '');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Reset form when modal opens with new preselected values
  useEffect(() => {
    if (isOpen) {
      setDay(preselectedDay);
      setStartTime(preselectedStartTime);
    }
  }, [isOpen, preselectedDay, preselectedStartTime]);

  // Set random color if no color is selected
  useEffect(() => {
    if (!color && isOpen) {
      setColor(getRandomColor());
    }
  }, [isOpen, color]);

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
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setSubject('');
    setDay('');
    setStartTime('');
    setEndTime('');
    setColor(PRESET_COLORS[0]);
  };

  const handleClose = () => {
    if (subject || day || startTime || endTime) {
      setShowCancelConfirm(true);
    } else {
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
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="bg-[var(--bg-surface)]" style={{ borderRadius: 0, maxHeight: '90vh', overflowY: 'auto' }}>
          <DialogHeader>
            <DialogTitle>
              {editingEntry ? 'Edit Entry' : 'Add Entry'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="subject-mobile" className="text-sm font-medium">Subject</label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="w-full" style={{ borderRadius: 0 }}>
                  <SelectValue placeholder="Enter or select subject" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--bg-surface)] border border-[var(--border-color)] max-h-[200px]">
                  {SUBJECT_CATEGORIES.map(category => (
                    <div key={category.category}>
                      <div className="px-2 py-1 text-xs font-semibold text-[var(--text-secondary)] bg-[var(--bg-elevated)]">
                        {category.category}
                      </div>
                      {category.subjects.map(subj => (
                        <SelectItem key={subj} value={subj} className="cursor-pointer">{subj}</SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="day-mobile" className="text-sm font-medium">Day</label>
              <Select value={day} onValueChange={setDay} required>
                <SelectTrigger className="w-full" style={{ borderRadius: 0 }}>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--bg-surface)] border border-[var(--border-color)]">
                  {DAYS.map(d => (
                    <SelectItem key={d.id} value={d.id} className="cursor-pointer">{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Time</label>
                <Select value={startTime} onValueChange={handleStartTimeChange} required>
                  <SelectTrigger style={{ borderRadius: 0 }}>
                    <SelectValue placeholder="Start" />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--bg-surface)] border border-[var(--border-color)] max-h-[200px]">
                    {TIME_SLOTS.map(time => (
                      <SelectItem key={time} value={time} className="cursor-pointer">{formatTime12Hour(time)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Time</label>
                <Select value={endTime} onValueChange={setEndTime} required>
                  <SelectTrigger style={{ borderRadius: 0 }}>
                    <SelectValue placeholder="End" />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--bg-surface)] border border-[var(--border-color)] max-h-[200px]">
                    {TIME_SLOTS.map(time => (
                      <SelectItem key={time} value={time} className="cursor-pointer">{formatTime12Hour(time)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Color</label>
              <div className="flex gap-2 flex-wrap">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 border-2 cursor-pointer ${color === c ? 'border-[var(--text-primary)]' : 'border-transparent'}`}
                    style={{ backgroundColor: c, borderRadius: '50%' }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1 bg-[var(--accent-primary)] cursor-pointer" style={{ borderRadius: 0 }}>
                {editingEntry ? 'Update' : 'Add Entry'}
              </Button>
              <Button type="button" variant="outline" onClick={handleClose} className="cursor-pointer" style={{ borderRadius: 0 }}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <DialogContent style={{ borderRadius: 0, backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 50 }} />
          <div style={{ position: 'relative', zIndex: 51 }}>
            <DialogHeader>
              <DialogTitle>Discard Changes?</DialogTitle>
              <p className="text-sm text-[var(--text-secondary)]">
                Are you sure you want to close? Your changes will be lost.
              </p>
            </DialogHeader>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowCancelConfirm(false)} className="cursor-pointer" style={{ borderRadius: 0 }}>
                Keep Editing
              </Button>
              <Button onClick={confirmCancel} className="bg-[var(--accent-primary)] cursor-pointer" style={{ borderRadius: 0 }}>
                Discard
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent style={{ borderRadius: 0, backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 50 }} />
          <div style={{ position: 'relative', zIndex: 51 }}>
            <DialogHeader>
              <DialogTitle>Validation Error</DialogTitle>
              <p className="text-sm text-[var(--text-secondary)]">
                {errorMessage}
              </p>
            </DialogHeader>
            <div className="flex justify-end">
              <Button onClick={() => setShowErrorDialog(false)} className="bg-[var(--accent-primary)] cursor-pointer" style={{ borderRadius: 0 }}>
                OK
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
