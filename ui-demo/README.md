# AgentCore Memory Demo UI

Interactive UI demonstration of AgentCore Memory with the Market Trends Agent.

## Features

- **User Selection**: Switch between different brokers (Sarah Chen, Mike Johnson, Lisa Wang)
- **Session Management**: Multiple sessions per user with history
- **Memory Visualization**: Real-time display of stored profiles and conversation history
- **Interactive Chat**: Chat with the deployed Market Trends Agent
- **Memory Timeline**: Visual timeline of memory events

## Quick Start

### 1. Install Dependencies
```bash
cd ui-demo
npm install
```

### 2. Start Development Server
```bash
npm start
```

The app will open at `http://localhost:3000`

## Configuration

### Environment Variables
Create a `.env` file in the ui-demo directory:

```env
REACT_APP_AGENTCORE_ENDPOINT=https://your-agentcore-runtime-endpoint
```

### AgentCore Integration
The UI is configured to work with:
- **Memory ID**: `runtime_us_market_agent_8e082e5c_mem-B1ZetpF2X2`
- **Runtime ID**: `runtime_us_market_agent_8e082e5c-HYMo6FF9Qn`

## Demo Users

### Sarah Chen (Goldman Sachs)
- **Focus**: Tech stocks, AI, semiconductors
- **Sessions**: session-sarah-1, session-sarah-2, session-sarah-3

### Mike Johnson (JP Morgan)
- **Focus**: Healthcare, biotech investments
- **Sessions**: session-mike-1, session-mike-2

### Lisa Wang (Morgan Stanley)
- **Focus**: Energy, renewable investments
- **Sessions**: session-lisa-1

## Testing Scenarios

### 1. Memory Persistence
1. Select "Sarah Chen"
2. Ask: "What's my profile?"
3. Switch to "Mike Johnson"
4. Switch back to "Sarah Chen"
5. Verify profile is remembered

### 2. Session History
1. Select a user with multiple sessions
2. Switch between sessions
3. Observe different conversation histories

### 3. Real-time Chat
1. Ask about stock prices: "What's NVDA doing?"
2. Ask about news: "Any AI chip news?"
3. Test memory: "What do you remember about me?"

## API Integration

### Mock Mode (Default)
The UI runs in mock mode by default for local testing without backend dependencies.

### Live Mode
To connect to your deployed AgentCore Runtime:

1. Set `REACT_APP_AGENTCORE_ENDPOINT` in `.env`
2. Update `agentService.js` to use real API calls
3. Ensure CORS is configured on your AgentCore Runtime

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to AWS S3 + Amplify
```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
```

## Components

- **App.js**: Main application component
- **UserSelector**: Dropdown for broker selection
- **SessionManager**: Session selection and management
- **MemoryViewer**: Display memory data and timeline
- **ChatInterface**: Interactive chat with the agent
- **agentService.js**: API integration service

## Styling

The UI uses a modern, professional design with:
- Responsive layout
- Clean typography
- Intuitive color coding
- Smooth animations
- Mobile-friendly design

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your AgentCore Runtime has CORS configured
2. **Memory Not Loading**: Check Memory ID and permissions
3. **Chat Not Working**: Verify Runtime ID and endpoint URL

### Debug Mode
Open browser developer tools to see API calls and responses in the console.
