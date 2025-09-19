#!/usr/bin/env node

import { FileManager } from './core/file-manager.js';

async function main() {
  try {
    console.log('🚀 Starting Mimic Window File Manager...');

    const fileManager = new FileManager();
    await fileManager.start();

    // Graceful shutdown handler
    const shutdown = async () => {
      console.log('\n👋 Shutting down...');
      await fileManager.stop();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('❌ Failed to start file manager:', error);
    process.exit(1);
  }
}

// Start the application
main();

export { FileManager };
