# Multi-Agent Data System

A powerful desktop application that orchestrates multiple AI agents to process, structure, and model data from various sources including CSV, Excel, and database connections. The system features a modern dashboard interface with real-time monitoring, data visualization, and graph database integration.

![Multi-Agent Data System Dashboard](dashboard-screenshot.png)

## 🚀 Features

### Core Functionality
- **Multi-Agent Architecture**: Three specialized agents working in coordination
  - **Data Loader Agent**: Handles data ingestion from CSV, Excel, and ODBC connections
  - **Data Structuring Agent**: Processes, cleans, and structures raw data with AI-powered insights
  - **Graph Modeling Agent**: Creates graph models and loads data into Neo4j database

### User Interface
- **Modern Desktop App**: Built with Electron and React for cross-platform compatibility
- **Responsive Dashboard**: Real-time monitoring of system performance and agent status
- **Collapsible Sidebar**: Clean navigation with expandable/collapsible sidebar
- **Dark/Light Mode**: Toggle between themes for better user experience
- **Interactive Charts**: Performance metrics and agent distribution visualization

### Data Processing
- **Multiple Data Sources**: Support for CSV, Excel, JSON, and database connections
- **ODBC Integration**: Connect to SQLite, MySQL, PostgreSQL databases
- **AI-Powered Analysis**: LLM integration with OpenAI, Anthropic Claude, and Ollama
- **Graph Database**: Neo4j integration for relationship modeling and analysis
- **Real-time Processing**: Live data processing with progress tracking

## 📊 Dashboard Overview

The dashboard provides comprehensive monitoring of your multi-agent system:

- **Job Status**: Track completed, active, and failed jobs
- **Agent Status**: Monitor the health and status of all agents
- **Performance Metrics**: System load, memory usage, and processing times
- **Performance Charts**: Historical data visualization
- **Agent Distribution**: Visual breakdown of agent workload
- **Recent Jobs**: Real-time job processing history

## 🛠️ Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or pnpm
- Neo4j (optional, for full graph functionality)

### Setup
1. Clone the repository:
```bash
git clone https://github.com/KateAllen533/Mutlti-Agent-Systems-GraphDB.git
cd Mutlti-Agent-Systems-GraphDB
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys and configuration
```

4. Build and run the application:
```bash
# Build the React frontend
npm run build-react

# Start the desktop application
npm start
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file with the following variables:

```env
# LLM Provider Configuration
LLM_PROVIDER=openai  # or 'anthropic' or 'ollama'
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4
ANTHROPIC_API_KEY=your_anthropic_api_key
ANTHROPIC_MODEL=claude-3-sonnet
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama2

# Neo4j Configuration (optional)
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password

# Server Configuration
PORT=3000
DASHBOARD_PORT=3001
```

### LLM Providers
The system supports multiple LLM providers:

- **OpenAI**: GPT-4, GPT-3.5-turbo
- **Anthropic**: Claude-3 Sonnet, Claude-3 Haiku
- **Ollama**: Local models (llama2, codellama, mistral, etc.)

## 📁 Project Structure

```
src/
├── agents/                 # Agent implementations
│   ├── BaseAgent.js       # Base agent class
│   ├── DataLoaderAgent.js # Data loading agent
│   ├── DataStructuringAgent.js # Data processing agent
│   └── GraphModelingAgent.js # Graph modeling agent
├── coordination/          # Agent orchestration
│   └── AgentOrchestrator.js
├── services/             # Core services
│   └── LLMService.js     # LLM integration service
├── desktop/              # Desktop application
│   ├── components/       # React components
│   ├── pages/           # Application pages
│   └── App.jsx          # Main application
├── dashboard/           # Dashboard server
└── index.js            # Main server entry point
```

## 🎯 Usage

### Starting the Application
1. Launch the desktop application using the desktop icon or `npm start`
2. The application will start both the backend server (port 3000) and dashboard (port 3001)
3. Use the sidebar navigation to access different features

### Data Processing Workflow
1. **Data Connectors**: Upload files or configure database connections
2. **Agent Workflow**: Monitor the processing pipeline
3. **Analytics**: View processed data and insights
4. **Settings**: Configure LLM providers and system settings

### Sidebar Navigation
- **Dashboard**: System overview and monitoring
- **Data Connectors**: File upload and database connections
- **Agent Workflow**: Real-time agent status and processing
- **Analytics**: Data visualization and insights
- **Settings**: Configuration and preferences

## 🔌 API Endpoints

The system provides REST API endpoints for integration:

- `POST /api/upload` - Upload files for processing
- `GET /api/settings` - Retrieve current settings
- `POST /api/settings` - Update system settings
- `GET /api/agents/status` - Get agent status
- `POST /api/agents/start` - Start all agents
- `POST /api/agents/stop` - Stop all agents

## 🚀 Development

### Available Scripts
```bash
npm run dev          # Development mode
npm run build-react  # Build React frontend
npm run build        # Build for production
npm run pack         # Package for distribution
npm run dist         # Create distributable
npm run lint         # Run ESLint
npm run test         # Run tests
```

### Building for Distribution
```bash
# Build the application
npm run build

# Package for your platform
npm run pack

# Create distributable installer
npm run dist
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Check the documentation in the `/docs` folder
- Review the configuration examples

## 🔮 Roadmap

- [ ] Enhanced graph visualization
- [ ] Additional data source connectors
- [ ] Advanced AI model integration
- [ ] Cloud deployment options
- [ ] Plugin system for custom agents
- [ ] Real-time collaboration features

---

**Built with ❤️ using Electron, React, and Node.js**