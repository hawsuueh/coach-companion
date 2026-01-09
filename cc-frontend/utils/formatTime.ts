// utils/formatTime.ts
export const formatTime = (timeString: string): string => {
  // Expecting "HH:MM:SS" from DB
  const [hours, minutes] = timeString.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return '';

  const date = new Date();
  date.setHours(hours, minutes);

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true // 7:00 AM
  });
};
