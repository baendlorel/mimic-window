import { truncateText, padText } from './icons.js';
import { colorPathBar, colorWindowBorder, colorWindowTitle, colorStatusBar } from './theme.js';

/**
 * Create path breadcrumb bar
 */
export function createPathBar(currentPath: string, width: number): string {
  const prefix = '📁 ';
  const availableWidth = width - prefix.length - 2; // 2 for borders
  const truncatedPath = truncateText(currentPath, availableWidth);
  const coloredPath = colorPathBar(truncatedPath);

  return colorWindowBorder(`│ ${prefix}${padText(coloredPath, availableWidth)} │`);
}

/**
 * Create status bar with file count and other info
 */
export function createStatusBar(itemCount: number, selectedIndex: number, width: number): string {
  const statusText =
    selectedIndex >= 0 ? `${selectedIndex + 1}/${itemCount} items` : `${itemCount} items`;

  const availableWidth = width - 4; // 2 for borders on each side
  const paddedStatus = padText(statusText, availableWidth, 'center');
  const coloredStatus = colorStatusBar(paddedStatus, 'info');

  return colorWindowBorder(`│ ${coloredStatus} │`);
}

/**
 * Create window frame with title
 */
export function createWindowFrame(
  width: number,
  height: number,
  title: string
): {
  top: string;
  bottom: string;
  sides: string[];
} {
  const coloredTitle = colorWindowTitle(title);
  const titleBar = colorWindowBorder(
    `╭─ ${coloredTitle} ${'─'.repeat(Math.max(0, width - title.length - 6))}╮`
  );
  const bottomBar = colorWindowBorder(`╰${'─'.repeat(width - 2)}╯`);

  const sides = [];
  for (let i = 0; i < height - 2; i++) {
    sides.push(colorWindowBorder(`│${' '.repeat(width - 2)}│`));
  }

  return {
    top: titleBar,
    bottom: bottomBar,
    sides,
  };
}

/**
 * Create empty content placeholder
 */
export function createEmptyMessage(width: number, message: string = 'No files found'): string[] {
  const messageLines = ['📂', '', message, '', 'This directory is empty'];

  const availableWidth = width - 4; // Account for borders

  return messageLines.map((line) => {
    const paddedLine = padText(line, availableWidth, 'center');
    const coloredLine = line ? colorStatusBar(paddedLine, 'info') : paddedLine;
    return colorWindowBorder(`│ ${coloredLine} │`);
  });
}

/**
 * Create loading indicator
 */
export function createLoadingIndicator(width: number, frame: number = 0): string {
  const spinners = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  const spinner = spinners[frame % spinners.length];
  const message = `${spinner} Loading...`;

  const availableWidth = width - 4;
  const paddedMessage = padText(message, availableWidth, 'center');
  const coloredMessage = colorStatusBar(paddedMessage, 'info');

  return colorWindowBorder(`│ ${coloredMessage} │`);
}
