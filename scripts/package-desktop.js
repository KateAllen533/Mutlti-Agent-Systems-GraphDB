const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Packaging Multi-Agent Desktop Application...');

const platform = process.platform;
const arch = process.arch;

console.log(`📱 Target Platform: ${platform} ${arch}`);

try {
  // Step 1: Clean previous builds
  console.log('🧹 Cleaning previous builds...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }

  // Step 2: Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // Step 3: Build React application
  console.log('⚛️ Building React application...');
  execSync('npm run build-react', { stdio: 'inherit' });

  // Step 4: Copy server files to dist
  console.log('📁 Copying server files...');
  const serverFiles = [
    'src/index.js',
    'src/agents',
    'src/coordination', 
    'src/dashboard',
    'src/config',
    'package.json',
    '.env.example'
  ];

  // Ensure dist directory exists
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
  }

  // Copy files
  serverFiles.forEach(file => {
    const srcPath = path.join(__dirname, '..', file);
    const destPath = path.join(__dirname, '..', 'dist', file);
    
    if (fs.existsSync(srcPath)) {
      const destDir = path.dirname(destPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      
      if (fs.statSync(srcPath).isDirectory()) {
        execSync(`cp -r "${srcPath}" "${destPath}"`, { stdio: 'inherit' });
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  });

  // Step 5: Build Electron application
  console.log('⚡ Building Electron application...');
  
  // Set platform-specific build options
  let buildCommand = 'npm run dist';
  
  if (platform === 'win32') {
    buildCommand += ' -- --win --x64';
  } else if (platform === 'darwin') {
    buildCommand += ' -- --mac --x64';
  } else {
    buildCommand += ' -- --linux --x64';
  }

  execSync(buildCommand, { stdio: 'inherit' });

  // Step 6: Create installation package
  console.log('📦 Creating installation package...');
  
  const packageName = `MultiAgent-DataSystem-${platform}-${arch}`;
  const packageDir = path.join(__dirname, '..', 'packages', packageName);
  
  if (!fs.existsSync(path.dirname(packageDir))) {
    fs.mkdirSync(path.dirname(packageDir), { recursive: true });
  }

  // Copy built application
  if (fs.existsSync('dist')) {
    execSync(`cp -r dist/* "${packageDir}/"`, { stdio: 'inherit' });
  }

  // Create installation script
  const installScript = platform === 'win32' ? 'install.bat' : 'install.sh';
  const installScriptPath = path.join(packageDir, installScript);
  
  if (platform === 'win32') {
    fs.writeFileSync(installScriptPath, `@echo off
echo Installing Multi-Agent Data System...
echo.
echo Please follow the installation wizard.
echo.
pause`);
  } else {
    fs.writeFileSync(installScriptPath, `#!/bin/bash
echo "Installing Multi-Agent Data System..."
echo
echo "Please follow the installation wizard."
echo
read -p "Press Enter to continue..."`);
    execSync(`chmod +x "${installScriptPath}"`);
  }

  // Create README for package
  const packageReadme = `# Multi-Agent Data System - ${platform} ${arch}

## Installation Instructions

1. Run the installation script: ${installScript}
2. Follow the installation wizard
3. Launch the application from your desktop or start menu

## System Requirements

- ${platform === 'win32' ? 'Windows 10 or later' : platform === 'darwin' ? 'macOS 10.14 or later' : 'Linux (Ubuntu 18.04+ or equivalent)'}
- 4GB RAM minimum
- 1GB free disk space
- Internet connection for initial setup

## Support

For support and documentation, visit: https://github.com/your-repo/docs

Built on: ${new Date().toISOString()}
`;

  fs.writeFileSync(path.join(packageDir, 'README.txt'), packageReadme);

  console.log('✅ Desktop application packaged successfully!');
  console.log(`📦 Package location: ${packageDir}`);
  console.log('🎉 Ready for distribution!');

} catch (error) {
  console.error('❌ Packaging failed:', error.message);
  process.exit(1);
}
