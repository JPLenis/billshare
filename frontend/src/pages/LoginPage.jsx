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
