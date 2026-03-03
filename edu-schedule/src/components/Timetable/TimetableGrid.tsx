import { useState, useRef } from 'react';
import { Trash2 } from 'lucide-react';
import { DAYS, type DayId } from '../../constants';
import { TIME_SLOTS } from '../../constants/days';
import { useEntries } from '../../hooks';
import { formatTime12Hour } from '../../utils/timeUtils';

interface TimetableGridProps {
  onCellClick?: (day: DayId, time: string) => void;
  zoom?: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
}

interface DragShadow {
  subject: string;
  startTime: string;
  endTime: string;
  color: string;
  rowSpan: number;
}

// Calculate how many hours an entry spans
const getDurationSlots = (startTime: string, endTime: string): number => {
  const startHour = parseInt(startTime.split(':')[0]);
  const endHour = parseInt(endTime.split(':')[0]);
  return Math.max(1, endHour - startHour);
};

export function TimetableGrid({ onCellClick, zoom = 100, onZoomIn, onZoomOut }: TimetableGridProps) {
  const { entries, updateEntry, deleteEntry } = useEntries();
  const [dragOverCell, setDragOverCell] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isOverBin, setIsOverBin] = useState(false);
  const [dragShadow, setDragShadow] = useState<DragShadow | null>(null);
  const [shadowPos, setShadowPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // onDrag fires continuously during a native drag with live clientX/clientY.
  // Filter out the terminal event where the browser fires (0, 0) on release.
  const handleDrag = (e: React.DragEvent) => {
    if (e.clientX === 0 && e.clientY === 0) return;
    setShadowPos({ x: e.clientX, y: e.clientY });
  };

  const handleDrop = (e: React.DragEvent, dayId: DayId, time: string) => {
    e.preventDefault();
    setDragOverCell(null);
    setIsDragging(false);
    setDragShadow(null);
    try {
      const data = e.dataTransfer.getData('application/json');
      if (!data) return;

      const entry = JSON.parse(data);

      // Preserve the original duration when moving to a new slot
      const originalStartIdx = TIME_SLOTS.indexOf(entry.startTime);
      const originalEndIdx = TIME_SLOTS.indexOf(entry.endTime);
      const duration = Math.max(1, originalEndIdx - originalStartIdx);

      const newStartIdx = TIME_SLOTS.indexOf(time as typeof TIME_SLOTS[number]);
      const newEndIdx = Math.min(newStartIdx + duration, TIME_SLOTS.length - 1);
      const newEndTime = TIME_SLOTS[newEndIdx];

      updateEntry(entry.id, { day: dayId, startTime: time, endTime: newEndTime });
    } catch (err) {
      console.error('Drop error:', err);
    }
  };

  const handleBinDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOverBin(false);
    setIsDragging(false);
    setDragShadow(null);
    try {
      const data = e.dataTransfer.getData('application/json');
      if (!data) return;
      const entry = JSON.parse(data);
      deleteEntry(entry.id);
    } catch (err) {
      console.error('Bin drop error:', err);
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

  // Calculate row span for entries
  const getEntryRowSpan = (entry: typeof entries[0]): number => {
    return getDurationSlots(entry.startTime, entry.endTime);
  };

  const CELL_HEIGHT = 50;
  const ROWS = TIME_SLOTS.length;

  return (
    <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
      <div className="min-w-[700px] md:min-w-auto">        {/* Header row */}
        <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-[var(--border-color)]">
          <div className="bg-[var(--bg-surface)] p-2 flex items-center justify-center">
            <div className="flex items-center gap-1">
              <button
                onClick={onZoomOut}
                className="w-6 h-6 bg-[var(--accent-primary)] text-white flex items-center justify-center cursor-pointer text-sm font-bold"
                style={{ borderRadius: 0 }}
                aria-label="Zoom out"
              >
                −
              </button>
              <span className="text-xs w-8 text-center text-[var(--text-secondary)]">{zoom}%</span>
              <button
                onClick={onZoomIn}
                className="w-6 h-6 bg-[var(--accent-primary)] text-white flex items-center justify-center cursor-pointer text-sm font-bold"
                style={{ borderRadius: 0 }}
                aria-label="Zoom in"
              >
                +
              </button>
            </div>
          </div>
          {DAYS.map(day => (
            <div key={day.id} className="bg-[var(--bg-surface)] p-3 text-center font-medium border-r border-[var(--border-color)] last:border-r-0 text-sm">
              {day.short}
            </div>
          ))}
        </div>

        {/* Time grid - using grid with row spans for entries */}
        <div 
          ref={containerRef}
          className="grid" 
          style={{ 
            gridTemplateColumns: `80px repeat(7, 1fr)`,
            gridTemplateRows: `repeat(${ROWS}, ${CELL_HEIGHT}px)`,
          }}
        >
          {/* Time labels in first column — each pinned to its own row */}
          {TIME_SLOTS.map((time, timeIndex) => (
            <div
              key={`time-${time}`}
              className="bg-[var(--bg-surface)] p-2 text-xs text-[var(--text-secondary)] text-right pr-3 border-r border-b border-[var(--border-color)] flex items-center justify-end"
              style={{ gridColumn: 1, gridRow: timeIndex + 1 }}
            >
              {formatTime12Hour(time)}
            </div>
          ))}

          {/* Day cells — each pinned to its explicit column and row */}
          {TIME_SLOTS.map((time, timeIndex) => (
            DAYS.map((day, dayIndex) => {
              const cellId = `${day.id}-${time}`;
              const entry = entries.find(e => e.day === day.id && e.startTime === time);
              const isDragOver = dragOverCell === cellId;
              const col = dayIndex + 2; // column 1 is time labels
              const row = timeIndex + 1;

              // Check if this cell is the start of an entry
              if (entry && entry.startTime === time) {
                const rowSpan = getEntryRowSpan(entry);
                return (
                  <div
                    key={cellId}
                    className={`border-r border-b border-[var(--border-color)] cursor-grab active:cursor-grabbing transition-opacity ${
                      isDragOver ? 'border-4 border-solid border-[var(--accent-primary)]' : ''
                    } ${isDragging && dragShadow?.subject === entry.subject ? 'opacity-40' : ''}`}
                    style={{
                      gridColumn: col,
                      gridRow: `${row} / span ${rowSpan}`,
                      backgroundColor: entry.color,
                    }}
                    onDragOver={(e) => handleDragOver(e, day.id, time)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, day.id, time)}
                    onClick={() => handleCellClick(day.id, time)}
                    draggable
                    onDragStart={(e) => {
                      // Hide the native ghost image
                      const ghost = document.createElement('div');
                      ghost.style.position = 'absolute';
                      ghost.style.top = '-9999px';
                      document.body.appendChild(ghost);
                      e.dataTransfer.setDragImage(ghost, 0, 0);
                      setTimeout(() => document.body.removeChild(ghost), 0);

                      e.dataTransfer.setData('application/json', JSON.stringify(entry));
                      e.dataTransfer.effectAllowed = 'move';
                      setShadowPos({ x: e.clientX, y: e.clientY });
                      setDragShadow({
                        subject: entry.subject,
                        startTime: entry.startTime,
                        endTime: entry.endTime,
                        color: entry.color,
                        rowSpan,
                      });
                      setIsDragging(true);
                    }}
                    onDrag={handleDrag}
                    onDragEnd={() => {
                      setIsDragging(false);
                      setIsOverBin(false);
                      setDragShadow(null);
                    }}
                  >
                    <div className="p-2 text-white text-xs font-medium h-full flex flex-col justify-center">
                      <div className="font-semibold truncate">{entry.subject}</div>
                      <div className="opacity-80">{entry.startTime} - {entry.endTime}</div>
                    </div>
                  </div>
                );
              }

              // Skip cells covered by multi-hour entries
              const coveredByEntry = entries.some(e => {
                const startIdx = TIME_SLOTS.indexOf(e.startTime as any);
                const endIdx = TIME_SLOTS.indexOf(e.endTime as any);
                return e.day === day.id && timeIndex > startIdx && timeIndex < endIdx;
              });

              if (coveredByEntry) {
                return <div key={cellId} style={{ gridColumn: col, gridRow: row }} />;
              }

              return (
                <div
                  key={cellId}
                  className={`bg-[var(--bg-primary)] border-r border-b border-[var(--border-color)] cursor-pointer hover:bg-[var(--bg-elevated)] transition-colors ${
                    isDragOver ? 'border-4 border-solid border-[var(--accent-primary)]' : ''
                  }`}
                  style={{ gridColumn: col, gridRow: row }}
                  onDragOver={(e) => handleDragOver(e, day.id, time)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, day.id, time)}
                  onClick={() => handleCellClick(day.id, time)}
                />
              );
            })
          ))}
        </div>
      </div>

      {/* Delete bin — always visible, lights up when dragging over */}
      <div
        className={`mt-3 flex items-center justify-center gap-3 border-2 border-dashed transition-all duration-150 select-none ${
          isDragging && isOverBin
            ? 'border-red-500 bg-red-500/20 text-red-400 cursor-copy'
            : isDragging
            ? 'border-red-400/60 bg-red-500/10 text-red-400/70 cursor-copy'
            : 'border-[var(--border-color)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] cursor-default'
        }`}
        style={{ height: 56 }}
        onDragOver={(e) => { e.preventDefault(); setIsOverBin(true); }}
        onDragLeave={() => setIsOverBin(false)}
        onDrop={handleBinDrop}
      >
        <Trash2 size={20} />
        <span className="text-sm font-medium">Drop here to delete</span>
      </div>

      {/* Custom drag shadow — follows the cursor */}
      {isDragging && dragShadow && (
        <div
          className="fixed pointer-events-none z-50 rounded shadow-2xl opacity-90"
          style={{
            left: shadowPos.x + 12,
            top: shadowPos.y + 12,
            width: 140,
            height: dragShadow.rowSpan * CELL_HEIGHT - 4,
            backgroundColor: dragShadow.color,
            boxShadow: `0 8px 32px 0 ${dragShadow.color}99, 0 2px 8px rgba(0,0,0,0.4)`,
            transform: 'rotate(2deg) scale(1.04)',
            transition: 'box-shadow 0.1s',
          }}
        >
          <div className="p-2 text-white text-xs font-medium h-full flex flex-col justify-center">
            <div className="font-semibold truncate">{dragShadow.subject}</div>
            <div className="opacity-80">{dragShadow.startTime} - {dragShadow.endTime}</div>
          </div>
        </div>
      )}
    </div>
  );
}
