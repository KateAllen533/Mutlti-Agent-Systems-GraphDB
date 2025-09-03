import { BaseAgent } from './BaseAgent.js';
import fs from 'fs/promises';
import path from 'path';
import csv from 'csv-parser';
import XLSX from 'xlsx';
import { createReadStream } from 'fs';
import sqlite3 from 'sqlite3';
import mysql from 'mysql2/promise';
import pg from 'pg';

export class DataLoaderAgent extends BaseAgent {
  constructor(config = {}) {
    super('DataLoader', config);
    this.supportedFormats = ['csv', 'xlsx', 'xls', 'json'];
    this.uploadDir = config.uploadDir || './uploads';
  }

  async initialize() {
    await super.initialize();
    // Ensure upload directory exists
    await fs.mkdir(this.uploadDir, { recursive: true });
    this.logger.info('DataLoader agent initialized');
  }

  async execute(data) {
    const { source, type, path: filePath, connectionString } = data;
    
    switch (source) {
      case 'local':
        return await this.loadFromLocal(filePath, type);
      case 'upload':
        return await this.loadFromUpload(filePath, type);
      case 'odbc':
        return await this.loadFromODBC(connectionString, type);
      default:
        throw new Error(`Unsupported source type: ${source}`);
    }
  }

  async loadFromLocal(filePath, type) {
    this.logger.info(`Loading data from local file: ${filePath}`);
    
    if (!await this.fileExists(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const extension = path.extname(filePath).toLowerCase();
    const actualType = type || extension.substring(1);

    switch (actualType) {
      case 'csv':
        return await this.parseCSV(filePath);
      case 'xlsx':
      case 'xls':
        return await this.parseExcel(filePath);
      case 'json':
        return await this.parseJSON(filePath);
      default:
        throw new Error(`Unsupported file type: ${actualType}`);
    }
  }

  async loadFromUpload(filePath, type) {
    this.logger.info(`Loading data from uploaded file: ${filePath}`);
    return await this.loadFromLocal(filePath, type);
  }

  async loadFromODBC(connectionString, type) {
    this.logger.info(`Loading data from ODBC connection`);
    
    try {
      // Parse connection string to determine database type
      const dbType = this.parseConnectionString(connectionString);
      
      switch (dbType) {
        case 'sqlite':
          return await this.querySQLite(connectionString);
        case 'mysql':
          return await this.queryMySQL(connectionString);
        case 'postgresql':
          return await this.queryPostgreSQL(connectionString);
        default:
          throw new Error(`Unsupported database type: ${dbType}`);
      }
    } catch (error) {
      this.logger.error('ODBC connection failed:', error);
      throw error;
    }
  }

  async parseCSV(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          this.logger.info(`Parsed ${results.length} rows from CSV`);
          resolve({
            data: results,
            metadata: {
              type: 'csv',
              rowCount: results.length,
              columns: results.length > 0 ? Object.keys(results[0]) : []
            }
          });
        })
        .on('error', reject);
    });
  }

  async parseExcel(filePath) {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    this.logger.info(`Parsed ${data.length} rows from Excel`);
    return {
      data,
      metadata: {
        type: 'excel',
        rowCount: data.length,
        columns: data.length > 0 ? Object.keys(data[0]) : [],
        sheetName
      }
    };
  }

  async parseJSON(filePath) {
    const content = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(content);
    
    // Handle both array and object formats
    const normalizedData = Array.isArray(data) ? data : [data];
    
    this.logger.info(`Parsed ${normalizedData.length} rows from JSON`);
    return {
      data: normalizedData,
      metadata: {
        type: 'json',
        rowCount: normalizedData.length,
        columns: normalizedData.length > 0 ? Object.keys(normalizedData[0]) : []
      }
    };
  }

  async querySQLite(connectionString) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(connectionString);
      db.all("SELECT * FROM sqlite_master WHERE type='table'", (err, tables) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (tables.length === 0) {
          resolve({ data: [], metadata: { type: 'sqlite', tables: [] } });
          return;
        }
        
        const tableName = tables[0].name;
        db.all(`SELECT * FROM ${tableName} LIMIT 1000`, (err, rows) => {
          if (err) {
            reject(err);
            return;
          }
          
          this.logger.info(`Retrieved ${rows.length} rows from SQLite table: ${tableName}`);
          resolve({
            data: rows,
            metadata: {
              type: 'sqlite',
              tableName,
              rowCount: rows.length,
              columns: rows.length > 0 ? Object.keys(rows[0]) : []
            }
          });
        });
      });
    });
  }

  async queryMySQL(connectionString) {
    const connection = await mysql.createConnection(connectionString);
    
    try {
      const [tables] = await connection.execute("SHOW TABLES");
      if (tables.length === 0) {
        return { data: [], metadata: { type: 'mysql', tables: [] } };
      }
      
      const tableName = Object.values(tables[0])[0];
      const [rows] = await connection.execute(`SELECT * FROM ${tableName} LIMIT 1000`);
      
      this.logger.info(`Retrieved ${rows.length} rows from MySQL table: ${tableName}`);
      return {
        data: rows,
        metadata: {
          type: 'mysql',
          tableName,
          rowCount: rows.length,
          columns: rows.length > 0 ? Object.keys(rows[0]) : []
        }
      };
    } finally {
      await connection.end();
    }
  }

  async queryPostgreSQL(connectionString) {
    const client = new pg.Client(connectionString);
    await client.connect();
    
    try {
      const result = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        LIMIT 1
      `);
      
      if (result.rows.length === 0) {
        return { data: [], metadata: { type: 'postgresql', tables: [] } };
      }
      
      const tableName = result.rows[0].table_name;
      const dataResult = await client.query(`SELECT * FROM ${tableName} LIMIT 1000`);
      
      this.logger.info(`Retrieved ${dataResult.rows.length} rows from PostgreSQL table: ${tableName}`);
      return {
        data: dataResult.rows,
        metadata: {
          type: 'postgresql',
          tableName,
          rowCount: dataResult.rows.length,
          columns: dataResult.rows.length > 0 ? Object.keys(dataResult.rows[0]) : []
        }
      };
    } finally {
      await client.end();
    }
  }

  parseConnectionString(connectionString) {
    if (connectionString.includes('sqlite')) return 'sqlite';
    if (connectionString.includes('mysql')) return 'mysql';
    if (connectionString.includes('postgresql') || connectionString.includes('postgres')) return 'postgresql';
    throw new Error('Unable to determine database type from connection string');
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
