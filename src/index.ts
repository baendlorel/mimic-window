#!/usr/bin/env node

import { FileManager } from './core/file-manager.js';

async function main() {
  try {
    console.log('🚀 Starting Mimic Window File Manager...');

    const fileManager = new FileManager();
    await fileManager.start();
  } catch (error) {
    console.error('❌ Failed to start file manager:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Goodbye!');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Goodbye!');
  process.exit(0);
});

// Start the application
if (require.main === module) {
  main();
}

export { FileManager };
