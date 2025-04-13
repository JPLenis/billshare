import React, { useEffect, useState } from 'react';
import API from '../api/axios';

export default function DashboardPage() {
  const [bills, setBills] = useState([]);
  const [form, setForm] = useState({ totalAmount: '', splitBetween: '', description: '' });

  useEffect(() => {
    API.get('/bills').then(res => setBills(res.data)).catch(console.error);
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/bills', form);
      setBills([...bills, res.data]);
    } catch (err) {
      alert('Error creating bill');
    }
  };

  return (
    <div>
      <h2>Create a New Bill</h2>
      <form onSubmit={handleSubmit}>
        <input name="totalAmount" placeholder="Total Amount" onChange={handleChange} required />
        <input name="splitBetween" placeholder="Number of People" onChange={handleChange} required />
        <input name="description" placeholder="Description" onChange={handleChange} />
        <button type="submit">Create</button>
      </form>

      <h3>Your Bills</h3>
      <ul>
        {bills.map(b => (
          <li key={b._id}>
            {b.description} — ${b.totalAmount} split by {b.splitBetween}
          </li>
        ))}
      </ul>
    </div>
  );
}
