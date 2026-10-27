import React from 'react';
import {
  File,
  FileImage,
  FileVideo,
  FileText,
  Music,
  Archive,
  FileCode,
  FileSpreadsheet,
  FileJson,
  FileDefault
} from 'lucide-react';

const FileIcon = ({ type, size = 24, className = '' }) => {
  const getIcon = () => {
    if (!type) return <File size={size} className={className} />;

    const mimeType = type.toLowerCase();

    // Images
    if (mimeType.startsWith('image/')) {
      return <FileImage size={size} className={className} />;
    }

    // Vidéos
    if (mimeType.startsWith('video/')) {
      return <FileVideo size={size} className={className} />;
    }

    // Audio
    if (mimeType.startsWith('audio/')) {
      return <Music size={size} className={className} />;
    }

    // PDF
    if (mimeType === 'application/pdf') {
      return <FileText size={size} className={className} />;
    }

    // Archives
    if (
      mimeType === 'application/zip' ||
      mimeType === 'application/x-rar-compressed' ||
      mimeType === 'application/x-7z-compressed' ||
      mimeType === 'application/x-tar' ||
      mimeType === 'application/gzip'
    ) {
      return <Archive size={size} className={className} />;
    }

    // Code
    if (
      mimeType === 'text/javascript' ||
      mimeType === 'text/html' ||
      mimeType === 'text/css' ||
      mimeType === 'application/json' ||
      mimeType === 'text/xml'
    ) {
      return <FileCode size={size} className={className} />;
    }

    // JSON
    if (mimeType === 'application/json') {
      return <FileJson size={size} className={className} />;
    }

    // Excel
    if (
      mimeType === 'application/vnd.ms-excel' ||
      mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      return <FileSpreadsheet size={size} className={className} />;
    }

    // Texte
    if (mimeType.startsWith('text/')) {
      return <FileText size={size} className={className} />;
    }

    // Par défaut
    return <File size={size} className={className} />;
  };

  return getIcon();
};

export default FileIcon;
