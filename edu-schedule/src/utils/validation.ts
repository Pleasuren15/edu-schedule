export function validateEntry(entry: {
  subject: string;
  day: string;
  startTime: string;
  endTime: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!entry.subject || entry.subject.trim().length === 0) {
    errors.push('Subject is required');
  } else if (entry.subject.length > 30) {
    errors.push('Subject must be 30 characters or less');
  }

  if (!entry.day) {
    errors.push('Day is required');
  }

  if (!entry.startTime) {
    errors.push('Start time is required');
  }

  if (!entry.endTime) {
    errors.push('End time is required');
  }

  if (entry.startTime && entry.endTime) {
    const start = parseInt(entry.startTime.replace(':', ''));
    const end = parseInt(entry.endTime.replace(':', ''));
    if (end <= start) {
      errors.push('End time must be after start time');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateTimeRange(start: string, end: string): boolean {
  const startNum = parseInt(start.replace(':', ''));
  const endNum = parseInt(end.replace(':', ''));
  return endNum > startNum;
}

export function validateImportedEntries(entries: unknown[]): { valid: boolean; validEntries: any[]; errors: string[] } {
  const validEntries: any[] = [];
  const errors: string[] = [];

  entries.forEach((entry, index) => {
    const e = entry as Record<string, unknown>;
    const validation = validateEntry({
      subject: String(e.subject || ''),
      day: String(e.day || ''),
      startTime: String(e.startTime || e.start || ''),
      endTime: String(e.endTime || e.end || ''),
    });

    if (validation.valid) {
      validEntries.push({
        subject: e.subject,
        day: e.day,
        startTime: e.startTime || e.start,
        endTime: e.endTime || e.end,
        color: e.color,
      });
    } else {
      errors.push(`Entry ${index + 1}: ${validation.errors.join(', ')}`);
    }
  });

  return {
    valid: errors.length === 0,
    validEntries,
    errors,
  };
}
