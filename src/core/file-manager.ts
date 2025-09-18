import blessed from 'blessed';
import path from 'path';
import { FileSystem } from './file-system.js';
import { UI } from './ui.js';
import { EventHandler } from './event-handler.js';

export class FileManager {
  private screen!: blessed.Widgets.Screen;
  private fileSystem: FileSystem;
  private ui: UI;
  private eventHandler: EventHandler;
  private currentPath: string;

  constructor() {
    this.currentPath = process.cwd();
    this.fileSystem = new FileSystem();
    this.ui = new UI();
    this.eventHandler = new EventHandler();
  }

  async start(): Promise<void> {
    this.initializeScreen();
    this.setupEventHandlers();
    await this.refreshView();

    this.screen.render();

    // Start the main loop
    this.screen.key(['escape', 'q', 'C-c'], () => {
      process.exit(0);
    });
  }

  private initializeScreen(): void {
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'Mimic Window - File Manager',
      cursor: {
        artificial: true,
        shape: 'block',
        blink: true,
      },
    });

    this.ui.initialize(this.screen, this.currentPath);
  }

  private setupEventHandlers(): void {
    this.eventHandler.setupKeyboardEvents(this.screen, {
      onNavigate: (direction: 'up' | 'down' | 'left' | 'right') => {
        this.handleNavigation(direction);
      },
      onEnter: () => {
        this.handleEnter();
      },
      onEscape: () => {
        this.handleEscape();
      },
    });

    // Mouse events will be handled by UI component
  }

  private async handleNavigation(direction: 'up' | 'down' | 'left' | 'right'): Promise<void> {
    this.ui.navigateSelection(direction);
    this.screen.render();
  }

  private async handleEnter(): Promise<void> {
    const selectedItem = this.ui.getSelectedItem();
    if (selectedItem) {
      if (selectedItem.isDirectory) {
        await this.navigateToDirectory(selectedItem.path);
      } else {
        await this.openFile(selectedItem.path);
      }
    }
  }

  private async handleEscape(): Promise<void> {
    const parentPath = path.dirname(this.currentPath);
    if (parentPath !== this.currentPath) {
      await this.navigateToDirectory(parentPath);
    }
  }

  private async navigateToDirectory(dirPath: string): Promise<void> {
    try {
      const files = await this.fileSystem.listDirectory(dirPath);
      this.currentPath = dirPath;
      this.ui.updateDirectoryView(dirPath, files);
      this.screen.render();
    } catch (error) {
      this.ui.showError(`Cannot access directory: ${error}`);
    }
  }

  private async openFile(filePath: string): Promise<void> {
    try {
      // For now, just show a message
      this.ui.showMessage(`Opening file: ${path.basename(filePath)}`);
      // TODO: Implement file opening logic
    } catch (error) {
      this.ui.showError(`Cannot open file: ${error}`);
    }
  }

  private async refreshView(): Promise<void> {
    try {
      const files = await this.fileSystem.listDirectory(this.currentPath);
      this.ui.updateDirectoryView(this.currentPath, files);
    } catch (error) {
      this.ui.showError(`Cannot read directory: ${error}`);
    }
  }
}
