import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import DataTable from '../../components/ui/DataTable';
import SearchFilter from '../../components/ui/SearchFilter';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';
import { Plus, Users } from 'lucide-react';

export default function DriverList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/drivers', { params: { page, limit: 10, ...filters } });
      setData(res.data.data.data);
      setPagination({ page: res.data.data.page, totalPages: res.data.data.totalPages });
    } catch {
      toast.error('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filters]);

  const handleDelete = async () => {
    try {
      await api.delete(`/drivers/${deleteTarget.id}`);
      toast.success('Driver deleted');
      fetchData(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleteTarget(null);
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'license_number', label: 'License' },
    { key: 'license_expiry', label: 'License Expiry', render: (val) => new Date(val).toLocaleDateString() },
    { key: 'safety_score', label: 'Safety Score' },
    { key: 'status', label: 'Status', render: (val) => <span className={`px-2 py-1 text-xs rounded ${val === 'Available' ? 'bg-green-100 text-green-800' : val === 'On Trip' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>{val}</span> },
    { key: 'actions', label: '', render: (_, row) => (
        <div className="flex gap-2">
          <button onClick={() => navigate(`/drivers/${row.id}/edit`)} className="text-primary-600 hover:underline">Edit</button>
          <button onClick={() => setDeleteTarget(row)} className="text-red-600 hover:underline">Delete</button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Driver Management</h1>
        <Link to="/drivers/new" className="btn-primary flex items-center gap-1"><Plus size={18} /> Add Driver</Link>
      </div>
      <SearchFilter
        searchTerm={filters.search}
        onSearchChange={(val) => setFilters({ ...filters, search: val })}
        filters={filters}
        onFilterChange={(key, val) => setFilters({ ...filters, [key]: val })}
        filterOptions={[
          { key: 'status', label: 'All Statuses', options: ['Available','On Trip','Off Duty','Suspended'].map(s => ({ value: s, label: s })) }
        ]}
      />
      {loading ? <Spinner className="py-10" /> : data.length === 0 ? <EmptyState title="No drivers found" /> : (
        <>
          <DataTable columns={columns} data={data} />
          <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={fetchData} />
        </>
      )}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Driver"
        message={`Delete ${deleteTarget?.name}?`}
        confirmText="Delete"
      />
    </div>
  );
}