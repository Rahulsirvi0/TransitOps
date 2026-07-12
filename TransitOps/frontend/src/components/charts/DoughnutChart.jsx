import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DoughnutChart({ data, options: customOptions, height = 250, cutout = '70%' }) {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout,
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } },
      tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.parsed}%` } }
    },
    ...customOptions
  };

  return (
    <div style={{ height }}>
      <Doughnut data={data} options={defaultOptions} />
    </div>
  );
}