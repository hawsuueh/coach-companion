// utils/formatDate.ts
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  return date.toLocaleDateString('en-US', {
    month: 'short', // Aug
    day: 'numeric', // 21
    year: 'numeric' // 2025
  });
};
