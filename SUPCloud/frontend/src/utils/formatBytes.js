export const formatBytes = (bytes) => {
  const value = Number(bytes) || 0;
  if (value === 0) return '0 o';
  const k = 1000;
  const sizes = ['o', 'ko', 'Mo', 'Go', 'To'];
  const i = Math.min(Math.floor(Math.log(value) / Math.log(k)), sizes.length - 1);
  const formatted = value / Math.pow(k, i);
  return `${formatted >= 100 ? Math.round(formatted) : formatted.toFixed(2)} ${sizes[i]}`;
};

export const formatPercent = (used, total) => {
  const usedValue = Number(used) || 0;
  const totalValue = Number(total) || 0;
  if (usedValue <= 0 || totalValue <= 0) return '0';
  const percent = Math.min(100, (usedValue / totalValue) * 100);
  return percent < 0.01 ? '<0,01' : percent.toFixed(2).replace('.', ',');
};
