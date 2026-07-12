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

export default function MaintenanceList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({ vehicle_id: '', status: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/maintenance', { params: { page, limit: 10, ...filters } });
      setData(res.data.data.data);
      setPagination({ page: res.data.data.page, totalPages: res.data.data.totalPages });
    } catch {
      toast.error('Failed to load maintenance records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filters]);

  const handleDelete = async () => {
    try {
      await api.delete(`/maintenance/${deleteTarget.id}`);
      toast.success('Record deleted');
      fetchData(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.patch(`/maintenance/${id}/status`, { status });
      toast.success('Status updated');
      fetchData(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const columns = [
    { key: 'vehicle_name', label: 'Vehicle' },
    { key: 'maintenance_type', label: 'Type' },
    { key: 'cost', label: 'Cost' },
    { key: 'maintenance_date', label: 'Date', render: (val) => new Date(val).toLocaleDateString() },
    { key: 'status', label: 'Status', render: (val, row) => (
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs rounded ${val === 'Completed' ? 'bg-green-100 text-green-800' : val === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{val}</span>
          {val !== 'Completed' && (
            <select
              value=""
              onChange={(e) => handleStatusUpdate(row.id, e.target.value)}
              className="text-xs border rounded px-1 py-0"
            >
              <option value="">Change</option>
              {val === 'Open' && <option value="In Progress">Start</option>}
              {val === 'In Progress' && <option value="Completed">Complete</option>}
            </select>
          )}
        </div>
      )
    },
    { key: 'actions', label: '', render: (_, row) => (
        <button onClick={() => setDeleteTarget(row)} className="text-red-600 hover:underline">Delete</button>
      )
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Maintenance</h1>
        <button onClick={() => navigate('/maintenance/new')} className="btn-primary flex items-center gap-1"><Plus size={18} /> New Record</button>
      </div>
      <SearchFilter
        searchTerm={filters.search || ''}
        onSearchChange={(val) => setFilters({ ...filters, search: val })}
        filters={filters}
        onFilterChange={(key, val) => setFilters({ ...filters, [key]: val })}
        filterOptions={[
          { key: 'status', label: 'All Statuses', options: ['Open','In Progress','Completed'].map(s => ({ value: s, label: s })) }
        ]}
      />
      {loading ? <Spinner className="py-10" /> : data.length === 0 ? <EmptyState title="No maintenance records" /> : (
        <>
          <DataTable columns={columns} data={data} />
          <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={fetchData} />
        </>
      )}
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Record" message="Delete this maintenance record?" confirmText="Delete" />
    </div>
  );
}