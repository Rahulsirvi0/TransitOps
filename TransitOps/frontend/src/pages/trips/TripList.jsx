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

export default function TripList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [actionTarget, setActionTarget] = useState(null); // { id, action }
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/trips', { params: { page, limit: 10, ...filters } });
      setData(res.data.data.data);
      setPagination({ page: res.data.data.page, totalPages: res.data.data.totalPages });
    } catch {
      toast.error('Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filters]);

  const handleAction = async () => {
    setActionLoading(true);
    try {
      if (actionTarget.action === 'dispatch') await api.post(`/trips/${actionTarget.id}/dispatch`);
      else if (actionTarget.action === 'complete') {
        const actualDist = prompt('Enter actual distance (km):');
        const revenue = prompt('Enter revenue:');
        if (!actualDist || !revenue) throw new Error('Distance and revenue required');
        await api.post(`/trips/${actionTarget.id}/complete`, { actual_distance: parseFloat(actualDist), revenue: parseFloat(revenue) });
      } else if (actionTarget.action === 'cancel') await api.post(`/trips/${actionTarget.id}/cancel`);
      toast.success(`Trip ${actionTarget.action}ed`);
      fetchData(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Action failed');
    } finally {
      setActionLoading(false);
      setActionTarget(null);
    }
  };

  const columns = [
    { key: 'trip_number', label: 'Trip #' },
    { key: 'source', label: 'Source' },
    { key: 'destination', label: 'Destination' },
    { key: 'cargo_weight', label: 'Cargo (t)' },
    { key: 'revenue', label: 'Revenue' },
    { key: 'status', label: 'Status', render: (val) => {
      const colors = { Draft: 'bg-gray-100 text-gray-800', Dispatched: 'bg-blue-100 text-blue-800', Completed: 'bg-green-100 text-green-800', Cancelled: 'bg-red-100 text-red-800' };
      return <span className={`px-2 py-1 text-xs rounded ${colors[val] || ''}`}>{val}</span>;
    }},
    { key: 'actions', label: '', render: (_, row) => (
        <div className="flex gap-2">
          {row.status === 'Draft' && (
            <>
              <button onClick={() => navigate(`/trips/${row.id}/edit`)} className="text-primary-600 hover:underline">Edit</button>
              <button onClick={() => setActionTarget({ id: row.id, action: 'dispatch' })} className="text-green-600 hover:underline">Dispatch</button>
            </>
          )}
          {row.status === 'Dispatched' && (
            <>
              <button onClick={() => setActionTarget({ id: row.id, action: 'complete' })} className="text-green-600 hover:underline">Complete</button>
              <button onClick={() => setActionTarget({ id: row.id, action: 'cancel' })} className="text-red-600 hover:underline">Cancel</button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Trip Management</h1>
        <button onClick={() => navigate('/trips/new')} className="btn-primary flex items-center gap-1"><Plus size={18} /> New Trip</button>
      </div>
      <SearchFilter
        searchTerm={filters.search}
        onSearchChange={(val) => setFilters({ ...filters, search: val })}
        filters={filters}
        onFilterChange={(key, val) => setFilters({ ...filters, [key]: val })}
        filterOptions={[
          { key: 'status', label: 'All Statuses', options: ['Draft','Dispatched','Completed','Cancelled'].map(s => ({ value: s, label: s })) }
        ]}
      />
      {loading ? <Spinner className="py-10" /> : data.length === 0 ? <EmptyState title="No trips found" /> : (
        <>
          <DataTable columns={columns} data={data} />
          <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={fetchData} />
        </>
      )}
      <ConfirmDialog
        isOpen={!!actionTarget}
        onClose={() => setActionTarget(null)}
        onConfirm={handleAction}
        title={`Confirm ${actionTarget?.action}`}
        message={`Are you sure you want to ${actionTarget?.action} this trip?`}
        confirmText={actionTarget?.action?.charAt(0).toUpperCase() + actionTarget?.action?.slice(1)}
        loading={actionLoading}
        variant={actionTarget?.action === 'cancel' ? 'danger' : 'primary'}
      />
    </div>
  );
}