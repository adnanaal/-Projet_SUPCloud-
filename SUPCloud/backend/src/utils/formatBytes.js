/**
 * Formate une taille en octets avec des unités décimales (o, ko, Mo, Go, To),
 * cohérentes avec l'affichage du frontend et le quota de 30 Go (30 000 000 000 octets).
 * Accepte un nombre ou un BigInt.
 */
const formatBytes = (bytes) => {
  const value = Number(bytes);

  if (!Number.isFinite(value) || value <= 0) return '0 o';

  const units = ['o', 'ko', 'Mo', 'Go', 'To'];
  const i = Math.min(Math.floor(Math.log(value) / Math.log(1000)), units.length - 1);
  const scaled = value / Math.pow(1000, i);

  return `${i === 0 ? Math.round(scaled) : scaled.toFixed(2)} ${units[i]}`;
};

module.exports = formatBytes;
