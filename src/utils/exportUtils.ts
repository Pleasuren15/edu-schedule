import { DAYS, type DayId } from '../constants';

export interface Entry {
  id: string;
  subject: string;
  day: DayId;
  startTime: string;
  endTime: string;
  color: string;
}

export function exportToJSON(entries: Entry[]): string {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    entries: entries.map(e => ({
      subject: e.subject,
      day: e.day,
      startTime: e.startTime,
      endTime: e.endTime,
      color: e.color,
    })),
  };
  return JSON.stringify(data, null, 2);
}

export function exportToCSV(entries: Entry[]): string {
  const headers = ['Subject', 'Day', 'Start Time', 'End Time', 'Color'];
  const rows = entries.map(e => [
    e.subject,
    e.day,
    e.startTime,
    e.endTime,
    e.color,
  ]);
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

export function exportToICS(entries: Entry[]): string {
  const formatDate = (day: string, time: string): string => {
    const dayIndex = DAYS.findIndex(d => d.id === day);
    const now = new Date();
    const dayDiff = (dayIndex + 1 - ((now.getDay() + 6) % 7) + 7) % 7 || 7;
    const targetDay = new Date(now);
    targetDay.setDate(now.getDate() + dayDiff);
    
    const [hours, minutes] = time.split(':');
    targetDay.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    return formatDateICS(targetDay);
  };

  const formatDateICS = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  let ics = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//TimeGrid//EN\n';
  
  entries.forEach(entry => {
    const start = formatDate(entry.day, entry.startTime);
    const end = formatDate(entry.day, entry.endTime);
    
    ics += 'BEGIN:VEVENT\n';
    ics += `SUMMARY:${entry.subject}\n`;
    ics += `DTSTART:${start}\n`;
    ics += `DTEND:${end}\n`;
    ics += 'END:VEVENT\n';
  });
  
  ics += 'END:VCALENDAR';
  return ics;
}

export function exportToHTML(entries: Entry[]): string {
  const dayHeaders = DAYS.map(d => `<th>${d.short}</th>`).join('');
  
  const rows: string[] = [];
  const hours = ['12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
  
  hours.forEach(hour => {
    const cells = DAYS.map(day => {
      const cellEntries = entries.filter(e => e.day === day.id && e.startTime.startsWith(hour));
      if (cellEntries.length > 0) {
        return `<td style="background:${cellEntries[0].color}">${cellEntries[0].subject}</td>`;
      }
      return '<td></td>';
    });
    rows.push(`<tr><td>${hour}:00</td>${cells.join('')}</tr>`);
  });

  return `<!DOCTYPE html>
<html>
<head>
  <title>TimeGrid Schedule</title>
  <style>
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
    th { background: #f5f5f5; }
  </style>
</head>
<body>
  <h1>TimeGrid Schedule</h1>
  <table>
    <tr><th>Time</th>${dayHeaders}</tr>
    ${rows.join('\n')}
  </table>
</body>
</html>`;
}

export function parseJSON(content: string): any[] {
  try {
    const data = JSON.parse(content);
    if (Array.isArray(data)) return data;
    if (data.entries && Array.isArray(data.entries)) return data.entries;
    return [];
  } catch {
    return [];
  }
}

export function parseCSV(content: string): any[] {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];
  
  const entries: any[] = [];
  for (let i = 1; i < lines.length; i++) {
    const [subject, day, startTime, endTime, color] = lines[i].split(',');
    if (subject && day) {
      entries.push({ subject, day, startTime, endTime, color });
    }
  }
  return entries;
}

export function parseICS(content: string): any[] {
  const events: any[] = [];
  const eventMatches = content.split('BEGIN:VEVENT');
  
  for (let i = 1; i < eventMatches.length; i++) {
    const event = eventMatches[i];
    const summaryMatch = event.match(/SUMMARY:(.+)/);
    
    if (summaryMatch) {
      events.push({
        subject: summaryMatch[1],
        day: 'monday', // Default, would need proper day calculation
        startTime: '12:00',
        endTime: '13:00',
      });
    }
  }
  return events;
}

export function normalizeDay(day: string): string {
  const normalized = day.toLowerCase().trim();
  const dayMap: Record<string, string> = {
    mon: 'monday', tue: 'tuesday', wed: 'wednesday', thu: 'thursday',
    fri: 'friday', sat: 'saturday', sun: 'sunday',
  };
  return dayMap[normalized] || normalized;
}

export function normalizeTime(time: string): string {
  const match = time.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
  if (!match) return '12:00';
  
  let hours = parseInt(match[1]);
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const period = match[3]?.toLowerCase();
  
  if (period === 'pm' && hours !== 12) hours += 12;
  if (period === 'am' && hours === 12) hours = 0;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}
