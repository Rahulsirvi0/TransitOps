import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const initialForm = {
  vehicle_id: '',
  expense_type: 'Fuel',
  description: '',
  cost: '',
  expense_date: ''
};

export default function ExpenseForm({ initialData = initialForm, onSubmit, onCancel }) {
  const [form, setForm] = useState(initialData);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await api.get('/vehicles', { params: { limit: 100 } });
        setVehicles(res.data.data.data || []);
      } catch (err) {
        toast.error('Failed to load vehicles');
      }
    };
    fetchVehicles();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(form);
      toast.success('Expense saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Vehicle (optional)</label>
          <select name="vehicle_id" value={form.vehicle_id} onChange={handleChange} className="input-field">
            <option value="">All Vehicles</option>
            {vehicles.map(v => <option key={v.id} value={v.id}>{v.registration_number}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Expense Type *</label>
          <select name="expense_type" value={form.expense_type} onChange={handleChange} required className="input-field">
            <option>Fuel</option><option>Repair</option><option>Toll</option><option>Insurance</option><option>Miscellaneous</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Description</label>
          <input name="description" value={form.description} onChange={handleChange} className="input-field" placeholder="Brief description" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Cost *</label>
          <input name="cost" type="number" step="0.01" value={form.cost} onChange={handleChange} required className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Date *</label>
          <input name="expense_date" type="date" value={form.expense_date} onChange={handleChange} required className="input-field" />
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        {onCancel && <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>}
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving...' : 'Save Expense'}
        </button>
      </div>
    </form>
  );
}