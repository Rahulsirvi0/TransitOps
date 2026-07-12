import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="btn-secondary text-sm">Previous</button>
        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="btn-secondary text-sm">Next</button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
        </p>
        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
          <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:ring-gray-600 dark:hover:bg-gray-700 disabled:opacity-50">
            <ChevronLeft size={18} />
          </button>
          {start > 1 && (
            <>
              <button onClick={() => onPageChange(1)} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:text-gray-100 dark:ring-gray-600 dark:hover:bg-gray-700">1</button>
              {start > 2 && <span className="relative inline-flex items-center px-4 py-2 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 dark:text-gray-300 dark:ring-gray-600">...</span>}
            </>
          )}
          {pages.map(page => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 dark:ring-gray-600 ${
                page === currentPage
                  ? 'bg-primary-600 text-white ring-primary-600'
                  : 'text-gray-900 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {page}
            </button>
          ))}
          {end < totalPages && (
            <>
              {end < totalPages - 1 && <span className="relative inline-flex items-center px-4 py-2 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 dark:text-gray-300 dark:ring-gray-600">...</span>}
              <button onClick={() => onPageChange(totalPages)} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:text-gray-100 dark:ring-gray-600 dark:hover:bg-gray-700">{totalPages}</button>
            </>
          )}
          <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:ring-gray-600 dark:hover:bg-gray-700 disabled:opacity-50">
            <ChevronRight size={18} />
          </button>
        </nav>
      </div>
    </div>
  );
}