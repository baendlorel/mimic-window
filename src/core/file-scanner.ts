import fs from 'fs/promises';
import path from 'path';

export class FileScanner {
  /**
   * Scan directory and return list of files and folders
   */
  static async scanDirectory(dirPath: string): Promise<FileItem[]> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      const items: FileItem[] = [];

      for (const entry of entries) {
        try {
          const fullPath = path.join(dirPath, entry.name);
          const stats = await fs.stat(fullPath);

          items.push({
            name: entry.name,
            path: fullPath,
            type: entry.isDirectory() ? 'directory' : 'file',
            size: entry.isFile() ? stats.size : undefined,
            lastModified: stats.mtime,
          });
        } catch (error) {
          // Skip files that can't be accessed (permission errors, etc.)
          console.warn(`Cannot access ${entry.name}:`, error);
        }
      }

      // Sort: directories first, then files, both alphabetically
      return items.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1;
        }
        return a.name.localeCompare(b.name, undefined, {
          numeric: true,
          sensitivity: 'base',
        });
      });
    } catch (error) {
      throw new Error(`Failed to scan directory "${dirPath}": ${error}`);
    }
  }

  /**
   * Check if path exists and is accessible
   */
  static async pathExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get parent directory path
   */
  static getParentPath(filePath: string): string {
    return path.dirname(filePath);
  }

  /**
   * Join paths safely
   */
  static joinPath(...paths: string[]): string {
    return path.resolve(...paths);
  }

  /**
   * Check if path is a directory
   */
  static async isDirectory(filePath: string): Promise<boolean> {
    try {
      const stats = await fs.stat(filePath);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
  }

  /**
   * Get file extension
   */
  static getFileExtension(fileName: string): string {
    return path.extname(fileName).toLowerCase();
  }

  /**
   * Check if file is hidden (starts with .)
   */
  static isHiddenFile(fileName: string): boolean {
    return fileName.startsWith('.');
  }
}
