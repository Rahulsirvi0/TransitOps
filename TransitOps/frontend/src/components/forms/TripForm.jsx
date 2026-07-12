import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const initialForm = {
  trip_number: '',
  source: '',
  destination: '',
  vehicle_id: '',
  driver_id: '',
  cargo_weight: '',
  planned_distance: '',
  revenue: ''
};

export default function TripForm({ initialData = initialForm, onSubmit, onCancel }) {
  const [form, setForm] = useState(initialData);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSelects = async () => {
      try {
        const [vRes, dRes] = await Promise.all([
          api.get('/vehicles', { params: { status: 'Available', limit: 100 } }),
          api.get('/drivers', { params: { status: 'Available', limit: 100 } })
        ]);
        setVehicles(vRes.data.data.data || []);
        setDrivers(dRes.data.data.data || []);
      } catch (err) {
        toast.error('Failed to load vehicles/drivers');
      }
    };
    fetchSelects();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(form);
      toast.success('Trip saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow max-w-3xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Trip Number *</label>
          <input name="trip_number" value={form.trip_number} onChange={handleChange} required className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Source *</label>
          <input name="source" value={form.source} onChange={handleChange} required className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Destination *</label>
          <input name="destination" value={form.destination} onChange={handleChange} required className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Vehicle *</label>
          <select name="vehicle_id" value={form.vehicle_id} onChange={handleChange} required className="input-field">
            <option value="">Select vehicle</option>
            {vehicles.map(v => <option key={v.id} value={v.id}>{v.registration_number} ({v.name})</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Driver *</label>
          <select name="driver_id" value={form.driver_id} onChange={handleChange} required className="input-field">
            <option value="">Select driver</option>
            {drivers.map(d => <option key={d.id} value={d.id}>{d.name} ({d.license_number})</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Cargo Weight (t) *</label>
          <input name="cargo_weight" type="number" step="0.01" value={form.cargo_weight} onChange={handleChange} required className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Planned Distance (km)</label>
          <input name="planned_distance" type="number" step="0.1" value={form.planned_distance} onChange={handleChange} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Expected Revenue</label>
          <input name="revenue" type="number" step="0.01" value={form.revenue} onChange={handleChange} className="input-field" />
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        {onCancel && <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>}
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving...' : 'Create Trip'}
        </button>
      </div>
    </form>
  );
}