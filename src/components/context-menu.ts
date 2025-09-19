import { padText } from './icons.js';
import { colorContextMenu } from './theme.js';

export interface ContextMenuItem {
  label: string;
  action: string;
  shortcut?: string;
  separator?: boolean;
}

/**
 * Create context menu
 */
export function createContextMenu(
  items: ContextMenuItem[],
  position: Position,
  terminalWidth: number,
  terminalHeight: number
): {
  lines: string[];
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
} {
  // Calculate menu dimensions
  const maxLabelWidth = Math.max(...items.map((item) => item.label.length));
  const maxShortcutWidth = Math.max(...items.map((item) => item.shortcut?.length || 0));
  const menuWidth = Math.max(20, maxLabelWidth + maxShortcutWidth + 6); // 6 for padding and separator
  const menuHeight = items.length + 2; // +2 for borders

  // Adjust position if menu would go off screen
  let { x, y } = position;
  if (x + menuWidth > terminalWidth) {
    x = terminalWidth - menuWidth;
  }
  if (y + menuHeight > terminalHeight) {
    y = terminalHeight - menuHeight;
  }

  // Ensure minimum position
  x = Math.max(0, x);
  y = Math.max(0, y);

  // Create menu lines
  const lines: string[] = [];

  // Top border
  lines.push(`╭${'─'.repeat(menuWidth - 2)}╮`);

  // Menu items
  for (const item of items) {
    if (item.separator) {
      lines.push(`├${'─'.repeat(menuWidth - 2)}┤`);
    } else {
      const label = padText(item.label, maxLabelWidth);
      const shortcut = item.shortcut
        ? padText(item.shortcut, maxShortcutWidth, 'right')
        : ' '.repeat(maxShortcutWidth);
      const spacing = menuWidth - 2 - label.length - shortcut.length;
      lines.push(`│${label}${' '.repeat(spacing)}${shortcut}│`);
    }
  }

  // Bottom border
  lines.push(`╰${'─'.repeat(menuWidth - 2)}╯`);

  // Apply colors to the menu
  const coloredLines = colorContextMenu(lines);

  return {
    lines: coloredLines,
    bounds: {
      x,
      y,
      width: menuWidth,
      height: menuHeight,
    },
  };
}

/**
 * Get default context menu items for files
 */
export function getFileContextMenuItems(): ContextMenuItem[] {
  return [
    { label: 'Open', action: 'open', shortcut: 'Enter' },
    { label: 'Open with VSCode', action: 'open-vscode', shortcut: 'Ctrl+O' },
    { separator: true, label: '', action: '' },
    { label: 'Copy', action: 'copy', shortcut: 'Ctrl+C' },
    { label: 'Cut', action: 'cut', shortcut: 'Ctrl+X' },
    { label: 'Paste', action: 'paste', shortcut: 'Ctrl+V' },
    { separator: true, label: '', action: '' },
    { label: 'Delete', action: 'delete', shortcut: 'Del' },
  ];
}

/**
 * Get default context menu items for directories
 */
export function getDirectoryContextMenuItems(): ContextMenuItem[] {
  return [
    { label: 'Open', action: 'open', shortcut: 'Enter' },
    { label: 'Open with VSCode', action: 'open-vscode', shortcut: 'Ctrl+O' },
    { separator: true, label: '', action: '' },
    { label: 'Copy', action: 'copy', shortcut: 'Ctrl+C' },
    { label: 'Cut', action: 'cut', shortcut: 'Ctrl+X' },
    { label: 'Paste', action: 'paste', shortcut: 'Ctrl+V' },
    { separator: true, label: '', action: '' },
    { label: 'Delete', action: 'delete', shortcut: 'Del' },
  ];
}

/**
 * Get context menu items for empty space
 */
export function getEmptySpaceContextMenuItems(): ContextMenuItem[] {
  return [
    { label: 'Paste', action: 'paste', shortcut: 'Ctrl+V' },
    { separator: true, label: '', action: '' },
    { label: 'Refresh', action: 'refresh', shortcut: 'F5' },
  ];
}
