import React, { useState } from 'react';
import axios from 'axios';
import './AddUser.css'; // ✅ Add this for custom styling

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
      await axios.post(API_URL, JSON.stringify(form), {
        headers: { 'Content-Type': 'application/json' }
      });
      alert('User added successfully!');
      setForm({ patient_id: '', name: '', age: '', gender: '' });
    } catch (err) {
      console.error('Error:', err.response?.data || err.message);
      alert('Error adding user');
    }
  };

  return (
    <div className="add-user-container">
      <h2>Add New Patient</h2>
      <form onSubmit={handleSubmit} className="add-user-form">
        <div className="form-group">
          <label>Patient ID</label>
          <input name="patient_id" value={form.patient_id} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Name</label>
          <input name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Age</label>
          <input name="age" type="number" value={form.age} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Gender</label>
          <input name="gender" value={form.gender} onChange={handleChange} required />
        </div>
        <button type="submit" className="submit-btn">Add Patient</button>
      </form>
    </div>
  );
}

export default AddUser;
