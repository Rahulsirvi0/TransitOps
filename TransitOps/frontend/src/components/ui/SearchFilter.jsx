import { Search, X } from 'lucide-react';

export default function SearchFilter({ searchTerm, onSearchChange, placeholder = 'Search...', filters, onFilterChange, filterOptions = [] }) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="input-field pl-10 pr-8"
        />
        {searchTerm && (
          <button onClick={() => onSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        )}
      </div>
      {filterOptions.map((filter) => (
        <select
          key={filter.key}
          value={filters?.[filter.key] || ''}
          onChange={(e) => onFilterChange(filter.key, e.target.value)}
          className="input-field w-auto min-w-[150px]"
        >
          <option value="">{filter.label || 'All'}</option>
          {filter.options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ))}
    </div>
  );
}