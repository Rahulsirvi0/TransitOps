import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const initialForm = {
  vehicle_id: '',
  maintenance_type: '',
  description: '',
  cost: '',
  maintenance_date: ''
};

export default function MaintenanceForm({ initialData = initialForm, onSubmit, onCancel }) {
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
      toast.success('Maintenance record saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save maintenance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Vehicle *</label>
          <select name="vehicle_id" value={form.vehicle_id} onChange={handleChange} required className="input-field">
            <option value="">Select vehicle</option>
            {vehicles.map(v => <option key={v.id} value={v.id}>{v.registration_number} ({v.name})</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Maintenance Type *</label>
          <input name="maintenance_type" value={form.maintenance_type} onChange={handleChange} required className="input-field" placeholder="e.g., Engine repair" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows="3" className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Cost *</label>
          <input name="cost" type="number" step="0.01" value={form.cost} onChange={handleChange} required className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Date *</label>
          <input name="maintenance_date" type="date" value={form.maintenance_date} onChange={handleChange} required className="input-field" />
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        {onCancel && <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>}
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving...' : 'Save Maintenance'}
        </button>
      </div>
    </form>
  );
}