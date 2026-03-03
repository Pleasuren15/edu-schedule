import { formatTime12Hour } from '../../utils/timeUtils';

interface TimeColumnProps {
  time: string;
}

export function TimeColumn({ time }: TimeColumnProps) {
  return (
    <div className="bg-[var(--bg-surface)] p-2 text-xs text-[var(--text-secondary)] text-right pr-3">
      {formatTime12Hour(time)}
    </div>
  );
}
