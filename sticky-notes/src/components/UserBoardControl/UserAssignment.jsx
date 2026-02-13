import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import NoteDefault from '../backgroundstyles/notestyles/NoteDefault';
import { getApiUrl } from '../../utils/api';

const UserAssignment = ({ boardId, currentUser, onAssignmentChanged }) => {
  const [availableUsers, setAvailableUsers] = useState([]);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [userRole, setUserRole] = useState('viewer');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchAssignedUsers();
  }, [boardId]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(getApiUrl('users'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const users = await response.json();
      // Filter out current user and already assigned users
      const filteredUsers = users.filter(user => 
        user.username !== currentUser?.username &&
        !assignedUsers.some(assigned => assigned.username === user.username)
      );
      setAvailableUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
    }
  };

  const fetchAssignedUsers = async () => {
    try {
      const response = await fetch(getApiUrl(`boards/${boardId}/users`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch assigned users: ${response.status}`);
      }

      const users = await response.json();
      setAssignedUsers(users);
    } catch (error) {
      console.error('Error fetching assigned users:', error);
      setError('Failed to load assigned users');
    }
  };

  const handleAssignUser = async (e) => {
    e.preventDefault();
    
    if (!selectedUser) {
      setError('Please select a user');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(getApiUrl(`boards/${boardId}/assign`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          username: selectedUser,
          role: userRole
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to assign user: ${response.status}`);
      }

      const result = await response.json();
      
      // Update local state
      const assignedUser = availableUsers.find(user => user.username === selectedUser);
      if (assignedUser) {
        setAssignedUsers(prev => [...prev, { ...assignedUser, role: userRole }]);
        setAvailableUsers(prev => prev.filter(user => user.username !== selectedUser));
      }
      
      // Reset form
      setSelectedUser('');
      setUserRole('viewer');
      
      // Notify parent component
      if (onAssignmentChanged) {
        onAssignmentChanged(result);
      }
    } catch (error) {
      console.error('Error assigning user:', error);
      setError(error.message || 'Failed to assign user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveUser = async (username) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(getApiUrl(`boards/${boardId}/unassign`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ username })
      });

      if (!response.ok) {
        throw new Error(`Failed to remove user: ${response.status}`);
      }

      // Update local state
      const removedUser = assignedUsers.find(user => user.username === username);
      if (removedUser) {
        setAvailableUsers(prev => [...prev, removedUser]);
        setAssignedUsers(prev => prev.filter(user => user.username !== username));
      }
      
      // Notify parent component
      if (onAssignmentChanged) {
        onAssignmentChanged({ username, removed: true });
      }
    } catch (error) {
      console.error('Error removing user:', error);
      setError(error.message || 'Failed to remove user');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = availableUsers.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    marginBottom: '12px',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '6px',
    outline: 'none',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#e0e0e0',
    fontSize: '13px',
    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
    fontFamily: '"Times New Roman", Times, serif'
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer'
  };

  const buttonStyle = {
    padding: '8px 16px',
    backgroundColor: isLoading ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '6px',
    color: isLoading ? '#666' : '#e0e0e0',
    fontSize: '13px',
    fontWeight: '500',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    fontFamily: '"Times New Roman", Times, serif',
    opacity: isLoading ? 0.7 : 1
  };

  const removeButtonStyle = {
    ...buttonStyle,
    backgroundColor: 'rgba(211, 47, 47, 0.1)',
    borderColor: 'rgba(211, 47, 47, 0.3)',
    color: '#d32f2f',
    padding: '4px 8px',
    fontSize: '11px'
  };

  const userItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    marginBottom: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '6px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  };

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 1000,
      minWidth: '400px',
      maxWidth: '500px',
      maxHeight: '80vh',
      overflowY: 'auto'
    }}>
      <NoteDefault
        note={{
          text: '',
          width: '100%',
          height: 'auto',
          done: false
        }}
        onDone={() => {}}
        onDelete={() => {}}
        onCommentsOpen={() => {}}
        onCommentsClose={() => {}}
      >
        <div style={{
          padding: '20px',
          minHeight: '400px'
        }}>
          <h3 style={{
            color: '#333',
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '20px',
            fontFamily: '"Times New Roman", Times, serif',
            textAlign: 'center'
          }}>
            Manage Board Users
          </h3>

          {error && (
            <div style={{
              color: '#d32f2f',
              fontSize: '12px',
              marginBottom: '16px',
              padding: '8px 12px',
              backgroundColor: 'rgba(211, 47, 47, 0.1)',
              borderRadius: '4px',
              fontFamily: '"Times New Roman", Times, serif'
            }}>
              {error}
            </div>
          )}

          {/* Assign User Form */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{
              color: '#333',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '12px',
              fontFamily: '"Times New Roman", Times, serif'
            }}>
              Assign New User
            </h4>
            
            <form onSubmit={handleAssignUser}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users..."
                style={inputStyle}
                disabled={isLoading}
              />

              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                style={selectStyle}
                disabled={isLoading}
                required
              >
                <option value="">Select a user...</option>
                {filteredUsers.map(user => (
                  <option key={user.username} value={user.username}>
                    {user.username}
                  </option>
                ))}
              </select>

              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                style={selectStyle}
                disabled={isLoading}
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>

              <button
                type="submit"
                style={buttonStyle}
                disabled={isLoading || !selectedUser}
              >
                {isLoading ? 'Assigning...' : 'Assign User'}
              </button>
            </form>
          </div>

          {/* Assigned Users List */}
          <div>
            <h4 style={{
              color: '#333',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '12px',
              fontFamily: '"Times New Roman", Times, serif'
            }}>
              Assigned Users ({assignedUsers.length})
            </h4>
            
            {assignedUsers.length === 0 ? (
              <div style={{
                color: '#666',
                fontSize: '13px',
                textAlign: 'center',
                padding: '20px',
                fontFamily: '"Times New Roman", Times, serif'
              }}>
                No users assigned yet
              </div>
            ) : (
              assignedUsers.map(user => (
                <div key={user.username} style={userItemStyle}>
                  <div>
                    <div style={{
                      color: '#333',
                      fontSize: '13px',
                      fontWeight: '500',
                      fontFamily: '"Times New Roman", Times, serif'
                    }}>
                      {user.username}
                    </div>
                    <div style={{
                      color: '#666',
                      fontSize: '11px',
                      fontFamily: '"Times New Roman", Times, serif'
                    }}>
                      {user.role}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveUser(user.username)}
                    style={removeButtonStyle}
                    disabled={isLoading}
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </NoteDefault>
    </div>
  );
};

UserAssignment.propTypes = {
  boardId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  currentUser: PropTypes.shape({
    username: PropTypes.string
  }),
  onAssignmentChanged: PropTypes.func
};

export default UserAssignment;
