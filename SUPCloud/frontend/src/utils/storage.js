import { formatPercent } from './formatBytes';

const DEFAULT_STORAGE_LIMIT = 30000000000;

/**
 * Informations de stockage d'un utilisateur : utilisé, restant, total et pourcentage
 */
export const getStorageInfo = (user) => {
  const used = Number(user?.storageUsed) || 0;
  const limit = Number(user?.storageLimit) || DEFAULT_STORAGE_LIMIT;

  return {
    used,
    limit,
    remaining: Math.max(0, limit - used),
    percent: Math.min(100, (used / limit) * 100),
    percentLabel: formatPercent(used, limit),
  };
};
