const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const DAY_MS = 24 * 60 * 60 * 1000;

const PERIODS = [
  { key: 'today', label: "Aujourd'hui", maxDays: 0 },
  { key: 'yesterday', label: 'Hier', maxDays: 1 },
  { key: 'week', label: '7 derniers jours', maxDays: 7 },
  { key: 'month', label: '30 derniers jours', maxDays: 30 },
  { key: 'older', label: 'Plus ancien', maxDays: Infinity },
];

/**
 * Regroupe des éléments par période selon leur date de modification
 * (Aujourd'hui, Hier, 7 derniers jours, 30 derniers jours, Plus ancien).
 * Les périodes vides sont omises et l'ordre d'entrée est conservé.
 */
export const groupByPeriod = (items, getDate = (item) => item.updatedAt || item.createdAt) => {
  const today = startOfDay(new Date());
  const groups = PERIODS.map((period) => ({ ...period, items: [] }));

  for (const item of items) {
    const daysAgo = Math.max(0, Math.round((today - startOfDay(new Date(getDate(item)))) / DAY_MS));
    const group = groups.find((candidate) => daysAgo <= candidate.maxDays);
    group.items.push(item);
  }

  return groups.filter((group) => group.items.length > 0);
};
