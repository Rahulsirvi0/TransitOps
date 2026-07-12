export default function Spinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`${sizes[size]} animate-spin rounded-full border-2 border-gray-200 border-t-primary-600 dark:border-gray-600 dark:border-t-primary-400`}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}