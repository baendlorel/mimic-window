import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';

export class FileOperations {
  /**
   * Copy file or directory
   */
  static async copy(source: string, destination: string): Promise<void> {
    try {
      const stats = await fs.stat(source);

      if (stats.isDirectory()) {
        await this.copyDirectory(source, destination);
      } else {
        await fs.copyFile(source, destination);
      }
    } catch (error) {
      throw new Error(`Failed to copy "${source}" to "${destination}": ${error}`);
    }
  }

  /**
   * Move/rename file or directory
   */
  static async move(source: string, destination: string): Promise<void> {
    try {
      await fs.rename(source, destination);
    } catch (error) {
      throw new Error(`Failed to move "${source}" to "${destination}": ${error}`);
    }
  }

  /**
   * Delete file or directory
   */
  static async delete(filePath: string): Promise<void> {
    try {
      const stats = await fs.stat(filePath);

      if (stats.isDirectory()) {
        await fs.rmdir(filePath, { recursive: true });
      } else {
        await fs.unlink(filePath);
      }
    } catch (error) {
      throw new Error(`Failed to delete "${filePath}": ${error}`);
    }
  }

  /**
   * Open file with default system application
   */
  static async openWithSystem(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      let command: string;
      let args: string[];

      // Determine command based on platform
      switch (process.platform) {
        case 'win32':
          command = 'cmd';
          args = ['/c', 'start', '""', filePath];
          break;
        case 'darwin':
          command = 'open';
          args = [filePath];
          break;
        default: // Linux and others
          command = 'xdg-open';
          args = [filePath];
          break;
      }

      const child = spawn(command, args, {
        detached: true,
        stdio: 'ignore',
      });

      child.on('error', (error) => {
        reject(new Error(`Failed to open "${filePath}": ${error.message}`));
      });

      child.on('exit', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Failed to open "${filePath}": exit code ${code}`));
        }
      });

      child.unref();
    });
  }

  /**
   * Open file or directory with VS Code
   */
  static async openWithVSCode(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const child = spawn('code', [filePath], {
        detached: true,
        stdio: 'ignore',
      });

      child.on('error', (error) => {
        reject(new Error(`Failed to open "${filePath}" with VS Code: ${error.message}`));
      });

      child.on('exit', (code) => {
        if (code === 0 || code === null) {
          resolve();
        } else {
          reject(new Error(`Failed to open "${filePath}" with VS Code: exit code ${code}`));
        }
      });

      child.unref();
    });
  }

  /**
   * Create new directory
   */
  static async createDirectory(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      throw new Error(`Failed to create directory "${dirPath}": ${error}`);
    }
  }

  /**
   * Create new file
   */
  static async createFile(filePath: string, content: string = ''): Promise<void> {
    try {
      await fs.writeFile(filePath, content);
    } catch (error) {
      throw new Error(`Failed to create file "${filePath}": ${error}`);
    }
  }

  /**
   * Check if path exists
   */
  static async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get unique file name if file already exists
   */
  static async getUniqueFileName(filePath: string): Promise<string> {
    if (!(await this.exists(filePath))) {
      return filePath;
    }

    const dir = path.dirname(filePath);
    const ext = path.extname(filePath);
    const name = path.basename(filePath, ext);

    let counter = 1;
    let newPath: string;

    do {
      newPath = path.join(dir, `${name} (${counter})${ext}`);
      counter++;
    } while (await this.exists(newPath));

    return newPath;
  }

  /**
   * Copy directory recursively
   */
  private static async copyDirectory(source: string, destination: string): Promise<void> {
    await fs.mkdir(destination, { recursive: true });

    const entries = await fs.readdir(source, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(source, entry.name);
      const destPath = path.join(destination, entry.name);

      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  /**
   * Validate file name
   */
  static validateFileName(name: string): { valid: boolean; message?: string } {
    if (!name || name.trim().length === 0) {
      return { valid: false, message: 'File name cannot be empty' };
    }

    // Check for invalid characters (Windows + Unix)
    const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
    if (invalidChars.test(name)) {
      return { valid: false, message: 'File name contains invalid characters' };
    }

    // Check for reserved names (Windows)
    const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;
    if (reservedNames.test(name.split('.')[0])) {
      return { valid: false, message: 'File name is reserved by the system' };
    }

    // Check length
    if (name.length > 255) {
      return { valid: false, message: 'File name is too long' };
    }

    return { valid: true };
  }
}
