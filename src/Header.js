import React from 'react';
import './Header.css';
import { useNavigate } from 'react-router-dom';

const Header = ({ user, signOut }) => {
  const navigate = useNavigate();

  return (
    <header className="dashboard-header">
      <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <span role="img" aria-label="logo">🏥</span>
        <span className="logo-text">MediSys Dashboard</span>
      </div>

      <nav className="header-nav">
        <button className="nav-button" onClick={() => navigate('/history')}>📊 History</button>
        <button className="nav-button" onClick={() => navigate('/patient-management')}>👥 Manage Patients</button>
       
        <button className="nav-button logout" onClick={signOut}>🚪 Sign Out</button>
      </nav>

      <div className="username">
        👤 <strong>{user.username}</strong>
      </div>
    </header>
  );
};

export default Header;
