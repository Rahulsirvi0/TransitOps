export default function DataTable({ columns, data, loading }) {
  if (loading) return <div className="text-center py-10">Loading...</div>;
  return (
    <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
      <table className="min-w-full">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            {columns.map(col => <th key={col.key} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{col.label}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {data.length ? data.map((row, idx) => (
            <tr key={row.id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-600">
              {columns.map(col => (
                <td key={col.key} className="px-4 py-3 text-sm">{col.render ? col.render(row[col.key], row) : row[col.key]}</td>
              ))}
            </tr>
          )) : <tr><td colSpan={columns.length} className="text-center py-6 text-gray-500">No data found</td></tr>}
        </tbody>
      </table>
    </div>
  );
}