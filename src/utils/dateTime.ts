export const getCurrentDateTime = () => {
  const now = new Date();
  // Adjust for local timezone
  const tzOffset = now.getTimezoneOffset() * 60000; // offset in milliseconds
  const localISOTime = (new Date(now.getTime() - tzOffset)).toISOString().slice(0, 16);
  return localISOTime;
};