import React from 'react';
import { Brain, User, MessageCircle, Clock } from 'lucide-react';

const MemoryViewer = ({ memoryData, loading }) => {
  if (loading) {
    return (
      <div className="memory-viewer">
        <h3><Brain size={20} /> AgentCore Memory</h3>
        <div className="loading">Loading memory data...</div>
      </div>
    );
  }

  if (!memoryData) {
    return (
      <div className="memory-viewer">
        <h3><Brain size={20} /> AgentCore Memory</h3>
        <div className="no-data">No memory data available</div>
      </div>
    );
  }

  return (
    <div className="memory-viewer">
      <h3><Brain size={20} /> AgentCore Memory</h3>
      
      <div className="memory-stats">
        <div className="stat">
          <span className="label">Total Memories:</span>
          <span className="value">{memoryData.memory_count}</span>
        </div>
        <div className="stat">
          <span className="label">Last Updated:</span>
          <span className="value">{new Date(memoryData.last_updated).toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="profile-section">
        <h4><User size={16} /> Broker Profile</h4>
        <div className="profile-card">
          <div className="profile-item">
            <strong>Name:</strong> {memoryData.profile.name}
          </div>
          <div className="profile-item">
            <strong>Firm:</strong> {memoryData.profile.firm}
          </div>
          <div className="profile-item">
            <strong>Focus:</strong> {memoryData.profile.focus}
          </div>
        </div>
      </div>

      <div className="memory-timeline">
        <h4><Clock size={16} /> Memory Timeline</h4>
        <div className="timeline">
          {memoryData.memories.map((memory, index) => (
            <div key={index} className={`timeline-item ${memory.type}`}>
              <div className="timeline-marker">
                {memory.type === 'profile' ? <User size={12} /> : <MessageCircle size={12} />}
              </div>
              <div className="timeline-content">
                <div className="timeline-time">
                  {new Date(memory.timestamp).toLocaleTimeString()}
                </div>
                <div className="timeline-text">
                  {memory.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="memory-footer">
        <small>Memory ID: runtime_us_market_agent_8e082e5c_mem-B1ZetpF2X2</small>
      </div>
    </div>
  );
};

export default MemoryViewer;
