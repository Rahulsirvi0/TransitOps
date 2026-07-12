import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import DriverForm from '../../components/forms/DriverForm';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export default function DriverFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(id);

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      api.get(`/drivers/${id}`)
        .then(res => setInitialData(res.data.data))
        .catch(() => toast.error('Failed to load driver'))
        .finally(() => setLoading(false));
    } else {
      setInitialData({});
    }
  }, [id, isEdit]);

  const handleSubmit = async (formData) => {
    if (isEdit) {
      await api.put(`/drivers/${id}`, formData);
    } else {
      await api.post('/drivers', formData);
    }
    navigate('/drivers');
  };

  if (loading) return <Spinner className="py-10" />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Driver' : 'Add Driver'}</h1>
      <DriverForm initialData={initialData} onSubmit={handleSubmit} onCancel={() => navigate('/drivers')} />
    </div>
  );
}