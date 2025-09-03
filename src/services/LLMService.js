import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export class LLMService {
  constructor(config = {}) {
    this.config = {
      openaiApiKey: config.openaiApiKey || process.env.OPENAI_API_KEY,
      anthropicApiKey: config.anthropicApiKey || process.env.ANTHROPIC_API_KEY,
      ollamaUrl: config.ollamaUrl || process.env.OLLAMA_URL || 'http://localhost:11434',
      ollamaModel: config.ollamaModel || process.env.OLLAMA_MODEL || 'llama2',
      defaultProvider: config.defaultProvider || 'ollama', // 'openai', 'anthropic', 'ollama'
      maxTokens: config.maxTokens || 2000,
      temperature: config.temperature || 0.7
    };
    
    this.initializeClients();
  }

  initializeClients() {
    // Initialize OpenAI client
    if (this.config.openaiApiKey) {
      this.openai = new OpenAI({
        apiKey: this.config.openaiApiKey
      });
    }

    // Initialize Anthropic client
    if (this.config.anthropicApiKey) {
      this.anthropic = new Anthropic({
        apiKey: this.config.anthropicApiKey
      });
    }
  }

  async generateResponse(prompt, options = {}) {
    const provider = options.provider || this.config.defaultProvider;
    
    try {
      switch (provider) {
        case 'openai':
          return await this.generateWithOpenAI(prompt, options);
        case 'anthropic':
          return await this.generateWithAnthropic(prompt, options);
        case 'ollama':
          return await this.generateWithOllama(prompt, options);
        default:
          throw new Error(`Unsupported LLM provider: ${provider}`);
      }
    } catch (error) {
      console.error(`Error generating response with ${provider}:`, error);
      throw error;
    }
  }

  async generateWithOpenAI(prompt, options = {}) {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized. Please provide OpenAI API key.');
    }

    const response = await this.openai.chat.completions.create({
      model: options.model || 'gpt-4',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: options.maxTokens || this.config.maxTokens,
      temperature: options.temperature || this.config.temperature
    });

    return {
      content: response.choices[0].message.content,
      provider: 'openai',
      model: options.model || 'gpt-4',
      usage: response.usage
    };
  }

  async generateWithAnthropic(prompt, options = {}) {
    if (!this.anthropic) {
      throw new Error('Anthropic client not initialized. Please provide Anthropic API key.');
    }

    const response = await this.anthropic.messages.create({
      model: options.model || 'claude-3-sonnet-20240229',
      max_tokens: options.maxTokens || this.config.maxTokens,
      temperature: options.temperature || this.config.temperature,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    return {
      content: response.content[0].text,
      provider: 'anthropic',
      model: options.model || 'claude-3-sonnet-20240229',
      usage: response.usage
    };
  }

  async generateWithOllama(prompt, options = {}) {
    const model = options.model || this.config.ollamaModel;
    const url = `${this.config.ollamaUrl}/api/generate`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: options.temperature || this.config.temperature,
          num_predict: options.maxTokens || this.config.maxTokens
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return {
      content: data.response,
      provider: 'ollama',
      model: model,
      usage: {
        prompt_tokens: data.prompt_eval_count || 0,
        completion_tokens: data.eval_count || 0,
        total_tokens: (data.prompt_eval_count || 0) + (data.eval_count || 0)
      }
    };
  }

  async analyzeDataWithLLM(data, analysisType, options = {}) {
    const prompt = this.buildAnalysisPrompt(data, analysisType);
    return await this.generateResponse(prompt, options);
  }

  buildAnalysisPrompt(data, analysisType) {
    const dataSummary = this.summarizeData(data);
    
    switch (analysisType) {
      case 'data_quality':
        return `Analyze the following data for quality issues and provide recommendations:

${dataSummary}

Please identify:
1. Data completeness issues
2. Data consistency problems
3. Potential outliers or anomalies
4. Recommendations for data cleaning

Provide your analysis in a structured format.`;

      case 'schema_generation':
        return `Based on the following data, generate a comprehensive schema definition:

${dataSummary}

Please provide:
1. Entity definitions with properties and types
2. Relationship definitions
3. Constraints and validation rules
4. Indexing recommendations

Format the response as a structured schema.`;

      case 'relationship_detection':
        return `Analyze the following data to detect relationships between entities:

${dataSummary}

Please identify:
1. Foreign key relationships
2. Hierarchical relationships
3. Temporal relationships
4. Semantic relationships
5. Confidence scores for each relationship

Provide detailed relationship analysis.`;

      case 'graph_insights':
        return `Analyze the following graph data and provide insights:

${dataSummary}

Please provide:
1. Graph structure analysis
2. Key patterns and clusters
3. Centrality analysis
4. Anomaly detection
5. Business insights and recommendations

Format as structured insights.`;

      default:
        return `Analyze the following data and provide comprehensive insights:

${dataSummary}

Please provide a detailed analysis covering data quality, patterns, relationships, and actionable recommendations.`;
    }
  }

  summarizeData(data) {
    if (!data || data.length === 0) {
      return 'No data provided for analysis.';
    }

    const sample = data.slice(0, 5);
    const columns = Object.keys(sample[0] || {});
    
    return `
Data Summary:
- Total Records: ${data.length}
- Columns: ${columns.join(', ')}
- Sample Data:
${JSON.stringify(sample, null, 2)}

Column Types and Statistics:
${columns.map(col => {
  const values = data.map(row => row[col]).filter(v => v !== null && v !== undefined);
  const uniqueValues = new Set(values).size;
  const nullCount = data.length - values.length;
  
  return `- ${col}: ${uniqueValues} unique values, ${nullCount} nulls`;
}).join('\n')}
`;
  }

  async testConnection(provider) {
    try {
      const testPrompt = "Hello, this is a connection test. Please respond with 'Connection successful'.";
      const response = await this.generateResponse(testPrompt, { provider });
      return {
        success: true,
        provider,
        response: response.content
      };
    } catch (error) {
      return {
        success: false,
        provider,
        error: error.message
      };
    }
  }

  async getAvailableModels(provider) {
    switch (provider) {
      case 'openai':
        return [
          'gpt-4',
          'gpt-4-turbo',
          'gpt-3.5-turbo',
          'gpt-3.5-turbo-16k'
        ];
      case 'anthropic':
        return [
          'claude-3-opus-20240229',
          'claude-3-sonnet-20240229',
          'claude-3-haiku-20240307'
        ];
      case 'ollama':
        try {
          const response = await fetch(`${this.config.ollamaUrl}/api/tags`);
          if (response.ok) {
            const data = await response.json();
            return data.models?.map(model => model.name) || [];
          }
        } catch (error) {
          console.error('Error fetching Ollama models:', error);
        }
        return ['llama2', 'codellama', 'mistral', 'neural-chat'];
      default:
        return [];
    }
  }
}

export default LLMService;
