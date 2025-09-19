// ASCII icons and components for file manager UI
import { colorFolderIcon, colorFileIcon, colorFileName, colorSelection } from './theme.js';

/**
 * Folder icon (9 characters wide)
 */
export function createFolderIcon(): string[] {
  return ['╭´‾`──╮', '│     │', '╰─────╯'];
}

/**
 * File icon (9 characters wide)
 */
export function createFileIcon(): string[] {
  return ['┌━━━━━╮', '│     │', '╰─────╯'];
}

/**
 * Center text within given width, handling multi-line overflow
 */
export function centerText(text: string, width: number): string[] {
  if (text.length <= width) {
    const padding = Math.floor((width - text.length) / 2);
    return [' '.repeat(padding) + text + ' '.repeat(width - text.length - padding)];
  }

  // Handle text overflow by wrapping
  const lines: string[] = [];
  let currentLine = '';
  const words = text.split(' ');

  for (const word of words) {
    if (currentLine.length + word.length + 1 <= width) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) {
        lines.push(centerSingleLine(currentLine, width));
        currentLine = word;
      } else {
        // Single word is too long, truncate it
        lines.push(centerSingleLine(word.substring(0, width - 3) + '...', width));
        currentLine = '';
      }
    }
  }

  if (currentLine) {
    lines.push(centerSingleLine(currentLine, width));
  }

  return lines;
}

function centerSingleLine(text: string, width: number): string {
  const padding = Math.floor((width - text.length) / 2);
  return ' '.repeat(padding) + text + ' '.repeat(width - text.length - padding);
}

/**
 * Create a file/folder item with icon and name
 */
export function createFileItem(
  name: string,
  type: 'file' | 'directory',
  isSelected: boolean = false
): string[] {
  const iconWidth = 9;
  const icon = type === 'directory' ? createFolderIcon() : createFileIcon();

  // Apply colors to icon
  const coloredIcon =
    type === 'directory' ? colorFolderIcon(icon, isSelected) : colorFileIcon(icon, isSelected);

  const nameLines = centerText(name, iconWidth);

  // Apply colors to name
  const coloredNameLines = nameLines.map((line) => colorFileName(line, type, isSelected));

  // Combine icon and name
  const result = [...coloredIcon, ...coloredNameLines];

  // Add selection highlight if needed
  if (isSelected) {
    return result.map((line) => colorSelection(line));
  }

  return result.map((line) => `  ${line}  `);
}

/**
 * Create horizontal separator line
 */
export function createSeparator(width: number, char: string = '─'): string {
  return char.repeat(width);
}

/**
 * Create a bordered box
 */
export function createBox(width: number, height: number, title?: string): string[] {
  const topBorder = title
    ? `╭─ ${title} ${'─'.repeat(Math.max(0, width - title.length - 6))}╮`
    : `╭${'─'.repeat(width - 2)}╮`;

  const bottomBorder = `╰${'─'.repeat(width - 2)}╯`;
  const sideBorder = `│${' '.repeat(width - 2)}│`;

  const lines = [topBorder];
  for (let i = 0; i < height - 2; i++) {
    lines.push(sideBorder);
  }
  lines.push(bottomBorder);

  return lines;
}

/**
 * Truncate text with ellipsis if too long
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Pad text to specific width
 */
export function padText(
  text: string,
  width: number,
  align: 'left' | 'center' | 'right' = 'left'
): string {
  if (text.length >= width) return text.substring(0, width);

  const padding = width - text.length;

  switch (align) {
    case 'center':
      const leftPad = Math.floor(padding / 2);
      const rightPad = padding - leftPad;
      return ' '.repeat(leftPad) + text + ' '.repeat(rightPad);
    case 'right':
      return ' '.repeat(padding) + text;
    default: // left
      return text + ' '.repeat(padding);
  }
}
