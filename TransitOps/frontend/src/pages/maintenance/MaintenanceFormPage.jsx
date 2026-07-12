import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import MaintenanceForm from '../../components/forms/MaintenanceForm';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export default function MaintenanceFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(id);

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      api.get(`/maintenance/${id}`)
        .then(res => setInitialData(res.data.data))
        .catch(() => toast.error('Failed to load record'))
        .finally(() => setLoading(false));
    } else {
      setInitialData({});
    }
  }, [id]);

  const handleSubmit = async (formData) => {
    if (isEdit) {
      await api.put(`/maintenance/${id}`, formData);
    } else {
      await api.post('/maintenance', formData);
    }
    navigate('/maintenance');
  };

  if (loading) return <Spinner className="py-10" />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Maintenance' : 'New Maintenance'}</h1>
      <MaintenanceForm initialData={initialData} onSubmit={handleSubmit} onCancel={() => navigate('/maintenance')} />
    </div>
  );
}