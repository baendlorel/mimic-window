import { AppState, FileItem, Position, Size } from './types.js';

// State management using functional approach with immutable updates
export class StateManager {
  private state: AppState;
  private listeners: ((state: AppState) => void)[] = [];

  constructor(initialPath: string, terminalSize: Size) {
    this.state = {
      viewport: {
        currentPath: initialPath,
        items: [],
        terminalSize,
        itemsPerRow: 0,
        totalRows: 0,
      },
      selection: {
        selectedIndex: -1,
        selectedItem: null,
      },
      contextMenu: {
        visible: false,
        position: { x: 0, y: 0 },
        targetItem: null,
      },
      clipboard: null,
      clipboardOperation: null,
    };
  }

  // Get current state (immutable)
  getState(): Readonly<AppState> {
    return { ...this.state };
  }

  // Subscribe to state changes
  subscribe(listener: (state: AppState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Update state immutably and notify listeners
  private updateState(updater: (state: AppState) => AppState): void {
    this.state = updater(this.state);
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.state));
  }

  // Action creators
  setCurrentPath(path: string): void {
    this.updateState((state) => ({
      ...state,
      viewport: {
        ...state.viewport,
        currentPath: path,
      },
    }));
  }

  setFileItems(items: FileItem[]): void {
    this.updateState((state) => ({
      ...state,
      viewport: {
        ...state.viewport,
        items,
      },
    }));
  }

  setTerminalSize(size: Size): void {
    this.updateState((state) => ({
      ...state,
      viewport: {
        ...state.viewport,
        terminalSize: size,
      },
    }));
  }

  setLayoutInfo(itemsPerRow: number, totalRows: number): void {
    this.updateState((state) => ({
      ...state,
      viewport: {
        ...state.viewport,
        itemsPerRow,
        totalRows,
      },
    }));
  }

  setSelection(index: number, item: FileItem | null): void {
    this.updateState((state) => ({
      ...state,
      selection: {
        selectedIndex: index,
        selectedItem: item,
      },
    }));
  }

  clearSelection(): void {
    this.setSelection(-1, null);
  }

  moveSelection(direction: 'up' | 'down' | 'left' | 'right'): void {
    const { selection, viewport } = this.state;
    const { selectedIndex } = selection;
    const { items, itemsPerRow } = viewport;

    if (items.length === 0) return;

    let newIndex = selectedIndex;

    switch (direction) {
      case 'left':
        newIndex = Math.max(0, selectedIndex - 1);
        break;
      case 'right':
        newIndex = Math.min(items.length - 1, selectedIndex + 1);
        break;
      case 'up':
        newIndex = Math.max(0, selectedIndex - itemsPerRow);
        break;
      case 'down':
        newIndex = Math.min(items.length - 1, selectedIndex + itemsPerRow);
        break;
    }

    this.setSelection(newIndex, items[newIndex] || null);
  }

  showContextMenu(position: Position, targetItem: FileItem | null): void {
    this.updateState((state) => ({
      ...state,
      contextMenu: {
        visible: true,
        position,
        targetItem,
      },
    }));
  }

  hideContextMenu(): void {
    this.updateState((state) => ({
      ...state,
      contextMenu: {
        ...state.contextMenu,
        visible: false,
      },
    }));
  }

  setClipboard(item: FileItem | null, operation: 'copy' | 'cut' | null): void {
    this.updateState((state) => ({
      ...state,
      clipboard: item,
      clipboardOperation: operation,
    }));
  }

  clearClipboard(): void {
    this.setClipboard(null, null);
  }
}
