import * as blessed from 'blessed';

export interface EventCallbacks {
  onNavigate: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onEnter: () => void;
  onEscape: () => void;
  onRightClick?: (x: number, y: number) => void;
  onMouseClick?: (x: number, y: number) => void;
}

export class EventHandler {
  setupKeyboardEvents(screen: blessed.Widgets.Screen, callbacks: EventCallbacks): void {
    // Arrow keys navigation
    screen.key(['up', 'k'], () => {
      callbacks.onNavigate('up');
    });

    screen.key(['down', 'j'], () => {
      callbacks.onNavigate('down');
    });

    screen.key(['left', 'h'], () => {
      callbacks.onNavigate('left');
    });

    screen.key(['right', 'l'], () => {
      callbacks.onNavigate('right');
    });

    // Enter key
    screen.key(['enter', 'return'], () => {
      callbacks.onEnter();
    });

    // Escape key
    screen.key(['escape'], () => {
      callbacks.onEscape();
    });

    // Mouse events
    screen.on('click', (data: any) => {
      if (callbacks.onMouseClick) {
        callbacks.onMouseClick(data.x, data.y);
      }
    });

    // Right-click (usually Ctrl+click in terminals)
    screen.on('element click', (data: any) => {
      if (data.button === 'right' && callbacks.onRightClick) {
        callbacks.onRightClick(data.x, data.y);
      }
    });

    // Handle window resize
    screen.on('resize', () => {
      screen.render();
    });
  }

  setupMouseEvents(screen: blessed.Widgets.Screen, callbacks: {
    onClick: (x: number, y: number) => void;
    onDoubleClick: (x: number, y: number) => void;
    onRightClick: (x: number, y: number) => void;
  }): void {
    let clickCount = 0;
    let clickTimer: NodeJS.Timeout;

    screen.on('click', (data: any) => {
      clickCount++;

      if (clickCount === 1) {
        // Single click
        clickTimer = setTimeout(() => {
          if (clickCount === 1) {
            callbacks.onClick(data.x, data.y);
          }
          clickCount = 0;
        }, 300);
      } else if (clickCount === 2) {
        // Double click
        clearTimeout(clickTimer);
        callbacks.onDoubleClick(data.x, data.y);
        clickCount = 0;
      }
    });

    // Right click detection (usually Ctrl+click)
    screen.on('element click', (data: any) => {
      if (data.button === 'right') {
        callbacks.onRightClick(data.x, data.y);
      }
    });
  }

  // Method to handle context menu events
  setupContextMenuEvents(menu: any, callbacks: {
    onSelect: (item: string) => void;
    onCancel: () => void;
  }): void {
    // This would be implemented when we create the context menu component
  }

  // Method to handle drag and drop (if needed)
  setupDragAndDrop(screen: blessed.Widgets.Screen, callbacks: {
    onDragStart: (x: number, y: number) => void;
    onDrag: (x: number, y: number) => void;
    onDrop: (x: number, y: number) => void;
  }): void {
    // Drag and drop implementation would go here
    // This is more complex and might not be necessary for basic file operations
  }

  // Utility method to debounce events
  debounce<T extends (...args: any[]) => void>(func: T, wait: number): T {
    let timeout: NodeJS.Timeout;
    return ((...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    }) as T;
  }

  // Utility method to throttle events
  throttle<T extends (...args: any[]) => void>(func: T, limit: number): T {
    let inThrottle: boolean;
    return ((...args: any[]) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }) as T;
  }
}