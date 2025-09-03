import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Dashboard.css';
import { getAuthHeaders, handleAuthError } from './utils/auth'; // Add this import

const API_URL = 'https://3l0dyz6m34.execute-api.us-east-1.amazonaws.com/prod/telemetry';

function Dashboard({ user, signOut }) {
  const [telemetry, setTelemetry] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        const headers = await getAuthHeaders(); // Add JWT headers
        const res = await axios.get(API_URL, { headers });
        
        if (!cancelled) {
          setTelemetry(res.data);
          setAlerts(res.data.filter(d => d.status !== 'OK'));
        }
      } catch (err) {
        if (!cancelled) {
          handleAuthError(err); // Handle authentication errors
          console.error('Fetch error:', err.response?.data || err.message);
        }
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  const uniquePatientIds = new Set(telemetry.map(d => d.patient_id));
  const totalPatients = uniquePatientIds.size;
  const criticalAlerts = alerts.length;

  const renderStatusBadge = (status) => {
    const statusClass = {
      OK: 'status-ok',
      CRITICAL: 'status-critical',
      INACTIVE: 'status-inactive'
    }[status] || 'status-default';

    return <span className={`status-badge ${statusClass}`}>{status}</span>;
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">⚕️ Patient Monitoring Dashboard</h1>

      <div className="summary-section">
        <div className="summary-card">
          <h3>🧍 Active Patients</h3>
          <p>{totalPatients}</p>
        </div>
        <div className="summary-card">
          <h3>🚨 Critical Alerts</h3>
          <p>{criticalAlerts}</p>
        </div>
      </div>

      <section>
        <h2>🚨 Recent Alerts</h2>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Status</th>
                <th>Heart Rate</th>
                <th>SpO2</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert, index) => (
                <tr key={index}>
                  <td>{alert.patient_id}</td>
                  <td>{renderStatusBadge(alert.status)}</td>
                  <td>{alert.heart_rate}</td>
                  <td>{alert.oxygen_saturation}</td>
                  <td>{new Date(alert.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>📋 Recent Telemetry</h2>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Heart Rate</th>
                <th>SpO2</th>
                <th>Movement</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {telemetry.map((entry, index) => (
                <tr key={index}>
                  <td>{entry.patient_id}</td>
                  <td>{entry.heart_rate}</td>
                  <td>{entry.oxygen_saturation}</td>
                  <td>{entry.movement}</td>
                  <td>{renderStatusBadge(entry.status)}</td>
                  <td>{new Date(entry.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;