declare const __IS_DEV__: boolean;
// Core types for the file manager
interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  lastModified?: Date;
}

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface SelectionState {
  selectedIndex: number;
  selectedItem: FileItem | null;
}

interface ViewportState {
  currentPath: string;
  items: FileItem[];
  terminalSize: Size;
  itemsPerRow: number;
  totalRows: number;
}

interface ContextMenuState {
  visible: boolean;
  position: Position;
  targetItem: FileItem | null;
}

interface AppState {
  viewport: ViewportState;
  selection: SelectionState;
  contextMenu: ContextMenuState;
  clipboard: FileItem | null;
  clipboardOperation: 'copy' | 'cut' | null;
}

interface MouseEventObject {
  x: number;
  y: number;
  button: 'left' | 'right' | 'middle';
  type: 'click' | 'double-click';
}

interface KeyEvent {
  key: string;
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
}

interface EventHandler<T = any> {
  (event: T): void | Promise<void>;
}

interface EventBus {
  on<T>(event: string, handler: EventHandler<T>): () => void;
  emit<T>(event: string, data: T): void;
  off(event: string, handler?: EventHandler): void;
}
