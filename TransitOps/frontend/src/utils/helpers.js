import { CURRENCY_SYMBOL, WEIGHT_UNIT, DISTANCE_UNIT, STATUS_COLORS } from './constants';

/**
 * Format a number as currency string.
 * @param {number} amount 
 * @param {string} symbol - currency symbol (default ₹)
 * @returns {string}
 */
export function formatCurrency(amount, symbol = CURRENCY_SYMBOL) {
  if (amount == null || isNaN(amount)) return `${symbol}0.00`;
  return `${symbol}${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format a number as weight with unit.
 * @param {number} weight 
 * @returns {string}
 */
export function formatWeight(weight) {
  if (weight == null || isNaN(weight)) return `0 ${WEIGHT_UNIT}`;
  return `${Number(weight).toFixed(2)} ${WEIGHT_UNIT}`;
}

/**
 * Format a number as distance with unit.
 * @param {number} distance 
 * @returns {string}
 */
export function formatDistance(distance) {
  if (distance == null || isNaN(distance)) return `0 ${DISTANCE_UNIT}`;
  return `${Number(distance).toFixed(1)} ${DISTANCE_UNIT}`;
}

/**
 * Format a date string to a human-readable format.
 * @param {string} dateString - ISO date string or YYYY-MM-DD
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string}
 */
export function formatDate(dateString, options = {}) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
}

/**
 * Format a date to YYYY-MM-DD for input fields.
 * @param {string|Date} date 
 * @returns {string}
 */
export function toInputDateValue(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}

/**
 * Get CSS class for a status badge based on entity type.
 * @param {'vehicle'|'driver'|'trip'|'maintenance'} entity 
 * @param {string} status 
 * @returns {string} Tailwind CSS classes
 */
export function getStatusColor(entity, status) {
  const colors = STATUS_COLORS[entity];
  return colors?.[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
}

/**
 * Get a human-readable label for a status value (e.g., "In Shop" -> "In Shop").
 * @param {string} status 
 * @returns {string}
 */
export function getStatusLabel(status) {
  return status?.replace(/_/g, ' ') || '';
}

/**
 * Debounce a function call.
 * @param {Function} func 
 * @param {number} delay in ms 
 * @returns {Function} debounced function
 */
export function debounce(func, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Conditionally join class names.
 * @param  {...string} classes 
 * @returns {string}
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Truncate a string to a max length with ellipsis.
 * @param {string} str 
 * @param {number} maxLength 
 * @returns {string}
 */
export function truncate(str, maxLength = 30) {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

/**
 * Calculate fuel efficiency (km per liter).
 * @param {number} distance - in km
 * @param {number} fuelLiters 
 * @returns {string} formatted efficiency
 */
export function calculateFuelEfficiency(distance, fuelLiters) {
  if (!fuelLiters || fuelLiters === 0) return '0 km/L';
  return `${(distance / fuelLiters).toFixed(2)} km/L`;
}

/**
 * Determine if a license is expired.
 * @param {string} expiryDate - date string
 * @returns {boolean}
 */
export function isLicenseExpired(expiryDate) {
  if (!expiryDate) return true;
  return new Date(expiryDate) < new Date();
}

/**
 * Get initials from a full name.
 * @param {string} name 
 * @returns {string}
 */
export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}