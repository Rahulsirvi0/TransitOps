import { PackageOpen } from 'lucide-react';

export default function EmptyState({ icon: Icon = PackageOpen, title = 'No data found', description = '', action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}