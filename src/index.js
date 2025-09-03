import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { AgentOrchestrator } from './coordination/AgentOrchestrator.js';
import { DashboardServer } from './dashboard/DashboardServer.js';
import winston from 'winston';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MultiAgentDataSystem {
  constructor() {
    this.app = express();
    this.orchestrator = null;
    this.dashboard = null;
    this.uploadDir = process.env.UPLOAD_DIR || './uploads';
    
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.label({ label: 'MainApp' }),
        winston.format.printf(({ timestamp, label, level, message }) => {
          return `${timestamp} [${label}] ${level}: ${message}`;
        })
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/app.log' })
      ]
    });
    
    this.setupUpload();
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupUpload() {
    // Configure multer for file uploads
    this.upload = multer({
      dest: this.uploadDir,
      limits: {
        fileSize: this.parseFileSize(process.env.MAX_FILE_SIZE || '50MB')
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = [
          'text/csv',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/json'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type. Only CSV, Excel, and JSON files are allowed.'));
        }
      }
    });
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        agents: this.orchestrator ? this.orchestrator.getAgentStatus() : null
      });
    });

    // Upload file endpoint
    this.app.post('/api/upload', this.upload.single('file'), async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileType = this.getFileType(req.file.originalname);
        const jobConfig = this.orchestrator.createUploadJob(req.file.path, fileType);
        
        // Process the file
        const jobId = await this.orchestrator.processDataAsync(jobConfig);
        
        res.json({ 
          message: 'File uploaded and processing started',
          jobId,
          fileName: req.file.originalname,
          fileType
        });
      } catch (error) {
        this.logger.error('File upload failed:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Process local file endpoint
    this.app.post('/api/process/local', async (req, res) => {
      try {
        const { filePath, fileType } = req.body;
        
        if (!filePath) {
          return res.status(400).json({ error: 'File path is required' });
        }

        const jobConfig = this.orchestrator.createLocalFileJob(filePath, fileType);
        const jobId = await this.orchestrator.processDataAsync(jobConfig);
        
        res.json({ 
          message: 'Local file processing started',
          jobId,
          filePath,
          fileType
        });
      } catch (error) {
        this.logger.error('Local file processing failed:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Process ODBC connection endpoint
    this.app.post('/api/process/odbc', async (req, res) => {
      try {
        const { connectionString, query } = req.body;
        
        if (!connectionString) {
          return res.status(400).json({ error: 'Connection string is required' });
        }

        const jobConfig = this.orchestrator.createODBCJob(connectionString, query);
        const jobId = await this.orchestrator.processDataAsync(jobConfig);
        
        res.json({ 
          message: 'ODBC processing started',
          jobId,
          connectionString: this.maskConnectionString(connectionString)
        });
      } catch (error) {
        this.logger.error('ODBC processing failed:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Get job status
    this.app.get('/api/job/:jobId/status', (req, res) => {
      try {
        const { jobId } = req.params;
        const status = this.orchestrator.getJobStatus(jobId);
        res.json(status);
      } catch (error) {
        res.status(404).json({ error: error.message });
      }
    });

    // Get job history
    this.app.get('/api/jobs/history', (req, res) => {
      try {
        const history = this.orchestrator.getJobHistory();
        res.json(history);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Get agent status
    this.app.get('/api/agents/status', (req, res) => {
      try {
        const status = this.orchestrator.getAgentStatus();
        res.json(status);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Settings endpoints
    this.app.get('/api/settings', (req, res) => {
      try {
        const settings = {
          system: {
            maxFileSize: process.env.MAX_FILE_SIZE || '50MB',
            maxConcurrentJobs: process.env.MAX_CONCURRENT_JOBS || 5,
            autoStart: process.env.AUTO_START === 'true',
            logLevel: process.env.LOG_LEVEL || 'info',
            retentionDays: process.env.RETENTION_DAYS || 30
          },
          database: {
            neo4jUri: process.env.NEO4J_URI || 'bolt://localhost:7687',
            neo4jUser: process.env.NEO4J_USER || 'neo4j',
            neo4jPassword: process.env.NEO4J_PASSWORD ? '***' : '',
            neo4jDatabase: process.env.NEO4J_DATABASE || 'neo4j'
          },
          api: {
            openaiApiKey: process.env.OPENAI_API_KEY ? '***' : '',
            anthropicApiKey: process.env.ANTHROPIC_API_KEY ? '***' : '',
            ollamaUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
            ollamaModel: process.env.OLLAMA_MODEL || 'llama2',
            openaiModel: process.env.OPENAI_MODEL || 'gpt-4',
            anthropicModel: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet',
            maxTokens: process.env.MAX_TOKENS || 2000,
            temperature: process.env.TEMPERATURE || 0.7
          }
        };
        res.json(settings);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post('/api/settings', (req, res) => {
      try {
        const settings = req.body;
        
        // Update environment variables (in a real app, you'd save to a config file)
        if (settings.system) {
          if (settings.system.maxFileSize) process.env.MAX_FILE_SIZE = settings.system.maxFileSize;
          if (settings.system.maxConcurrentJobs) process.env.MAX_CONCURRENT_JOBS = settings.system.maxConcurrentJobs;
          if (settings.system.autoStart !== undefined) process.env.AUTO_START = settings.system.autoStart.toString();
          if (settings.system.logLevel) process.env.LOG_LEVEL = settings.system.logLevel;
          if (settings.system.retentionDays) process.env.RETENTION_DAYS = settings.system.retentionDays;
        }
        
        if (settings.database) {
          if (settings.database.neo4jUri) process.env.NEO4J_URI = settings.database.neo4jUri;
          if (settings.database.neo4jUser) process.env.NEO4J_USER = settings.database.neo4jUser;
          if (settings.database.neo4jPassword) process.env.NEO4J_PASSWORD = settings.database.neo4jPassword;
          if (settings.database.neo4jDatabase) process.env.NEO4J_DATABASE = settings.database.neo4jDatabase;
        }
        
        if (settings.api) {
          if (settings.api.openaiApiKey) process.env.OPENAI_API_KEY = settings.api.openaiApiKey;
          if (settings.api.anthropicApiKey) process.env.ANTHROPIC_API_KEY = settings.api.anthropicApiKey;
          if (settings.api.ollamaUrl) process.env.OLLAMA_URL = settings.api.ollamaUrl;
          if (settings.api.ollamaModel) process.env.OLLAMA_MODEL = settings.api.ollamaModel;
          if (settings.api.openaiModel) process.env.OPENAI_MODEL = settings.api.openaiModel;
          if (settings.api.anthropicModel) process.env.ANTHROPIC_MODEL = settings.api.anthropicModel;
          if (settings.api.maxTokens) process.env.MAX_TOKENS = settings.api.maxTokens;
          if (settings.api.temperature) process.env.TEMPERATURE = settings.api.temperature;
        }
        
        this.logger.info('Settings updated successfully');
        res.json({ message: 'Settings saved successfully' });
      } catch (error) {
        this.logger.error('Settings update failed:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Batch processing endpoint
    this.app.post('/api/process/batch', async (req, res) => {
      try {
        const { jobs } = req.body;
        
        if (!Array.isArray(jobs) || jobs.length === 0) {
          return res.status(400).json({ error: 'Jobs array is required' });
        }

        const jobConfigs = jobs.map(job => {
          switch (job.type) {
            case 'local':
              return this.orchestrator.createLocalFileJob(job.filePath, job.fileType);
            case 'upload':
              return this.orchestrator.createUploadJob(job.filePath, job.fileType);
            case 'odbc':
              return this.orchestrator.createODBCJob(job.connectionString, job.query);
            default:
              throw new Error(`Unknown job type: ${job.type}`);
          }
        });

        const result = await this.orchestrator.processBatch(jobConfigs);
        res.json(result);
      } catch (error) {
        this.logger.error('Batch processing failed:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Error handling middleware
    this.app.use((error, req, res, next) => {
      this.logger.error('Unhandled error:', error);
      res.status(500).json({ error: 'Internal server error' });
    });

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({ error: 'Endpoint not found' });
    });
  }

  async initialize() {
    this.logger.info('Initializing Multi-Agent Data System');
    
    try {
      // Initialize orchestrator
      this.orchestrator = new AgentOrchestrator({
        dataLoader: {
          uploadDir: this.uploadDir
        },
        dataStructuring: {},
        graphModeling: {
          neo4jUri: process.env.NEO4J_URI,
          neo4jUser: process.env.NEO4J_USER,
          neo4jPassword: process.env.NEO4J_PASSWORD,
          clearExisting: process.env.NODE_ENV === 'development'
        }
      });

      // Set up orchestrator event listeners
      this.orchestrator.on('jobCompleted', (data) => {
        this.logger.info(`Job ${data.jobId} completed successfully`);
        if (this.dashboard) {
          this.dashboard.broadcastAgentUpdate('system', 'completed', data);
        }
      });

      this.orchestrator.on('jobFailed', (data) => {
        this.logger.error(`Job ${data.jobId} failed: ${data.error}`);
        if (this.dashboard) {
          this.dashboard.broadcastAgentUpdate('system', 'error', data);
        }
      });

      this.orchestrator.on('agentStatusChange', (data) => {
        if (this.dashboard) {
          this.dashboard.broadcastAgentUpdate(data.agent, data.status, data);
        }
      });

      await this.orchestrator.initialize();
      
      // Initialize dashboard
      this.dashboard = new DashboardServer({
        port: parseInt(process.env.PORT) + 1 || 3001
      });
      
      this.dashboard.start();
      
      this.logger.info('Multi-Agent Data System initialized successfully');
      this.logger.info('Note: Running in demo mode - Neo4j not available. Install Neo4j for full graph functionality.');
      
    } catch (error) {
      this.logger.error('Failed to initialize system:', error);
      throw error;
    }
  }

  start() {
    const port = process.env.PORT || 3000;
    
    this.app.listen(port, () => {
      this.logger.info(`Multi-Agent Data System API server running on port ${port}`);
      this.logger.info(`Dashboard available at: http://localhost:${parseInt(port) + 1}`);
      this.logger.info('System ready to process data from CSV, Excel, and ODBC sources');
    });
  }

  async stop() {
    this.logger.info('Stopping Multi-Agent Data System');
    
    if (this.orchestrator) {
      await this.orchestrator.stop();
    }
    
    if (this.dashboard) {
      this.dashboard.stop();
    }
    
    this.logger.info('System stopped');
  }

  // Utility methods
  getFileType(filename) {
    const ext = path.extname(filename).toLowerCase();
    switch (ext) {
      case '.csv':
        return 'csv';
      case '.xlsx':
      case '.xls':
        return 'excel';
      case '.json':
        return 'json';
      default:
        return 'unknown';
    }
  }

  parseFileSize(sizeStr) {
    const units = { B: 1, KB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024 };
    const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB)$/i);
    if (!match) return 50 * 1024 * 1024; // Default 50MB
    
    const size = parseFloat(match[1]);
    const unit = match[2].toUpperCase();
    return size * units[unit];
  }

  maskConnectionString(connectionString) {
    // Mask sensitive information in connection strings
    return connectionString.replace(/(password|pwd)=[^;]+/gi, 'password=***');
  }
}

// Create and start the application
const app = new MultiAgentDataSystem();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT. Gracefully shutting down...');
  await app.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nReceived SIGTERM. Gracefully shutting down...');
  await app.stop();
  process.exit(0);
});

// Initialize and start
app.initialize()
  .then(() => {
    app.start();
  })
  .catch((error) => {
    console.error('Failed to start application:', error);
    process.exit(1);
  });
