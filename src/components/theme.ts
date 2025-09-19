import { createColors } from 'tinyrainbow';

// Create colors instance
const colors = createColors();

/**
 * Color theme configuration
 */
export const Theme = {
  // UI Elements
  window: {
    border: colors.cyan,
    title: colors.blue,
    background: colors.gray,
  },

  // Path and navigation
  path: {
    current: colors.blue,
    separator: colors.cyan,
    folder: colors.yellow,
  },

  // File items
  file: {
    folder: {
      icon: colors.yellow,
      name: colors.yellow,
      selected: colors.magenta,
    },
    file: {
      icon: colors.blue,
      name: colors.gray,
      selected: colors.cyan,
    },
  },

  // Context menu
  menu: {
    border: colors.cyan,
    item: colors.gray,
    selected: colors.cyan,
    shortcut: colors.gray,
    separator: colors.cyan,
  },

  // Status
  status: {
    info: colors.cyan,
    success: colors.green,
    warning: colors.yellow,
    error: colors.red,
  },

  // Selection
  selection: {
    highlight: colors.magenta,
    arrow: colors.magenta,
  },
} as const;

/**
 * Apply color to folder icon
 */
export function colorFolderIcon(lines: string[], isSelected: boolean = false): string[] {
  const color = isSelected ? Theme.file.folder.selected : Theme.file.folder.icon;
  return lines.map((line) => color(line));
}

/**
 * Apply color to file icon
 */
export function colorFileIcon(lines: string[], isSelected: boolean = false): string[] {
  const color = isSelected ? Theme.file.file.selected : Theme.file.file.icon;
  return lines.map((line) => color(line));
}

/**
 * Apply color to file/folder name
 */
export function colorFileName(
  name: string,
  type: 'file' | 'directory',
  isSelected: boolean = false
): string {
  if (type === 'directory') {
    return isSelected ? Theme.file.folder.selected(name) : Theme.file.folder.name(name);
  } else {
    return isSelected ? Theme.file.file.selected(name) : Theme.file.file.name(name);
  }
}

/**
 * Apply color to path bar
 */
export function colorPathBar(path: string): string {
  const parts = path.split('/');
  const coloredParts = parts.map((part, index) => {
    if (index === parts.length - 1) {
      return Theme.path.current(part || '/');
    }
    return Theme.path.folder(part || '/');
  });

  return coloredParts.join(Theme.path.separator('/'));
}

/**
 * Apply color to window border
 */
export function colorWindowBorder(text: string): string {
  return Theme.window.border(text);
}

/**
 * Apply color to window title
 */
export function colorWindowTitle(title: string): string {
  return Theme.window.title(title);
}

/**
 * Apply color to context menu
 */
export function colorContextMenu(lines: string[]): string[] {
  return lines.map((line, index) => {
    // Border lines
    if (line.includes('╭') || line.includes('╯') || line.includes('├') || line.includes('┤')) {
      return Theme.menu.border(line);
    }

    // Menu items
    return Theme.menu.item(line);
  });
}

/**
 * Apply color to status bar
 */
export function colorStatusBar(
  text: string,
  type: 'info' | 'success' | 'warning' | 'error' = 'info'
): string {
  return Theme.status[type](text);
}

/**
 * Apply selection highlight
 */
export function colorSelection(text: string): string {
  return `${Theme.selection.arrow('►')} ${Theme.selection.highlight(text)} ${Theme.selection.arrow('◄')}`;
}

/**
 * Get icon for file type based on extension
 */
export function getFileTypeIcon(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();

  const icons: Record<string, string> = {
    // Documents
    txt: '📄',
    md: '📝',
    pdf: '📕',
    doc: '📘',
    docx: '📘',

    // Code files
    js: '🟨',
    ts: '🔷',
    html: '🌐',
    css: '🎨',
    json: '📋',
    xml: '📰',
    yml: '⚙️',
    yaml: '⚙️',

    // Images
    png: '🖼️',
    jpg: '🖼️',
    jpeg: '🖼️',
    gif: '🖼️',
    svg: '🎭',

    // Archives
    zip: '📦',
    tar: '📦',
    gz: '📦',
    rar: '📦',

    // Executables
    exe: '⚙️',
    app: '📱',
    deb: '📦',
    rpm: '📦',
  };

  return icons[ext || ''] || '📄';
}

/**
 * Format file size with colors
 */
export function colorFileSize(size: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let sizeValue = size;
  let unitIndex = 0;

  while (sizeValue >= 1024 && unitIndex < units.length - 1) {
    sizeValue /= 1024;
    unitIndex++;
  }

  const formatted = `${sizeValue.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;

  // Color based on size
  if (unitIndex >= 3) return colors.red(formatted); // GB, TB
  if (unitIndex >= 2) return colors.yellow(formatted); // MB
  if (unitIndex >= 1) return colors.cyan(formatted); // KB
  return colors.gray(formatted); // B
}
