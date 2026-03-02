import { format } from 'date-fns';

export function formatTime12Hour(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes);
  return format(date, 'h:mm a');
}

export function timeToDecimal(time24: string): number {
  const [hours, minutes] = time24.split(':').map(Number);
  return hours + minutes / 60;
}

export function formatHour(hour: number): string {
  const date = new Date();
  date.setHours(hour, 0);
  return format(date, 'h a');
}

export function formatTimeParts(hours: number, minutes: number): string {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export function getTimeSlotsBetween(start: string, end: string): string[] {
  const startIndex = TIME_SLOTS.indexOf(start as any);
  const endIndex = TIME_SLOTS.indexOf(end as any);
  if (startIndex === -1 || endIndex === -1) return [];
  return TIME_SLOTS.slice(startIndex, endIndex + 1);
}

const TIME_SLOTS = [
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
  '21:00', '21:30', '22:00', '22:30', '23:00', '23:30',
];

export function getDurationInSlots(start: string, end: string): number {
  const startIndex = TIME_SLOTS.indexOf(start as any);
  const endIndex = TIME_SLOTS.indexOf(end as any);
  if (startIndex === -1 || endIndex === -1) return 1;
  return Math.max(1, endIndex - startIndex + 1);
}
