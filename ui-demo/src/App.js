import React, { useState, useEffect } from 'react';
import UserSelector from './components/UserSelector';
import SessionManager from './components/SessionManager';
import MemoryViewer from './components/MemoryViewer';
import ChatInterface from './components/ChatInterface';
import './App.css';

const MEMORY_ID = 'runtime_us_market_agent_8e082e5c_mem-B1ZetpF2X2';
const RUNTIME_ID = 'runtime_us_market_agent_8e082e5c-HYMo6FF9Qn';

const demoUsers = [
  {
    id: 'Sarah',
    name: 'Sarah Chen',
    firm: 'Goldman Sachs',
    focus: 'Tech stocks, AI, semiconductors',
    sessions: ['session-sarah-1', 'session-sarah-2', 'session-sarah-3']
  },
  {
    id: 'Mike',
    name: 'Mike Johnson',
    firm: 'JP Morgan',
    focus: 'Healthcare, biotech investments',
    sessions: ['session-mike-1', 'session-mike-2']
  },
  {
    id: 'Lisa',
    name: 'Lisa Wang',
    firm: 'Morgan Stanley',
    focus: 'Energy, renewable investments',
    sessions: ['session-lisa-1']
  }
];

function App() {
  const [selectedUser, setSelectedUser] = useState(demoUsers[0]);
  const [selectedSession, setSelectedSession] = useState(demoUsers[0].sessions[0]);
  const [memoryData, setMemoryData] = useState(null);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedUser) {
      fetchMemoryData(selectedUser.id);
      fetchSessionHistory(selectedSession);
    }
  }, [selectedUser, selectedSession]);

  const fetchMemoryData = async (actorId) => {
    setLoading(true);
    try {
      // Simulate API call - replace with actual API
      const mockMemory = {
        actor_id: actorId,
        profile: selectedUser,
        memories: [
          {
            timestamp: new Date().toISOString(),
            type: 'profile',
            content: `Broker Profile: ${selectedUser.name} from ${selectedUser.firm}, focuses on ${selectedUser.focus}`
          },
          {
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            type: 'conversation',
            content: 'Previous conversation about market trends'
          }
        ],
        memory_count: 2,
        last_updated: new Date().toISOString()
      };
      setMemoryData(mockMemory);
    } catch (error) {
      console.error('Error fetching memory:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionHistory = async (sessionId) => {
    try {
      // Simulate session history - replace with actual API
      const mockHistory = [
        {
          role: 'user',
          content: `Hi, I'm ${selectedUser.name} from ${selectedUser.firm}. I focus on ${selectedUser.focus}.`,
          timestamp: new Date(Date.now() - 7200000).toISOString()
        },
        {
          role: 'assistant',
          content: `Welcome ${selectedUser.name}! I've saved your profile. Given your focus on ${selectedUser.focus}, I can provide tailored market analysis. What specific information would be most valuable to you today?`,
          timestamp: new Date(Date.now() - 7100000).toISOString()
        }
      ];
      setSessionHistory(mockHistory);
    } catch (error) {
      console.error('Error fetching session history:', error);
    }
  };

  const handleUserChange = (user) => {
    setSelectedUser(user);
    setSelectedSession(user.sessions[0]);
  };

  const handleSessionChange = (sessionId) => {
    setSelectedSession(sessionId);
  };

  const handleNewMessage = (message, response) => {
    const newMessages = [
      ...sessionHistory,
      {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      },
      {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      }
    ];
    setSessionHistory(newMessages);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Market Trends Agent - AgentCore Memory Demo</h1>
        <div className="runtime-info">
          <span>Memory: {MEMORY_ID}</span>
          <span>Runtime: {RUNTIME_ID}</span>
        </div>
      </header>

      <div className="controls">
        <UserSelector 
          users={demoUsers}
          selectedUser={selectedUser}
          onUserChange={handleUserChange}
        />
        <SessionManager
          sessions={selectedUser.sessions}
          selectedSession={selectedSession}
          onSessionChange={handleSessionChange}
        />
      </div>

      <div className="main-content">
        <div className="left-panel">
          <MemoryViewer 
            memoryData={memoryData}
            loading={loading}
          />
        </div>
        
        <div className="right-panel">
          <ChatInterface
            selectedUser={selectedUser}
            selectedSession={selectedSession}
            sessionHistory={sessionHistory}
            onNewMessage={handleNewMessage}
            memoryId={MEMORY_ID}
            runtimeId={RUNTIME_ID}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
