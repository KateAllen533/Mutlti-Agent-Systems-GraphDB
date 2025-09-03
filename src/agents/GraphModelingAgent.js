import { BaseAgent } from './BaseAgent.js';
import { LLMService } from '../services/LLMService.js';
import neo4j from 'neo4j-driver';
import _ from 'lodash';

export class GraphModelingAgent extends BaseAgent {
  constructor(config = {}) {
    super('GraphModeling', config);
    this.driver = null;
    this.neo4jConfig = {
      uri: config.neo4jUri || process.env.NEO4J_URI || 'bolt://localhost:7687',
      user: config.neo4jUser || process.env.NEO4J_USER || 'neo4j',
      password: config.neo4jPassword || process.env.NEO4J_PASSWORD || 'password'
    };
    this.llmService = new LLMService(config.llm || {});
  }

  async initialize() {
    await super.initialize();
    
    try {
      this.driver = neo4j.driver(
        this.neo4jConfig.uri,
        neo4j.auth.basic(this.neo4jConfig.user, this.neo4jConfig.password)
      );
      
      // Test connection
      await this.driver.verifyConnectivity();
      this.logger.info('Connected to Neo4j database');
      this.demoMode = false;
    } catch (error) {
      this.logger.warn('Failed to connect to Neo4j, running in demo mode:', error.message);
      this.demoMode = true;
      this.driver = null;
    }
  }

  async execute(data) {
    this.logger.info('Starting graph modeling process');
    
    const { structuredData, schema, relationships, analysis } = data;
    
    if (!structuredData || structuredData.length === 0) {
      throw new Error('No structured data provided for graph modeling');
    }

    if (this.demoMode) {
      this.logger.info('Running in demo mode - generating mock graph data');
      return await this.generateDemoGraphData(structuredData, schema, relationships, analysis);
    }

    // Clear existing data (optional - can be configured)
    if (this.config.clearExisting) {
      await this.clearDatabase();
    }

    // Create graph model
    const graphModel = await this.createGraphModel(schema, relationships, analysis);
    
    // Load data into Neo4j
    const loadResult = await this.loadDataToNeo4j(structuredData, graphModel);
    
    // Analyze the created graph
    const graphAnalysis = await this.analyzeGraph();
    
    // Generate graph insights
    const insights = await this.generateGraphInsights(graphAnalysis);
    
    // Generate LLM-powered graph insights
    const llmInsights = await this.generateLLMGraphInsights(structuredData, graphAnalysis, insights);
    
    const result = {
      graphModel,
      loadResult,
      graphAnalysis,
      insights,
      llmInsights,
      metadata: {
        processedAt: new Date().toISOString(),
        nodeCount: loadResult.nodeCount,
        relationshipCount: loadResult.relationshipCount
      }
    };

    this.logger.info(`Graph modeling completed. Created ${loadResult.nodeCount} nodes and ${loadResult.relationshipCount} relationships`);
    return result;
  }

  async createGraphModel(schema, relationships, analysis) {
    this.logger.info('Creating graph model from schema');
    
    const graphModel = {
      nodeTypes: [],
      relationshipTypes: [],
      constraints: [],
      indexes: []
    };

    // Create node types from schema entities
    for (const entity of schema.entities) {
      const nodeType = {
        name: entity.name,
        properties: entity.properties.map(prop => ({
          name: prop.name,
          type: this.mapToNeo4jType(prop.type),
          indexed: prop.patterns.includes('identifier') || prop.unique,
          unique: prop.unique
        })),
        constraints: entity.properties
          .filter(prop => prop.unique)
          .map(prop => ({
            type: 'UNIQUE',
            property: prop.name
          }))
      };
      
      graphModel.nodeTypes.push(nodeType);
    }

    // Create relationship types
    for (const rel of relationships) {
      const relationshipType = {
        name: this.generateRelationshipName(rel.source, rel.target),
        source: rel.source,
        target: rel.target,
        type: rel.type,
        properties: {
          confidence: rel.confidence,
          description: rel.description
        }
      };
      
      graphModel.relationshipTypes.push(relationshipType);
    }

    // Add additional relationship types based on data patterns
    const additionalRelationships = await this.detectAdditionalRelationships(analysis);
    graphModel.relationshipTypes.push(...additionalRelationships);

    return graphModel;
  }

  async loadDataToNeo4j(data, graphModel) {
    this.logger.info('Loading data into Neo4j');
    
    const session = this.driver.session();
    let nodeCount = 0;
    let relationshipCount = 0;

    try {
      // Create constraints and indexes
      await this.createConstraintsAndIndexes(graphModel, session);
      
      // Load nodes
      nodeCount = await this.loadNodes(data, graphModel, session);
      
      // Load relationships
      relationshipCount = await this.loadRelationships(data, graphModel, session);
      
      return { nodeCount, relationshipCount };
    } finally {
      await session.close();
    }
  }

  async createConstraintsAndIndexes(graphModel, session) {
    this.logger.info('Creating constraints and indexes');
    
    for (const nodeType of graphModel.nodeTypes) {
      for (const constraint of nodeType.constraints) {
        try {
          const cypher = `CREATE CONSTRAINT ${nodeType.name.toLowerCase()}_${constraint.property}_unique 
                         FOR (n:${nodeType.name}) REQUIRE n.${constraint.property} IS UNIQUE`;
          await session.run(cypher);
          this.logger.info(`Created constraint: ${constraint.property} unique for ${nodeType.name}`);
        } catch (error) {
          this.logger.warn(`Constraint creation failed (may already exist): ${error.message}`);
        }
      }
      
      for (const property of nodeType.properties) {
        if (property.indexed) {
          try {
            const cypher = `CREATE INDEX ${nodeType.name.toLowerCase()}_${property.name}_index 
                           FOR (n:${nodeType.name}) ON (n.${property.name})`;
            await session.run(cypher);
            this.logger.info(`Created index: ${property.name} for ${nodeType.name}`);
          } catch (error) {
            this.logger.warn(`Index creation failed (may already exist): ${error.message}`);
          }
        }
      }
    }
  }

  async loadNodes(data, graphModel, session) {
    this.logger.info('Loading nodes into Neo4j');
    
    const nodeType = graphModel.nodeTypes[0]; // Main entity
    const batchSize = 1000;
    let totalNodes = 0;

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      
      const cypher = `
        UNWIND $batch AS row
        CREATE (n:${nodeType.name})
        SET n += row
        RETURN count(n) as created
      `;
      
      const result = await session.run(cypher, { batch });
      const created = result.records[0].get('created').toNumber();
      totalNodes += created;
      
      this.logger.info(`Loaded batch ${Math.floor(i / batchSize) + 1}: ${created} nodes`);
    }

    return totalNodes;
  }

  async loadRelationships(data, graphModel, session) {
    this.logger.info('Loading relationships into Neo4j');
    
    let totalRelationships = 0;
    
    for (const relType of graphModel.relationshipTypes) {
      if (relType.type === 'foreign_key') {
        const relationships = await this.createForeignKeyRelationships(data, relType, session);
        totalRelationships += relationships;
      } else if (relType.type === 'hierarchical') {
        const relationships = await this.createHierarchicalRelationships(data, relType, session);
        totalRelationships += relationships;
      } else if (relType.type === 'temporal') {
        const relationships = await this.createTemporalRelationships(data, relType, session);
        totalRelationships += relationships;
      }
    }

    return totalRelationships;
  }

  async createForeignKeyRelationships(data, relType, session) {
    this.logger.info(`Creating foreign key relationships: ${relType.name}`);
    
    // Find matching values between source and target columns
    const sourceValues = new Set(data.map(row => row[relType.source]).filter(v => v !== null));
    const targetValues = new Set(data.map(row => row[relType.target]).filter(v => v !== null));
    const commonValues = [...sourceValues].filter(v => targetValues.has(v));
    
    if (commonValues.length === 0) {
      return 0;
    }

    const cypher = `
      UNWIND $values AS value
      MATCH (source:MainEntity {${relType.source}: value})
      MATCH (target:MainEntity {${relType.target}: value})
      WHERE source <> target
      CREATE (source)-[r:${relType.name}]->(target)
      SET r.confidence = $confidence,
          r.description = $description
      RETURN count(r) as created
    `;
    
    const result = await session.run(cypher, {
      values: commonValues,
      confidence: relType.properties.confidence,
      description: relType.properties.description
    });
    
    return result.records[0].get('created').toNumber();
  }

  async createHierarchicalRelationships(data, relType, session) {
    this.logger.info(`Creating hierarchical relationships: ${relType.name}`);
    
    // This is a simplified implementation
    // In a real scenario, you'd analyze the data to find parent-child relationships
    const cypher = `
      MATCH (parent:MainEntity)
      MATCH (child:MainEntity)
      WHERE parent.${relType.source} = child.${relType.target}
      AND parent <> child
      CREATE (parent)-[r:${relType.name}]->(child)
      SET r.confidence = $confidence,
          r.description = $description
      RETURN count(r) as created
    `;
    
    const result = await session.run(cypher, {
      confidence: relType.properties.confidence,
      description: relType.properties.description
    });
    
    return result.records[0].get('created').toNumber();
  }

  async createTemporalRelationships(data, relType, session) {
    this.logger.info(`Creating temporal relationships: ${relType.name}`);
    
    // Create temporal relationships based on date/time columns
    const cypher = `
      MATCH (earlier:MainEntity)
      MATCH (later:MainEntity)
      WHERE earlier.${relType.source} < later.${relType.target}
      AND earlier <> later
      CREATE (earlier)-[r:${relType.name}]->(later)
      SET r.confidence = $confidence,
          r.description = $description
      RETURN count(r) as created
    `;
    
    const result = await session.run(cypher, {
      confidence: relType.properties.confidence,
      description: relType.properties.description
    });
    
    return result.records[0].get('created').toNumber();
  }

  async analyzeGraph() {
    this.logger.info('Analyzing created graph');
    
    const session = this.driver.session();
    
    try {
      const analysis = {};
      
      // Get basic statistics
      const statsQuery = `
        MATCH (n)
        RETURN 
          count(n) as nodeCount,
          labels(n) as nodeLabels
      `;
      
      const statsResult = await session.run(statsQuery);
      analysis.nodeCount = statsResult.records[0].get('nodeCount').toNumber();
      analysis.nodeLabels = statsResult.records[0].get('nodeLabels');
      
      // Get relationship statistics
      const relStatsQuery = `
        MATCH ()-[r]->()
        RETURN 
          count(r) as relationshipCount,
          type(r) as relationshipTypes
      `;
      
      const relStatsResult = await session.run(relStatsQuery);
      analysis.relationshipCount = relStatsResult.records[0].get('relationshipCount').toNumber();
      analysis.relationshipTypes = relStatsResult.records[0].get('relationshipTypes');
      
      // Get graph density
      const densityQuery = `
        MATCH (n)
        WITH count(n) as nodeCount
        MATCH ()-[r]->()
        WITH nodeCount, count(r) as relCount
        RETURN 
          nodeCount,
          relCount,
          CASE 
            WHEN nodeCount > 1 
            THEN toFloat(relCount) / (nodeCount * (nodeCount - 1))
            ELSE 0.0
          END as density
      `;
      
      const densityResult = await session.run(densityQuery);
      const record = densityResult.records[0];
      analysis.density = record.get('density');
      
      // Get centrality measures (simplified)
      const centralityQuery = `
        MATCH (n)
        OPTIONAL MATCH (n)-[r]-()
        RETURN 
          n.id as nodeId,
          count(r) as degree
        ORDER BY degree DESC
        LIMIT 10
      `;
      
      const centralityResult = await session.run(centralityQuery);
      analysis.topNodes = centralityResult.records.map(record => ({
        nodeId: record.get('nodeId'),
        degree: record.get('degree').toNumber()
      }));
      
      return analysis;
    } finally {
      await session.close();
    }
  }

  async generateGraphInsights(analysis) {
    this.logger.info('Generating graph insights');
    
    const insights = {
      summary: {
        totalNodes: analysis.nodeCount,
        totalRelationships: analysis.relationshipCount,
        density: analysis.density,
        connectivity: analysis.density > 0.1 ? 'High' : analysis.density > 0.01 ? 'Medium' : 'Low'
      },
      patterns: [],
      recommendations: []
    };
    
    // Analyze patterns
    if (analysis.density > 0.1) {
      insights.patterns.push({
        type: 'dense_network',
        description: 'The graph shows high connectivity with many relationships between nodes',
        significance: 'High'
      });
    }
    
    if (analysis.topNodes.length > 0) {
      const maxDegree = analysis.topNodes[0].degree;
      if (maxDegree > analysis.nodeCount * 0.1) {
        insights.patterns.push({
          type: 'hub_nodes',
          description: `Found hub nodes with high degree centrality (max: ${maxDegree})`,
          significance: 'Medium'
        });
      }
    }
    
    // Generate recommendations
    if (analysis.density < 0.01) {
      insights.recommendations.push({
        type: 'sparse_graph',
        description: 'Consider adding more relationships to improve graph connectivity',
        priority: 'Medium'
      });
    }
    
    if (analysis.relationshipCount === 0) {
      insights.recommendations.push({
        type: 'no_relationships',
        description: 'No relationships were created. Review data for potential connections',
        priority: 'High'
      });
    }
    
    return insights;
  }

  async detectAdditionalRelationships(analysis) {
    const additionalRelationships = [];
    
    // Detect potential relationships based on column names
    const columns = analysis.columns;
    
    for (let i = 0; i < columns.length; i++) {
      for (let j = i + 1; j < columns.length; j++) {
        const col1 = columns[i];
        const col2 = columns[j];
        
        // Check for similar column names (potential relationships)
        if (this.areColumnsRelated(col1, col2)) {
          additionalRelationships.push({
            name: `RELATED_TO_${col1.toUpperCase()}_${col2.toUpperCase()}`,
            source: col1,
            target: col2,
            type: 'semantic',
            properties: {
              confidence: 0.6,
              description: `Semantic relationship between ${col1} and ${col2}`
            }
          });
        }
      }
    }
    
    return additionalRelationships;
  }

  areColumnsRelated(col1, col2) {
    const lower1 = col1.toLowerCase();
    const lower2 = col2.toLowerCase();
    
    // Check for common prefixes/suffixes
    const commonWords = ['id', 'name', 'type', 'status', 'date', 'time'];
    
    for (const word of commonWords) {
      if ((lower1.includes(word) && lower2.includes(word)) ||
          (lower1.includes(word) && lower2.includes(word.replace('id', 'name'))) ||
          (lower1.includes(word) && lower2.includes(word.replace('name', 'id')))) {
        return true;
      }
    }
    
    return false;
  }

  generateRelationshipName(source, target) {
    return `RELATES_TO_${source.toUpperCase()}_${target.toUpperCase()}`;
  }

  mapToNeo4jType(dataType) {
    const typeMapping = {
      'string': 'String',
      'number': 'Float',
      'boolean': 'Boolean',
      'date': 'DateTime',
      'email': 'String',
      'url': 'String',
      'phone': 'String',
      'id': 'String'
    };
    
    return typeMapping[dataType] || 'String';
  }

  async clearDatabase() {
    this.logger.info('Clearing existing data from Neo4j');
    
    const session = this.driver.session();
    
    try {
      await session.run('MATCH (n) DETACH DELETE n');
      this.logger.info('Database cleared');
    } finally {
      await session.close();
    }
  }

  async generateDemoGraphData(structuredData, schema, relationships, analysis) {
    this.logger.info('Generating demo graph data for visualization');
    
    // Create mock graph data
    const nodes = [];
    const edges = [];
    
    // Generate nodes from structured data
    structuredData.slice(0, 10).forEach((record, index) => {
      const nodeId = `node_${index}`;
      const nodeType = schema.entities?.[0]?.name || 'Entity';
      
      nodes.push({
        id: nodeId,
        label: `${nodeType} ${index + 1}`,
        group: nodeType,
        properties: record,
        size: Math.random() * 20 + 10
      });
    });
    
    // Generate mock relationships
    for (let i = 0; i < Math.min(5, nodes.length - 1); i++) {
      edges.push({
        id: `edge_${i}`,
        from: nodes[i].id,
        to: nodes[i + 1].id,
        label: 'RELATES_TO',
        width: Math.random() * 5 + 1
      });
    }
    
    // Generate mock insights
    const insights = [
      {
        type: 'pattern',
        title: 'Data Clustering',
        description: 'Detected 3 main clusters in the data structure',
        confidence: 0.85
      },
      {
        type: 'anomaly',
        title: 'Outlier Detection',
        description: 'Found 2 potential outliers in the dataset',
        confidence: 0.72
      },
      {
        type: 'relationship',
        title: 'Strong Correlations',
        description: 'Identified 5 strong correlations between entities',
        confidence: 0.91
      }
    ];
    
    return {
      success: true,
      graphData: {
        nodes,
        edges
      },
      insights,
      statistics: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        nodeTypes: [...new Set(nodes.map(n => n.group))],
        relationshipTypes: [...new Set(edges.map(e => e.label))]
      },
      demoMode: true,
      message: 'Demo mode: Graph data generated for visualization. Install Neo4j for full functionality.'
    };
  }

  async generateLLMGraphInsights(data, graphAnalysis, insights) {
    this.logger.info('Generating LLM-powered graph insights');
    
    try {
      const llmResponse = await this.llmService.analyzeDataWithLLM(data, 'graph_insights');
      
      return {
        llmAnalysis: this.parseLLMResponse(llmResponse.content),
        enhancedInsights: this.enhanceInsightsWithLLM(insights, llmResponse.content),
        recommendations: await this.generateLLMRecommendations(data, graphAnalysis, insights),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.warn('LLM graph insights generation failed:', error.message);
      return {
        llmAnalysis: { error: 'LLM analysis unavailable' },
        enhancedInsights: insights,
        recommendations: [],
        timestamp: new Date().toISOString()
      };
    }
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

  enhanceInsightsWithLLM(insights, llmContent) {
    return {
      ...insights,
      llmEnhancements: {
        content: llmContent,
        timestamp: new Date().toISOString()
      }
    };
  }

  async generateLLMRecommendations(data, graphAnalysis, insights) {
    try {
      const prompt = `Based on the following graph analysis, provide specific recommendations for optimization:

Graph Statistics:
- Nodes: ${graphAnalysis.nodeCount}
- Relationships: ${graphAnalysis.relationshipCount}
- Density: ${graphAnalysis.density}

Current Insights:
${JSON.stringify(insights, null, 2)}

Please provide:
1. Performance optimization recommendations
2. Data modeling improvements
3. Query optimization suggestions
4. Business value insights

Format as actionable recommendations.`;

      const response = await this.llmService.generateResponse(prompt);
      return this.parseLLMResponse(response.content);
    } catch (error) {
      this.logger.warn('LLM recommendations generation failed:', error.message);
      return { error: 'Recommendations unavailable' };
    }
  }

  async close() {
    if (this.driver) {
      await this.driver.close();
      this.logger.info('Neo4j connection closed');
    }
  }
}
