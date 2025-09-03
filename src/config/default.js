export const defaultConfig = {
  // Server Configuration
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true
    }
  },

  // Database Configuration
  database: {
    neo4j: {
      uri: process.env.NEO4J_URI || 'bolt://localhost:7687',
      user: process.env.NEO4J_USER || 'neo4j',
      password: process.env.NEO4J_PASSWORD || 'password',
      maxConnectionLifetime: 3 * 60 * 60 * 1000, // 3 hours
      maxConnectionPoolSize: 50,
      connectionAcquisitionTimeout: 2 * 60 * 1000, // 2 minutes
      disableLosslessIntegers: true
    }
  },

  // File Upload Configuration
  upload: {
    maxFileSize: process.env.MAX_FILE_SIZE || '50MB',
    uploadDir: process.env.UPLOAD_DIR || './uploads',
    allowedMimeTypes: [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/json'
    ],
    allowedExtensions: ['.csv', '.xlsx', '.xls', '.json']
  },

  // Agent Configuration
  agents: {
    dataLoader: {
      batchSize: 1000,
      timeout: 30000, // 30 seconds
      retryAttempts: 3,
      retryDelay: 1000 // 1 second
    },
    dataStructuring: {
      sampleSize: 100,
      minConfidence: 0.5,
      enableRelationshipDetection: true,
      enableDataQualityAssessment: true
    },
    graphModeling: {
      clearExisting: process.env.NODE_ENV === 'development',
      batchSize: 1000,
      createConstraints: true,
      createIndexes: true,
      enableGraphAnalysis: true
    }
  },

  // LLM Configuration
  llm: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4',
      maxTokens: 1000,
      temperature: 0.7,
      timeout: 30000
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: 'claude-3-sonnet-20240229',
      maxTokens: 1000,
      timeout: 30000
    }
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'combined',
    logDir: './logs',
    maxFiles: 5,
    maxSize: '10MB'
  },

  // Dashboard Configuration
  dashboard: {
    port: parseInt(process.env.PORT) + 1 || 3001,
    enableWebSocket: true,
    updateInterval: 5000, // 5 seconds
    maxHistoryItems: 100
  },

  // Job Configuration
  jobs: {
    maxConcurrentJobs: 5,
    jobTimeout: 300000, // 5 minutes
    maxRetries: 3,
    retryDelay: 5000 // 5 seconds
  },

  // Security Configuration
  security: {
    enableCORS: true,
    enableHelmet: true,
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    }
  },

  // Performance Configuration
  performance: {
    enableCompression: true,
    enableCaching: true,
    cacheTTL: 300000, // 5 minutes
    maxMemoryUsage: '512MB'
  }
};

export default defaultConfig;
