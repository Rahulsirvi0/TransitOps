import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import DataTable from '../../components/ui/DataTable';
import SearchFilter from '../../components/ui/SearchFilter';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';

export default function FuelLogList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({ vehicle_id: '', trip_id: '', startDate: '', endDate: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/fuel', { params: { page, limit: 10, ...filters } });
      setData(res.data.data.data);
      setPagination({ page: res.data.data.page, totalPages: res.data.data.totalPages });
    } catch {
      toast.error('Failed to load fuel logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filters]);

  const handleDelete = async () => {
    try {
      await api.delete(`/fuel/${deleteTarget.id}`);
      toast.success('Fuel log deleted');
      fetchData(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleteTarget(null);
    }
  };

  const columns = [
    { key: 'vehicle_name', label: 'Vehicle' },
    { key: 'trip_number', label: 'Trip' },
    { key: 'fuel_liters', label: 'Liters' },
    { key: 'fuel_cost', label: 'Cost' },
    { key: 'log_date', label: 'Date', render: (val) => new Date(val).toLocaleDateString() },
    { key: 'actions', label: '', render: (_, row) => (
        <button onClick={() => setDeleteTarget(row)} className="text-red-600 hover:underline">Delete</button>
      )
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Fuel Logs</h1>
        <button onClick={() => navigate('/fuel/new')} className="btn-primary flex items-center gap-1"><Plus size={18} /> Log Fuel</button>
      </div>
      <SearchFilter
        searchTerm=""
        onSearchChange={() => {}}
        filters={filters}
        onFilterChange={(key, val) => setFilters({ ...filters, [key]: val })}
        filterOptions={[]}
      />
      {loading ? <Spinner className="py-10" /> : data.length === 0 ? <EmptyState title="No fuel logs" /> : (
        <>
          <DataTable columns={columns} data={data} />
          <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={fetchData} />
        </>
      )}
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Fuel Log" message="Are you sure?" confirmText="Delete" />
    </div>
  );
}