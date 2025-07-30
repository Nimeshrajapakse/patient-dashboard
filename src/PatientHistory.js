// PatientHistory.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './PatientHistory.css';

import { fetchAuthSession } from '@aws-amplify/auth';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const API_URL = '';

function PatientHistory({ user, signOut }) {
  const [data, setData] = useState([]);
  const [patientId, setPatientId] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();

        const res = await axios.get(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setData(res.data);
        setAlerts(res.data.filter(d => d.status !== 'OK'));
      } catch (err) {
        console.error('API error (secured):', err.response?.data || err.message);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (patientId) {
      const patientData = data
        .filter(d => d.patient_id === patientId)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      setFiltered(patientData);
    } else {
      setFiltered([]);
    }
  }, [patientId, data]);

  const uniquePatientIds = [...new Set(data.map(d => d.patient_id))];
  const avgHR = filtered.length ? (filtered.reduce((sum, d) => sum + d.heart_rate, 0) / filtered.length).toFixed(1) : '—';
  const avgSpO2 = filtered.length ? (filtered.reduce((sum, d) => sum + d.oxygen_saturation, 0) / filtered.length).toFixed(1) : '—';
  const latestAlert = alerts.filter(d => d.patient_id === patientId).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

  const hrChart = {
    labels: filtered.map(d => new Date(d.timestamp).toLocaleTimeString()),
    datasets: [{
      label: 'Heart Rate',
      data: filtered.map(d => d.heart_rate),
      borderColor: '#ff4d6d',
      backgroundColor: 'rgba(255, 77, 109, 0.1)',
      tension: 0.4,
      pointRadius: 2,
    }]
  };

  const spo2Chart = {
    labels: filtered.map(d => new Date(d.timestamp).toLocaleTimeString()),
    datasets: [{
      label: 'SpO2',
      data: filtered.map(d => d.oxygen_saturation),
      borderColor: '#00b4d8',
      backgroundColor: 'rgba(0, 180, 216, 0.1)',
      tension: 0.4,
      pointRadius: 2,
    }]
  };

  return (
    <div className="App">
      <div className="history-container">
        <h1 className="page-title">📊 Patient Analytics</h1>

        <div className="selector">
          <label>Select Patient:</label>
          <select value={patientId} onChange={e => setPatientId(e.target.value)}>
            <option value="">-- Choose --</option>
            {uniquePatientIds.map(id => (
              <option key={id} value={id}>{id}</option>
            ))}
          </select>
        </div>

        {patientId && (
          <>
            <div className="stat-cards">
              <div className="stat-card">
                <h4>Avg HR</h4>
                <p>{avgHR} bpm</p>
              </div>
              <div className="stat-card">
                <h4>Avg SpO2</h4>
                <p>{avgSpO2} %</p>
              </div>
              <div className="stat-card">
                <h4>Last Alert</h4>
                <p>{latestAlert?.timestamp || '—'}</p>
              </div>
            </div>

            <div className="chart-section">
              <h3>📈 Heart Rate Trend</h3>
              <Line data={hrChart} />
            </div>

            <div className="chart-section">
              <h3>💙 SpO2 Trend</h3>
              <Line data={spo2Chart} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PatientHistory;
