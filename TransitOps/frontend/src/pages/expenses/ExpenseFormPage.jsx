import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import ExpenseForm from '../../components/forms/ExpenseForm';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export default function ExpenseFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(id);

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      api.get(`/expenses/${id}`)
        .then(res => setInitialData(res.data.data))
        .catch(() => toast.error('Failed to load expense'))
        .finally(() => setLoading(false));
    } else {
      setInitialData({});
    }
  }, [id]);

  const handleSubmit = async (formData) => {
    if (isEdit) {
      await api.put(`/expenses/${id}`, formData);
    } else {
      await api.post('/expenses', formData);
    }
    navigate('/expenses');
  };

  if (loading) return <Spinner className="py-10" />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Expense' : 'New Expense'}</h1>
      <ExpenseForm initialData={initialData} onSubmit={handleSubmit} onCancel={() => navigate('/expenses')} />
    </div>
  );
}