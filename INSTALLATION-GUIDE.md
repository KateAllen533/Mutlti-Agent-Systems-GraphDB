# 📦 Installation Guide - Multi-Agent Data System Desktop

## 🚀 Quick Installation

### Option 1: Download Pre-built Package (Recommended)

1. **Download the installer** for your platform:
   - **Windows**: `MultiAgent-DataSystem-Windows-x64.exe`
   - **macOS**: `MultiAgent-DataSystem-macOS-x64.dmg`
   - **Linux**: `MultiAgent-DataSystem-Linux-x64.AppImage`

2. **Run the installer** and follow the setup wizard

3. **Launch the application** from your desktop or start menu

### Option 2: Build from Source

#### Prerequisites
- **Node.js 18+** ([Download here](https://nodejs.org/))
- **Git** ([Download here](https://git-scm.com/))
- **Platform-specific build tools**:
  - **Windows**: Visual Studio Build Tools
  - **macOS**: Xcode Command Line Tools
  - **Linux**: build-essential package

#### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-repo/multiagent-data-system.git
   cd multiagent-data-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the application**
   ```bash
   npm run build
   ```

4. **Launch the desktop app**
   ```bash
   npm start
   ```

## 🔧 System Requirements

### Minimum Requirements
- **OS**: Windows 10, macOS 10.14, or Ubuntu 18.04+
- **RAM**: 4GB
- **Storage**: 1GB free space
- **Network**: Internet connection for initial setup

### Recommended Requirements
- **OS**: Windows 11, macOS 12+, or Ubuntu 20.04+
- **RAM**: 8GB
- **Storage**: 5GB free space
- **Network**: Stable internet connection

## 🗄️ Database Setup (Optional)

The application can run in **demo mode** without a database, but for full functionality:

### Neo4j Setup

1. **Install Neo4j Desktop**
   - Download from [neo4j.com](https://neo4j.com/download/)
   - Create a new database
   - Set username: `neo4j` and password: `password`

2. **Configure in the app**
   - Open Settings → Database
   - Enter connection details:
     - URI: `bolt://localhost:7687`
     - Username: `neo4j`
     - Password: `password`

### Alternative: Docker Setup
```bash
docker run -d \
  --name neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/password \
  neo4j:latest
```

## 🔑 API Configuration

### OpenAI Setup
1. Get API key from [OpenAI](https://platform.openai.com/api-keys)
2. Open Settings → API Keys
3. Enter your OpenAI API key

### Anthropic Setup
1. Get API key from [Anthropic](https://console.anthropic.com/)
2. Open Settings → API Keys
3. Enter your Anthropic API key

## 🚨 Troubleshooting

### Common Installation Issues

#### "Node.js not found"
- **Solution**: Install Node.js 18+ from [nodejs.org](https://nodejs.org/)
- **Verify**: Run `node --version` in terminal

#### "Permission denied" (Linux/macOS)
- **Solution**: Run with sudo or fix permissions
- **Command**: `sudo npm install` or `chmod +x launch-desktop.sh`

#### "Build tools not found" (Windows)
- **Solution**: Install Visual Studio Build Tools
- **Download**: [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022)

#### "Port already in use"
- **Solution**: Kill processes using ports 3000/3001
- **Windows**: `netstat -ano | findstr :3000`
- **macOS/Linux**: `lsof -ti:3000 | xargs kill -9`

### Application Issues

#### App won't start
1. Check system requirements
2. Verify Node.js version: `node --version`
3. Clear cache: `npm cache clean --force`
4. Reinstall dependencies: `rm -rf node_modules && npm install`

#### Database connection failed
1. Ensure Neo4j is running
2. Check connection settings
3. Verify firewall settings
4. App will run in demo mode if database unavailable

#### File upload issues
1. Check file size limits (default: 50MB)
2. Verify supported formats: CSV, Excel, JSON
3. Ensure file permissions

## 🔄 Updates

### Automatic Updates
The application checks for updates automatically and notifies you when new versions are available.

### Manual Updates
1. Download the latest installer
2. Run the installer (it will update the existing installation)
3. Restart the application

### Development Updates
```bash
git pull origin main
npm install
npm run build
```

## 🗑️ Uninstallation

### Windows
1. Go to Settings → Apps
2. Find "Multi-Agent Data System"
3. Click "Uninstall"

### macOS
1. Drag the app to Trash
2. Empty Trash
3. Remove data folder: `~/Library/Application Support/MultiAgent-DataSystem`

### Linux
1. Delete the AppImage file
2. Remove data folder: `~/.config/MultiAgent-DataSystem`

## 📞 Support

### Getting Help
- **Documentation**: Check the README files
- **Issues**: Report bugs on GitHub
- **Community**: Join our Discord server
- **Email**: support@multiagent-system.com

### Log Files
Log files are located at:
- **Windows**: `%APPDATA%/MultiAgent-DataSystem/logs/`
- **macOS**: `~/Library/Logs/MultiAgent-DataSystem/`
- **Linux**: `~/.config/MultiAgent-DataSystem/logs/`

### Debug Mode
Enable debug mode for troubleshooting:
```bash
npm start -- --debug
```

## ✅ Verification

After installation, verify everything works:

1. **Launch the app** - Should open without errors
2. **Check dashboard** - Should show system overview
3. **Test file upload** - Try uploading a CSV file
4. **Verify agents** - All agents should show as "running"
5. **Check settings** - Should be able to access all tabs

## 🎉 Next Steps

1. **Import sample data** using the demo files in `demo-data/`
2. **Configure data connectors** for your data sources
3. **Set up API keys** for LLM features
4. **Explore the workflow** visualization
5. **Review analytics** and reporting features

---

**Need help?** Check our [FAQ](FAQ.md) or [contact support](mailto:support@multiagent-system.com)
