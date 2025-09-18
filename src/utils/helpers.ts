import path from 'path';

// Functional programming helpers
export const pipe =
  <T>(...fns: Array<(arg: T) => T>) =>
  (value: T): T => {
    return fns.reduce((acc, fn) => fn(acc), value);
  };

export const compose =
  <T>(...fns: Array<(arg: T) => T>) =>
  (value: T): T => {
    return fns.reduceRight((acc, fn) => fn(acc), value);
  };

export const curry = <T, U, V>(fn: (a: T, b: U) => V) => {
  return (a: T) => (b: U) => fn(a, b);
};

export const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map();
  return ((...args: any[]) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

// File path utilities
export const getParentPath = (currentPath: string): string => {
  const parent = path.dirname(currentPath);
  return parent === currentPath ? currentPath : parent;
};

export const isSubPath = (parent: string, child: string): boolean => {
  const relative = path.relative(parent, child);
  return !relative.startsWith('..') && !path.isAbsolute(relative);
};

export const sanitizePath = (inputPath: string): string => {
  return path.resolve(inputPath);
};

// String helper utilities
export const truncateString = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
};

export const padRight = (str: string, length: number): string => {
  return str.padEnd(length, ' ');
};

export const padLeft = (str: string, length: number): string => {
  return str.padStart(length, ' ');
};

// Array utilities
export const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export const flatten = <T>(arrays: T[][]): T[] => {
  return arrays.reduce((acc, val) => acc.concat(val), []);
};

// Type guards
export const isError = (error: unknown): error is Error => {
  return error instanceof Error;
};

export const isString = (value: unknown): value is string => {
  return typeof value === 'string';
};

export const isNumber = (value: unknown): value is number => {
  return typeof value === 'number';
};

// Asynchronous helpers
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms)),
  ]);
};

// Color mapping utilities (used with tinyrainbow)
export const getColorForExtension = (extension: string): string => {
  const colorMap: Record<string, string> = {
    '.js': 'yellow',
    '.ts': 'blue',
    '.json': 'magenta',
    '.html': 'red',
    '.css': 'cyan',
    '.py': 'green',
    '.java': 'red',
    '.c': 'blue',
    '.cpp': 'blue',
    '.go': 'cyan',
    '.rs': 'red',
    '.php': 'magenta',
    '.rb': 'red',
    '.txt': 'white',
    '.md': 'white',
    '.pdf': 'red',
    '.doc': 'blue',
    '.docx': 'blue',
    '.xls': 'green',
    '.xlsx': 'green',
    '.ppt': 'magenta',
    '.pptx': 'magenta',
    '.zip': 'yellow',
    '.tar': 'yellow',
    '.gz': 'yellow',
    '.jpg': 'green',
    '.png': 'green',
    '.gif': 'green',
    '.mp3': 'cyan',
    '.wav': 'cyan',
    '.mp4': 'magenta',
    '.avi': 'magenta',
  };

  return colorMap[extension.toLowerCase()] || 'gray';
};

export const getColorForFileType = (isDirectory: boolean, extension: string = ''): string => {
  if (isDirectory) return 'blue';
  return getColorForExtension(extension);
};

// File size formatting
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Date formatting
export const formatDate = (date: Date): string => {
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Keyboard key description mapping
export const getKeyDescription = (key: string): string => {
  const keyMap: Record<string, string> = {
    up: '↑',
    down: '↓',
    left: '←',
    right: '→',
    enter: 'Enter',
    escape: 'Esc',
    space: 'Space',
    tab: 'Tab',
    backspace: 'Backspace',
    delete: 'Delete',
  };

  return keyMap[key] || key.toUpperCase();
};
