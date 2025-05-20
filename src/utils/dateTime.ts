
export const getCurrentDateTime = () => {
  const now = new Date();
  // Adjust for local timezone
  const tzOffset = now.getTimezoneOffset() * 60000; // offset in milliseconds
  const localISOTime = (new Date(now.getTime() - tzOffset)).toISOString().slice(0, 16);
  return localISOTime;
};

/**
 * Format a date in MM/DD-YYYY HH:MM AM/PM format for Supabase
 * @param date The date to format
 * @returns The formatted date string
 */
export const formatDateForSupabase = (date: Date): string => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  
  let hours = date.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // Convert 0 to 12
  
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${month}/${day}-${year} ${hours}:${minutes} ${ampm}`;
};

/**
 * Format a date in MM/DD/YYYY hh:mm AM/PM format for Google Sheets
 * This format matches what the Google Sheets script expects
 * @param date The date to format
 * @returns The formatted date string
 */
export const formatDateForSheets = (date: Date): string => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  
  let hours = date.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // Convert 0 to 12
  
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${month}/${day}/${year} ${hours}:${minutes} ${ampm}`;
};
