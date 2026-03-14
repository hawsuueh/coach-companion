// utils/formatTime.ts

/**
 * DB to UI: "07:00:00" -> "7:00 AM"
 */
export const formatTime = (timeString: string): string => {
  const [hours, minutes] = timeString.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return '';

  const date = new Date();
  date.setHours(hours, minutes);

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * UI to DB: "7:00 AM" -> "07:00:00"
 * Fixes Error 22007 (Invalid input syntax for type time)
 */
export const parseTimeToDB = (timeString: string): string => {
  if (!timeString) return '00:00:00';

  // 1. Clean hidden characters (like the Narrow No-Break Space \u202f)
  const cleanTime = timeString.replace(/\u202f/g, ' ').trim();

  // 2. Split "7:00" and "AM"
  const [time, modifier] = cleanTime.split(' ');
  let [hours, minutes] = time.split(':');

  let h = parseInt(hours, 10);

  // 3. Convert to 24-hour logic
  if (modifier?.toUpperCase() === 'PM' && h < 12) {
    h += 12;
  }
  if (modifier?.toUpperCase() === 'AM' && h === 12) {
    h = 0;
  }

  // 4. Pad with zeros to ensure "HH:MM:SS"
  const finalHours = h.toString().padStart(2, '0');
  const finalMinutes = minutes.padStart(2, '0');

  return `${finalHours}:${finalMinutes}:00`;
};

/**
 * UI to DB: "1:00" -> 3600, "1 hour" -> 3600, "90" -> 5400
 */
export const parseDurationToSeconds = (durationStr: string): number => {
  if (!durationStr) return 0;

  // 1. Try to match the "1h 10m" or "1h" or "10m" pattern
  // This regex looks for a number followed by 'h' and a number followed by 'm'
  const hourMatch = durationStr.match(/(\d+)\s*h/);
  const minuteMatch = durationStr.match(/(\d+)\s*m/);

  const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
  const minutes = minuteMatch ? parseInt(minuteMatch[1], 10) : 0;

  // 2. If the pattern matches, return the calculated seconds
  if (hourMatch || minuteMatch) {
    return hours * 3600 + minutes * 60;
  }

  // 3. Fallback for "HH:MM" format (like "01:10")
  if (durationStr.includes(':')) {
    const parts = durationStr.split(':').map(Number);
    if (parts.length === 2) return parts[0] * 3600 + parts[1] * 60;
  }

  // 4. Ultimate fallback: Treat as total minutes (e.g., "70")
  const val = parseInt(durationStr.replace(/[^0-9]/g, ''), 10);
  return isNaN(val) ? 0 : val * 60;
};
