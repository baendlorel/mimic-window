import process from 'process';
import { EventHandler } from './event-bus.js';
import { MouseEvent } from '../core/types.js';

export class MouseHandler {
  private mouseHandlers: Map<string, EventHandler<MouseEvent>[]> = new Map();
  private isListening = false;
  private lastClickTime = 0;
  private lastClickX = 0;
  private lastClickY = 0;
  private readonly DOUBLE_CLICK_THRESHOLD = 300; // milliseconds

  /**
   * Start listening for mouse events
   */
  start(): void {
    if (this.isListening) return;

    // Enable mouse tracking
    process.stdout.write('\x1b[?1000h'); // Mouse click tracking
    process.stdout.write('\x1b[?1002h'); // Mouse motion tracking when button pressed
    process.stdout.write('\x1b[?1015h'); // Enable urxvt mouse mode
    process.stdout.write('\x1b[?1006h'); // Enable SGR mouse mode

    process.stdin.on('data', this.handleMouseInput.bind(this));
    this.isListening = true;
  }

  /**
   * Stop listening for mouse events
   */
  stop(): void {
    if (!this.isListening) return;

    // Disable mouse tracking
    process.stdout.write('\x1b[?1000l');
    process.stdout.write('\x1b[?1002l');
    process.stdout.write('\x1b[?1015l');
    process.stdout.write('\x1b[?1006l');

    this.isListening = false;
  }

  /**
   * Register mouse event handler
   */
  on(event: string, handler: EventHandler<MouseEvent>): () => void {
    if (!this.mouseHandlers.has(event)) {
      this.mouseHandlers.set(event, []);
    }

    this.mouseHandlers.get(event)!.push(handler);

    return () => {
      const handlers = this.mouseHandlers.get(event);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  /**
   * Handle raw mouse input
   */
  private handleMouseInput(data: Buffer | string): void {
    const input = data.toString();

    // Check for mouse escape sequences
    if (!input.startsWith('\x1b[')) return;

    const mouseEvent = this.parseMouseEvent(input);
    if (mouseEvent) {
      this.emitMouseEvent(mouseEvent);
    }
  }

  /**
   * Parse mouse escape sequence
   */
  private parseMouseEvent(sequence: string): MouseEvent | null {
    // SGR mouse format: \x1b[<button;x;y;M or \x1b[<button;x;y;m
    const sgrMatch = sequence.match(/^\x1b\[<(\d+);(\d+);(\d+)([Mm])/);
    if (sgrMatch) {
      const [, buttonCode, x, y, action] = sgrMatch;
      const button = this.parseButtonCode(parseInt(buttonCode));
      const isPress = action === 'M';

      if (isPress && button) {
        return {
          x: parseInt(x) - 1, // Convert to 0-based coordinates
          y: parseInt(y) - 1,
          button,
          type: 'click',
        };
      }
    }

    // Standard mouse format: \x1b[M followed by 3 bytes
    if (sequence.startsWith('\x1b[M') && sequence.length >= 6) {
      const buttonByte = sequence.charCodeAt(3) - 32;
      const x = sequence.charCodeAt(4) - 33; // Convert to 0-based
      const y = sequence.charCodeAt(5) - 33;

      const button = this.parseButtonCode(buttonByte);
      if (button) {
        return {
          x,
          y,
          button,
          type: 'click',
        };
      }
    }

    return null;
  }

  /**
   * Parse button code to button name
   */
  private parseButtonCode(code: number): 'left' | 'right' | 'middle' | null {
    const button = code & 3;

    switch (button) {
      case 0:
        return 'left';
      case 1:
        return 'middle';
      case 2:
        return 'right';
      default:
        return null;
    }
  }

  /**
   * Emit mouse event and handle double-click detection
   */
  private emitMouseEvent(event: MouseEvent): void {
    const now = Date.now();
    const isDoubleClick =
      now - this.lastClickTime < this.DOUBLE_CLICK_THRESHOLD &&
      Math.abs(event.x - this.lastClickX) <= 1 &&
      Math.abs(event.y - this.lastClickY) <= 1 &&
      event.button === 'left';

    if (isDoubleClick) {
      // Emit double-click event
      const doubleClickEvent: MouseEvent = {
        ...event,
        type: 'double-click',
      };

      const handlers = this.mouseHandlers.get('double-click');
      if (handlers) {
        handlers.forEach((handler) => handler(doubleClickEvent));
      }

      // Reset click tracking
      this.lastClickTime = 0;
    } else {
      // Emit single click event
      const eventType = event.button === 'right' ? 'right-click' : 'click';
      const handlers = this.mouseHandlers.get(eventType);
      if (handlers) {
        handlers.forEach((handler) => handler(event));
      }

      // Update click tracking for double-click detection
      if (event.button === 'left') {
        this.lastClickTime = now;
        this.lastClickX = event.x;
        this.lastClickY = event.y;
      }
    }
  }

  /**
   * Register common mouse event handlers
   */
  registerCommonHandlers(eventBus: any): void {
    // Left click
    this.on('click', (event) => {
      if (event.button === 'left') {
        eventBus.emit('mouse:click', event);
      }
    });

    // Double click
    this.on('double-click', (event) => {
      eventBus.emit('mouse:double-click', event);
    });

    // Right click
    this.on('right-click', (event) => {
      eventBus.emit('mouse:right-click', event);
    });
  }
}
