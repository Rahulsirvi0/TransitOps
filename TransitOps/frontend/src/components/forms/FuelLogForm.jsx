import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const initialForm = {
  vehicle_id: '',
  trip_id: '',
  fuel_liters: '',
  fuel_cost: '',
  log_date: '',
  odometer_reading: ''
};

export default function FuelLogForm({ initialData = initialForm, onSubmit, onCancel }) {
  const [form, setForm] = useState(initialData);
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vRes, tRes] = await Promise.all([
          api.get('/vehicles', { params: { limit: 100 } }),
          api.get('/trips', { params: { status: 'Dispatched,Completed', limit: 100 } })
        ]);
        setVehicles(vRes.data.data.data || []);
        setTrips(tRes.data.data.data || []);
      } catch (err) {
        toast.error('Failed to load data');
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(form);
      toast.success('Fuel log saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save fuel log');
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
            {vehicles.map(v => <option key={v.id} value={v.id}>{v.registration_number}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Trip (optional)</label>
          <select name="trip_id" value={form.trip_id} onChange={handleChange} className="input-field">
            <option value="">No trip</option>
            {trips.map(t => <option key={t.id} value={t.id}>{t.trip_number}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Fuel (liters) *</label>
          <input name="fuel_liters" type="number" step="0.01" value={form.fuel_liters} onChange={handleChange} required className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Fuel Cost *</label>
          <input name="fuel_cost" type="number" step="0.01" value={form.fuel_cost} onChange={handleChange} required className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Date *</label>
          <input name="log_date" type="date" value={form.log_date} onChange={handleChange} required className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Odometer Reading</label>
          <input name="odometer_reading" type="number" step="0.1" value={form.odometer_reading} onChange={handleChange} className="input-field" />
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        {onCancel && <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>}
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving...' : 'Save Fuel Log'}
        </button>
      </div>
    </form>
  );
}