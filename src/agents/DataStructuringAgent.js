import { BaseAgent } from './BaseAgent.js';
import { LLMService } from '../services/LLMService.js';
import _ from 'lodash';
import moment from 'moment';

export class DataStructuringAgent extends BaseAgent {
  constructor(config = {}) {
    super('DataStructuring', config);
    this.dataTypes = {
      'string': 'String',
      'number': 'Number',
      'boolean': 'Boolean',
      'date': 'Date',
      'email': 'Email',
      'url': 'URL',
      'phone': 'Phone',
      'id': 'ID'
    };
    this.llmService = new LLMService(config.llm || {});
  }

  async initialize() {
    await super.initialize();
    this.logger.info('DataStructuring agent initialized');
  }

  async execute(data) {
    this.logger.info('Starting data structuring process');
    
    const { data: rawData, metadata } = data;
    
    if (!rawData || rawData.length === 0) {
      throw new Error('No data provided for structuring');
    }

    // Analyze data structure
    const analysis = await this.analyzeDataStructure(rawData);
    
    // Clean and normalize data
    const cleanedData = await this.cleanData(rawData, analysis);
    
    // Detect relationships
    const relationships = await this.detectRelationships(cleanedData, analysis);
    
    // Generate schema with LLM assistance
    const schema = await this.generateSchemaWithLLM(analysis, relationships, cleanedData);
    
    // Structure data according to schema
    const structuredData = await this.structureData(cleanedData, schema);
    
    // Generate LLM insights
    const llmInsights = await this.generateLLMInsights(cleanedData, analysis, relationships, schema);
    
    const result = {
      originalData: rawData,
      structuredData,
      schema,
      relationships,
      analysis,
      llmInsights,
      metadata: {
        ...metadata,
        processedAt: new Date().toISOString(),
        originalRowCount: rawData.length,
        structuredRowCount: structuredData.length
      }
    };

    this.logger.info(`Data structuring completed. Processed ${rawData.length} rows`);
    return result;
  }

  async analyzeDataStructure(data) {
    this.logger.info('Analyzing data structure');
    
    const sampleSize = Math.min(100, data.length);
    const sample = data.slice(0, sampleSize);
    
    const columnAnalysis = {};
    const columns = Object.keys(sample[0] || {});
    
    for (const column of columns) {
      const values = sample.map(row => row[column]).filter(val => val !== null && val !== undefined);
      columnAnalysis[column] = this.analyzeColumn(column, values);
    }
    
    return {
      columns,
      columnAnalysis,
      sampleSize,
      totalRows: data.length,
      dataQuality: this.assessDataQuality(data, columnAnalysis)
    };
  }

  analyzeColumn(columnName, values) {
    const nonNullValues = values.filter(val => val !== null && val !== undefined && val !== '');
    const nullCount = values.length - nonNullValues.length;
    
    // Detect data type
    const dataType = this.detectDataType(nonNullValues);
    
    // Detect patterns
    const patterns = this.detectPatterns(columnName, nonNullValues, dataType);
    
    // Statistical analysis
    const statistics = this.calculateStatistics(nonNullValues, dataType);
    
    // Detect potential relationships
    const potentialRelationships = this.detectPotentialRelationships(columnName, nonNullValues, dataType);
    
    return {
      name: columnName,
      dataType,
      patterns,
      statistics,
      potentialRelationships,
      nullCount,
      nullPercentage: (nullCount / values.length) * 100,
      uniqueValues: new Set(nonNullValues).size,
      sampleValues: nonNullValues.slice(0, 5)
    };
  }

  detectDataType(values) {
    if (values.length === 0) return 'unknown';
    
    const sample = values.slice(0, 10);
    
    // Check for boolean
    if (sample.every(val => ['true', 'false', '1', '0', 'yes', 'no'].includes(String(val).toLowerCase()))) {
      return 'boolean';
    }
    
    // Check for numbers
    if (sample.every(val => !isNaN(Number(val)) && !isNaN(parseFloat(val)))) {
      return 'number';
    }
    
    // Check for dates
    if (sample.every(val => this.isValidDate(val))) {
      return 'date';
    }
    
    // Check for emails
    if (sample.every(val => this.isValidEmail(val))) {
      return 'email';
    }
    
    // Check for URLs
    if (sample.every(val => this.isValidURL(val))) {
      return 'url';
    }
    
    // Check for phone numbers
    if (sample.every(val => this.isValidPhone(val))) {
      return 'phone';
    }
    
    // Check for IDs
    if (sample.every(val => this.looksLikeID(val))) {
      return 'id';
    }
    
    return 'string';
  }

  detectPatterns(columnName, values, dataType) {
    const patterns = [];
    
    // Name-based patterns
    const lowerName = columnName.toLowerCase();
    if (lowerName.includes('id') || lowerName.includes('key')) {
      patterns.push('identifier');
    }
    if (lowerName.includes('name')) {
      patterns.push('name');
    }
    if (lowerName.includes('email')) {
      patterns.push('email');
    }
    if (lowerName.includes('phone') || lowerName.includes('tel')) {
      patterns.push('phone');
    }
    if (lowerName.includes('date') || lowerName.includes('time')) {
      patterns.push('temporal');
    }
    if (lowerName.includes('address')) {
      patterns.push('address');
    }
    if (lowerName.includes('url') || lowerName.includes('link')) {
      patterns.push('url');
    }
    
    // Value-based patterns
    if (dataType === 'number') {
      const nums = values.map(v => Number(v));
      if (nums.every(n => Number.isInteger(n))) {
        patterns.push('integer');
      } else {
        patterns.push('decimal');
      }
      
      if (nums.every(n => n >= 0)) {
        patterns.push('positive');
      }
    }
    
    if (dataType === 'string') {
      const lengths = values.map(v => String(v).length);
      if (lengths.every(l => l === lengths[0])) {
        patterns.push('fixed_length');
      }
    }
    
    return patterns;
  }

  calculateStatistics(values, dataType) {
    const stats = {};
    
    if (dataType === 'number') {
      const nums = values.map(v => Number(v));
      stats.min = Math.min(...nums);
      stats.max = Math.max(...nums);
      stats.mean = nums.reduce((a, b) => a + b, 0) / nums.length;
      stats.median = this.calculateMedian(nums);
      stats.stdDev = this.calculateStandardDeviation(nums, stats.mean);
    }
    
    if (dataType === 'string') {
      const lengths = values.map(v => String(v).length);
      stats.minLength = Math.min(...lengths);
      stats.maxLength = Math.max(...lengths);
      stats.avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    }
    
    return stats;
  }

  detectPotentialRelationships(columnName, values, dataType) {
    const relationships = [];
    
    // Foreign key detection
    if (columnName.toLowerCase().includes('id') && dataType === 'string') {
      relationships.push({
        type: 'foreign_key',
        confidence: 0.8,
        description: 'Potential foreign key reference'
      });
    }
    
    // Hierarchical relationships
    if (columnName.toLowerCase().includes('parent') || columnName.toLowerCase().includes('child')) {
      relationships.push({
        type: 'hierarchical',
        confidence: 0.9,
        description: 'Parent-child relationship'
      });
    }
    
    // Temporal relationships
    if (dataType === 'date' || columnName.toLowerCase().includes('date')) {
      relationships.push({
        type: 'temporal',
        confidence: 0.7,
        description: 'Temporal relationship'
      });
    }
    
    return relationships;
  }

  assessDataQuality(data, columnAnalysis) {
    const quality = {
      completeness: 0,
      consistency: 0,
      accuracy: 0,
      overall: 0
    };
    
    const columns = Object.keys(columnAnalysis);
    let totalCompleteness = 0;
    let totalConsistency = 0;
    
    for (const column of columns) {
      const analysis = columnAnalysis[column];
      totalCompleteness += (100 - analysis.nullPercentage) / 100;
      
      // Consistency based on data type uniformity
      if (analysis.dataType !== 'unknown') {
        totalConsistency += 0.8;
      }
    }
    
    quality.completeness = (totalCompleteness / columns.length) * 100;
    quality.consistency = (totalConsistency / columns.length) * 100;
    quality.accuracy = Math.min(quality.completeness, quality.consistency);
    quality.overall = (quality.completeness + quality.consistency + quality.accuracy) / 3;
    
    return quality;
  }

  async cleanData(data, analysis) {
    this.logger.info('Cleaning and normalizing data');
    
    return data.map((row, index) => {
      const cleanedRow = {};
      
      for (const [column, value] of Object.entries(row)) {
        const columnAnalysis = analysis.columnAnalysis[column];
        cleanedRow[column] = this.cleanValue(value, columnAnalysis);
      }
      
      return cleanedRow;
    });
  }

  cleanValue(value, columnAnalysis) {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    
    const { dataType, patterns } = columnAnalysis;
    
    switch (dataType) {
      case 'number':
        return Number(value);
      case 'boolean':
        return this.normalizeBoolean(value);
      case 'date':
        return this.normalizeDate(value);
      case 'email':
        return String(value).toLowerCase().trim();
      case 'string':
        return String(value).trim();
      default:
        return value;
    }
  }

  async detectRelationships(data, analysis) {
    this.logger.info('Detecting relationships between columns');
    
    const relationships = [];
    const columns = analysis.columns;
    
    // Detect foreign key relationships
    for (let i = 0; i < columns.length; i++) {
      for (let j = i + 1; j < columns.length; j++) {
        const col1 = columns[i];
        const col2 = columns[j];
        
        const relationship = this.analyzeColumnRelationship(data, col1, col2);
        if (relationship) {
          relationships.push(relationship);
        }
      }
    }
    
    return relationships;
  }

  analyzeColumnRelationship(data, col1, col2) {
    const values1 = data.map(row => row[col1]).filter(v => v !== null);
    const values2 = data.map(row => row[col2]).filter(v => v !== null);
    
    // Check for exact matches (potential foreign key)
    const set1 = new Set(values1);
    const set2 = new Set(values2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    
    if (intersection.size > 0) {
      const overlap = intersection.size / Math.min(set1.size, set2.size);
      if (overlap > 0.5) {
        return {
          type: 'foreign_key',
          source: col1,
          target: col2,
          confidence: overlap,
          description: `Potential foreign key relationship between ${col1} and ${col2}`
        };
      }
    }
    
    return null;
  }

  async generateSchema(analysis, relationships) {
    this.logger.info('Generating data schema');
    
    const schema = {
      entities: [],
      relationships: relationships,
      constraints: []
    };
    
    // Create main entity
    const mainEntity = {
      name: 'MainEntity',
      properties: Object.values(analysis.columnAnalysis).map(col => ({
        name: col.name,
        type: col.dataType,
        patterns: col.patterns,
        nullable: col.nullPercentage > 0,
        unique: col.uniqueValues === analysis.totalRows,
        statistics: col.statistics
      }))
    };
    
    schema.entities.push(mainEntity);
    
    return schema;
  }

  async structureData(data, schema) {
    this.logger.info('Structuring data according to schema');
    
    // For now, return the cleaned data with additional metadata
    return data.map((row, index) => ({
      id: index + 1,
      ...row,
      _metadata: {
        rowIndex: index,
        processedAt: new Date().toISOString()
      }
    }));
  }

  // Helper methods
  isValidDate(value) {
    return moment(value, moment.ISO_8601, true).isValid() || 
           moment(value).isValid();
  }

  isValidEmail(value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(String(value));
  }

  isValidURL(value) {
    try {
      new URL(String(value));
      return true;
    } catch {
      return false;
    }
  }

  isValidPhone(value) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(String(value).replace(/[\s\-\(\)]/g, ''));
  }

  looksLikeID(value) {
    const str = String(value);
    return /^[A-Za-z0-9\-_]+$/.test(str) && str.length > 3;
  }

  normalizeBoolean(value) {
    const str = String(value).toLowerCase();
    return ['true', '1', 'yes', 'y'].includes(str);
  }

  normalizeDate(value) {
    return moment(value).toISOString();
  }

  calculateMedian(numbers) {
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  calculateStandardDeviation(numbers, mean) {
    const variance = numbers.reduce((acc, num) => acc + Math.pow(num - mean, 2), 0) / numbers.length;
    return Math.sqrt(variance);
  }

  async generateSchemaWithLLM(analysis, relationships, data) {
    this.logger.info('Generating schema with LLM assistance');
    
    try {
      const llmResponse = await this.llmService.analyzeDataWithLLM(data, 'schema_generation');
      
      // Parse LLM response and enhance the schema
      const enhancedSchema = await this.parseLLMSchemaResponse(llmResponse.content, analysis, relationships);
      
      return enhancedSchema;
    } catch (error) {
      this.logger.warn('LLM schema generation failed, using fallback:', error.message);
      return await this.generateSchema(analysis, relationships);
    }
  }

  async generateLLMInsights(data, analysis, relationships, schema) {
    this.logger.info('Generating LLM insights');
    
    try {
      const insights = {};
      
      // Data quality insights
      const qualityResponse = await this.llmService.analyzeDataWithLLM(data, 'data_quality');
      insights.dataQuality = this.parseLLMResponse(qualityResponse.content);
      
      // Relationship insights
      const relationshipResponse = await this.llmService.analyzeDataWithLLM(data, 'relationship_detection');
      insights.relationships = this.parseLLMResponse(relationshipResponse.content);
      
      // Business insights
      const businessResponse = await this.llmService.generateResponse(
        `Based on the following data analysis, provide business insights and recommendations:
        
        Data Quality: ${JSON.stringify(analysis.dataQuality)}
        Relationships: ${JSON.stringify(relationships)}
        Schema: ${JSON.stringify(schema)}
        
        Please provide actionable business insights and recommendations.`
      );
      insights.business = this.parseLLMResponse(businessResponse.content);
      
      return insights;
    } catch (error) {
      this.logger.warn('LLM insights generation failed:', error.message);
      return {
        dataQuality: { error: 'LLM analysis unavailable' },
        relationships: { error: 'LLM analysis unavailable' },
        business: { error: 'LLM analysis unavailable' }
      };
    }
  }

  async parseLLMSchemaResponse(llmContent, analysis, relationships) {
    // Enhanced schema generation with LLM insights
    const baseSchema = await this.generateSchema(analysis, relationships);
    
    try {
      // Try to parse structured JSON from LLM response
      const jsonMatch = llmContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const llmSchema = JSON.parse(jsonMatch[0]);
        return this.mergeSchemas(baseSchema, llmSchema);
      }
    } catch (error) {
      this.logger.warn('Failed to parse LLM schema JSON:', error.message);
    }
    
    // Fallback: enhance base schema with LLM insights
    return this.enhanceSchemaWithLLMInsights(baseSchema, llmContent);
  }

  parseLLMResponse(content) {
    try {
      // Try to parse as JSON first
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      // Fallback to text parsing
    }
    
    // Parse structured text response
    const lines = content.split('\n').filter(line => line.trim());
    const result = {};
    let currentSection = null;
    
    for (const line of lines) {
      if (line.match(/^[A-Z][A-Z\s]+:$/)) {
        currentSection = line.replace(':', '').toLowerCase().replace(/\s+/g, '_');
        result[currentSection] = [];
      } else if (currentSection && line.trim()) {
        result[currentSection].push(line.trim());
      }
    }
    
    return result;
  }

  mergeSchemas(baseSchema, llmSchema) {
    // Merge LLM-enhanced schema with base schema
    return {
      ...baseSchema,
      entities: llmSchema.entities || baseSchema.entities,
      relationships: [...(baseSchema.relationships || []), ...(llmSchema.relationships || [])],
      constraints: [...(baseSchema.constraints || []), ...(llmSchema.constraints || [])],
      llmEnhancements: llmSchema
    };
  }

  enhanceSchemaWithLLMInsights(baseSchema, llmContent) {
    // Add LLM insights as metadata to the schema
    return {
      ...baseSchema,
      llmInsights: {
        content: llmContent,
        timestamp: new Date().toISOString()
      }
    };
  }
}
