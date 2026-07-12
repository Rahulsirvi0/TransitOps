import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import VehicleForm from '../../components/forms/VehicleForm';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export default function VehicleFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(id);

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      api.get(`/vehicles/${id}`)
        .then(res => setInitialData(res.data.data))
        .catch(err => toast.error('Failed to load vehicle'))
        .finally(() => setLoading(false));
    } else {
      setInitialData({});
    }
  }, [id, isEdit]);

  const handleSubmit = async (formData) => {
    if (isEdit) {
      await api.put(`/vehicles/${id}`, formData);
    } else {
      await api.post('/vehicles', formData);
    }
    navigate('/vehicles');
  };

  if (loading) return <Spinner className="py-10" />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Vehicle' : 'Add Vehicle'}</h1>
      <VehicleForm initialData={initialData} onSubmit={handleSubmit} onCancel={() => navigate('/vehicles')} />
    </div>
  );
}