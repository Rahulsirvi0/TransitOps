import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function BarChart({ data, options: customOptions, height = 300, horizontal = false }) {
  const defaultOptions = {
    indexAxis: horizontal ? 'y' : 'x',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true } },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      x: { grid: { display: !horizontal }, beginAtZero: true },
      y: { grid: { display: horizontal }, beginAtZero: true }
    },
    ...customOptions
  };

  return (
    <div style={{ height }}>
      <Bar data={data} options={defaultOptions} />
    </div>
  );
}