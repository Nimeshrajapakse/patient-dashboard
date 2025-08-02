// Header.js
import React from 'react';
import './Header.css';
import { useNavigate } from 'react-router-dom';

const Header = ({ user, signOut }) => {
  const navigate = useNavigate();

  return (
    <header className="dashboard-header">
      <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
  <span role="img" aria-label="logo">🏥</span> MediSys Dashboard
</div>


      <div className="header-actions">
        <button onClick={() => navigate('/history')}>Patient History</button>
        <button onClick={signOut}>Sign Out</button>
      </div>

      <div className="username">
        Welcome, <strong>{user.username}</strong>
      </div>
    </header>
  );
};

export default Header;
