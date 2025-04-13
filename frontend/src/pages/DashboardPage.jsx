import React, { useEffect, useState } from 'react';
import API from '../api/axios';

export default function DashboardPage() {
  const [bills, setBills] = useState([]);
  const [form, setForm] = useState({
    totalAmount: '',
    splitBetween: '',
    description: '',
    names: ''
  });
  const [showOnlyUnpaid, setShowOnlyUnpaid] = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    API.get('/bills').then(res => setBills(res.data)).catch(console.error);
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const billPayload = {
        ...form,
        names: form.names.split(',').map(n => n.trim())
      };
      const res = await API.post('/bills', billPayload);
      setBills([...bills, res.data]);
      setForm({ totalAmount: '', splitBetween: '', description: '', names: '' });
    } catch (err) {
      alert('Error creating bill');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Welcome, {user?.name || user?.email}</h2>

      <h2>Create a New Bill</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="totalAmount"
          placeholder="Total Amount"
          onChange={handleChange}
          value={form.totalAmount}
          required
        />
        <br />
        <input
          name="splitBetween"
          placeholder="Number of People"
          onChange={handleChange}
          value={form.splitBetween}
          required
        />
        <br />
        <input
          name="description"
          placeholder="Description"
          onChange={handleChange}
          value={form.description}
        />
        <br />
        <input
          name="names"
          placeholder="Names (comma-separated)"
          onChange={handleChange}
          value={form.names}
        />
        <br />
        <button type="submit">Create</button>
      </form>

      <h3>Your Bills</h3>

      <label style={{ display: 'block', margin: '1rem 0' }}>
        <input
          type="checkbox"
          checked={showOnlyUnpaid}
          onChange={() => setShowOnlyUnpaid(!showOnlyUnpaid)}
        />
        Show only unpaid bills
      </label>

      <ul>
        {bills
          .filter(b => !showOnlyUnpaid || !b.paid)
          .map(b => (
            <li key={b._id}>
              <strong>{b.description}</strong> — ${b.totalAmount} split by {b.splitBetween}
              <br />
              Paid: <input type="checkbox" checked={b.paid} readOnly />
              {b.names && b.names.length > 0 && (
                <ul>
                  {b.names.map((name, i) => (
                    <li key={i}>
                      {name}: ${(parseFloat(b.totalAmount) / b.splitBetween).toFixed(2)}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
      </ul>
    </div>
  );
}