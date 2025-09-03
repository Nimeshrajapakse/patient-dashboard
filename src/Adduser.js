import React, { useState } from 'react';
import axios from 'axios';
import './AddUser.css';
import { getAuthHeaders, handleAuthError } from './utils/auth'; // Add this import

const API_URL = 'https://3l0dyz6m34.execute-api.us-east-1.amazonaws.com/prod/adduser';

function AddUser() {
  const [form, setForm] = useState({
    patient_id: '',
    name: '',
    age: '',
    gender: ''
  });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const headers = await getAuthHeaders(); // Add JWT headers
      await axios.post(API_URL, form, { headers }); // Use form directly, add headers
      
      alert('✅ Patient added successfully!');
      setForm({ patient_id: '', name: '', age: '', gender: '' });
    } catch (err) {
      handleAuthError(err); // Handle authentication errors
      console.error('Error:', err.response?.data || err.message);
      alert('❌ Error adding patient');
    }
  };

  return (
    <div className="add-user-container">
      <h2>🧍‍♂️ Add New Patient</h2>
      <form onSubmit={handleSubmit} className="add-user-form">
        <div className="form-group">
          <label htmlFor="patient_id">Patient ID</label>
          <input id="patient_id" name="patient_id" value={form.patient_id} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input id="name" name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="age">Age</label>
          <input id="age" name="age" type="number" value={form.age} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="gender">Gender</label>
          <select id="gender" name="gender" value={form.gender} onChange={handleChange} required>
            <option value="">Select...</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <button type="submit" className="submit-btn">➕ Add Patient</button>
      </form>
    </div>
  );
}

export default AddUser;