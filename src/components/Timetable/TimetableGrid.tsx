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

const getDurationSlots = (startTime: string, endTime: string): number => {
  const startHour = parseInt(startTime.split(':')[0]);
  const endHour = parseInt(endTime.split(':')[0]);
  return Math.max(1, endHour - startHour);
};

// ─── Mobile single-day view ───────────────────────────────────────────────────

interface MobileDayViewProps {
  onCellClick?: (day: DayId, time: string) => void;
}

function MobileDayView({ onCellClick }: MobileDayViewProps) {
  const { entries, updateEntry, deleteEntry } = useEntries();
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  // Touch drag state
  const touchDragRef = useRef<{ entry: typeof entries[0]; startX: number; startY: number } | null>(null);
  const [touchDragging, setTouchDragging] = useState(false);
  const [touchPos, setTouchPos] = useState({ x: 0, y: 0 });
  const [touchOverCell, setTouchOverCell] = useState<string | null>(null);
  const [touchOverBin, setTouchOverBin] = useState(false);
  const binRef = useRef<HTMLDivElement>(null);

  const activeDay = DAYS[activeDayIndex];
  const dayEntries = entries.filter(e => e.day === activeDay.id);

  const CELL_H = 64;

  // Stable distinct color per day index — avoids relying on accent-primary
  const DAY_COLORS = ['#e85d4a', '#d97706', '#16a34a', '#2563eb', '#7c3aed', '#db2777', '#0891b2'];

  const dropOnTime = (time: string) => {
    const dragged = touchDragRef.current?.entry;
    if (!dragged) return;
    const originalStartIdx = TIME_SLOTS.indexOf(dragged.startTime as typeof TIME_SLOTS[number]);
    const originalEndIdx = TIME_SLOTS.indexOf(dragged.endTime as typeof TIME_SLOTS[number]);
    const duration = Math.max(1, originalEndIdx - originalStartIdx);
    const newStartIdx = TIME_SLOTS.indexOf(time as typeof TIME_SLOTS[number]);
    const newEndIdx = Math.min(newStartIdx + duration, TIME_SLOTS.length - 1);
    updateEntry(dragged.id, { day: activeDay.id, startTime: time, endTime: TIME_SLOTS[newEndIdx] });
  };

  const handleTouchStart = (e: React.TouchEvent, entry: typeof entries[0]) => {
    // Don't start drag on a short tap — wait for movement
    const touch = e.touches[0];
    touchDragRef.current = { entry, startX: touch.clientX, startY: touch.clientY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchDragRef.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchDragRef.current.startX;
    const dy = touch.clientY - touchDragRef.current.startY;

    // Only start visual drag after 8px movement to distinguish from tap
    if (!touchDragging && Math.sqrt(dx * dx + dy * dy) < 8) return;

    e.preventDefault(); // Prevent scroll while dragging
    setTouchDragging(true);
    setTouchPos({ x: touch.clientX, y: touch.clientY });

    // Detect what element is under the finger
    const el = document.elementFromPoint(touch.clientX, touch.clientY);

    // Check if over bin
    const binEl = binRef.current;
    if (binEl && binEl.contains(el as Node)) {
      setTouchOverBin(true);
      setTouchOverCell(null);
      return;
    }
    setTouchOverBin(false);

    // Check if over a time cell (data-time attribute)
    const cellEl = (el as HTMLElement)?.closest('[data-time]') as HTMLElement | null;
    if (cellEl) {
      setTouchOverCell(cellEl.dataset.time ?? null);
    } else {
      setTouchOverCell(null);
    }
  };

  const handleTouchEnd = () => {
    if (!touchDragRef.current) return;

    if (touchDragging) {
      if (touchOverBin) {
        deleteEntry(touchDragRef.current.entry.id);
      } else if (touchOverCell) {
        dropOnTime(touchOverCell);
      }
    }

    touchDragRef.current = null;
    setTouchDragging(false);
    setTouchOverCell(null);
    setTouchOverBin(false);
  };

  return (
    <div
      className="h-full flex flex-col"
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Day navigator — full width pills */}
      <div className="flex bg-[var(--bg-surface)] border-b border-[var(--border-color)] shrink-0">
        {DAYS.map((day, i) => (
          <button
            key={day.id}
            onClick={() => setActiveDayIndex(i)}
            className="flex-1 py-3 text-xs font-semibold transition-colors border-r last:border-r-0 border-[var(--border-color)]"
            style={{
              borderRadius: 0,
              backgroundColor: i === activeDayIndex ? DAY_COLORS[i % DAY_COLORS.length] : 'var(--bg-elevated)',
              color: i === activeDayIndex ? '#fff' : 'var(--text-secondary)',
            }}
            aria-label={day.name}
          >
            {day.short}
          </button>
        ))}
      </div>

      {/* Delete bin — shown above grid when dragging */}
      <div
        ref={binRef}
        className={`flex items-center justify-center gap-3 border-b-2 border-dashed transition-all duration-150 select-none shrink-0 overflow-hidden ${
          touchDragging && touchOverBin
            ? 'border-red-500 bg-red-500/20 text-red-400'
            : touchDragging
            ? 'border-red-400/60 bg-red-500/10 text-red-400/70'
            : 'border-transparent bg-transparent text-transparent'
        }`}
        style={{ height: touchDragging ? 52 : 0 }}
      >
        <Trash2 size={18} />
        <span className="text-sm font-medium">Drop here to delete</span>
      </div>

      {/* Scrollable time grid */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div
          className="grid"
          style={{
            gridTemplateColumns: '80px 1fr',
            gridTemplateRows: `repeat(${TIME_SLOTS.length}, ${CELL_H}px)`,
          }}
        >
          {TIME_SLOTS.map((time, timeIndex) => {
            const entry = dayEntries.find(e => e.startTime === time);
            const coveredByEntry = dayEntries.some(e => {
              const si = TIME_SLOTS.indexOf(e.startTime as any);
              const ei = TIME_SLOTS.indexOf(e.endTime as any);
              return timeIndex > si && timeIndex < ei;
            });
            const cellId = `${activeDay.id}-${time}`;
            const isOver = touchOverCell === time && touchDragging;
            const row = timeIndex + 1;
            const isDraggedEntry = touchDragging && touchDragRef.current?.entry.startTime === time;

            return [
              // Time label
              <div
                key={`tl-${time}`}
                className="bg-[var(--bg-surface)] text-xs text-[var(--text-secondary)] border-r border-b border-[var(--border-color)] flex items-center justify-end pr-2"
                style={{ gridColumn: 1, gridRow: row }}
              >
                {formatTime12Hour(time)}
              </div>,

              // Entry or empty cell
              entry ? (
                <div
                  key={cellId}
                  className="border-b border-[var(--border-color)]"
                  style={{
                    gridColumn: 2,
                    gridRow: `${row} / span ${getDurationSlots(entry.startTime, entry.endTime)}`,
                    backgroundColor: entry.color,
                    opacity: isDraggedEntry ? 0.4 : 1,
                    touchAction: 'none',
                  }}
                  onTouchStart={(e) => handleTouchStart(e, entry)}
                  onClick={() => {
                    if (!touchDragging) onCellClick?.(activeDay.id, time);
                  }}
                >
                  <div className="p-2 text-white h-full flex flex-col justify-center">
                    <div className="font-semibold text-sm truncate">{entry.subject}</div>
                    <div className="text-xs opacity-80 mt-0.5">
                      {formatTime12Hour(entry.startTime)} – {formatTime12Hour(entry.endTime)}
                    </div>
                  </div>
                </div>
              ) : coveredByEntry ? (
                <div
                  key={cellId}
                  data-time={time}
                  style={{ gridColumn: 2, gridRow: row, backgroundColor: isOver ? 'var(--bg-elevated)' : undefined }}
                />
              ) : (
                <div
                  key={cellId}
                  data-time={time}
                  className={`bg-[var(--bg-primary)] border-b border-[var(--border-color)] transition-colors ${
                    isOver ? 'bg-[var(--bg-elevated)]' : ''
                  }`}
                  style={{ gridColumn: 2, gridRow: row, minHeight: CELL_H }}
                  onClick={() => {
                    if (!touchDragging) onCellClick?.(activeDay.id, time);
                  }}
                />
              ),
            ];
          })}
        </div>
      </div>

      {/* Touch drag shadow — follows finger */}
      {touchDragging && touchDragRef.current && (
        <div
          className="fixed pointer-events-none z-50 opacity-90"
          style={{
            left: touchPos.x - 70,
            top: touchPos.y - 30,
            width: 140,
            height: getDurationSlots(touchDragRef.current.entry.startTime, touchDragRef.current.entry.endTime) * CELL_H - 4,
            backgroundColor: touchDragRef.current.entry.color,
            transform: 'rotate(2deg) scale(1.04)',
            boxShadow: `0 8px 32px 0 ${touchDragRef.current.entry.color}99`,
          }}
        >
          <div className="p-2 text-white text-xs font-medium h-full flex flex-col justify-center">
            <div className="font-semibold truncate">{touchDragRef.current.entry.subject}</div>
            <div className="opacity-80">
              {formatTime12Hour(touchDragRef.current.entry.startTime)} – {formatTime12Hour(touchDragRef.current.entry.endTime)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Desktop full-week grid ───────────────────────────────────────────────────

export function TimetableGrid({ onCellClick, zoom = 100, onZoomIn, onZoomOut }: TimetableGridProps) {
  const { entries, updateEntry, deleteEntry } = useEntries();
  const [dragOverCell, setDragOverCell] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isOverBin, setIsOverBin] = useState(false);
  const [dragShadow, setDragShadow] = useState<DragShadow | null>(null);
  const [shadowPos, setShadowPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

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
      const entry = JSON.parse(e.dataTransfer.getData('application/json'));
      const originalStartIdx = TIME_SLOTS.indexOf(entry.startTime);
      const originalEndIdx = TIME_SLOTS.indexOf(entry.endTime);
      const duration = Math.max(1, originalEndIdx - originalStartIdx);
      const newStartIdx = TIME_SLOTS.indexOf(time as typeof TIME_SLOTS[number]);
      const newEndIdx = Math.min(newStartIdx + duration, TIME_SLOTS.length - 1);
      updateEntry(entry.id, { day: dayId, startTime: time, endTime: TIME_SLOTS[newEndIdx] });
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
      const entry = JSON.parse(e.dataTransfer.getData('application/json'));
      deleteEntry(entry.id);
    } catch (err) {
      console.error('Bin drop error:', err);
    }
  };

  const handleDragOver = (e: React.DragEvent, dayId: DayId, time: string) => {
    e.preventDefault();
    setDragOverCell(`${dayId}-${time}`);
  };

  const getEntryRowSpan = (entry: typeof entries[0]) =>
    getDurationSlots(entry.startTime, entry.endTime);

  const CELL_HEIGHT = 50;
  const ROWS = TIME_SLOTS.length;

  return (
    <>
      {/* Mobile: single-day view — h-full propagates from the bounded parent in App */}
      <div className="md:hidden h-full">
        <MobileDayView onCellClick={onCellClick} />
      </div>

      {/* Desktop: full-week grid */}
      <div className="hidden md:block overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Header row */}
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
              <div
                key={day.id}
                className="bg-[var(--bg-surface)] p-3 text-center font-medium border-r border-[var(--border-color)] last:border-r-0 text-sm"
              >
                {day.short}
              </div>
            ))}
          </div>

          {/* Time grid */}
          <div
            ref={containerRef}
            className="grid"
            style={{
              gridTemplateColumns: `80px repeat(7, 1fr)`,
              gridTemplateRows: `repeat(${ROWS}, ${CELL_HEIGHT}px)`,
            }}
          >
            {TIME_SLOTS.map((time, timeIndex) => (
              <div
                key={`time-${time}`}
                className="bg-[var(--bg-surface)] p-2 text-xs text-[var(--text-secondary)] text-right pr-3 border-r border-b border-[var(--border-color)] flex items-center justify-end"
                style={{ gridColumn: 1, gridRow: timeIndex + 1 }}
              >
                {formatTime12Hour(time)}
              </div>
            ))}

            {TIME_SLOTS.map((time, timeIndex) =>
              DAYS.map((day, dayIndex) => {
                const cellId = `${day.id}-${time}`;
                const entry = entries.find(e => e.day === day.id && e.startTime === time);
                const isDragOver = dragOverCell === cellId;
                const col = dayIndex + 2;
                const row = timeIndex + 1;

                if (entry) {
                  const rowSpan = getEntryRowSpan(entry);
                  return (
                    <div
                      key={cellId}
                      className={`border-r border-b border-[var(--border-color)] cursor-grab active:cursor-grabbing transition-opacity ${
                        isDragOver ? 'ring-2 ring-inset ring-[var(--accent-primary)]' : ''
                      } ${isDragging && dragShadow?.subject === entry.subject ? 'opacity-40' : ''}`}
                      style={{
                        gridColumn: col,
                        gridRow: `${row} / span ${rowSpan}`,
                        backgroundColor: entry.color,
                      }}
                      onDragOver={(e) => handleDragOver(e, day.id, time)}
                      onDragLeave={() => setDragOverCell(null)}
                      onDrop={(e) => handleDrop(e, day.id, time)}
                      onClick={() => onCellClick?.(day.id, time)}
                      draggable
                      onDragStart={(e) => {
                        const ghost = document.createElement('div');
                        ghost.style.position = 'absolute';
                        ghost.style.top = '-9999px';
                        document.body.appendChild(ghost);
                        e.dataTransfer.setDragImage(ghost, 0, 0);
                        setTimeout(() => document.body.removeChild(ghost), 0);
                        e.dataTransfer.setData('application/json', JSON.stringify(entry));
                        e.dataTransfer.effectAllowed = 'move';
                        setShadowPos({ x: e.clientX, y: e.clientY });
                        setDragShadow({ subject: entry.subject, startTime: entry.startTime, endTime: entry.endTime, color: entry.color, rowSpan });
                        setIsDragging(true);
                      }}
                      onDrag={handleDrag}
                      onDragEnd={() => { setIsDragging(false); setIsOverBin(false); setDragShadow(null); }}
                    >
                      <div className="p-2 text-white text-xs font-medium h-full flex flex-col justify-center">
                        <div className="font-semibold truncate">{entry.subject}</div>
                        <div className="opacity-80">{entry.startTime} – {entry.endTime}</div>
                      </div>
                    </div>
                  );
                }

                const coveredByEntry = entries.some(e => {
                  const si = TIME_SLOTS.indexOf(e.startTime as any);
                  const ei = TIME_SLOTS.indexOf(e.endTime as any);
                  return e.day === day.id && timeIndex > si && timeIndex < ei;
                });

                if (coveredByEntry) {
                  return <div key={cellId} style={{ gridColumn: col, gridRow: row }} />;
                }

                return (
                  <div
                    key={cellId}
                    className={`bg-[var(--bg-primary)] border-r border-b border-[var(--border-color)] cursor-pointer hover:bg-[var(--bg-elevated)] transition-colors ${
                      isDragOver ? 'ring-2 ring-inset ring-[var(--accent-primary)]' : ''
                    }`}
                    style={{ gridColumn: col, gridRow: row }}
                    onDragOver={(e) => handleDragOver(e, day.id, time)}
                    onDragLeave={() => setDragOverCell(null)}
                    onDrop={(e) => handleDrop(e, day.id, time)}
                    onClick={() => onCellClick?.(day.id, time)}
                  />
                );
              })
            )}
          </div>
        </div>

        {/* Delete bin */}
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

        {/* Custom drag shadow */}
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
            }}
          >
            <div className="p-2 text-white text-xs font-medium h-full flex flex-col justify-center">
              <div className="font-semibold truncate">{dragShadow.subject}</div>
              <div className="opacity-80">{dragShadow.startTime} – {dragShadow.endTime}</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
