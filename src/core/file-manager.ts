import process from 'process';
import path from 'path';
import ansiEscapes from 'ansi-escapes';
import terminalSize from 'terminal-size';

import { StateManager } from './state-manager.js';
import { FileScanner } from './file-scanner.js';
import { LayoutManager } from './layout-manager.js';
import { FileOperations } from './file-operations.js';
import { SimpleEventBus, Events } from '../events/event-bus.js';
import { KeyboardHandler } from '../events/keyboard-handler.js';
import { MouseHandler } from '../events/mouse-handler.js';
import {
  createPathBar,
  createStatusBar,
  createWindowFrame,
  createEmptyMessage,
} from '../components/ui.js';
import {
  createContextMenu,
  getFileContextMenuItems,
  getDirectoryContextMenuItems,
  getEmptySpaceContextMenuItems,
} from '../components/context-menu.js';
import { colorWindowBorder } from '../components/theme.js';

export class FileManager {
  private stateManager: StateManager;
  private eventBus: SimpleEventBus;
  private keyboardHandler: KeyboardHandler;
  private mouseHandler: MouseHandler;
  private isRunning = false;
  private renderTimer?: NodeJS.Timeout;

  constructor() {
    const currentDir = process.cwd();
    const termSize = terminalSize();

    this.stateManager = new StateManager(currentDir, {
      width: termSize.columns || 80,
      height: termSize.rows || 24,
    });
    this.eventBus = new SimpleEventBus();
    this.keyboardHandler = new KeyboardHandler();
    this.mouseHandler = new MouseHandler();

    this.setupEventHandlers();
  }

  /**
   * Start the file manager
   */
  async start(): Promise<void> {
    if (this.isRunning) return;

    this.isRunning = true;

    try {
      // Initialize terminal
      this.initializeTerminal();

      // Start event handlers
      this.keyboardHandler.start();
      this.mouseHandler.start();

      // Register common shortcuts
      this.keyboardHandler.registerCommonShortcuts(this.eventBus);
      this.mouseHandler.registerCommonHandlers(this.eventBus);

      // Load initial directory
      await this.loadCurrentDirectory();

      // Start render loop
      this.startRenderLoop();

      // Subscribe to state changes
      this.stateManager.subscribe(() => {
        this.render();
      });
    } catch (error) {
      console.error('Failed to start file manager:', error);
      await this.stop();
      throw error;
    }
  }

  /**
   * Stop the file manager
   */
  async stop(): Promise<void> {
    if (!this.isRunning) return;

    this.isRunning = false;

    // Stop render loop
    if (this.renderTimer) {
      clearInterval(this.renderTimer);
      this.renderTimer = undefined;
    }

    // Stop event handlers
    this.keyboardHandler.stop();
    this.mouseHandler.stop();

    // Clean up terminal
    this.cleanupTerminal();

    // Clear event bus
    this.eventBus.clear();
  }

  /**
   * Initialize terminal settings
   */
  private initializeTerminal(): void {
    // Hide cursor
    process.stdout.write(ansiEscapes.cursorHide);

    // Clear screen
    process.stdout.write(ansiEscapes.clearScreen);

    // Enable alternative screen buffer
    process.stdout.write('\x1b[?1049h');

    // Handle terminal resize
    process.stdout.on('resize', () => {
      const termSize = terminalSize();
      this.stateManager.setTerminalSize({
        width: termSize.columns || 80,
        height: termSize.rows || 24,
      });
    });
  }

  /**
   * Cleanup terminal settings
   */
  private cleanupTerminal(): void {
    // Disable alternative screen buffer
    process.stdout.write('\x1b[?1049l');

    // Show cursor
    process.stdout.write(ansiEscapes.cursorShow);

    // Clear screen
    process.stdout.write(ansiEscapes.clearScreen);
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    // Navigation events
    this.eventBus.on(Events.NAVIGATION, async (event: any) => {
      await this.handleNavigation(event.direction);
    });

    // Mouse events
    this.eventBus.on(Events.MOUSE_CLICK, (event: MouseEventObject) => {
      this.handleMouseClick(event);
    });

    this.eventBus.on(Events.MOUSE_DOUBLE_CLICK, (event: MouseEventObject) => {
      this.handleMouseDoubleClick(event);
    });

    this.eventBus.on(Events.MOUSE_RIGHT_CLICK, (event: MouseEventObject) => {
      this.handleMouseRightClick(event);
    });

    // File operations
    this.eventBus.on(Events.FILE_OPENED, async () => {
      await this.handleFileOpen();
    });

    this.eventBus.on(Events.FILE_COPY, () => {
      this.handleFileCopy();
    });

    this.eventBus.on(Events.FILE_CUT, () => {
      this.handleFileCut();
    });

    this.eventBus.on(Events.FILE_PASTE, async () => {
      await this.handleFilePaste();
    });

    this.eventBus.on(Events.FILE_DELETE, async () => {
      await this.handleFileDelete();
    });

    this.eventBus.on(Events.FILE_OPEN_VSCODE, async () => {
      await this.handleOpenWithVSCode();
    });

    // Context menu events
    this.eventBus.on(Events.CONTEXT_MENU_ACTION, async (event: any) => {
      await this.handleContextMenuAction(event.action);
    });

    // Refresh
    this.eventBus.on(Events.REFRESH, async () => {
      await this.loadCurrentDirectory();
    });
  }

  /**
   * Load files from current directory
   */
  private async loadCurrentDirectory(): Promise<void> {
    try {
      const state = this.stateManager.getState();
      const items = await FileScanner.scanDirectory(state.viewport.currentPath);

      this.stateManager.setFileItems(items);

      // Update layout
      const layout = LayoutManager.calculateLayout(state.viewport.terminalSize);
      this.stateManager.setLayoutInfo(layout.itemsPerRow, layout.totalRows);

      // Reset selection if needed
      const { selectedIndex } = state.selection;
      if (selectedIndex >= items.length) {
        this.stateManager.clearSelection();
      }
    } catch (error) {
      console.error('Failed to load directory:', error);
      this.stateManager.setFileItems([]);
    }
  }

  /**
   * Handle navigation
   */
  private async handleNavigation(direction: string): Promise<void> {
    const state = this.stateManager.getState();

    switch (direction) {
      case 'up':
      case 'down':
      case 'left':
      case 'right':
        this.stateManager.moveSelection(direction as any);
        break;

      case 'back':
        const parentPath = FileScanner.getParentPath(state.viewport.currentPath);
        if (parentPath !== state.viewport.currentPath) {
          this.stateManager.setCurrentPath(parentPath);
          await this.loadCurrentDirectory();
        }
        break;
    }
  }

  /**
   * Handle mouse click
   */
  private handleMouseClick(event: MouseEventObject): void {
    const state = this.stateManager.getState();
    const layout = LayoutManager.calculateLayout(state.viewport.terminalSize);

    // Hide context menu if visible
    if (state.contextMenu.visible) {
      this.stateManager.hideContextMenu();
      return;
    }

    const itemIndex = LayoutManager.getItemIndexFromPosition(
      event.x,
      event.y,
      layout,
      state.viewport.items.length
    );

    if (itemIndex >= 0) {
      const item = state.viewport.items[itemIndex];
      this.stateManager.setSelection(itemIndex, item);
    } else {
      this.stateManager.clearSelection();
    }
  }

  /**
   * Handle mouse double click
   */
  private handleMouseDoubleClick(event: MouseEventObject): void {
    const state = this.stateManager.getState();
    const layout = LayoutManager.calculateLayout(state.viewport.terminalSize);

    const itemIndex = LayoutManager.getItemIndexFromPosition(
      event.x,
      event.y,
      layout,
      state.viewport.items.length
    );

    if (itemIndex >= 0) {
      const item = state.viewport.items[itemIndex];
      this.stateManager.setSelection(itemIndex, item);
      this.handleFileOpen();
    }
  }

  /**
   * Handle mouse right click
   */
  private handleMouseRightClick(event: MouseEventObject): void {
    const state = this.stateManager.getState();
    const layout = LayoutManager.calculateLayout(state.viewport.terminalSize);

    const itemIndex = LayoutManager.getItemIndexFromPosition(
      event.x,
      event.y,
      layout,
      state.viewport.items.length
    );

    let targetItem: FileItem | null = null;

    if (itemIndex >= 0) {
      targetItem = state.viewport.items[itemIndex];
      this.stateManager.setSelection(itemIndex, targetItem);
    }

    this.stateManager.showContextMenu({ x: event.x, y: event.y }, targetItem);
  }

  /**
   * Handle file open
   */
  private async handleFileOpen(): Promise<void> {
    const state = this.stateManager.getState();
    const { selectedItem } = state.selection;

    if (!selectedItem) return;

    try {
      if (selectedItem.type === 'directory') {
        this.stateManager.setCurrentPath(selectedItem.path);
        await this.loadCurrentDirectory();
      } else {
        await FileOperations.openWithSystem(selectedItem.path);
      }
    } catch (error) {
      console.error('Failed to open item:', error);
    }
  }

  /**
   * Handle file copy
   */
  private handleFileCopy(): void {
    const state = this.stateManager.getState();
    const { selectedItem } = state.selection;

    if (selectedItem) {
      this.stateManager.setClipboard(selectedItem, 'copy');
    }
  }

  /**
   * Handle file cut
   */
  private handleFileCut(): void {
    const state = this.stateManager.getState();
    const { selectedItem } = state.selection;

    if (selectedItem) {
      this.stateManager.setClipboard(selectedItem, 'cut');
    }
  }

  /**
   * Handle file paste
   */
  private async handleFilePaste(): Promise<void> {
    const state = this.stateManager.getState();
    const { clipboard, clipboardOperation } = state;

    if (!clipboard || !clipboardOperation) return;

    try {
      const fileName = path.basename(clipboard.path);
      const destinationPath = path.join(state.viewport.currentPath, fileName);
      const finalPath = await FileOperations.getUniqueFileName(destinationPath);

      if (clipboardOperation === 'copy') {
        await FileOperations.copy(clipboard.path, finalPath);
      } else if (clipboardOperation === 'cut') {
        await FileOperations.move(clipboard.path, finalPath);
        this.stateManager.clearClipboard();
      }

      await this.loadCurrentDirectory();
    } catch (error) {
      console.error('Failed to paste item:', error);
    }
  }

  /**
   * Handle file delete
   */
  private async handleFileDelete(): Promise<void> {
    const state = this.stateManager.getState();
    const { selectedItem } = state.selection;

    if (!selectedItem) return;

    try {
      await FileOperations.delete(selectedItem.path);
      await this.loadCurrentDirectory();
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  }

  /**
   * Handle open with VS Code
   */
  private async handleOpenWithVSCode(): Promise<void> {
    const state = this.stateManager.getState();
    const { selectedItem } = state.selection;

    if (!selectedItem) return;

    try {
      await FileOperations.openWithVSCode(selectedItem.path);
    } catch (error) {
      console.error('Failed to open with VS Code:', error);
    }
  }

  /**
   * Handle context menu action
   */
  private async handleContextMenuAction(action: string): Promise<void> {
    this.stateManager.hideContextMenu();

    switch (action) {
      case 'open':
        await this.handleFileOpen();
        break;
      case 'open-vscode':
        await this.handleOpenWithVSCode();
        break;
      case 'copy':
        this.handleFileCopy();
        break;
      case 'cut':
        this.handleFileCut();
        break;
      case 'paste':
        await this.handleFilePaste();
        break;
      case 'delete':
        await this.handleFileDelete();
        break;
      case 'refresh':
        await this.loadCurrentDirectory();
        break;
    }
  }

  /**
   * Start render loop
   */
  private startRenderLoop(): void {
    this.render();
    this.renderTimer = setInterval(() => {
      this.render();
    }, 50); // 20 FPS
  }

  /**
   * Render the interface
   */
  private render(): void {
    if (!this.isRunning) return;

    const state = this.stateManager.getState();
    const { terminalSize } = state.viewport;
    const layout = LayoutManager.calculateLayout(terminalSize);

    // Clear screen and go to top
    process.stdout.write(ansiEscapes.clearScreen);
    process.stdout.write(ansiEscapes.cursorTo(0, 0));

    // Create window frame
    const windowFrame = createWindowFrame(terminalSize.width, terminalSize.height, 'File Manager');

    // Render top border
    process.stdout.write(windowFrame.top + '\n');

    // Render path bar
    const pathBar = createPathBar(state.viewport.currentPath, terminalSize.width);
    process.stdout.write(pathBar + '\n');

    // Render separator
    process.stdout.write(colorWindowBorder(`│${'─'.repeat(terminalSize.width - 2)}│`) + '\n');

    // Render file grid
    if (state.viewport.items.length === 0) {
      const emptyMessage = createEmptyMessage(terminalSize.width);
      emptyMessage.forEach((line) => process.stdout.write(line + '\n'));
    } else {
      const fileGrid = LayoutManager.renderFileGrid(
        state.viewport.items,
        state.selection.selectedIndex,
        layout,
        terminalSize.width
      );

      fileGrid.forEach((line) => {
        process.stdout.write(colorWindowBorder(`│${line}│`) + '\n');
      });
    }

    // Fill remaining space
    const usedHeight =
      3 + (state.viewport.items.length === 0 ? 5 : layout.totalRows * layout.itemHeight) + 2; // +2 for status and bottom
    const remainingHeight = terminalSize.height - usedHeight;

    for (let i = 0; i < remainingHeight; i++) {
      process.stdout.write(colorWindowBorder(`│${' '.repeat(terminalSize.width - 2)}│`) + '\n');
    }

    // Render status bar
    const statusBar = createStatusBar(
      state.viewport.items.length,
      state.selection.selectedIndex,
      terminalSize.width
    );
    process.stdout.write(statusBar + '\n');

    // Render bottom border
    process.stdout.write(windowFrame.bottom);

    // Render context menu if visible
    if (state.contextMenu.visible) {
      this.renderContextMenu(state);
    }
  }

  /**
   * Render context menu
   */
  private renderContextMenu(state: any): void {
    const { contextMenu } = state;

    let menuItems;
    if (contextMenu.targetItem) {
      menuItems =
        contextMenu.targetItem.type === 'directory'
          ? getDirectoryContextMenuItems()
          : getFileContextMenuItems();
    } else {
      menuItems = getEmptySpaceContextMenuItems();
    }

    const menu = createContextMenu(
      menuItems,
      contextMenu.position,
      state.viewport.terminalSize.width,
      state.viewport.terminalSize.height
    );

    // Render menu at position
    menu.lines.forEach((line, index) => {
      const y = menu.bounds.y + index;
      process.stdout.write(ansiEscapes.cursorTo(menu.bounds.x, y));
      process.stdout.write(line);
    });
  }
}
