const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Building Multi-Agent Desktop Application...');

try {
  // Build React app
  console.log('📦 Building React application...');
  execSync('npm run build-react', { stdio: 'inherit' });

  // Copy necessary files
  console.log('📁 Copying application files...');
  
  // Ensure dist directory exists
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
  }

  // Copy server files
  const serverFiles = [
    'src/index.js',
    'src/agents',
    'src/coordination',
    'src/dashboard',
    'src/config',
    'package.json',
    'node_modules'
  ];

  serverFiles.forEach(file => {
    const srcPath = path.join(__dirname, '..', file);
    const destPath = path.join(__dirname, '..', 'dist', file);
    
    if (fs.existsSync(srcPath)) {
      if (fs.statSync(srcPath).isDirectory()) {
        execSync(`xcopy "${srcPath}" "${destPath}" /E /I /Y`, { stdio: 'inherit' });
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  });

  // Build Electron app
  console.log('⚡ Building Electron application...');
  execSync('npm run dist', { stdio: 'inherit' });

  console.log('✅ Desktop application built successfully!');
  console.log('📦 Installer available in dist/ directory');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
