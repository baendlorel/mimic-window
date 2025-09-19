import { createFileItem } from '../components/icons.js';

export interface LayoutInfo {
  itemsPerRow: number;
  totalRows: number;
  itemWidth: number;
  itemHeight: number;
  startY: number; // Starting Y position for file items
}

export interface ItemPosition {
  x: number;
  y: number;
  row: number;
  col: number;
  index: number;
}

export class LayoutManager {
  private static readonly ITEM_WIDTH = 13; // 9 for icon + 4 for spacing
  private static readonly ITEM_HEIGHT = 5; // 3 for icon + 2 for name lines
  private static readonly HEADER_HEIGHT = 3; // Path bar + separator
  private static readonly FOOTER_HEIGHT = 2; // Status bar
  private static readonly MIN_ITEMS_PER_ROW = 1;

  /**
   * Calculate layout information based on terminal size
   */
  static calculateLayout(terminalSize: Size): LayoutInfo {
    const availableWidth = terminalSize.width - 4; // Account for borders
    const availableHeight = terminalSize.height - this.HEADER_HEIGHT - this.FOOTER_HEIGHT - 2; // Account for borders

    const itemsPerRow = Math.max(
      this.MIN_ITEMS_PER_ROW,
      Math.floor(availableWidth / this.ITEM_WIDTH)
    );

    const maxRows = Math.floor(availableHeight / this.ITEM_HEIGHT);
    const totalRows = Math.max(1, maxRows);

    return {
      itemsPerRow,
      totalRows,
      itemWidth: this.ITEM_WIDTH,
      itemHeight: this.ITEM_HEIGHT,
      startY: this.HEADER_HEIGHT + 1, // +1 for top border
    };
  }

  /**
   * Get position information for a specific item index
   */
  static getItemPosition(index: number, layout: LayoutInfo): ItemPosition {
    const row = Math.floor(index / layout.itemsPerRow);
    const col = index % layout.itemsPerRow;

    const x = col * layout.itemWidth + 2; // +2 for left border
    const y = layout.startY + row * layout.itemHeight;

    return {
      x,
      y,
      row,
      col,
      index,
    };
  }

  /**
   * Get item index from terminal coordinates
   */
  static getItemIndexFromPosition(
    x: number,
    y: number,
    layout: LayoutInfo,
    totalItems: number
  ): number {
    // Check if click is in the file area
    if (y < layout.startY || x < 2) {
      return -1;
    }

    const adjustedX = x - 2; // Account for left border
    const adjustedY = y - layout.startY;

    const col = Math.floor(adjustedX / layout.itemWidth);
    const row = Math.floor(adjustedY / layout.itemHeight);

    if (col >= layout.itemsPerRow) {
      return -1;
    }

    const index = row * layout.itemsPerRow + col;

    return index < totalItems ? index : -1;
  }

  /**
   * Check if coordinates are within item bounds
   */
  static isWithinItemBounds(
    x: number,
    y: number,
    itemPosition: ItemPosition,
    layout: LayoutInfo
  ): boolean {
    return (
      x >= itemPosition.x &&
      x < itemPosition.x + layout.itemWidth &&
      y >= itemPosition.y &&
      y < itemPosition.y + layout.itemHeight
    );
  }

  /**
   * Render file items in grid layout
   */
  static renderFileGrid(
    items: FileItem[],
    selectedIndex: number,
    layout: LayoutInfo,
    terminalWidth: number
  ): string[] {
    const lines: string[] = [];
    const maxY = layout.startY + layout.totalRows * layout.itemHeight;

    // Initialize all lines with empty content
    for (let y = 0; y < maxY; y++) {
      lines[y] = ' '.repeat(terminalWidth - 2); // -2 for borders
    }

    // Render each item
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const position = this.getItemPosition(i, layout);
      const isSelected = i === selectedIndex;

      // Create item visual
      const itemLines = createFileItem(item.name, item.type, isSelected);

      // Place item lines in the grid
      for (let lineIndex = 0; lineIndex < itemLines.length; lineIndex++) {
        const targetY = position.y + lineIndex;
        if (targetY < lines.length) {
          const line = lines[targetY];
          const before = line.substring(0, position.x);
          const after = line.substring(position.x + itemLines[lineIndex].length);
          lines[targetY] = before + itemLines[lineIndex] + after;
        }
      }
    }

    return lines;
  }

  /**
   * Get visible item indices for current view
   */
  static getVisibleItems(
    totalItems: number,
    layout: LayoutInfo,
    scrollOffset: number = 0
  ): { start: number; end: number; visibleCount: number } {
    const itemsPerPage = layout.itemsPerRow * layout.totalRows;
    const start = scrollOffset * layout.itemsPerRow;
    const end = Math.min(totalItems, start + itemsPerPage);
    const visibleCount = end - start;

    return { start, end, visibleCount };
  }

  /**
   * Calculate scroll offset to ensure item is visible
   */
  static getScrollOffsetForItem(
    itemIndex: number,
    layout: LayoutInfo,
    currentScrollOffset: number = 0
  ): number {
    const itemRow = Math.floor(itemIndex / layout.itemsPerRow);
    const visibleRowStart = currentScrollOffset;
    const visibleRowEnd = currentScrollOffset + layout.totalRows - 1;

    if (itemRow < visibleRowStart) {
      return itemRow;
    } else if (itemRow > visibleRowEnd) {
      return itemRow - layout.totalRows + 1;
    }

    return currentScrollOffset;
  }
}
