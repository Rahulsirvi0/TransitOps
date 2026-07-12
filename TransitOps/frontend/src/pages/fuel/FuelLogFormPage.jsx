import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import FuelLogForm from '../../components/forms/FuelLogForm';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export default function FuelLogFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(id);

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      api.get(`/fuel/${id}`)
        .then(res => setInitialData(res.data.data))
        .catch(() => toast.error('Failed to load fuel log'))
        .finally(() => setLoading(false));
    } else {
      setInitialData({});
    }
  }, [id]);

  const handleSubmit = async (formData) => {
    if (isEdit) {
      await api.put(`/fuel/${id}`, formData);
    } else {
      await api.post('/fuel', formData);
    }
    navigate('/fuel');
  };

  if (loading) return <Spinner className="py-10" />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Fuel Log' : 'New Fuel Log'}</h1>
      <FuelLogForm initialData={initialData} onSubmit={handleSubmit} onCancel={() => navigate('/fuel')} />
    </div>
  );
}