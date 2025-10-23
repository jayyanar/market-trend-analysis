import React from 'react';
import { User } from 'lucide-react';

const UserSelector = ({ users, selectedUser, onUserChange }) => {
  return (
    <div className="user-selector">
      <label>
        <User size={16} />
        Select Broker:
      </label>
      <select 
        value={selectedUser.id} 
        onChange={(e) => {
          const user = users.find(u => u.id === e.target.value);
          onUserChange(user);
        }}
      >
        {users.map(user => (
          <option key={user.id} value={user.id}>
            {user.name} ({user.firm})
          </option>
        ))}
      </select>
    </div>
  );
};

export default UserSelector;
