# 🖥️ Multi-Agent Data System - Desktop Application

A powerful desktop application built with Electron that provides a Power BI-style interface for managing multi-agent data processing workflows.

## 🚀 Features

### 📊 **Power BI-Style Dashboard**
- Real-time system monitoring
- Interactive charts and visualizations
- Agent status tracking
- Performance metrics
- Job history and analytics

### 🔌 **Data Connectors**
- **File Upload**: CSV, Excel, JSON support
- **Database Connections**: SQLite, MySQL, PostgreSQL
- **API Endpoints**: REST API integration
- **Cloud Storage**: AWS S3, Google Drive, Dropbox

### 🔄 **Agent Workflow Visualization**
- Interactive workflow diagrams
- Real-time agent monitoring
- Step-by-step execution tracking
- Performance metrics per agent

### 📈 **Advanced Analytics**
- Performance over time charts
- Data source distribution
- Error analysis and reporting
- System health monitoring

### ⚙️ **Comprehensive Settings**
- System configuration
- Database connections
- API key management
- Security settings
- Notification preferences

## 🛠️ Installation

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Windows 10+, macOS 10.14+, or Linux

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd multiagent-data-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start in development mode**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 📦 Building the Desktop App

### Development Build
```bash
# Start the backend server and Electron app
npm run dev

# Or start them separately
npm run server    # Backend API server
npm run electron-dev  # Electron app in dev mode
```

### Production Build
```bash
# Build React app and create Electron installer
npm run build

# Or build step by step
npm run build-react  # Build React frontend
npm run dist        # Create Electron installer
```

### Platform-Specific Builds
```bash
# Windows
npm run dist -- --win

# macOS
npm run dist -- --mac

# Linux
npm run dist -- --linux
```

## 🎯 Usage

### 1. **Dashboard Overview**
- Monitor system health and performance
- View real-time agent status
- Track job completion rates
- Analyze system metrics

### 2. **Data Connectors**
- Click "Add New Connector" to create data sources
- Choose from File Upload, Database, API, or Cloud Storage
- Test connections before saving
- Manage existing connectors

### 3. **Workflow Monitoring**
- View interactive workflow diagrams
- Monitor agent execution in real-time
- Click on nodes for detailed information
- Control workflow execution

### 4. **Analytics & Reporting**
- Analyze performance trends
- View data source distribution
- Monitor error rates and types
- Export reports and insights

### 5. **Settings Configuration**
- Configure system parameters
- Set up database connections
- Manage API keys and authentication
- Customize notifications

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# Neo4j Configuration
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password

# LLM API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# System Settings
MAX_FILE_SIZE=50
MAX_CONCURRENT_JOBS=5
LOG_LEVEL=info
```

### Database Setup
1. Install Neo4j Desktop or use Docker
2. Create a new database
3. Update connection settings in the app
4. The system will run in demo mode if Neo4j is unavailable

## 🏗️ Architecture

### Frontend (React + Ant Design)
- **Dashboard**: System overview and monitoring
- **Data Connectors**: Data source management
- **Workflow Viewer**: Agent workflow visualization
- **Analytics**: Performance analysis and reporting
- **Settings**: Configuration management

### Backend (Node.js + Express)
- **API Server**: RESTful endpoints for data operations
- **Agent Orchestrator**: Coordinates multi-agent workflows
- **Data Processing**: Handles file parsing and data structuring
- **Graph Modeling**: Creates and manages graph relationships

### Desktop Integration (Electron)
- **Main Process**: Application lifecycle and system integration
- **Renderer Process**: React-based user interface
- **IPC Communication**: Secure communication between processes
- **File System Access**: Native file operations and dialogs

## 🔒 Security Features

- **Context Isolation**: Secure renderer process
- **API Key Encryption**: Secure storage of credentials
- **File Validation**: Safe file upload and processing
- **Audit Logging**: Track all system operations
- **Session Management**: Secure user sessions

## 📱 Cross-Platform Support

### Windows
- Windows 10/11 support
- NSIS installer
- Windows service integration
- Native file dialogs

### macOS
- macOS 10.14+ support
- DMG installer
- Native menu integration
- Touch Bar support

### Linux
- Ubuntu 18.04+ support
- AppImage format
- Desktop integration
- Package manager support

## 🚨 Troubleshooting

### Common Issues

1. **App won't start**
   - Check Node.js version (18+ required)
   - Verify all dependencies are installed
   - Check for port conflicts (3000, 3001)

2. **Neo4j connection failed**
   - Ensure Neo4j is running
   - Check connection credentials
   - Verify firewall settings
   - App will run in demo mode if Neo4j unavailable

3. **File upload issues**
   - Check file size limits
   - Verify file format support
   - Ensure proper permissions

4. **Build failures**
   - Clear node_modules and reinstall
   - Check for platform-specific dependencies
   - Verify build tools are installed

### Debug Mode
```bash
# Enable debug logging
npm run dev -- --debug

# View Electron dev tools
Press F12 in the app
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check the docs folder
- **Issues**: Report bugs on GitHub
- **Discussions**: Join community discussions
- **Email**: support@multiagent-system.com

## 🔄 Updates

The application automatically checks for updates and notifies users when new versions are available. Updates can be installed directly from the app or downloaded from the releases page.

---

**Built with ❤️ using Electron, React, and Node.js**
