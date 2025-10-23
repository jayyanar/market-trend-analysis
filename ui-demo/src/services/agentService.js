import axios from 'axios';

const MEMORY_ID = 'runtime_us_market_agent_8e082e5c_mem-B1ZetpF2X2';
const RUNTIME_ID = 'runtime_us_market_agent_8e082e5c-HYMo6FF9Qn';

// AgentCore Runtime endpoint - will be set via environment variable
const AGENTCORE_ENDPOINT = process.env.REACT_APP_AGENTCORE_ENDPOINT || 'https://your-api-gateway-url';

class AgentService {
  constructor() {
    this.axiosInstance = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }

  async invokeAgent(prompt, actorId, sessionId) {
    try {
      console.log('Invoking agent:', { prompt, actorId, sessionId });
      
      const response = await this.axiosInstance.post(`${AGENTCORE_ENDPOINT}/invoke`, {
        prompt,
        actor_id: actorId,
        session_id: sessionId
      });
      
      console.log('Agent response:', response.data);
      
      // Handle different response formats
      if (response.data.response && Array.isArray(response.data.response)) {
        return response.data.response[0];
      } else if (response.data.response) {
        return response.data.response;
      } else {
        return response.data;
      }
    } catch (error) {
      console.error('Error invoking agent:', error);
      
      // Fallback to mock response for demo
      return this.getMockAgentResponse(prompt, actorId);
    }
  }

  async getMemory(actorId) {
    try {
      console.log('Fetching memory for actor:', actorId);
      
      // Direct call to AWS Bedrock Agent Runtime
      const AWS = window.AWS;
      if (AWS) {
        const bedrockClient = new AWS.BedrockAgentRuntime({
          region: 'us-east-1'
        });
        
        const params = {
          memoryId: MEMORY_ID,
          actorId: actorId,
          maxResults: 10
        };
        
        const result = await bedrockClient.retrieveMemory(params).promise();
        
        return {
          actor_id: actorId,
          memories: result.memories || [],
          memory_count: result.memories ? result.memories.length : 0,
          last_updated: new Date().toISOString()
        };
      }
      
      // Fallback to API Gateway if AWS SDK not available
      const response = await this.axiosInstance.get(`${AGENTCORE_ENDPOINT}/memory/${actorId}`);
      return response.data;
      
    } catch (error) {
      console.error('Error fetching memory:', error);
      
      // Return mock data for demo
      return this.getMockMemoryData(actorId);
    }
  }

  async getSessionHistory(sessionId) {
    try {
      console.log('Fetching session history:', sessionId);
      
      const response = await this.axiosInstance.get(`${AGENTCORE_ENDPOINT}/session/${sessionId}`);
      return response.data.messages || [];
      
    } catch (error) {
      console.error('Error fetching session history:', error);
      
      // Return mock data for demo
      return this.getMockSessionHistory(sessionId);
    }
  }

  // Mock responses for fallback/demo
  getMockAgentResponse(prompt, actorId) {
    const users = {
      'Sarah': { name: 'Sarah Chen', firm: 'Goldman Sachs', focus: 'tech stocks, AI, semiconductors' },
      'Mike': { name: 'Mike Johnson', firm: 'JP Morgan', focus: 'healthcare, biotech' },
      'Lisa': { name: 'Lisa Wang', firm: 'Morgan Stanley', focus: 'energy, renewables' }
    };
    
    const user = users[actorId] || users['Sarah'];
    
    if (prompt.toLowerCase().includes('nvda') || prompt.toLowerCase().includes('nvidia')) {
      return `Based on your focus on ${user.focus}, NVDA is currently trading at $875.32, up 2.1% today. Given your investment strategy at ${user.firm}, this aligns well with your portfolio objectives. The AI chip demand continues to drive growth.`;
    } else if (prompt.toLowerCase().includes('profile') || prompt.toLowerCase().includes('remember')) {
      return `I remember you're ${user.name} from ${user.firm}, focusing on ${user.focus}. Your profile is stored in my AgentCore Memory and I reference it for all our conversations.`;
    } else if (prompt.toLowerCase().includes('news')) {
      return `Here are the latest news updates relevant to your ${user.focus} focus: Recent developments show strong growth potential. This aligns with your investment strategy at ${user.firm}.`;
    } else {
      return `Thank you for your message, ${user.name}. As a ${user.firm} broker focused on ${user.focus}, I'll provide analysis tailored to your investment approach. How can I assist you with market intelligence today?`;
    }
  }

  getMockMemoryData(actorId) {
    const users = {
      'Sarah': { name: 'Sarah Chen', firm: 'Goldman Sachs', focus: 'Tech stocks, AI, semiconductors' },
      'Mike': { name: 'Mike Johnson', firm: 'JP Morgan', focus: 'Healthcare, biotech investments' },
      'Lisa': { name: 'Lisa Wang', firm: 'Morgan Stanley', focus: 'Energy, renewable investments' }
    };

    const user = users[actorId] || users['Sarah'];
    
    return {
      actor_id: actorId,
      profile: user,
      memories: [
        {
          timestamp: new Date().toISOString(),
          type: 'profile',
          content: `Broker Profile: ${user.name} from ${user.firm}, focuses on ${user.focus}`
        },
        {
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          type: 'conversation',
          content: 'Previous conversation about market trends and investment strategies'
        }
      ],
      memory_count: 2,
      last_updated: new Date().toISOString()
    };
  }

  getMockSessionHistory(sessionId) {
    return [
      {
        role: 'user',
        content: 'Hi, I\'m Sarah Chen from Goldman Sachs. I focus on tech stocks, especially AI and semiconductors.',
        timestamp: new Date(Date.now() - 7200000).toISOString()
      },
      {
        role: 'assistant',
        content: 'Welcome Sarah! I\'ve saved your profile to AgentCore Memory. Given your focus on tech stocks, AI, and semiconductors, I can provide tailored market analysis. What specific information would be most valuable to you today?',
        timestamp: new Date(Date.now() - 7100000).toISOString()
      }
    ];
  }
}

export default new AgentService();
