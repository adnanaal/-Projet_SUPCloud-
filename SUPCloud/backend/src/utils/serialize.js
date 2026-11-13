/**
 * Convertit récursivement les BigInt en Number pour permettre la sérialisation JSON
 */
const serializeBigInt = (data) => {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'bigint') {
    return Number(data);
  }

  if (Array.isArray(data)) {
    return data.map(serializeBigInt);
  }

  if (data instanceof Date) {
    return data;
  }

  if (typeof data === 'object') {
    const result = {};
    for (const key of Object.keys(data)) {
      result[key] = serializeBigInt(data[key]);
    }
    return result;
  }

  return data;
};

module.exports = serializeBigInt;
