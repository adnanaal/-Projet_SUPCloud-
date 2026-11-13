export const formatBytes = (bytes) => {
  const value = Number(bytes) || 0;
  if (value === 0) return '0 o';
  const k = 1000;
  const sizes = ['o', 'ko', 'Mo', 'Go', 'To'];
  const i = Math.min(Math.floor(Math.log(value) / Math.log(k)), sizes.length - 1);
  const formatted = value / Math.pow(k, i);
  return `${formatted >= 100 ? Math.round(formatted) : formatted.toFixed(2)} ${sizes[i]}`;
};
