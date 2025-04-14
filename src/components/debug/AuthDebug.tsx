import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const AuthDebug: React.FC = () => {
  const { user, token, isAuthenticated, isLoading } = useAuth();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 9999,
        maxWidth: '300px',
        maxHeight: '200px',
        overflow: 'auto'
      }}
    >
      <h4 style={{ margin: '0 0 5px 0' }}>Auth Debug</h4>
      <div>
        <strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}
      </div>
      <div>
        <strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}
      </div>
      <div>
        <strong>Token:</strong> {token ? token.substring(0, 10) + '...' : 'None'}
      </div>
      <div>
        <strong>User:</strong> {user ? `${user.name} (${user.role})` : 'None'}
      </div>
      <div style={{ marginTop: '5px' }}>
        <button 
          onClick={() => console.log({ user, token, isAuthenticated, isLoading })}
          style={{
            backgroundColor: '#4CAF50',
            border: 'none',
            color: 'white',
            padding: '2px 5px',
            textAlign: 'center',
            textDecoration: 'none',
            display: 'inline-block',
            fontSize: '10px',
            margin: '2px',
            cursor: 'pointer',
            borderRadius: '3px'
          }}
        >
          Log Details
        </button>
        <button 
          onClick={() => localStorage.clear()}
          style={{
            backgroundColor: '#f44336',
            border: 'none',
            color: 'white',
            padding: '2px 5px',
            textAlign: 'center',
            textDecoration: 'none',
            display: 'inline-block',
            fontSize: '10px',
            margin: '2px',
            cursor: 'pointer',
            borderRadius: '3px'
          }}
        >
          Clear Storage
        </button>
      </div>
    </div>
  );
};
