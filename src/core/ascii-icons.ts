import path from 'path';

export class AsciiIcons {
  static getFolderIcon(): string {
    // Folder icon (6x4 characters)
    return [
      ' 📁 ', // 使用 Unicode 字符作为图标
      '────',
      '    ',
      '    ',
    ].join('\n');
  }

  static getFileIcon(filename: string): string {
    const ext = path.extname(filename).toLowerCase();

    // Return different ASCII/unicode icons based on file type
    switch (ext) {
      case '.txt':
      case '.md':
        return this.createTextIcon('TXT');
      case '.js':
      case '.ts':
        return this.createCodeIcon('JS');
      case '.json':
        return this.createDataIcon('JSON');
      case '.html':
      case '.htm':
        return this.createCodeIcon('HTML');
      case '.css':
        return this.createCodeIcon('CSS');
      case '.py':
        return this.createCodeIcon('PY');
      case '.java':
        return this.createCodeIcon('JAVA');
      case '.c':
      case '.cpp':
        return this.createCodeIcon('C++');
      case '.go':
        return this.createCodeIcon('GO');
      case '.rs':
        return this.createCodeIcon('RUST');
      case '.php':
        return this.createCodeIcon('PHP');
      case '.rb':
        return this.createCodeIcon('RUBY');
      case '.exe':
      case '.bin':
        return this.createExecutableIcon('EXE');
      case '.zip':
      case '.tar':
      case '.gz':
        return this.createArchiveIcon('ZIP');
      case '.jpg':
      case '.png':
      case '.gif':
      case '.bmp':
        return this.createImageIcon('IMG');
      case '.mp3':
      case '.wav':
      case '.flac':
        return this.createAudioIcon('AUD');
      case '.mp4':
      case '.avi':
      case '.mkv':
        return this.createVideoIcon('VID');
      case '.pdf':
        return this.createDocumentIcon('PDF');
      case '.doc':
      case '.docx':
        return this.createDocumentIcon('DOC');
      case '.xls':
      case '.xlsx':
        return this.createDocumentIcon('XLS');
      case '.ppt':
      case '.pptx':
        return this.createDocumentIcon('PPT');
      default:
        return this.createGenericFileIcon('FILE');
    }
  }

  private static createTextIcon(label: string): string {
    return [
      ' 📄 ', // Unicode text file icon
      '────',
      ` ${label.padEnd(3)}`,
      '    ',
    ].join('\n');
  }

  private static createCodeIcon(label: string): string {
    return [
      ' 💻 ', // Unicode code file icon
      '────',
      ` ${label.padEnd(3)}`,
      '    ',
    ].join('\n');
  }

  private static createDataIcon(label: string): string {
    return [
      ' 📊 ', // Unicode data file icon
      '────',
      ` ${label.padEnd(3)}`,
      '    ',
    ].join('\n');
  }

  private static createExecutableIcon(label: string): string {
    return [
      ' ⚡ ', // Unicode executable file icon
      '────',
      ` ${label.padEnd(3)}`,
      '    ',
    ].join('\n');
  }

  private static createArchiveIcon(label: string): string {
    return [
      ' 📦 ', // Unicode archive file icon
      '────',
      ` ${label.padEnd(3)}`,
      '    ',
    ].join('\n');
  }

  private static createImageIcon(label: string): string {
    return [
      ' 🖼️ ', // Unicode image file icon
      '────',
      ` ${label.padEnd(3)}`,
      '    ',
    ].join('\n');
  }

  private static createAudioIcon(label: string): string {
    return [
      ' 🎵 ', // Unicode audio file icon
      '────',
      ` ${label.padEnd(3)}`,
      '    ',
    ].join('\n');
  }

  private static createVideoIcon(label: string): string {
    return [
      ' 🎬 ', // Unicode video file icon
      '────',
      ` ${label.padEnd(3)}`,
      '    ',
    ].join('\n');
  }

  private static createDocumentIcon(label: string): string {
    return [
      ' 📝 ', // Unicode document file icon
      '────',
      ` ${label.padEnd(3)}`,
      '    ',
    ].join('\n');
  }

  private static createGenericFileIcon(label: string): string {
    return [
      ' 📄 ', // Unicode generic file icon
      '────',
      ` ${label.padEnd(3)}`,
      '    ',
    ].join('\n');
  }

  // ASCII-only version (used if Unicode is not supported)
  static getFolderIconAscii(): string {
    return ['+---+', '|   |', '+---+', ' DIR'].join('\n');
  }

  static getFileIconAscii(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const label = ext.substring(1).toUpperCase().padEnd(3);

    return ['+---+', '|   |', '+---+', ` ${label}`].join('\n');
  }

  // Check whether the terminal supports Unicode
  static supportsUnicode(): boolean {
    return process.platform !== 'win32' || Boolean(process.env.WT_SESSION);
  }

  // Get appropriate icon for an item
  static getIconForItem(filename: string, isDirectory: boolean): string {
    if (isDirectory) {
      return this.supportsUnicode() ? this.getFolderIcon() : this.getFolderIconAscii();
    } else {
      return this.supportsUnicode() ? this.getFileIcon(filename) : this.getFileIconAscii(filename);
    }
  }
}
