import React, { useEffect, useState } from 'react';
import API from '../api/axios';

export default function DashboardPage() {
  const [bills, setBills] = useState([]);
  const [form, setForm] = useState({
    totalAmount: '',
    splitBetween: 0,
    description: '',
    dueDate: '',
  });
  const [names, setNames] = useState([]);
  const [paidStatus, setPaidStatus] = useState([]);
  const [showOnlyUnpaid, setShowOnlyUnpaid] = useState(false);

  let user = null;
  try {
    const raw = localStorage.getItem('user');
    if (raw && raw !== 'undefined') {
      user = JSON.parse(raw);
    }
  } catch (err) {
    user = null;
  }

  useEffect(() => {
    API.get('/bills').then(res => setBills(res.data)).catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    if (name === 'splitBetween') {
      const num = parseInt(value, 10) || 0;
      setNames(Array(num).fill(''));
      setPaidStatus(Array(num).fill(false));
    }
  };

  const handleNameChange = (index, value) => {
    const updated = [...names];
    updated[index] = value;
    setNames(updated);
  };

  const togglePaid = (index) => {
    const updated = [...paidStatus];
    updated[index] = !updated[index];
    setPaidStatus(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const billPayload = {
        ...form,
        names,
        paidStatus,
      };
      const res = await API.post('/bills', billPayload);
      setBills([...bills, res.data]);
      setForm({ totalAmount: '', splitBetween: 0, description: '', dueDate: '' });
      setNames([]);
      setPaidStatus([]);
    } catch (err) {
      alert('Error creating bill');
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/bills/${id}`);
      setBills(bills.filter(b => b._id !== id));
    } catch (err) {
      alert("Error deleting bill");
    }
  };

  const totalUnpaid = bills
    .filter(b => !b.paid)
    .reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0)
    .toFixed(2);

  const copySummary = () => {
    const summary = bills.map(b => {
      return `${b.description} — $${b.totalAmount} (${b.paid ? 'Paid' : 'Unpaid'})`;
    }).join('\n');
    navigator.clipboard.writeText(summary);
    alert('Summary copied to clipboard!');
  };

  return (
    <div style={{
      maxWidth: '500px',
      margin: '0 auto',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <h2 style={{ textAlign: 'center' }}>Welcome, {user?.name || "Guest"}</h2>

      <h2>Create a New Bill</h2>
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Total Amount</label>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
          <span style={{ marginRight: '0.5rem' }}>$</span>
          <input
            name="totalAmount"
            placeholder="0.00"
            onChange={handleChange}
            value={form.totalAmount}
            type="number"
            step="0.01"
            style={{ width: '100%' }}
            required
          />
        </div>

        <label style={{ display: 'block', marginBottom: '0.5rem' }}>How many?</label>
        <input
          name="splitBetween"
          placeholder="e.g. 3"
          type="number"
          onChange={handleChange}
          value={form.splitBetween}
          min="0"
          style={{ width: '100%', marginBottom: '2rem' }}
        />

        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
        <input
          name="description"
          placeholder="e.g. Lunch with friends"
          onChange={handleChange}
          value={form.description}
          style={{ width: '100%', marginBottom: '2rem' }}
        />

        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Due Date (optional)</label>
        <input
          name="dueDate"
          type="date"
          onChange={handleChange}
          value={form.dueDate}
          style={{ width: '100%', marginBottom: '2rem' }}
        />

        {names.length > 0 && <h4>Enter Names & Mark Paid</h4>}
        {names.map((name, index) => (
          <div key={index} style={{ marginBottom: '1rem' }}>
            <input
              placeholder={`Name ${index + 1}`}
              value={name}
              onChange={(e) => handleNameChange(index, e.target.value)}
              style={{ width: '70%', marginRight: '1rem' }}
              required
            />
            <label>
              <input
                type="checkbox"
                checked={paidStatus[index]}
                onChange={() => togglePaid(index)}
              /> Paid
            </label>
          </div>
        ))}

        <button type="submit" style={{ width: '100%', marginBottom: '2rem' }}>Create</button>
      </form>

      <h3>Total Unpaid Amount: ${totalUnpaid}</h3>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <button onClick={copySummary}>Copy Summary</button>
        <label>
          <input
            type="checkbox"
            checked={showOnlyUnpaid}
            onChange={() => setShowOnlyUnpaid(!showOnlyUnpaid)}
          />
          Show only unpaid bills
        </label>
      </div>

      <ul style={{ width: '100%' }}>
        {bills
          .filter(b => !showOnlyUnpaid || !b.paid)
          .map(b => {
            const unpaidCount = b.paidStatus
              ? b.paidStatus.filter(p => !p).length || 1
              : b.splitBetween;
            return (
              <li key={b._id} style={{ marginBottom: '1rem' }}>
                <strong>{b.description}</strong> — ${b.totalAmount} split by {unpaidCount} unpaid
                {b.dueDate && <div>Due: {b.dueDate}</div>}
                <br />
                Paid: <input type="checkbox" checked={b.paid} readOnly />
                <br />
                <button onClick={() => handleDelete(b._id)}>Delete</button>
                {b.names && b.names.length > 0 && (
                  <ul>
                    {b.names.map((name, i) => (
                      <li key={i}>
                        {name}: {b.paidStatus?.[i] ? 'Paid' : `$${(parseFloat(b.totalAmount) / unpaidCount).toFixed(2)}`}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
      </ul>
    </div>
  );
}
