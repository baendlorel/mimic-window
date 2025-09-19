import process from 'process';

export class KeyboardHandler {
  private keyHandlers: Map<string, EventHandler<KeyEvent>[]> = new Map();
  private isListening = false;

  /**
   * Start listening for keyboard events
   */
  start(): void {
    if (this.isListening) return;

    // Enable raw mode to capture individual keystrokes
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }

    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', this.handleKeyPress.bind(this));
    this.isListening = true;
  }

  /**
   * Stop listening for keyboard events
   */
  stop(): void {
    if (!this.isListening) return;

    process.stdin.removeAllListeners('data');

    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
    }

    process.stdin.pause();
    this.isListening = false;
  }

  /**
   * Register keyboard event handler
   */
  on(key: string, handler: EventHandler<KeyEvent>): () => void {
    if (!this.keyHandlers.has(key)) {
      this.keyHandlers.set(key, []);
    }

    this.keyHandlers.get(key)!.push(handler);

    return () => {
      const handlers = this.keyHandlers.get(key);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  /**
   * Handle raw keyboard input
   */
  private handleKeyPress(chunk: string): void {
    const key = this.parseKey(chunk);

    // Emit to specific key handlers
    const handlers = this.keyHandlers.get(key.key);
    if (handlers) {
      handlers.forEach((handler) => handler(key));
    }

    // Emit to generic key handlers
    const genericHandlers = this.keyHandlers.get('*');
    if (genericHandlers) {
      genericHandlers.forEach((handler) => handler(key));
    }
  }

  /**
   * Parse raw key input into KeyEvent
   */
  private parseKey(chunk: string): KeyEvent {
    const key: KeyEvent = {
      key: '',
      ctrl: false,
      alt: false,
      shift: false,
    };

    const code = chunk.charCodeAt(0);

    // Control characters
    if (code === 3) {
      key.key = 'ctrl+c';
      key.ctrl = true;
    } else if (code === 27) {
      // ESC or escape sequence
      if (chunk.length === 1) {
        key.key = 'escape';
      } else {
        // ANSI escape sequence
        key.key = this.parseEscapeSequence(chunk);
      }
    } else if (code === 13) {
      key.key = 'enter';
    } else if (code === 8 || code === 127) {
      key.key = 'backspace';
    } else if (code === 9) {
      key.key = 'tab';
    } else if (code === 32) {
      key.key = 'space';
    } else if (code >= 1 && code <= 26) {
      // Ctrl+letter
      key.key = `ctrl+${String.fromCharCode(code + 96)}`;
      key.ctrl = true;
    } else if (code >= 32 && code <= 126) {
      // Printable ASCII
      key.key = chunk;
    } else {
      key.key = `unknown:${code}`;
    }

    return key;
  }

  /**
   * Parse ANSI escape sequences for arrow keys, function keys, etc.
   */
  private parseEscapeSequence(sequence: string): string {
    if (sequence.length < 3) return 'escape';

    // Arrow keys: ESC[A, ESC[B, ESC[C, ESC[D
    if (sequence.startsWith('\x1b[')) {
      const command = sequence.substring(2);

      switch (command) {
        case 'A':
          return 'up';
        case 'B':
          return 'down';
        case 'C':
          return 'right';
        case 'D':
          return 'left';
        case 'H':
          return 'home';
        case 'F':
          return 'end';
        case '2~':
          return 'insert';
        case '3~':
          return 'delete';
        case '5~':
          return 'pageup';
        case '6~':
          return 'pagedown';
        default:
          if (command.match(/^\d+~/)) {
            return `f${command.substring(0, command.length - 1)}`;
          }
          return `ansi:${command}`;
      }
    }

    return `escape:${sequence.substring(1)}`;
  }

  /**
   * Register common keyboard shortcuts
   */
  registerCommonShortcuts(eventBus: any): void {
    // Arrow keys for navigation
    this.on('up', () => eventBus.emit('navigation', { direction: 'up' }));
    this.on('down', () => eventBus.emit('navigation', { direction: 'down' }));
    this.on('left', () => eventBus.emit('navigation', { direction: 'left' }));
    this.on('right', () => eventBus.emit('navigation', { direction: 'right' }));

    // Enter to open
    this.on('enter', () => eventBus.emit('file:opened', {}));

    // Escape to go back
    this.on('escape', () => eventBus.emit('navigation', { direction: 'back' }));

    // Ctrl+C to copy
    this.on('ctrl+c', (event) => {
      if (event.ctrl) {
        eventBus.emit('file:copy', {});
      }
    });

    // Ctrl+X to cut
    this.on('ctrl+x', () => eventBus.emit('file:cut', {}));

    // Ctrl+V to paste
    this.on('ctrl+v', () => eventBus.emit('file:paste', {}));

    // Delete key
    this.on('delete', () => eventBus.emit('file:delete', {}));

    // F5 to refresh
    this.on('f5', () => eventBus.emit('refresh', {}));

    // Ctrl+O to open with VSCode
    this.on('ctrl+o', () => eventBus.emit('file:open-vscode', {}));
  }
}
