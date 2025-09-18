#!/usr/bin/env node

import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function build() {
  try {
    console.log('🔨 Building Mimic Window...');
    
    // 清理 dist 目录
    const distPath = path.join(__dirname, '..', 'dist');
    try {
      await fs.rm(distPath, { recursive: true, force: true });
    } catch (error) {
      // 目录可能不存在，忽略错误
    }
    
    // 创建 dist 目录
    await fs.mkdir(distPath, { recursive: true });
    
    // 编译 TypeScript
    console.log('📦 Compiling TypeScript...');
    const { stdout, stderr } = await execAsync('npx tsc', { cwd: path.join(__dirname, '..') });
    
    if (stderr) {
      console.warn('TypeScript warnings:', stderr);
    }
    
    // 复制 package.json 到 dist
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const distPackageJsonPath = path.join(distPath, 'package.json');
    
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
    
    // 创建精简版的 package.json
    const distPackageJson = {
      name: packageJson.name,
      version: packageJson.version,
      description: packageJson.description,
      main: 'index.js',
      bin: {
        mimic: './index.js'
      },
      dependencies: packageJson.dependencies
    };
    
    await fs.writeFile(
      distPackageJsonPath,
      JSON.stringify(distPackageJson, null, 2),
      'utf-8'
    );
    
    // 使入口文件可执行
    const indexJsPath = path.join(distPath, 'index.js');
    try {
      await fs.chmod(indexJsPath, 0o755);
    } catch (error) {
      console.warn('Could not make index.js executable:', error);
    }
    
    console.log('✅ Build completed successfully!');
    console.log('📁 Output directory:', distPath);
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// 如果是直接运行此脚本
if (require.main === module) {
  build();
}

export { build };