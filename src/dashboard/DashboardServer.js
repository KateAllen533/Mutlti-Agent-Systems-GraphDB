import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DashboardServer {
  constructor(config = {}) {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new Server(this.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    
    this.port = config.port || process.env.PORT || 3000;
    this.llmConfig = {
      openai: new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      }),
      anthropic: new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
      })
    };
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupSocketHandlers();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.static(path.join(__dirname, 'public')));
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    // Get graph data
    this.app.get('/api/graph', async (req, res) => {
      try {
        const graphData = await this.getGraphData();
        res.json(graphData);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Get graph insights
    this.app.get('/api/insights', async (req, res) => {
      try {
        const insights = await this.getGraphInsights();
        res.json(insights);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Generate LLM visualization
    this.app.post('/api/visualize', async (req, res) => {
      try {
        const { data, prompt, llmProvider = 'openai' } = req.body;
        const visualization = await this.generateVisualization(data, prompt, llmProvider);
        res.json(visualization);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Get agent status
    this.app.get('/api/agents/status', (req, res) => {
      res.json(this.getAgentStatus());
    });

    // Serve main dashboard
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('request-graph-update', async () => {
        try {
          const graphData = await this.getGraphData();
          socket.emit('graph-update', graphData);
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      socket.on('request-insights', async () => {
        try {
          const insights = await this.getGraphInsights();
          socket.emit('insights-update', insights);
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  async getGraphData() {
    // This would typically connect to Neo4j to get the actual graph data
    // For now, returning mock data structure
    return {
      nodes: [
        { id: 1, label: 'Node 1', group: 'A', properties: { name: 'Sample Node 1' } },
        { id: 2, label: 'Node 2', group: 'B', properties: { name: 'Sample Node 2' } },
        { id: 3, label: 'Node 3', group: 'A', properties: { name: 'Sample Node 3' } }
      ],
      edges: [
        { from: 1, to: 2, label: 'RELATES_TO', properties: { confidence: 0.8 } },
        { from: 2, to: 3, label: 'CONNECTED_TO', properties: { confidence: 0.6 } }
      ],
      metadata: {
        nodeCount: 3,
        edgeCount: 2,
        lastUpdated: new Date().toISOString()
      }
    };
  }

  async getGraphInsights() {
    // Mock insights - in real implementation, this would come from the GraphModelingAgent
    return {
      summary: {
        totalNodes: 3,
        totalRelationships: 2,
        density: 0.33,
        connectivity: 'Medium'
      },
      patterns: [
        {
          type: 'connected_components',
          description: 'Graph contains 1 connected component',
          significance: 'Medium'
        }
      ],
      recommendations: [
        {
          type: 'expand_relationships',
          description: 'Consider adding more relationships to improve connectivity',
          priority: 'Low'
        }
      ]
    };
  }

  async generateVisualization(data, prompt, llmProvider = 'openai') {
    try {
      let response;
      
      if (llmProvider === 'anthropic') {
        response = await this.generateWithAnthropic(data, prompt);
      } else {
        response = await this.generateWithOpenAI(data, prompt);
      }
      
      return {
        visualization: response,
        provider: llmProvider,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`LLM visualization failed: ${error.message}`);
    }
  }

  async generateWithOpenAI(data, prompt) {
    const systemPrompt = `You are a data visualization expert. Analyze the provided graph data and create a comprehensive visualization description including:
    1. Graph structure analysis
    2. Key patterns and insights
    3. Visualization recommendations
    4. Interactive features suggestions
    
    Respond in JSON format with the following structure:
    {
      "analysis": "string",
      "patterns": ["pattern1", "pattern2"],
      "recommendations": ["rec1", "rec2"],
      "visualizationType": "string",
      "interactiveFeatures": ["feature1", "feature2"]
    }`;

    const completion = await this.llmConfig.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Data: ${JSON.stringify(data)}\n\nPrompt: ${prompt}` }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    return JSON.parse(completion.choices[0].message.content);
  }

  async generateWithAnthropic(data, prompt) {
    const systemPrompt = `You are a data visualization expert. Analyze the provided graph data and create a comprehensive visualization description including:
    1. Graph structure analysis
    2. Key patterns and insights
    3. Visualization recommendations
    4. Interactive features suggestions
    
    Respond in JSON format with the following structure:
    {
      "analysis": "string",
      "patterns": ["pattern1", "pattern2"],
      "recommendations": ["rec1", "rec2"],
      "visualizationType": "string",
      "interactiveFeatures": ["feature1", "feature2"]
    }`;

    const response = await this.llmConfig.anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Data: ${JSON.stringify(data)}\n\nPrompt: ${prompt}`
        }
      ]
    });

    return JSON.parse(response.content[0].text);
  }

  getAgentStatus() {
    // This would typically get real-time status from the agents
    return {
      dataLoader: { status: 'idle', lastActivity: new Date().toISOString() },
      dataStructuring: { status: 'idle', lastActivity: new Date().toISOString() },
      graphModeling: { status: 'idle', lastActivity: new Date().toISOString() }
    };
  }

  broadcastAgentUpdate(agentName, status, data) {
    this.io.emit('agent-update', {
      agent: agentName,
      status,
      data,
      timestamp: new Date().toISOString()
    });
  }

  start() {
    this.server.listen(this.port, () => {
      console.log(`Dashboard server running on port ${this.port}`);
      console.log(`Access the dashboard at: http://localhost:${this.port}`);
    });
  }

  stop() {
    this.server.close();
  }
}
