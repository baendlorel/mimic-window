import blessed from 'blessed';
import path from 'path';
import { FileItem } from './file-system.js';

export class UI {
  private screen!: blessed.Widgets.Screen;
  private pathBox!: blessed.Widgets.BoxElement;
  private fileList!: blessed.Widgets.ListElement;
  private messageBox!: blessed.Widgets.BoxElement;
  private currentItems: FileItem[] = [];
  private selectedIndex: number = 0;

  initialize(screen: blessed.Widgets.Screen, currentPath: string): void {
    this.screen = screen;
    this.createPathBox(currentPath);
    this.createFileList();
    this.createMessageBox();
  }

  private createPathBox(currentPath: string): void {
    this.pathBox = blessed.box({
      top: 0,
      left: 0,
      width: '100%',
      height: 3,
      content: ` Path: ${currentPath} `,
      style: {
        fg: 'white',
        bg: 'blue',
        bold: true,
      },
      border: {
        type: 'line',
      },
      tags: true,
    });

    this.screen.append(this.pathBox);
  }

  private createFileList(): void {
    this.fileList = blessed.list({
      top: 3,
      left: 0,
      width: '100%',
      height: '100%-6',
      items: [],
      keys: true,
      vi: true,
      mouse: true,
      style: {
        selected: {
          fg: 'black',
          bg: 'white',
        },
        item: {
          fg: 'white',
          bg: 'black',
        },
      },
      border: {
        type: 'line',
      },
    });

    this.screen.append(this.fileList);
  }

  private createMessageBox(): void {
    this.messageBox = blessed.box({
      bottom: 0,
      left: 0,
      width: '100%',
      height: 3,
      content: ' Use arrow keys to navigate, Enter to open, Esc to go back ',
      style: {
        fg: 'black',
        bg: 'gray',
      },
      border: {
        type: 'line',
      },
    });

    this.screen.append(this.messageBox);
  }

  updateDirectoryView(currentPath: string, items: FileItem[]): void {
    this.currentItems = items;
    this.selectedIndex = 0;

    // Update path display
    this.pathBox.setContent(` Path: ${currentPath} `);

    // Update file list with ASCII icons
    const displayItems = items.map((item, index) => {
      const icon = this.getIconForItem(item);
      const name = item.name.length > 20 ? item.name.substring(0, 17) + '...' : item.name;
      return `${icon} ${name}`;
    });

    this.fileList.setItems(displayItems);
    this.fileList.select(0);
  }

  private getIconForItem(item: FileItem): string {
    if (item.isDirectory) {
      // Folder icon (4x4 characters)
      return '[ ] '; // Simplified folder icon
    } else {
      // File icon based on extension
      const ext = path.extname(item.name).toLowerCase();

      switch (ext) {
        case '.txt':
        case '.md':
          return 'TXT ';
        case '.js':
        case '.ts':
          return 'JS  ';
        case '.json':
          return 'JSON';
        case '.html':
        case '.htm':
          return 'HTML';
        case '.css':
          return 'CSS ';
        case '.py':
          return 'PY  ';
        case '.java':
          return 'JAVA';
        case '.c':
        case '.cpp':
          return 'C++ ';
        case '.go':
          return 'GO  ';
        case '.rs':
          return 'RUST';
        case '.php':
          return 'PHP ';
        case '.rb':
          return 'RUBY';
        case '.exe':
        case '.bin':
          return 'EXE ';
        case '.zip':
        case '.tar':
        case '.gz':
          return 'ZIP ';
        case '.jpg':
        case '.png':
        case '.gif':
          return 'IMG ';
        case '.mp3':
        case '.wav':
          return 'AUD ';
        case '.mp4':
        case '.avi':
          return 'VID ';
        default:
          return 'FILE';
      }
    }
  }

  navigateSelection(direction: 'up' | 'down' | 'left' | 'right'): void {
    switch (direction) {
      case 'up':
        if (this.selectedIndex > 0) {
          this.selectedIndex--;
          this.fileList.up(1);
        }
        break;
      case 'down':
        if (this.selectedIndex < this.currentItems.length - 1) {
          this.selectedIndex++;
          this.fileList.down(1);
        }
        break;
      case 'left':
        // TODO: Implement grid navigation
        break;
      case 'right':
        // TODO: Implement grid navigation
        break;
    }
  }

  getSelectedItem(): FileItem | null {
    if (this.currentItems.length === 0) {
      return null;
    }
    return this.currentItems[this.selectedIndex];
  }

  showMessage(message: string): void {
    this.messageBox.setContent(` ${message} `);
    this.screen.render();

    // Clear message after 2 seconds
    setTimeout(() => {
      this.messageBox.setContent(' Use arrow keys to navigate, Enter to open, Esc to go back ');
      this.screen.render();
    }, 2000);
  }

  showError(error: string): void {
    this.messageBox.setContent(` {red-fg}Error: ${error}{/red-fg} `);
    this.screen.render();

    // Clear error after 3 seconds
    setTimeout(() => {
      this.messageBox.setContent(' Use arrow keys to navigate, Enter to open, Esc to go back ');
      this.screen.render();
    }, 3000);
  }

  // Method to handle mouse clicks
  handleMouseClick(x: number, y: number): void {
    // TODO: Implement mouse click handling for file selection
  }

  // Method to show context menu
  showContextMenu(x: number, y: number, items: string[]): void {
    // TODO: Implement context menu
  }
}
