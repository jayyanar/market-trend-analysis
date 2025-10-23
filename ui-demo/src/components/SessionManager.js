import React from 'react';
import { Clock } from 'lucide-react';

const SessionManager = ({ sessions, selectedSession, onSessionChange }) => {
  return (
    <div className="session-manager">
      <label>
        <Clock size={16} />
        Session:
      </label>
      <select 
        value={selectedSession} 
        onChange={(e) => onSessionChange(e.target.value)}
      >
        {sessions.map(session => (
          <option key={session} value={session}>
            {session}
          </option>
        ))}
      </select>
      <button className="new-session-btn">
        New Session
      </button>
    </div>
  );
};

export default SessionManager;
