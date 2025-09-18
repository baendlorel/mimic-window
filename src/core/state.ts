import { EventEmitter } from 'events';
import { FileItem } from './file-system.js';

// Application state interface
export interface AppState {
  currentPath: string;
  files: FileItem[];
  selectedIndex: number;
  viewMode: 'list' | 'grid';
  sortBy: 'name' | 'size' | 'date';
  sortOrder: 'asc' | 'desc';
  showHidden: boolean;
  isLoading: boolean;
  error: string | null;
  message: string | null;
  contextMenu: {
    visible: boolean;
    x: number;
    y: number;
    items: string[];
  };
}

// State change events
export interface StateEvents {
  'state:changed': (newState: AppState, oldState: AppState) => void;
  'state:path:changed': (path: string) => void;
  'state:selection:changed': (index: number) => void;
  'state:files:changed': (files: FileItem[]) => void;
  'state:error:occurred': (error: string) => void;
  'state:message:shown': (message: string) => void;
  'state:contextmenu:shown': (x: number, y: number) => void;
  'state:contextmenu:hidden': () => void;
}

export class StateManager extends EventEmitter {
  private state: AppState;

  constructor() {
    super();
    this.state = this.getInitialState();
  }

  private getInitialState(): AppState {
    return {
      currentPath: process.cwd(),
      files: [],
      selectedIndex: 0,
      viewMode: 'list',
      sortBy: 'name',
      sortOrder: 'asc',
      showHidden: false,
      isLoading: false,
      error: null,
      message: null,
      contextMenu: {
        visible: false,
        x: 0,
        y: 0,
        items: ['Open', 'Copy', 'Paste', 'Delete', 'Rename', 'Properties'],
      },
    };
  }

  // Get the current state
  getState(): AppState {
    return { ...this.state };
  }

  // Update state using an updater function
  updateState(updater: (state: AppState) => AppState): void {
    const oldState = this.getState();
    this.state = updater(this.getState());
    this.emit('state:changed', this.state, oldState);
  }

  // Specific state update helpers
  setCurrentPath(path: string): void {
    this.updateState((state) => ({
      ...state,
      currentPath: path,
      selectedIndex: 0,
      error: null,
    }));
    this.emit('state:path:changed', path);
  }

  setFiles(files: FileItem[]): void {
    this.updateState((state) => ({
      ...state,
      files,
      isLoading: false,
      error: null,
    }));
    this.emit('state:files:changed', files);
  }

  setSelectedIndex(index: number): void {
    this.updateState((state) => ({
      ...state,
      selectedIndex: index,
    }));
    this.emit('state:selection:changed', index);
  }

  setLoading(isLoading: boolean): void {
    this.updateState((state) => ({
      ...state,
      isLoading,
    }));
  }

  setError(error: string | null): void {
    this.updateState((state) => ({
      ...state,
      error,
      isLoading: false,
    }));
    if (error) {
      this.emit('state:error:occurred', error);
    }
  }

  setMessage(message: string | null): void {
    this.updateState((state) => ({
      ...state,
      message,
    }));
    if (message) {
      this.emit('state:message:shown', message);
    }
  }

  showContextMenu(x: number, y: number): void {
    this.updateState((state) => ({
      ...state,
      contextMenu: {
        ...state.contextMenu,
        visible: true,
        x,
        y,
      },
    }));
    this.emit('state:contextmenu:shown', x, y);
  }

  hideContextMenu(): void {
    this.updateState((state) => ({
      ...state,
      contextMenu: {
        ...state.contextMenu,
        visible: false,
      },
    }));
    this.emit('state:contextmenu:hidden');
  }

  toggleViewMode(): void {
    this.updateState((state) => ({
      ...state,
      viewMode: state.viewMode === 'list' ? 'grid' : 'list',
    }));
  }

  toggleSortOrder(): void {
    this.updateState((state) => ({
      ...state,
      sortOrder: state.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  }

  setSortBy(sortBy: 'name' | 'size' | 'date'): void {
    this.updateState((state) => ({
      ...state,
      sortBy,
    }));
  }

  toggleHiddenFiles(): void {
    this.updateState((state) => ({
      ...state,
      showHidden: !state.showHidden,
    }));
  }

  // Selector functions (derive data from state)
  getSelectedFile(): FileItem | null {
    const { files, selectedIndex } = this.state;
    return files.length > 0 && selectedIndex < files.length ? files[selectedIndex] : null;
  }

  getSortedFiles(): FileItem[] {
    const { files, sortBy, sortOrder, showHidden } = this.state;

    let filteredFiles = files;
    if (!showHidden) {
      filteredFiles = files.filter((file) => !file.name.startsWith('.'));
    }

    return filteredFiles.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'date':
          comparison = a.modified.getTime() - b.modified.getTime();
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  // State validation
  validateState(): boolean {
    const { files, selectedIndex } = this.state;

    if (selectedIndex < 0 || selectedIndex >= files.length) {
      this.setSelectedIndex(0);
      return false;
    }

    return true;
  }

  // State persistence (optional)
  saveState(): void {
    // 可以保存状态到本地文件
  }

  loadState(): void {
    // Can load state from a local file
  }

  // Reset state
  resetState(): void {
    const oldState = this.getState();
    this.state = this.getInitialState();
    this.emit('state:changed', this.state, oldState);
  }
}

// 创建全局状态管理器实例
export const globalState = new StateManager();
