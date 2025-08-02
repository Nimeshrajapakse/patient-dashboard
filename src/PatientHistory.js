import React, { useState } from 'react';
import axios from 'axios';
import './PatientHistory.css';

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

const API_BASE_URL = 'https://87482chyli.execute-api.us-east-1.amazonaws.com/prod/getuser';

function PatientHistory() {
  const [inputId, setInputId] = useState('');
  const [patientId, setPatientId] = useState('');
  const [data, setData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState('');

  const fetchData = async () => {
    if (!inputId) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/${inputId}`);

      const sortedData = res.data.sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );

      setData(sortedData);
      setPatientId(inputId);
      setAlerts(sortedData.filter(d => d.status !== 'OK'));
      setError('');
    } catch (err) {
      console.error('API error:', err.response?.data || err.message);
      setError('Patient not found or API error.');
      setData([]);
      setPatientId('');
      setAlerts([]);
    }
  };

  const avgHR = data.length
    ? (data.reduce((sum, d) => sum + d.heart_rate, 0) / data.length).toFixed(1)
    : '—';

  const avgSpO2 = data.length
    ? (data.reduce((sum, d) => sum + d.oxygen_saturation, 0) / data.length).toFixed(1)
    : '—';

  const latestAlert = alerts
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

  const formattedAlertTime = latestAlert
    ? new Date(latestAlert.timestamp).toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    : '—';

  const hrChart = {
    labels: data.map(d => new Date(d.timestamp).toLocaleTimeString()),
    datasets: [{
      label: 'Heart Rate',
      data: data.map(d => d.heart_rate),
      borderColor: '#ff4d6d',
      backgroundColor: 'rgba(255, 77, 109, 0.1)',
      tension: 0.4,
      pointRadius: 2,
    }]
  };

  const spo2Chart = {
    labels: data.map(d => new Date(d.timestamp).toLocaleTimeString()),
    datasets: [{
      label: 'SpO2',
      data: data.map(d => d.oxygen_saturation),
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

        <div className="searchbar">
          <input
            type="text"
            placeholder="Enter Patient ID"
            value={inputId}
            onChange={e => setInputId(e.target.value)}
          />
          <button onClick={fetchData}>Search</button>
        </div>

        {error && <p className="error">{error}</p>}

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
                <p>{formattedAlertTime}</p>
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
