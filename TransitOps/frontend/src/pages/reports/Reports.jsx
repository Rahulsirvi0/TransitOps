import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import DataTable from '../../components/ui/DataTable';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { Download, FileText, BarChart3, TrendingUp, DollarSign, Wrench, Fuel } from 'lucide-react';

const REPORT_CONFIG = {
  'trip-summary': {
    title: 'Trip Summary',
    endpoint: '/reports/trip-summary',
    icon: FileText,
    filters: ['startDate', 'endDate', 'vehicle_id', 'driver_id', 'region_id', 'status'],
    columns: [
      { key: 'trip_number', label: 'Trip #' },
      { key: 'source', label: 'Source' },
      { key: 'destination', label: 'Destination' },
      { key: 'vehicle_name', label: 'Vehicle' },
      { key: 'driver_name', label: 'Driver' },
      { key: 'cargo_weight', label: 'Cargo (t)' },
      { key: 'revenue', label: 'Revenue', render: (val) => formatCurrency(val) },
      { key: 'status', label: 'Status', render: (val) => (
        <span className={`px-2 py-1 text-xs rounded ${getStatusColor('trip', val)}`}>{val}</span>
      )},
      { key: 'created_at', label: 'Date', render: (val) => formatDate(val) }
    ]
  },
  'expense-summary': {
    title: 'Expense Summary',
    endpoint: '/reports/expense-summary',
    icon: DollarSign,
    filters: ['startDate', 'endDate', 'vehicle_id', 'expense_type'],
    columns: [
      { key: 'vehicle_name', label: 'Vehicle' },
      { key: 'expense_type', label: 'Type' },
      { key: 'description', label: 'Description' },
      { key: 'cost', label: 'Cost', render: (val) => formatCurrency(val) },
      { key: 'expense_date', label: 'Date', render: (val) => formatDate(val) }
    ]
  },
  'fleet-utilization': {
    title: 'Fleet Utilization',
    endpoint: '/reports/fleet-utilization',
    icon: BarChart3,
    filters: ['startDate', 'endDate', 'region_id', 'vehicle_type'],
    columns: [
      { key: 'vehicle_name', label: 'Vehicle' },
      { key: 'total_trips', label: 'Trips' },
      { key: 'total_distance', label: 'Distance (km)' },
      { key: 'utilization_percent', label: 'Utilization %', render: (val) => `${val}%` }
    ]
  },
  'fuel-efficiency': {
    title: 'Fuel Efficiency',
    endpoint: '/reports/fuel-efficiency',
    icon: Fuel,
    filters: ['startDate', 'endDate', 'vehicle_id'],
    columns: [
      { key: 'vehicle_name', label: 'Vehicle' },
      { key: 'total_fuel', label: 'Fuel (L)' },
      { key: 'total_distance', label: 'Distance (km)' },
      { key: 'efficiency', label: 'Efficiency (km/L)', render: (val) => `${val} km/L` }
    ]
  },
  'vehicle-roi': {
    title: 'Vehicle ROI',
    endpoint: '/reports/vehicle-roi',
    icon: TrendingUp,
    filters: ['vehicle_id', 'startDate', 'endDate'],
    columns: [
      { key: 'vehicle_name', label: 'Vehicle' },
      { key: 'acquisition_cost', label: 'Acquisition Cost', render: (val) => formatCurrency(val) },
      { key: 'total_revenue', label: 'Total Revenue', render: (val) => formatCurrency(val) },
      { key: 'total_cost', label: 'Total Cost', render: (val) => formatCurrency(val) },
      { key: 'roi_percent', label: 'ROI %', render: (val) => `${val}%` }
    ]
  },
  'maintenance-cost': {
    title: 'Maintenance Cost',
    endpoint: '/reports/maintenance-cost',
    icon: Wrench,
    filters: ['startDate', 'endDate', 'vehicle_id'],
    columns: [
      { key: 'vehicle_name', label: 'Vehicle' },
      { key: 'maintenance_count', label: 'Records' },
      { key: 'total_cost', label: 'Total Cost', render: (val) => formatCurrency(val) }
    ]
  }
};

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState('trip-summary');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    vehicle_id: '',
    driver_id: '',
    region_id: '',
    status: '',
    expense_type: '',
    vehicle_type: ''
  });
  const [format, setFormat] = useState('json');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [regions, setRegions] = useState([]);

  const config = REPORT_CONFIG[selectedReport];

  // Load filter options
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [vRes, dRes, rRes] = await Promise.all([
          api.get('/vehicles', { params: { limit: 200 } }),
          api.get('/drivers', { params: { limit: 200 } }),
          api.get('/regions', { params: { limit: 100 } }) // you may add a regions endpoint
        ]);
        setVehicles(vRes.data.data.data || []);
        setDrivers(dRes.data.data.data || []);
        setRegions(rRes.data?.data?.data || []);
      } catch (err) {
        // Regions endpoint may not exist; ignore
      }
    };
    loadOptions();
  }, []);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      config.filters.forEach(f => {
        if (filters[f]) params[f] = filters[f];
      });
      if (format === 'json') {
        const res = await api.get(config.endpoint, { params });
        setData(res.data.data || []);
      } else {
        const res = await api.get(config.endpoint, {
          params: { ...params, format },
          responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${selectedReport}-${new Date().toISOString().slice(0,10)}.${format}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success(`${config.title} ${format.toUpperCase()} downloaded`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  }, [selectedReport, filters, format, config]);

  useEffect(() => {
    if (format === 'json') fetchReport();
  }, [selectedReport, filters, format]); // re-fetch on filter change for JSON view

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleExport = () => {
    if (format === 'json') {
      // If JSON, switch to CSV and download
      setFormat('csv');
      // Wait for state update then fetch
      setTimeout(() => fetchReport(), 100);
    } else {
      fetchReport();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Reports</h1>
        <div className="flex gap-3">
          <select
            value={selectedReport}
            onChange={(e) => {
              setSelectedReport(e.target.value);
              setFilters({ startDate: '', endDate: '', vehicle_id: '', driver_id: '', region_id: '', status: '', expense_type: '', vehicle_type: '' });
              setData([]);
            }}
            className="input-field min-w-[200px]"
          >
            {Object.entries(REPORT_CONFIG).map(([key, rep]) => (
              <option key={key} value={key}>{rep.title}</option>
            ))}
          </select>
          <select value={format} onChange={(e) => setFormat(e.target.value)} className="input-field w-24">
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
            <option value="pdf">PDF</option>
          </select>
          <button onClick={handleExport} className="btn-primary flex items-center gap-2">
            <Download size={18} /> Export {format.toUpperCase()}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex flex-wrap gap-4">
        {config.filters.includes('startDate') && (
          <div>
            <label className="block text-xs mb-1">From</label>
            <input type="date" value={filters.startDate} onChange={e => handleFilterChange('startDate', e.target.value)} className="input-field" />
          </div>
        )}
        {config.filters.includes('endDate') && (
          <div>
            <label className="block text-xs mb-1">To</label>
            <input type="date" value={filters.endDate} onChange={e => handleFilterChange('endDate', e.target.value)} className="input-field" />
          </div>
        )}
        {config.filters.includes('vehicle_id') && (
          <div>
            <label className="block text-xs mb-1">Vehicle</label>
            <select value={filters.vehicle_id} onChange={e => handleFilterChange('vehicle_id', e.target.value)} className="input-field">
              <option value="">All</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.registration_number}</option>)}
            </select>
          </div>
        )}
        {config.filters.includes('driver_id') && (
          <div>
            <label className="block text-xs mb-1">Driver</label>
            <select value={filters.driver_id} onChange={e => handleFilterChange('driver_id', e.target.value)} className="input-field">
              <option value="">All</option>
              {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        )}
        {config.filters.includes('region_id') && (
          <div>
            <label className="block text-xs mb-1">Region</label>
            <select value={filters.region_id} onChange={e => handleFilterChange('region_id', e.target.value)} className="input-field">
              <option value="">All</option>
              {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
        )}
        {config.filters.includes('status') && (
          <div>
            <label className="block text-xs mb-1">Status</label>
            <select value={filters.status} onChange={e => handleFilterChange('status', e.target.value)} className="input-field">
              <option value="">All</option>
              <option value="Draft">Draft</option>
              <option value="Dispatched">Dispatched</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        )}
        {config.filters.includes('expense_type') && (
          <div>
            <label className="block text-xs mb-1">Expense Type</label>
            <select value={filters.expense_type} onChange={e => handleFilterChange('expense_type', e.target.value)} className="input-field">
              <option value="">All</option>
              <option value="Fuel">Fuel</option>
              <option value="Repair">Repair</option>
              <option value="Toll">Toll</option>
              <option value="Insurance">Insurance</option>
              <option value="Miscellaneous">Miscellaneous</option>
            </select>
          </div>
        )}
        {config.filters.includes('vehicle_type') && (
          <div>
            <label className="block text-xs mb-1">Vehicle Type</label>
            <select value={filters.vehicle_type} onChange={e => handleFilterChange('vehicle_type', e.target.value)} className="input-field">
              <option value="">All</option>
              <option value="Truck">Truck</option>
              <option value="Van">Van</option>
              <option value="Bus">Bus</option>
              <option value="Trailer">Trailer</option>
              <option value="Pickup">Pickup</option>
            </select>
          </div>
        )}
      </div>

      {/* Report Data */}
      {format === 'json' && (
        loading ? <Spinner className="py-10" /> :
        data.length === 0 ? <EmptyState title="No data for selected filters" /> :
        <DataTable columns={config.columns} data={data} />
      )}
    </div>
  );
}