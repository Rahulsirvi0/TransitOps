import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const initialForm = {
  registration_number: '',
  name: '',
  model: '',
  vehicle_type: 'Truck',
  max_load_capacity: '',
  current_odometer: '',
  acquisition_cost: '',
  region_id: ''
};

export default function VehicleForm({ initialData = initialForm, onSubmit, onCancel }) {
  const [form, setForm] = useState(initialData);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(form);
      toast.success('Vehicle saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save vehicle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Registration Number *</label>
          <input name="registration_number" value={form.registration_number} onChange={handleChange} required className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input name="name" value={form.name} onChange={handleChange} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Model</label>
          <input name="model" value={form.model} onChange={handleChange} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Vehicle Type</label>
          <select name="vehicle_type" value={form.vehicle_type} onChange={handleChange} className="input-field">
            <option>Truck</option><option>Van</option><option>Bus</option><option>Trailer</option><option>Pickup</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Max Load Capacity (t)</label>
          <input name="max_load_capacity" type="number" step="0.01" value={form.max_load_capacity} onChange={handleChange} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Current Odometer</label>
          <input name="current_odometer" type="number" step="0.1" value={form.current_odometer} onChange={handleChange} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Acquisition Cost</label>
          <input name="acquisition_cost" type="number" step="0.01" value={form.acquisition_cost} onChange={handleChange} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Region</label>
          <input name="region_id" placeholder="Region ID" value={form.region_id} onChange={handleChange} className="input-field" />
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        {onCancel && <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>}
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving...' : 'Save Vehicle'}
        </button>
      </div>
    </form>
  );
}