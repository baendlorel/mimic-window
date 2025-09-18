import * as fs from 'fs/promises';
import * as path from 'path';

export interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modified: Date;
}

export class FileSystem {
  async listDirectory(dirPath: string): Promise<FileItem[]> {
    try {
      const items = await fs.readdir(dirPath, { withFileTypes: true });
      
      const fileItems: FileItem[] = [];
      
      for (const item of items) {
        if (item.name.startsWith('.')) continue; // Skip hidden files
        
        const fullPath = path.join(dirPath, item.name);
        const stats = await fs.stat(fullPath);
        
        fileItems.push({
          name: item.name,
          path: fullPath,
          isDirectory: item.isDirectory(),
          size: stats.size,
          modified: stats.mtime
        });
      }
      
      // Sort: directories first, then files, both alphabetically
      return fileItems.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });
    } catch (error) {
      throw new Error(`Failed to read directory: ${error}`);
    }
  }

  async getFileInfo(filePath: string): Promise<FileItem> {
    try {
      const stats = await fs.stat(filePath);
      return {
        name: path.basename(filePath),
        path: filePath,
        isDirectory: stats.isDirectory(),
        size: stats.size,
        modified: stats.mtime
      };
    } catch (error) {
      throw new Error(`Failed to get file info: ${error}`);
    }
  }

  async createDirectory(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      throw new Error(`Failed to create directory: ${error}`);
    }
  }

  async deleteItem(itemPath: string): Promise<void> {
    try {
      const stats = await fs.stat(itemPath);
      if (stats.isDirectory()) {
        await fs.rm(itemPath, { recursive: true });
      } else {
        await fs.unlink(itemPath);
      }
    } catch (error) {
      throw new Error(`Failed to delete item: ${error}`);
    }
  }

  async copyItem(sourcePath: string, destinationPath: string): Promise<void> {
    try {
      const stats = await fs.stat(sourcePath);
      if (stats.isDirectory()) {
        await this.copyDirectory(sourcePath, destinationPath);
      } else {
        await fs.copyFile(sourcePath, destinationPath);
      }
    } catch (error) {
      throw new Error(`Failed to copy item: ${error}`);
    }
  }

  private async copyDirectory(sourceDir: string, destinationDir: string): Promise<void> {
    await fs.mkdir(destinationDir, { recursive: true });
    
    const items = await fs.readdir(sourceDir, { withFileTypes: true });
    
    for (const item of items) {
      const sourcePath = path.join(sourceDir, item.name);
      const destinationPath = path.join(destinationDir, item.name);
      
      if (item.isDirectory()) {
        await this.copyDirectory(sourcePath, destinationPath);
      } else {
        await fs.copyFile(sourcePath, destinationPath);
      }
    }
  }

  async moveItem(sourcePath: string, destinationPath: string): Promise<void> {
    try {
      await fs.rename(sourcePath, destinationPath);
    } catch (error) {
      throw new Error(`Failed to move item: ${error}`);
    }
  }

  async readFile(filePath: string): Promise<string> {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to read file: ${error}`);
    }
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    try {
      await fs.writeFile(filePath, content, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to write file: ${error}`);
    }
  }
}