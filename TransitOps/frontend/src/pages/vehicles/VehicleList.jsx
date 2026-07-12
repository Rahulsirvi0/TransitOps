import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import DataTable from '../../components/ui/DataTable';
import { Truck, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VehicleList() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({ search: '', status: '', type: '', region: '' });

  const fetchVehicles = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get('/vehicles', { params: { page, limit: 10, ...filters } });
      setVehicles(data.data.data);
      setPagination({ page: data.data.page, totalPages: data.data.totalPages, total: data.data.total });
    } catch (err) {
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVehicles(); }, [filters]);

  const columns = [
    { key: 'registration_number', label: 'Reg Number' },
    { key: 'name', label: 'Name' },
    { key: 'vehicle_type', label: 'Type' },
    { key: 'max_load_capacity', label: 'Capacity (t)' },
    { key: 'status', label: 'Status', render: (val) => <span className={`px-2 py-1 text-xs rounded ${val === 'Available' ? 'bg-green-100 text-green-800' : val === 'On Trip' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>{val}</span> },
    { key: 'actions', label: '', render: (_, row) => <Link to={`/vehicles/${row.id}`} className="text-primary-600 hover:underline">Edit</Link> }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Vehicle Registry</h1>
        <Link to="/vehicles/new" className="btn-primary flex items-center gap-1"><Plus size={18} /> Add Vehicle</Link>
      </div>
      <div className="flex gap-4 mb-4">
        <input type="text" placeholder="Search..." className="input" value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} />
        <select className="input" value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
          <option value="">All Status</option>
          <option>Available</option><option>On Trip</option><option>In Shop</option><option>Retired</option>
        </select>
      </div>
      <DataTable columns={columns} data={vehicles} loading={loading} />
      {/* Pagination component */}
    </div>
  );
}