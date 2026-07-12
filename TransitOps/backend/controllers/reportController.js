
const catchAsync = require('../utils/catchAsync');
const { successResponse } = require('../utils/response');
const trips = require('../data/trips');
const vehicles = require('../data/vehicles');
const drivers = require('../data/drivers');
const maintenance = require('../data/maintenance');
const fuel = require('../data/fuel');
const expenses = require('../data/expenses');
const { matchesSearch, matchesAny, withinDateRange, toNumber } = require('../config/db');

const formatMoney = (value) => Number(value || 0);

const getVehicle = (vehicleId) => vehicles.find((vehicle) => String(vehicle.id) === String(vehicleId));
const getDriver = (driverId) => drivers.find((driver) => String(driver.id) === String(driverId));

const enrichTrip = (trip) => {
  const vehicle = getVehicle(trip.vehicle_id);
  const driver = getDriver(trip.driver_id);
  return {
    ...trip,
    vehicle_name: vehicle?.name || vehicle?.registration_number || 'Unknown vehicle',
    driver_name: driver?.name || 'Unknown driver',
    region_id: vehicle?.region_id || null,
  };
};

const respondWithFormat = (req, res, filenameBase, rows) => {
  const format = String(req.query.format || 'json').toLowerCase();
  if (format === 'csv') {
    const { Parser } = require('json2csv');
    const parser = new Parser();
    const csv = parser.parse(rows);
    res.header('Content-Type', 'text/csv');
    res.attachment(`${filenameBase}.csv`);
    return res.send(csv);
  }

  if (format === 'pdf') {
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filenameBase}.pdf`);
    doc.pipe(res);
    doc.fontSize(16).text(filenameBase.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()), { align: 'center' });
    doc.moveDown();
    rows.forEach((row) => {
      doc.fontSize(10).text(JSON.stringify(row));
    });
    doc.end();
    return null;
  }

  return successResponse(res, rows);
};

exports.tripSummary = catchAsync(async (req, res) => {
  const { startDate, endDate, vehicle_id, driver_id, region_id, status } = req.query;
  const rows = trips
    .map(enrichTrip)
    .filter((trip) => matchesSearch(trip, req.query.search, ['trip_number', 'source', 'destination', 'vehicle_name', 'driver_name', 'status']))
    .filter((trip) => !startDate || withinDateRange(trip.created_at, startDate, endDate || startDate))
    .filter((trip) => !endDate || withinDateRange(trip.created_at, startDate || endDate, endDate))
    .filter((trip) => !vehicle_id || String(trip.vehicle_id) === String(vehicle_id))
    .filter((trip) => !driver_id || String(trip.driver_id) === String(driver_id))
    .filter((trip) => !region_id || String(trip.region_id) === String(region_id))
    .filter((trip) => matchesAny(trip.status, status));

  respondWithFormat(req, res, 'trip_summary', rows);
});

exports.expenseSummary = catchAsync(async (req, res) => {
  const { startDate, endDate, vehicle_id, expense_type } = req.query;
  const rows = expenses
    .map((expense) => ({
      ...expense,
      vehicle_name: getVehicle(expense.vehicle_id)?.name || 'Unknown vehicle',
    }))
    .filter((expense) => matchesSearch(expense, req.query.search, ['vehicle_name', 'expense_type', 'description']))
    .filter((expense) => !startDate || withinDateRange(expense.expense_date, startDate, endDate || startDate))
    .filter((expense) => !endDate || withinDateRange(expense.expense_date, startDate || endDate, endDate))
    .filter((expense) => !vehicle_id || String(expense.vehicle_id) === String(vehicle_id))
    .filter((expense) => !expense_type || String(expense.expense_type) === String(expense_type));

  respondWithFormat(req, res, 'expense_summary', rows);
});

exports.fleetUtilization = catchAsync(async (req, res) => {
  const { startDate, endDate, region_id, vehicle_type } = req.query;
  const relevantTrips = trips.filter((trip) => trip.status === 'Completed' && withinDateRange(trip.completed_at || trip.created_at, startDate, endDate));
  const rows = vehicles
    .filter((vehicle) => !region_id || String(vehicle.region_id) === String(region_id))
    .filter((vehicle) => !vehicle_type || String(vehicle.vehicle_type) === String(vehicle_type))
    .map((vehicle) => {
      const vehicleTrips = relevantTrips.filter((trip) => String(trip.vehicle_id) === String(vehicle.id));
      const total_trips = vehicleTrips.length;
      const total_distance = vehicleTrips.reduce((sum, trip) => sum + toNumber(trip.actual_distance || trip.planned_distance), 0);
      return {
        vehicle_name: vehicle.name || vehicle.registration_number,
        total_trips,
        total_distance,
        utilization_percent: relevantTrips.length ? Number(((total_trips / relevantTrips.length) * 100).toFixed(1)) : 0,
      };
    });

  respondWithFormat(req, res, 'fleet_utilization', rows);
});

exports.fuelEfficiency = catchAsync(async (req, res) => {
  const { startDate, endDate, vehicle_id } = req.query;
  const rows = vehicles
    .filter((vehicle) => !vehicle_id || String(vehicle.id) === String(vehicle_id))
    .map((vehicle) => {
      const fuelRows = fuel.filter((entry) => String(entry.vehicle_id) === String(vehicle.id) && withinDateRange(entry.log_date, startDate, endDate));
      const tripRows = trips.filter((trip) => String(trip.vehicle_id) === String(vehicle.id) && trip.status === 'Completed' && withinDateRange(trip.completed_at || trip.created_at, startDate, endDate));
      const total_fuel = fuelRows.reduce((sum, entry) => sum + toNumber(entry.fuel_liters), 0);
      const total_distance = tripRows.reduce((sum, trip) => sum + toNumber(trip.actual_distance || trip.planned_distance), 0);
      return {
        vehicle_name: vehicle.name || vehicle.registration_number,
        total_fuel,
        total_distance,
        efficiency: total_fuel ? Number((total_distance / total_fuel).toFixed(2)) : 0,
      };
    });

  respondWithFormat(req, res, 'fuel_efficiency', rows);
});

exports.vehicleROI = catchAsync(async (req, res) => {
  const { vehicle_id, startDate, endDate } = req.query;
  const rows = vehicles
    .filter((vehicle) => !vehicle_id || String(vehicle.id) === String(vehicle_id))
    .map((vehicle) => {
      const tripRevenue = trips
        .filter((trip) => String(trip.vehicle_id) === String(vehicle.id) && trip.status === 'Completed' && withinDateRange(trip.completed_at || trip.created_at, startDate, endDate))
        .reduce((sum, trip) => sum + toNumber(trip.revenue), 0);

      const fuelCost = fuel
        .filter((entry) => String(entry.vehicle_id) === String(vehicle.id) && withinDateRange(entry.log_date, startDate, endDate))
        .reduce((sum, entry) => sum + toNumber(entry.fuel_cost), 0);

      const maintenanceCost = maintenance
        .filter((entry) => String(entry.vehicle_id) === String(vehicle.id) && withinDateRange(entry.maintenance_date, startDate, endDate))
        .reduce((sum, entry) => sum + toNumber(entry.cost), 0);

      const expenseCost = expenses
        .filter((entry) => String(entry.vehicle_id) === String(vehicle.id) && withinDateRange(entry.expense_date, startDate, endDate))
        .reduce((sum, entry) => sum + toNumber(entry.cost), 0);

      const total_cost = fuelCost + maintenanceCost + expenseCost;
      const roi_percent = vehicle.acquisition_cost ? Number((((tripRevenue - total_cost) / vehicle.acquisition_cost) * 100).toFixed(1)) : 0;

      return {
        vehicle_name: vehicle.name || vehicle.registration_number,
        acquisition_cost: formatMoney(vehicle.acquisition_cost),
        total_revenue: tripRevenue,
        total_cost,
        roi_percent,
      };
    });

  respondWithFormat(req, res, 'vehicle_roi', rows);
});

exports.maintenanceCost = catchAsync(async (req, res) => {
  const { startDate, endDate, vehicle_id } = req.query;
  const rows = vehicles
    .filter((vehicle) => !vehicle_id || String(vehicle.id) === String(vehicle_id))
    .map((vehicle) => {
      const vehicleMaintenance = maintenance.filter((entry) => String(entry.vehicle_id) === String(vehicle.id) && withinDateRange(entry.maintenance_date, startDate, endDate));
      return {
        vehicle_name: vehicle.name || vehicle.registration_number,
        maintenance_count: vehicleMaintenance.length,
        total_cost: vehicleMaintenance.reduce((sum, entry) => sum + toNumber(entry.cost), 0),
      };
    });

  respondWithFormat(req, res, 'maintenance_cost', rows);
});