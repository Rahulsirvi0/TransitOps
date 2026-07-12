export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const ROLES = {
  ADMIN: 'admin',
  FLEET_MANAGER: 'fleet_manager',
  DRIVER: 'driver',
  SAFETY_OFFICER: 'safety_officer',
  FINANCIAL_ANALYST: 'financial_analyst',
};

export const VEHICLE_STATUSES = ['Available', 'On Trip', 'In Shop', 'Retired'];
export const VEHICLE_TYPES = ['Truck', 'Van', 'Bus', 'Trailer', 'Pickup'];

export const DRIVER_STATUSES = ['Available', 'On Trip', 'Off Duty', 'Suspended'];
export const LICENSE_CATEGORIES = ['A', 'B', 'C', 'D', 'E'];

export const TRIP_STATUSES = ['Draft', 'Dispatched', 'Completed', 'Cancelled'];

export const MAINTENANCE_STATUSES = ['Open', 'In Progress', 'Completed'];

export const EXPENSE_TYPES = ['Fuel', 'Repair', 'Toll', 'Insurance', 'Miscellaneous'];

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
};

export const CHART_COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  gray: '#6b7280',
};

export const STATUS_COLORS = {
  vehicle: {
    Available: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'On Trip': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'In Shop': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    Retired: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
  driver: {
    Available: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'On Trip': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'Off Duty': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    Suspended: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
  trip: {
    Draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    Dispatched: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    Completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    Cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
  maintenance: {
    Open: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    'In Progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    Completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
};

export const DATE_FORMAT = 'yyyy-MM-dd';
export const DATE_DISPLAY_FORMAT = 'MMM dd, yyyy';
export const TIME_FORMAT = 'HH:mm';
export const CURRENCY_SYMBOL = '₹'; // change as needed
export const WEIGHT_UNIT = 't';
export const DISTANCE_UNIT = 'km';