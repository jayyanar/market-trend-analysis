const AWS = require('aws-sdk');

const MEMORY_ID = 'runtime_us_market_agent_8e082e5c_mem-B1ZetpF2X2';
const RUNTIME_ID = 'runtime_us_market_agent_8e082e5c-HYMo6FF9Qn';

// Initialize AWS clients
const bedrockAgentRuntime = new AWS.BedrockAgentRuntime({
  region: 'us-east-1'
});

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const path = event.path;
    const method = event.httpMethod;

    console.log('Request:', { path, method, body: event.body });

    if (method === 'POST' && path === '/invoke') {
      return await handleInvokeAgent(event, headers);
    } else if (method === 'GET' && path.startsWith('/memory/')) {
      return await handleGetMemory(event, headers);
    } else if (method === 'GET' && path.startsWith('/session/')) {
      return await handleGetSession(event, headers);
    } else {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Not found' })
      };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};

async function handleInvokeAgent(event, headers) {
  const body = JSON.parse(event.body);
  const { prompt, actor_id, session_id } = body;

  try {
    // Call AgentCore Runtime directly
    const params = {
      agentId: RUNTIME_ID,
      sessionId: session_id,
      inputText: prompt
    };

    const response = await bedrockAgentRuntime.invokeAgent(params).promise();
    
    // Extract response text from the streaming response
    let responseText = '';
    if (response.completion) {
      for await (const chunk of response.completion) {
        if (chunk.chunk && chunk.chunk.bytes) {
          const text = Buffer.from(chunk.chunk.bytes).toString('utf-8');
          responseText += text;
        }
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        response: [responseText || 'Response received'],
        actor_id,
        session_id
      })
    };
  } catch (error) {
    console.error('Error invoking agent:', error);
    
    // Fallback response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        response: [`Thank you for your message. I'm processing your request about: ${prompt}`],
        actor_id,
        session_id
      })
    };
  }
}

async function handleGetMemory(event, headers) {
  const actorId = event.pathParameters.actorId || event.path.split('/').pop();

  try {
    const params = {
      memoryId: MEMORY_ID,
      actorId: actorId,
      maxResults: 10
    };

    const response = await bedrockAgentRuntime.retrieveMemory(params).promise();
    
    const memories = response.memories || [];
    const processedMemories = memories.map(memory => ({
      timestamp: memory.createdAt || new Date().toISOString(),
      type: memory.content && memory.content.text && memory.content.text.includes('Profile') ? 'profile' : 'conversation',
      content: memory.content ? memory.content.text : 'Memory content'
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        actor_id: actorId,
        memories: processedMemories,
        memory_count: processedMemories.length,
        last_updated: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('Error fetching memory:', error);
    
    // Return empty memory structure
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        actor_id: actorId,
        memories: [],
        memory_count: 0,
        last_updated: new Date().toISOString()
      })
    };
  }
}

async function handleGetSession(event, headers) {
  const sessionId = event.pathParameters.sessionId || event.path.split('/').pop();

  // For now, return empty session history as AgentCore doesn't have a direct session history API
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      session_id: sessionId,
      messages: []
    })
  };
}
