import { useState } from 'react';
import toast from 'react-hot-toast';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  license_number: '',
  license_category: '',
  license_expiry: '',
  safety_score: '5.0',
  status: 'Available'
};

export default function DriverForm({ initialData = initialForm, onSubmit, onCancel }) {
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
      toast.success('Driver saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save driver');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name *</label>
          <input name="name" value={form.name} onChange={handleChange} required className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">License Number *</label>
          <input name="license_number" value={form.license_number} onChange={handleChange} required className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">License Category</label>
          <input name="license_category" value={form.license_category} onChange={handleChange} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">License Expiry *</label>
          <input name="license_expiry" type="date" value={form.license_expiry} onChange={handleChange} required className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Safety Score (0-5)</label>
          <input name="safety_score" type="number" step="0.1" min="0" max="5" value={form.safety_score} onChange={handleChange} className="input-field" />
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        {onCancel && <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>}
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving...' : 'Save Driver'}
        </button>
      </div>
    </form>
  );
}