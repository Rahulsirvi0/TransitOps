const catchAsync = require('../utils/catchAsync');
const { successResponse } = require('../utils/response');
const vehicles = require('../data/vehicles');
const drivers = require('../data/drivers');
const trips = require('../data/trips');
const maintenance = require('../data/maintenance');
const fuel = require('../data/fuel');
const expenses = require('../data/expenses');
const { matchesAny, nowIso, sumBy } = require('../config/db');

const getVehicleName = (vehicleId) => vehicles.find((vehicle) => String(vehicle.id) === String(vehicleId))?.name || 'Unknown vehicle';
const getDriverName = (driverId) => drivers.find((driver) => String(driver.id) === String(driverId))?.name || 'Unknown driver';

const monthBuckets = (year, items, dateField, aggregateField) => {
  return Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const total = items.reduce((runningTotal, item) => {
      const itemDate = new Date(item[dateField]);
      if (Number.isNaN(itemDate.getTime()) || itemDate.getFullYear() !== year || itemDate.getMonth() + 1 !== month) {
        return runningTotal;
      }
      return runningTotal + Number(item[aggregateField] || 0);
    }, 0);
    return aggregateField === 'count' ? { month, count: total } : { month, total };
  });
};

exports.getKPIs = catchAsync(async (req, res) => {
  const activeTrips = trips.filter((trip) => trip.status === 'Dispatched').length;
  const availableVehicles = vehicles.filter((vehicle) => vehicle.status === 'Available').length;
  const inMaintenance = vehicles.filter((vehicle) => vehicle.status === 'In Shop').length;
  const driversOnDuty = drivers.filter((driver) => driver.status === 'On Trip').length;
  const fleetUtilization = vehicles.length
    ? Number(((vehicles.filter((vehicle) => vehicle.status === 'On Trip').length / vehicles.length) * 100).toFixed(1))
    : 0;

  const recentTrips = [...trips]
    .sort((left, right) => new Date(right.created_at) - new Date(left.created_at))
    .slice(0, 5)
    .map((trip) => ({
      ...trip,
      vehicle_name: getVehicleName(trip.vehicle_id),
      driver_name: getDriverName(trip.driver_id),
    }));

  const recentExpenses = [...expenses]
    .sort((left, right) => new Date(right.created_at) - new Date(left.created_at))
    .slice(0, 5)
    .map((expense) => ({
      ...expense,
      vehicle_name: getVehicleName(expense.vehicle_id),
    }));

  const recentMaintenance = [...maintenance]
    .sort((left, right) => new Date(right.created_at) - new Date(left.created_at))
    .slice(0, 5)
    .map((item) => ({
      ...item,
      vehicle_name: getVehicleName(item.vehicle_id),
    }));

  successResponse(res, {
    activeTrips,
    availableVehicles,
    inMaintenance,
    driversOnDuty,
    totalDrivers: drivers.length,
    fuelLogs: fuel.length,
    maintenance: maintenance.length,
    expenses: expenses.length,
    fleetUtilization,
    recentTrips,
    recentExpenses,
    recentMaintenance,
  });
});

exports.getCharts = catchAsync(async (req, res) => {
  const yearFilter = Number(req.query.year) || new Date().getFullYear();

  const tripsPerMonth = Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const count = trips.filter((trip) => {
      const date = new Date(trip.created_at);
      return date.getFullYear() === yearFilter && date.getMonth() + 1 === month && trip.status === 'Completed';
    }).length;
    return { month, count };
  });

  const vehicleStatus = Object.entries(
    vehicles.reduce((groups, vehicle) => {
      groups[vehicle.status] = (groups[vehicle.status] || 0) + 1;
      return groups;
    }, {})
  ).map(([status, count]) => ({ status, count }));

  const fuelCost = Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const total = fuel.reduce((runningTotal, item) => {
      const date = new Date(item.log_date);
      return date.getFullYear() === yearFilter && date.getMonth() + 1 === month ? runningTotal + Number(item.fuel_cost || 0) : runningTotal;
    }, 0);
    return { month, total };
  });

  const maintenanceCost = Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const total = maintenance.reduce((runningTotal, item) => {
      const date = new Date(item.maintenance_date);
      return date.getFullYear() === yearFilter && date.getMonth() + 1 === month ? runningTotal + Number(item.cost || 0) : runningTotal;
    }, 0);
    return { month, total };
  });

  successResponse(res, { tripsPerMonth, vehicleStatus, fuelCost, maintenanceCost });
});