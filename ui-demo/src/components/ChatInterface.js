import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Bot, User } from 'lucide-react';
import agentService from '../services/agentService';

const ChatInterface = ({ selectedUser, selectedSession, sessionHistory, onNewMessage, memoryId, runtimeId }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [sessionHistory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    setLoading(true);
    const userMessage = message;
    setMessage('');

    try {
      console.log('Sending message to AgentCore:', {
        message: userMessage,
        user: selectedUser.id,
        session: selectedSession
      });

      // Call real AgentCore Runtime
      const response = await agentService.invokeAgent(
        userMessage, 
        selectedUser.id, 
        selectedSession
      );
      
      console.log('Received response from AgentCore:', response);
      
      onNewMessage(userMessage, response);
    } catch (error) {
      console.error('Error sending message:', error);
      onNewMessage(userMessage, 'Sorry, there was an error processing your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSamplePrompts = () => {
    const prompts = [
      `Hi, I'm ${selectedUser.name} from ${selectedUser.firm}. I focus on ${selectedUser.focus}.`,
      "What's the current price for NVDA?",
      "Search for latest AI semiconductor news",
      "What do you remember about my investment preferences?",
      "Give me 3 stock recommendations based on my profile"
    ];
    return prompts;
  };

  const handleSamplePrompt = (prompt) => {
    setMessage(prompt);
  };

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <MessageSquare size={20} />
        <h3>Chat with Market Trends Agent</h3>
        <div className="session-info">
          Session: {selectedSession}
        </div>
      </div>

      <div className="chat-messages">
        {sessionHistory.length === 0 ? (
          <div className="welcome-section">
            <div className="welcome-message">
              <Bot size={24} />
              <p>Welcome! Start a conversation to see AgentCore Memory in action.</p>
            </div>
            
            <div className="sample-prompts">
              <h4>Try these sample prompts:</h4>
              {getSamplePrompts().map((prompt, index) => (
                <button
                  key={index}
                  className="sample-prompt"
                  onClick={() => handleSamplePrompt(prompt)}
                  disabled={loading}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          sessionHistory.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              <div className="message-icon">
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className="message-content">
                <div className="message-text">{msg.content}</div>
                <div className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="message assistant">
            <div className="message-icon">
              <Bot size={16} />
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div className="loading-text">Connecting to AgentCore Runtime...</div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input" onSubmit={handleSubmit}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`Ask about ${selectedUser.focus} or test memory with "What's my profile?"...`}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !message.trim()}>
          <Send size={16} />
        </button>
      </form>

      <div className="runtime-info">
        <small>
          Runtime: {runtimeId} | Memory: {memoryId}
        </small>
      </div>
    </div>
  );
};

export default ChatInterface;
