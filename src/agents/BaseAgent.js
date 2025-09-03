import { EventEmitter } from 'events';
import winston from 'winston';

export class BaseAgent extends EventEmitter {
  constructor(name, config = {}) {
    super();
    this.name = name;
    this.config = config;
    this.status = 'idle';
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.label({ label: this.name }),
        winston.format.printf(({ timestamp, label, level, message }) => {
          return `${timestamp} [${label}] ${level}: ${message}`;
        })
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: `logs/${this.name}.log` })
      ]
    });
  }

  async initialize() {
    this.logger.info(`Initializing ${this.name} agent`);
    this.status = 'initializing';
    this.emit('statusChange', { agent: this.name, status: this.status });
  }

  async process(data) {
    this.logger.info(`Processing data in ${this.name}`);
    this.status = 'processing';
    this.emit('statusChange', { agent: this.name, status: this.status });
    
    try {
      const result = await this.execute(data);
      this.status = 'completed';
      this.emit('statusChange', { agent: this.name, status: this.status });
      this.emit('completed', { agent: this.name, result });
      return result;
    } catch (error) {
      this.status = 'error';
      this.logger.error(`Error in ${this.name}:`, error);
      this.emit('statusChange', { agent: this.name, status: this.status });
      this.emit('error', { agent: this.name, error });
      throw error;
    }
  }

  async execute(data) {
    throw new Error('Execute method must be implemented by subclass');
  }

  getStatus() {
    return {
      name: this.name,
      status: this.status,
      config: this.config
    };
  }
}
