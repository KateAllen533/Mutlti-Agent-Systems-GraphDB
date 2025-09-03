import { EventEmitter } from 'events';
import { DataLoaderAgent } from '../agents/DataLoaderAgent.js';
import { DataStructuringAgent } from '../agents/DataStructuringAgent.js';
import { GraphModelingAgent } from '../agents/GraphModelingAgent.js';
import winston from 'winston';

export class AgentOrchestrator extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = config;
    this.agents = {};
    this.pipeline = [];
    this.currentJob = null;
    this.jobHistory = [];
    
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.label({ label: 'Orchestrator' }),
        winston.format.printf(({ timestamp, label, level, message }) => {
          return `${timestamp} [${label}] ${level}: ${message}`;
        })
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/orchestrator.log' })
      ]
    });
  }

  async initialize() {
    this.logger.info('Initializing Agent Orchestrator');
    
    // Initialize agents
    this.agents.dataLoader = new DataLoaderAgent(this.config.dataLoader || {});
    this.agents.dataStructuring = new DataStructuringAgent(this.config.dataStructuring || {});
    this.agents.graphModeling = new GraphModelingAgent(this.config.graphModeling || {});
    
    // Set up agent event listeners
    this.setupAgentListeners();
    
    // Initialize all agents with error handling
    const initPromises = [
      this.agents.dataLoader.initialize().catch(err => {
        this.logger.error('DataLoader initialization failed:', err);
        throw err;
      }),
      this.agents.dataStructuring.initialize().catch(err => {
        this.logger.error('DataStructuring initialization failed:', err);
        throw err;
      }),
      this.agents.graphModeling.initialize().catch(err => {
        this.logger.warn('GraphModeling initialization failed, will run in demo mode:', err.message);
        // Don't throw error for GraphModeling - it can run in demo mode
      })
    ];
    
    await Promise.allSettled(initPromises);
    this.logger.info('Agent initialization completed');
    this.emit('initialized');
  }

  setupAgentListeners() {
    for (const [agentName, agent] of Object.entries(this.agents)) {
      agent.on('statusChange', (data) => {
        this.logger.info(`Agent ${agentName} status changed to: ${data.status}`);
        this.emit('agentStatusChange', { agent: agentName, ...data });
      });
      
      agent.on('completed', (data) => {
        this.logger.info(`Agent ${agentName} completed task`);
        this.emit('agentCompleted', { agent: agentName, ...data });
      });
      
      agent.on('error', (data) => {
        this.logger.error(`Agent ${agentName} encountered error:`, data.error);
        this.emit('agentError', { agent: agentName, ...data });
      });
    }
  }

  async processData(jobConfig) {
    this.logger.info('Starting data processing job');
    
    const job = {
      id: this.generateJobId(),
      config: jobConfig,
      status: 'started',
      startTime: new Date(),
      steps: [],
      result: null,
      error: null
    };
    
    this.currentJob = job;
    this.jobHistory.push(job);
    
    try {
      // Step 1: Load data
      this.logger.info('Step 1: Loading data');
      job.steps.push({ name: 'dataLoading', status: 'started', startTime: new Date() });
      
      const loadResult = await this.agents.dataLoader.process(jobConfig.dataSource);
      job.steps[job.steps.length - 1].status = 'completed';
      job.steps[job.steps.length - 1].endTime = new Date();
      job.steps[job.steps.length - 1].result = loadResult;
      
      this.emit('stepCompleted', { jobId: job.id, step: 'dataLoading', result: loadResult });
      
      // Step 2: Structure data
      this.logger.info('Step 2: Structuring data');
      job.steps.push({ name: 'dataStructuring', status: 'started', startTime: new Date() });
      
      const structureResult = await this.agents.dataStructuring.process(loadResult);
      job.steps[job.steps.length - 1].status = 'completed';
      job.steps[job.steps.length - 1].endTime = new Date();
      job.steps[job.steps.length - 1].result = structureResult;
      
      this.emit('stepCompleted', { jobId: job.id, step: 'dataStructuring', result: structureResult });
      
      // Step 3: Create graph model
      this.logger.info('Step 3: Creating graph model');
      job.steps.push({ name: 'graphModeling', status: 'started', startTime: new Date() });
      
      const graphResult = await this.agents.graphModeling.process(structureResult);
      job.steps[job.steps.length - 1].status = 'completed';
      job.steps[job.steps.length - 1].endTime = new Date();
      job.steps[job.steps.length - 1].result = graphResult;
      
      this.emit('stepCompleted', { jobId: job.id, step: 'graphModeling', result: graphResult });
      
      // Job completed successfully
      job.status = 'completed';
      job.endTime = new Date();
      job.result = {
        dataLoading: loadResult,
        dataStructuring: structureResult,
        graphModeling: graphResult
      };
      
      this.logger.info(`Job ${job.id} completed successfully`);
      this.emit('jobCompleted', { jobId: job.id, result: job.result });
      
      return job.result;
      
    } catch (error) {
      this.logger.error(`Job ${job.id} failed:`, error);
      
      job.status = 'failed';
      job.endTime = new Date();
      job.error = error.message;
      
      // Mark current step as failed
      if (job.steps.length > 0) {
        const currentStep = job.steps[job.steps.length - 1];
        if (currentStep.status === 'started') {
          currentStep.status = 'failed';
          currentStep.endTime = new Date();
          currentStep.error = error.message;
        }
      }
      
      this.emit('jobFailed', { jobId: job.id, error: error.message });
      throw error;
    }
  }

  async processDataAsync(jobConfig) {
    // Process data in background and emit events
    setImmediate(async () => {
      try {
        await this.processData(jobConfig);
      } catch (error) {
        this.logger.error('Async processing failed:', error);
      }
    });
    
    return this.currentJob?.id;
  }

  getJobStatus(jobId) {
    const job = this.jobHistory.find(j => j.id === jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }
    
    return {
      id: job.id,
      status: job.status,
      startTime: job.startTime,
      endTime: job.endTime,
      steps: job.steps.map(step => ({
        name: step.name,
        status: step.status,
        startTime: step.startTime,
        endTime: step.endTime,
        duration: step.endTime ? step.endTime - step.startTime : null
      })),
      error: job.error
    };
  }

  getAgentStatus() {
    const status = {};
    for (const [agentName, agent] of Object.entries(this.agents)) {
      status[agentName] = agent.getStatus();
    }
    return status;
  }

  getJobHistory() {
    return this.jobHistory.map(job => ({
      id: job.id,
      status: job.status,
      startTime: job.startTime,
      endTime: job.endTime,
      duration: job.endTime ? job.endTime - job.startTime : null,
      error: job.error
    }));
  }

  async stop() {
    this.logger.info('Stopping Agent Orchestrator');
    
    // Close all agents
    for (const [agentName, agent] of Object.entries(this.agents)) {
      if (agent.close) {
        await agent.close();
      }
    }
    
    this.logger.info('Agent Orchestrator stopped');
  }

  generateJobId() {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Utility methods for different data source types
  createLocalFileJob(filePath, fileType) {
    return {
      dataSource: {
        source: 'local',
        path: filePath,
        type: fileType
      }
    };
  }

  createUploadJob(filePath, fileType) {
    return {
      dataSource: {
        source: 'upload',
        path: filePath,
        type: fileType
      }
    };
  }

  createODBCJob(connectionString, query = null) {
    return {
      dataSource: {
        source: 'odbc',
        connectionString,
        query
      }
    };
  }

  // Batch processing
  async processBatch(jobConfigs) {
    this.logger.info(`Processing batch of ${jobConfigs.length} jobs`);
    
    const results = [];
    const errors = [];
    
    for (let i = 0; i < jobConfigs.length; i++) {
      try {
        this.logger.info(`Processing job ${i + 1}/${jobConfigs.length}`);
        const result = await this.processData(jobConfigs[i]);
        results.push({ index: i, result });
      } catch (error) {
        this.logger.error(`Job ${i + 1} failed:`, error);
        errors.push({ index: i, error: error.message });
      }
    }
    
    this.logger.info(`Batch processing completed. ${results.length} successful, ${errors.length} failed`);
    
    return {
      results,
      errors,
      summary: {
        total: jobConfigs.length,
        successful: results.length,
        failed: errors.length
      }
    };
  }

  // Pipeline management
  addPipelineStep(step) {
    this.pipeline.push(step);
  }

  clearPipeline() {
    this.pipeline = [];
  }

  async executePipeline(initialData) {
    this.logger.info(`Executing pipeline with ${this.pipeline.length} steps`);
    
    let currentData = initialData;
    
    for (let i = 0; i < this.pipeline.length; i++) {
      const step = this.pipeline[i];
      this.logger.info(`Executing pipeline step ${i + 1}: ${step.name}`);
      
      try {
        currentData = await step.execute(currentData);
        this.emit('pipelineStepCompleted', { step: i + 1, name: step.name, result: currentData });
      } catch (error) {
        this.logger.error(`Pipeline step ${i + 1} failed:`, error);
        this.emit('pipelineStepFailed', { step: i + 1, name: step.name, error: error.message });
        throw error;
      }
    }
    
    this.logger.info('Pipeline execution completed');
    return currentData;
  }
}
