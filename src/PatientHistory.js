import React, { useState } from 'react';
import axios from 'axios';
import './PatientHistory.css';
import { getAuthHeaders, handleAuthError } from './utils/auth.js'; // Add this import

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

const API_BASE_URL = 'https://3l0dyz6m34.execute-api.us-east-1.amazonaws.com/prod/getuser';

function PatientHistory() {
  const [inputId, setInputId] = useState('');
  const [patientId, setPatientId] = useState('');
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState('');

  const fetchData = async () => {
    if (!inputId) return;
    try {
      const headers = await getAuthHeaders(); // Add JWT headers
      const res = await axios.get(`${API_BASE_URL}/${inputId}`, { headers });
      
      const allData = res.data.sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );
      setData(allData);
      setPatientId(inputId);
      setError('');

      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24h ago
      const recent = allData.filter(d => new Date(d.timestamp) > cutoff);
      setFilteredData(recent);
      setAlerts(recent.filter(d => d.status !== 'OK'));
    } catch (err) {
      handleAuthError(err); // Handle authentication errors
      console.error('API error:', err.response?.data || err.message);
      setError('Patient not found or API error.');
      setData([]);
      setFilteredData([]);
      setPatientId('');
      setAlerts([]);
    }
  };

  const formatLocal = ts =>
    new Date(ts).toLocaleString('en-US', {
      timeZone: 'Asia/Colombo',
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

  const avgHR = filteredData.length
    ? (filteredData.reduce((sum, d) => sum + d.heart_rate, 0) / filteredData.length).toFixed(1)
    : '—';

  const avgSpO2 = filteredData.length
    ? (filteredData.reduce((sum, d) => sum + d.oxygen_saturation, 0) / filteredData.length).toFixed(1)
    : '—';

  const latestAlert = alerts
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

  const formattedAlertTime = latestAlert ? formatLocal(latestAlert.timestamp) : '—';

  const hrChart = {
    labels: filteredData.map(d => formatLocal(d.timestamp)),
    datasets: [{
      label: 'Heart Rate',
      data: filteredData.map(d => d.heart_rate),
      borderColor: '#ff4d6d',
      backgroundColor: 'rgba(255, 77, 109, 0.1)',
      tension: 0.4,
      pointRadius: 2,
    }]
  };

  const spo2Chart = {
    labels: filteredData.map(d => formatLocal(d.timestamp)),
    datasets: [{
      label: 'SpO2',
      data: filteredData.map(d => d.oxygen_saturation),
      borderColor: '#00b4d8',
      backgroundColor: 'rgba(0, 180, 216, 0.1)',
      tension: 0.4,
      pointRadius: 2,
    }]
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Patient Analytics Report`, 14, 20);

    doc.setFontSize(12);
    doc.text(`Patient ID: ${patientId}`, 14, 30);
    doc.text(`Average HR (24h): ${avgHR} bpm`, 14, 38);
    doc.text(`Average SpO2 (24h): ${avgSpO2} %`, 14, 46);
    doc.text(`Last Alert: ${formattedAlertTime}`, 14, 54);

    autoTable(doc, {
      startY: 64,
      head: [['Timestamp (Local)', 'Heart Rate']],
      body: data.map(d => [formatLocal(d.timestamp), d.heart_rate]),
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [255, 77, 109] },
      margin: { top: 10 }
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Timestamp (Local)', 'SpO2']],
      body: data.map(d => [formatLocal(d.timestamp), d.oxygen_saturation]),
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 180, 216] },
      margin: { top: 10 }
    });

    doc.save(`Patient_${patientId}_Report.pdf`);
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
            <button onClick={downloadPDF} className="download-button">
              📄 Download PDF Report
            </button>

            <div id="report-section">
              <div className="stat-cards">
                <div className="stat-card">
                  <h4>Avg HR (24h)</h4>
                  <p>{avgHR} bpm</p>
                </div>
                <div className="stat-card">
                  <h4>Avg SpO2 (24h)</h4>
                  <p>{avgSpO2} %</p>
                </div>
                <div className="stat-card">
                  <h4>Last Alert</h4>
                  <p>{formattedAlertTime}</p>
                </div>
              </div>

              <div className="chart-section">
                <h3>📈 Heart Rate Trend (24h)</h3>
                <Line data={hrChart} />
              </div>

              <div className="chart-section">
                <h3>💙 SpO2 Trend (24h)</h3>
                <Line data={spo2Chart} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PatientHistory;