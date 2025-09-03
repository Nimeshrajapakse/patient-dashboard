import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getAuthHeaders, handleAuthError } from './utils/auth';
import './Patientmanagement.css';

const API_BASE_URL = 'https://3l0dyz6m34.execute-api.us-east-1.amazonaws.com/prod';

function PatientManagement() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const navigate = useNavigate();

  // Form state for editing
  const [editForm, setEditForm] = useState({
    patient_id: '',
    name: '',
    age: '',
    gender: ''
  });

  // Fetch all patients
  const fetchPatients = async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/Viewusers`, { headers });
      setPatients(response.data);
    } catch (err) {
      handleAuthError(err);
      console.error('Error fetching patients:', err);
      alert('❌ Error fetching patients');
    } finally {
      setLoading(false);
    }
  };

  // Load patients on component mount
  useEffect(() => {
    fetchPatients();
  }, []);

  // Delete patient
  const handleDelete = async (patientId) => {
    if (!window.confirm(`Are you sure you want to delete patient ${patientId}?`)) {
      return;
    }

    try {
      const headers = await getAuthHeaders();
      await axios.delete(`${API_BASE_URL}/user/${patientId}`, { headers });
      alert('✅ Patient deleted successfully!');
      fetchPatients(); // Refresh the list
    } catch (err) {
      handleAuthError(err);
      console.error('Error deleting patient:', err);
      alert('❌ Error deleting patient');
    }
  };

  // Start editing patient
  const handleEdit = (patient) => {
    setEditingPatient(patient);
    setEditForm({
      patient_id: patient.patient_id,
      name: patient.name,
      age: patient.age.toString(),
      gender: patient.gender
    });
    setShowEditForm(true);
  };

  // Handle edit form changes
  const handleEditFormChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // Submit edit form
// Update your handleEditSubmit function in PatientManagement.js
const handleEditSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const headers = await getAuthHeaders();
    
    // Make sure the data is properly formatted
    const updateData = {
      name: editForm.name,
      age: parseInt(editForm.age), // Ensure it's a number
      gender: editForm.gender
    };
    
    console.log('Sending update for patient:', editForm.patient_id);
    console.log('Update data:', updateData);
    console.log('Headers:', headers);
    
    const response = await axios.put(
      `${API_BASE_URL}/user/${editForm.patient_id}`, 
      updateData, 
      { headers }
    );
    
    console.log('Update response:', response);
    alert('✅ Patient updated successfully!');
    setShowEditForm(false);
    setEditingPatient(null);
    fetchPatients();
    
  } catch (err) {
    console.error('Full error object:', err);
    console.error('Error response:', err.response);
    console.error('Error config:', err.config);
    
    handleAuthError(err);
    
    const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
    alert(`❌ Error updating patient: ${errorMessage}`);
  }
};

  // Cancel editing
  const handleEditCancel = () => {
    setShowEditForm(false);
    setEditingPatient(null);
    setEditForm({ patient_id: '', name: '', age: '', gender: '' });
  };

  return (
    <div className="patient-management-container">
      <div className="page-header">
        <h1 className="page-title">👨‍⚕️ Patient Management</h1>
        <div className="header-actions">
          <button 
            onClick={() => navigate('/adduser')}
            className="add-patient-btn"
          >
            ➕ Add New Patient
          </button>
          <button 
            onClick={fetchPatients}
            className="refresh-btn"
            disabled={loading}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Edit Form Modal */}
      {showEditForm && (
        <div className="edit-modal">
          <div className="edit-modal-content">
            <h2>✏️ Edit Patient</h2>
            <form onSubmit={handleEditSubmit} className="edit-form">
              <div className="form-group">
                <label htmlFor="edit-patient-id">Patient ID</label>
                <input 
                  id="edit-patient-id"
                  name="patient_id" 
                  value={editForm.patient_id} 
                  disabled 
                  className="disabled-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-name">Name</label>
                <input 
                  id="edit-name"
                  name="name" 
                  value={editForm.name} 
                  onChange={handleEditFormChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-age">Age</label>
                <input 
                  id="edit-age"
                  name="age" 
                  type="number" 
                  value={editForm.age} 
                  onChange={handleEditFormChange} 
                  required 
                  min="1"
                  max="120"
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-gender">Gender</label>
                <select 
                  id="edit-gender"
                  name="gender" 
                  value={editForm.gender} 
                  onChange={handleEditFormChange} 
                  required
                >
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-buttons">
                <button type="submit" className="save-btn">💾 Save Changes</button>
                <button type="button" onClick={handleEditCancel} className="cancel-btn">❌ Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Patients Table */}
      <div className="patients-section">
        <h2>📋 All Patients ({patients.length})</h2>
        
        {loading ? (
          <div className="loading">Loading patients...</div>
        ) : patients.length === 0 ? (
          <div className="no-patients">
            <p>No patients found.</p>
            <button onClick={() => navigate('/adduser')} className="add-first-patient-btn">
              ➕ Add Your First Patient
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="patients-table">
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.patient_id}>
                    <td>{patient.patient_id}</td>
                    <td>{patient.name}</td>
                    <td>{patient.age}</td>
                    <td>{patient.gender}</td>
                    <td className="actions-cell">
                      <button 
                        onClick={() => handleEdit(patient)}
                        className="edit-btn"
                        title="Edit Patient"
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(patient.patient_id)}
                        className="delete-btn"
                        title="Delete Patient"
                      >
                        🗑️ Delete
                      </button>
                     
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientManagement;