// Types MIME génériques envoyés quand le navigateur ne connaît pas le format
// (par exemple un fichier .md sous Windows)
const GENERIC_MIME_TYPES = new Set(['', 'application/octet-stream', 'application/x-download', 'binary/octet-stream']);

const EXTENSION_MIME_TYPES = {
  txt: 'text/plain',
  log: 'text/plain',
  md: 'text/markdown',
  markdown: 'text/markdown',
  csv: 'text/csv',
  json: 'application/json',
  xml: 'application/xml',
  yml: 'text/yaml',
  yaml: 'text/yaml',
  html: 'text/html',
  htm: 'text/html',
  css: 'text/css',
  js: 'text/javascript',
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  zip: 'application/zip',
};

/**
 * Détermine le type MIME à enregistrer : celui du navigateur s'il est précis,
 * sinon (absent ou générique) celui déduit de l'extension du fichier.
 */
const resolveMimeType = (originalName = '', declaredType = '') => {
  const declared = String(declaredType || '').toLowerCase();

  if (!GENERIC_MIME_TYPES.has(declared)) {
    return declaredType;
  }

  const dotIndex = originalName.lastIndexOf('.');
  const extension = dotIndex > 0 ? originalName.slice(dotIndex + 1).toLowerCase() : '';

  return EXTENSION_MIME_TYPES[extension] || declaredType || 'application/octet-stream';
};

module.exports = resolveMimeType;
