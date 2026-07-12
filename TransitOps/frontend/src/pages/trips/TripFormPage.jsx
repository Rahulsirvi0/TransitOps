import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import TripForm from '../../components/forms/TripForm';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export default function TripFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(id);

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      api.get(`/trips/${id}`)
        .then(res => setInitialData(res.data.data))
        .catch(() => toast.error('Failed to load trip'))
        .finally(() => setLoading(false));
    } else {
      setInitialData({});
    }
  }, [id, isEdit]);

  const handleSubmit = async (formData) => {
    if (isEdit) {
      await api.put(`/trips/${id}`, formData);
    } else {
      await api.post('/trips', formData);
    }
    navigate('/trips');
  };

  if (loading) return <Spinner className="py-10" />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Trip' : 'New Trip'}</h1>
      <TripForm initialData={initialData} onSubmit={handleSubmit} onCancel={() => navigate('/trips')} />
    </div>
  );
}