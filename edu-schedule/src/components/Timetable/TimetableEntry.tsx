import { useState } from 'react';
import type { Entry } from '../../store';

interface TimetableEntryProps {
  entry: Entry;
}

export function TimetableEntry({ entry }: TimetableEntryProps) {
  const [isDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify(entry));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={`absolute inset-0 p-2 text-white text-xs font-medium cursor-grab flex flex-col justify-center items-center text-center transition-opacity hover:opacity-90 ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
      style={{ 
        backgroundColor: entry.color,
      }}
    >
      <div className="font-semibold truncate w-full">{entry.subject}</div>
      <div className="text-[10px] opacity-80">{entry.startTime} - {entry.endTime}</div>
    </div>
  );
}
