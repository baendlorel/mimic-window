// Core types for the file manager
export interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  lastModified?: Date;
}

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface SelectionState {
  selectedIndex: number;
  selectedItem: FileItem | null;
}

export interface ViewportState {
  currentPath: string;
  items: FileItem[];
  terminalSize: Size;
  itemsPerRow: number;
  totalRows: number;
}

export interface ContextMenuState {
  visible: boolean;
  position: Position;
  targetItem: FileItem | null;
}

export interface AppState {
  viewport: ViewportState;
  selection: SelectionState;
  contextMenu: ContextMenuState;
  clipboard: FileItem | null;
  clipboardOperation: 'copy' | 'cut' | null;
}

export interface MouseEvent {
  x: number;
  y: number;
  button: 'left' | 'right' | 'middle';
  type: 'click' | 'double-click';
}

export interface KeyEvent {
  key: string;
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
}
