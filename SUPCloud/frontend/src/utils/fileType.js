const EXTENSION_TYPES = {
  jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', webp: 'image', svg: 'image', bmp: 'image',
  mp4: 'video', webm: 'video', ogv: 'video',
  mp3: 'audio', wav: 'audio', ogg: 'audio', m4a: 'audio', flac: 'audio',
  pdf: 'pdf',
  txt: 'text', md: 'text', markdown: 'text', log: 'text', csv: 'text', json: 'text',
  xml: 'text', yml: 'text', yaml: 'text', ini: 'text', html: 'text', htm: 'text', css: 'text', js: 'text',
};

export const getExtension = (name = '') => {
  const dotIndex = name.lastIndexOf('.');
  return dotIndex > 0 ? name.slice(dotIndex + 1).toLowerCase() : '';
};

/**
 * Type de prévisualisation d'un fichier : 'image' | 'video' | 'audio' | 'pdf' | 'text' | null.
 * Le type MIME est prioritaire ; quand il est absent ou non reconnu (ex. un .md envoyé
 * par Windows sans type), on se base sur l'extension du nom.
 */
export const getPreviewType = (file) => {
  const mime = (file?.mimeType || '').toLowerCase();

  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime === 'application/pdf') return 'pdf';
  if (mime.startsWith('text/') || mime === 'application/json' || mime === 'application/xml') return 'text';

  return EXTENSION_TYPES[getExtension(file?.name)] || null;
};
