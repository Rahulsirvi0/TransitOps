import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function Dashboard() {
  const [kpis, setKpis] = useState({});
  const [charts, setCharts] = useState({ tripsPerMonth: [], vehicleStatus: [], fuelCost: [], maintenanceCost: [] });

  useEffect(() => {
    api.get('/dashboard/kpis').then(res => setKpis(res.data.data));
    api.get('/dashboard/charts').then(res => setCharts(res.data.data));
  }, []);

  const tripsLineData = {
    labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    datasets: [{ label: 'Trips', data: Array(12).fill(0).map((_, i) => charts.tripsPerMonth?.find(m => m.month === i+1)?.count || 0), borderColor: '#3b82f6' }]
  };

  const vehicleStatusData = {
    labels: charts.vehicleStatus?.map(s => s.status),
    datasets: [{ data: charts.vehicleStatus?.map(s => s.count), backgroundColor: ['#10b981','#3b82f6','#f59e0b','#ef4444'] }]
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Fleet Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard title="Active Vehicles" value={kpis.activeTrips} icon="🚛" />
        <KpiCard title="Available" value={kpis.availableVehicles} />
        <KpiCard title="In Maintenance" value={kpis.inMaintenance} />
        <KpiCard title="Fleet Utilization" value={`${kpis.fleetUtilization}%`} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"><Line data={tripsLineData} /></div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"><Doughnut data={vehicleStatusData} /></div>
      </div>
    </div>
  );
}

function KpiCard({ title, value }) {
  return <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"><p className="text-sm text-gray-500">{title}</p><p className="text-2xl font-bold">{value}</p></div>;
}