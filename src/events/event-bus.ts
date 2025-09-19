import { MouseEvent, KeyEvent } from '../core/types.js';

export interface EventHandler<T = any> {
  (event: T): void | Promise<void>;
}

export interface EventBus {
  on<T>(event: string, handler: EventHandler<T>): () => void;
  emit<T>(event: string, data: T): void;
  off(event: string, handler?: EventHandler): void;
}

/**
 * Simple event bus implementation
 */
export class SimpleEventBus implements EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();

  on<T>(event: string, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }

    this.handlers.get(event)!.push(handler as EventHandler);

    // Return unsubscribe function
    return () => this.off(event, handler as EventHandler);
  }

  emit<T>(event: string, data: T): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for "${event}":`, error);
        }
      });
    }
  }

  off(event: string, handler?: EventHandler): void {
    if (!handler) {
      // Remove all handlers for event
      this.handlers.delete(event);
      return;
    }

    const handlers = this.handlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }

      if (handlers.length === 0) {
        this.handlers.delete(event);
      }
    }
  }

  clear(): void {
    this.handlers.clear();
  }
}

// Event types
export interface FileSelectedEvent {
  index: number;
  item: any;
}

export interface FileOpenedEvent {
  item: any;
}

export interface ContextMenuEvent {
  x: number;
  y: number;
  item?: any;
}

export interface NavigationEvent {
  direction: 'up' | 'down' | 'left' | 'right' | 'back';
}

export interface ActionEvent {
  action: string;
  target?: any;
}

// Common event names
export const Events = {
  // Mouse events
  MOUSE_CLICK: 'mouse:click',
  MOUSE_DOUBLE_CLICK: 'mouse:double-click',
  MOUSE_RIGHT_CLICK: 'mouse:right-click',

  // Keyboard events
  KEY_PRESS: 'key:press',

  // Navigation events
  NAVIGATION: 'navigation',

  // File events
  FILE_SELECTED: 'file:selected',
  FILE_OPENED: 'file:opened',
  DIRECTORY_CHANGED: 'directory:changed',

  // Context menu events
  CONTEXT_MENU_SHOW: 'context-menu:show',
  CONTEXT_MENU_HIDE: 'context-menu:hide',
  CONTEXT_MENU_ACTION: 'context-menu:action',

  // File operations
  FILE_COPY: 'file:copy',
  FILE_CUT: 'file:cut',
  FILE_PASTE: 'file:paste',
  FILE_DELETE: 'file:delete',
  FILE_OPEN_VSCODE: 'file:open-vscode',

  // UI events
  TERMINAL_RESIZE: 'terminal:resize',
  REFRESH: 'refresh',
} as const;
