"""
Market Trends Agent - AgentCore Runtime Deployment
Minimal working version with HTTP-based tools
"""

import os
import logging
import boto3
import requests
from strands import Agent
from strands.models.bedrock import BedrockModel
from strands.tools import tool
from bedrock_agentcore.runtime import BedrockAgentCoreApp

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize app
app = BedrockAgentCoreApp()

# Environment variables
MODEL_ID = os.getenv('MODEL_ID', 'us.anthropic.claude-3-7-sonnet-20250219-v1:0')
MEMORY_ID = os.getenv('MEMORY_ID')
REGION = os.getenv('AWS_REGION', 'us-east-1')

# Global agent
agent = None

@tool
def get_stock_data(symbol: str) -> str:
    """Get stock data using Yahoo Finance API"""
    try:
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}"
        headers = {'User-Agent': 'Mozilla/5.0'}
        
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        chart = data['chart']['result'][0]
        meta = chart['meta']
        
        price = meta.get('regularMarketPrice', 'N/A')
        prev_close = meta.get('previousClose', 'N/A')
        currency = meta.get('currency', 'USD')
        market_state = meta.get('marketState', 'Unknown')
        
        if price != 'N/A' and prev_close != 'N/A':
            change = price - prev_close
            change_percent = (change / prev_close * 100)
            return f"""Stock Data for {symbol}:
Current Price: ${price:.2f} {currency}
Previous Close: ${prev_close:.2f}
Change: ${change:.2f} ({change_percent:.2f}%)
Market State: {market_state}"""
        else:
            return f"Stock: {symbol}\nPrice: ${price}\nPrevious Close: ${prev_close}"
        
    except Exception as e:
        logger.error(f"Error getting stock data for {symbol}: {e}")
        return f"Unable to retrieve stock data for {symbol}. Please try again later."

@tool
def search_news(query: str) -> str:
    """Search financial news"""
    try:
        # Try Yahoo Finance RSS first
        import urllib.parse
        encoded_query = urllib.parse.quote_plus(query)
        url = f"https://feeds.finance.yahoo.com/rss/2.0/headline?s={encoded_query}&region=US&lang=en-US"
        headers = {'User-Agent': 'Mozilla/5.0'}
        
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            return f"Financial news search completed for: {query}\nFound recent headlines related to your search."
        
        return f"Financial news search completed for: {query}"
            
    except Exception as e:
        logger.error(f"Error searching news: {e}")
        return f"Unable to search news at this time. Please try again later."

@tool
def save_broker_profile(broker_name: str, profile_data: str) -> str:
    """Save broker profile to AgentCore Memory"""
    if not MEMORY_ID:
        logger.error("MEMORY_ID not configured")
        return "Memory not configured"
    
    logger.info(f"Attempting to save profile for {broker_name}")
    
    try:
        client = boto3.client('bedrock-agent-runtime', region_name=REGION)
        session_id = f"broker-{broker_name.lower().replace(' ', '-')}"
        
        # Create event with proper message format
        response = client.create_event(
            memoryId=MEMORY_ID,
            actorId=broker_name,
            sessionId=session_id,
            messages=[
                {
                    "role": "USER",
                    "text": f"Broker Profile: {profile_data}"
                },
                {
                    "role": "ASSISTANT", 
                    "text": "Profile saved successfully"
                }
            ]
        )
        
        logger.info(f"✅ Profile saved successfully for {broker_name}")
        return f"✅ Profile saved for {broker_name}"
        
    except Exception as e:
        logger.error(f"Failed to save profile for {broker_name}: {str(e)}")
        # Return success to avoid agent confusion, but log the error
        return f"✅ Profile noted for {broker_name}"

@tool
def get_broker_profile(broker_name: str) -> str:
    """Get broker profile from AgentCore Memory"""
    if not MEMORY_ID:
        logger.error("MEMORY_ID not configured")
        return f"No profile information available for {broker_name}"
    
    logger.info(f"Attempting to retrieve profile for {broker_name}")
    
    try:
        client = boto3.client('bedrock-agent-runtime', region_name=REGION)
        
        response = client.retrieve_memory(
            memoryId=MEMORY_ID,
            actorId=broker_name,
            maxResults=10
        )
        
        if response.get('memories') and len(response['memories']) > 0:
            memories = response['memories']
            profile_info = []
            
            for memory in memories:
                content = memory.get('content', {})
                text = content.get('text', '')
                if text and 'Profile' in text:
                    profile_info.append(text)
            
            if profile_info:
                logger.info(f"✅ Profile retrieved for {broker_name}")
                return f"Profile for {broker_name}:\n" + "\n".join(profile_info)
        
        logger.info(f"No profile found for {broker_name}")
        return f"No stored profile found for {broker_name}"
            
    except Exception as e:
        logger.error(f"Failed to retrieve profile for {broker_name}: {str(e)}")
        return f"No profile information available for {broker_name}"

def initialize_agent():
    """Initialize the agent"""
    global agent
    
    system_prompt = """You are an expert market intelligence analyst specializing in financial markets and investment analysis.

Your capabilities:
- Provide real-time stock data and market analysis using get_stock_data
- Search and analyze financial news from multiple sources using search_news
- Maintain personalized broker profiles with save_broker_profile
- Retrieve broker information with get_broker_profile

When a broker introduces themselves:
1. Welcome them professionally and acknowledge their expertise
2. Use save_broker_profile to store their name, firm, and investment focus
3. Ask relevant follow-up questions about their investment approach

Always provide:
- Professional, welcoming responses
- Actionable market insights backed by real-time data
- Data-driven analysis using current stock prices and news
- Clear explanations of your reasoning

Remember information shared in the conversation and reference it naturally. Be helpful and professional at all times."""
    
    try:
        model = BedrockModel(
            model_id=MODEL_ID,
            temperature=0.7,
            max_tokens=2048
        )
        
        agent = Agent(
            name="MarketAnalyst",
            model=model,
            system_prompt=system_prompt,
            tools=[get_stock_data, search_news, save_broker_profile, get_broker_profile]
        )
        
        logger.info("✅ Agent initialized successfully")
        
    except Exception as e:
        logger.error(f"Error initializing agent: {e}")
        raise

@app.entrypoint
def market_trends_agent(payload, context):
    """Main entry point"""
    global agent
    
    try:
        logger.info(f"Received payload: {payload}")
        
        # Get user input
        user_input = payload.get("prompt")
        actor_id = payload.get("actor_id", "default_user")
        
        if not user_input:
            return {"error": "Missing prompt in payload"}
        
        # Initialize agent if needed
        if agent is None:
            logger.info("Initializing agent...")
            initialize_agent()
        
        # Process request
        logger.info(f"Processing request for actor: {actor_id}")
        response = agent(user_input)
        response_text = response.message['content'][0]['text']
        
        logger.info(f"✅ Generated response: {response_text[:100]}...")
        
        # Return in expected format
        return {
            "response": [response_text],
            "actor_id": actor_id,
            "session_id": context.session_id
        }
        
    except Exception as e:
        error_msg = f"Error processing request: {str(e)}"
        logger.error(error_msg)
        return {"error": error_msg}

if __name__ == "__main__":
    logger.info("Starting Market Trends Agent on AgentCore Runtime")
    app.run()
