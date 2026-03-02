import { useState } from 'react';
import { DAYS, type DayId } from '../../constants';
import { TIME_SLOTS } from '../../constants/days';
import { useEntries } from '../../hooks';
import { TimetableEntry } from './TimetableEntry';
import { formatTime12Hour } from '../../utils/timeUtils';

interface TimetableGridProps {
  onCellClick?: (day: DayId, time: string) => void;
  zoom?: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
}

export function TimetableGrid({ onCellClick, zoom = 100, onZoomIn, onZoomOut }: TimetableGridProps) {
  const { entries, updateEntry } = useEntries();
  const [dragOverCell, setDragOverCell] = useState<string | null>(null);

  const handleDrop = (e: React.DragEvent, dayId: DayId, time: string) => {
    e.preventDefault();
    setDragOverCell(null);
    try {
      const data = e.dataTransfer.getData('application/json');
      if (!data) return;
      
      const entry = JSON.parse(data);
      updateEntry(entry.id, { day: dayId, startTime: time });
    } catch (err) {
      console.error('Drop error:', err);
    }
  };

  const handleDragOver = (e: React.DragEvent, dayId: DayId, time: string) => {
    e.preventDefault();
    setDragOverCell(`${dayId}-${time}`);
  };

  const handleDragLeave = () => {
    setDragOverCell(null);
  };

  const handleCellClick = (dayId: DayId, time: string) => {
    if (onCellClick) {
      onCellClick(dayId, time);
    }
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}>
        {/* Header row with days - with zoom controls */}
        <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-[var(--border-color)]">
          {/* Zoom controls in first cell */}
          <div className="bg-[var(--bg-surface)] p-2 flex items-center justify-center gap-1">
            <button
              onClick={onZoomOut}
              className="w-6 h-6 bg-[var(--accent-primary)] text-white flex items-center justify-center cursor-pointer text-sm font-bold"
              style={{ borderRadius: 0 }}
              aria-label="Zoom out"
            >
              −
            </button>
            <button
              onClick={onZoomIn}
              className="w-6 h-6 bg-[var(--accent-primary)] text-white flex items-center justify-center cursor-pointer text-sm font-bold"
              style={{ borderRadius: 0 }}
              aria-label="Zoom in"
            >
              +
            </button>
          </div>
          {DAYS.map(day => (
            <div key={day.id} className="bg-[var(--bg-surface)] p-3 text-center font-medium border-r border-[var(--border-color)] last:border-r-0">
              {day.short}
            </div>
          ))}
        </div>

        {/* Time grid rows */}
        {TIME_SLOTS.map((time) => (
          <div key={time} className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-[var(--border-color)]">
            {/* Time column */}
            <div className="bg-[var(--bg-surface)] p-2 text-xs text-[var(--text-secondary)] text-right pr-3 border-r border-[var(--border-color)] flex items-center justify-end">
              {formatTime12Hour(time)}
            </div>
            
              {/* Day cells */}
            {DAYS.map(day => {
              const entry = entries.find(
                e => e.day === day.id && e.startTime === time
              );
              const cellId = `${day.id}-${time}`;
              const isDragOver = dragOverCell === cellId;
              
              return (
                <div 
                  key={cellId} 
                  className={`bg-[var(--bg-primary)] min-h-[50px] p-0 relative border-r border-[var(--border-color)] last:border-r-0 cursor-pointer hover:bg-[var(--bg-elevated)] transition-colors ${
                    isDragOver ? 'border-4 border-solid border-[var(--accent-primary)] bg-[var(--bg-elevated)]' : ''
                  }`}
                  data-day={day.id}
                  data-time={time}
                  onDragOver={(e) => handleDragOver(e, day.id, time)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, day.id, time)}
                  onClick={() => handleCellClick(day.id, time)}
                >
                  {entry && (
                    <TimetableEntry entry={entry} />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
