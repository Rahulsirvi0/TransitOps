const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/response');
const trips = require('../data/trips');
const vehicles = require('../data/vehicles');
const drivers = require('../data/drivers');
const { nextId, paginate, sortRecords, matchesSearch, matchesAny, withinDateRange, toNumber, nowIso, findById, updateById, deleteById } = require('../config/db');

const getVehicle = (vehicleId) => findById(vehicles, vehicleId);
const getDriver = (driverId) => findById(drivers, driverId);

const enrichTrip = (trip) => {
  const vehicle = getVehicle(trip.vehicle_id);
  const driver = getDriver(trip.driver_id);
  return {
    ...trip,
    vehicle_name: vehicle?.name || vehicle?.registration_number || 'Unknown vehicle',
    driver_name: driver?.name || 'Unknown driver',
    region_id: vehicle?.region_id || null,
    region_name: vehicle?.region_name || null,
  };
};

exports.list = catchAsync(async (req, res) => {
  const { page, limit, search, status, vehicle_id, driver_id, startDate, endDate, sortBy, order } = req.query;
  const filtered = trips
    .filter((trip) => matchesSearch(enrichTrip(trip), search, ['trip_number', 'source', 'destination', 'status', 'vehicle_name', 'driver_name']))
    .filter((trip) => matchesAny(trip.status, status))
    .filter((trip) => !vehicle_id || String(trip.vehicle_id) === String(vehicle_id))
    .filter((trip) => !driver_id || String(trip.driver_id) === String(driver_id))
    .filter((trip) => withinDateRange(trip.created_at, startDate, endDate));

  successResponse(res, paginate(sortRecords(filtered.map(enrichTrip), sortBy || 'created_at', order || 'desc'), page, limit));
});

exports.getById = catchAsync(async (req, res) => {
  const trip = findById(trips, req.params.id);
  if (!trip) throw new AppError('Trip not found', 404);
  successResponse(res, enrichTrip(trip));
});

exports.create = catchAsync(async (req, res) => {
  const { trip_number, vehicle_id, driver_id, cargo_weight } = req.body;
  if (!trip_number) throw new AppError('Trip number required', 400);
  if (trips.some((trip) => trip.trip_number.toLowerCase() === String(trip_number).trim().toLowerCase())) {
    throw new AppError('Trip number already exists', 400);
  }

  const vehicle = getVehicle(vehicle_id);
  if (!vehicle) throw new AppError('Vehicle not found', 404);
  if (vehicle.status === 'Retired' || vehicle.status === 'In Shop') throw new AppError('Vehicle not available (retired/in shop)', 400);
  if (vehicle.status === 'On Trip') throw new AppError('Vehicle already on a trip', 400);
  if (toNumber(cargo_weight) > toNumber(vehicle.max_load_capacity)) throw new AppError('Cargo weight exceeds vehicle capacity', 400);

  const driver = getDriver(driver_id);
  if (!driver) throw new AppError('Driver not found', 404);
  if (driver.status === 'Suspended') throw new AppError('Driver is suspended', 400);
  if (driver.status === 'On Trip') throw new AppError('Driver already on a trip', 400);
  if (new Date(driver.license_expiry) < new Date()) throw new AppError('Driver license expired', 400);

  const now = nowIso();
  const trip = {
    id: nextId(trips),
    trip_number: String(trip_number).trim(),
    source: String(req.body.source || '').trim(),
    destination: String(req.body.destination || '').trim(),
    vehicle_id: toNumber(vehicle_id),
    driver_id: toNumber(driver_id),
    cargo_weight: toNumber(cargo_weight),
    planned_distance: toNumber(req.body.planned_distance),
    actual_distance: toNumber(req.body.actual_distance),
    revenue: toNumber(req.body.revenue),
    status: 'Draft',
    dispatched_at: null,
    completed_at: null,
    created_at: now,
    updated_at: now,
  };

  trips.unshift(trip);
  successResponse(res, { id: trip.id }, 'Trip created', 201);
});

exports.update = catchAsync(async (req, res) => {
  const trip = findById(trips, req.params.id);
  if (!trip) throw new AppError('Trip not found', 404);
  if (trip.status !== 'Draft') throw new AppError('Only draft trips can be edited', 400);

  if (req.body.trip_number && req.body.trip_number !== trip.trip_number) {
    const duplicate = trips.find((item) => item.trip_number.toLowerCase() === String(req.body.trip_number).trim().toLowerCase());
    if (duplicate) throw new AppError('Trip number already exists', 400);
  }

  const nextVehicleId = req.body.vehicle_id !== undefined ? toNumber(req.body.vehicle_id) : trip.vehicle_id;
  const nextDriverId = req.body.driver_id !== undefined ? toNumber(req.body.driver_id) : trip.driver_id;
  const vehicle = getVehicle(nextVehicleId);
  const driver = getDriver(nextDriverId);
  if (!vehicle) throw new AppError('Vehicle not found', 404);
  if (vehicle.status === 'Retired' || vehicle.status === 'In Shop') throw new AppError('Vehicle not available (retired/in shop)', 400);
  if (vehicle.status === 'On Trip') throw new AppError('Vehicle already on a trip', 400);
  if (!driver) throw new AppError('Driver not found', 404);
  if (driver.status === 'Suspended') throw new AppError('Driver is suspended', 400);
  if (driver.status === 'On Trip') throw new AppError('Driver already on a trip', 400);
  if (new Date(driver.license_expiry) < new Date()) throw new AppError('Driver license expired', 400);
  if (toNumber(req.body.cargo_weight, trip.cargo_weight) > toNumber(vehicle.max_load_capacity)) throw new AppError('Cargo weight exceeds vehicle capacity', 400);

  updateById(trips, req.params.id, (record) => {
    if (req.body.trip_number != null) record.trip_number = String(req.body.trip_number).trim();
    if (req.body.source != null) record.source = String(req.body.source).trim();
    if (req.body.destination != null) record.destination = String(req.body.destination).trim();
    if (req.body.vehicle_id != null) record.vehicle_id = nextVehicleId;
    if (req.body.driver_id != null) record.driver_id = nextDriverId;
    if (req.body.cargo_weight != null) record.cargo_weight = toNumber(req.body.cargo_weight, record.cargo_weight);
    if (req.body.planned_distance != null) record.planned_distance = toNumber(req.body.planned_distance, record.planned_distance);
    if (req.body.actual_distance != null) record.actual_distance = toNumber(req.body.actual_distance, record.actual_distance);
    if (req.body.revenue != null) record.revenue = toNumber(req.body.revenue, record.revenue);
  });
  successResponse(res, null, 'Trip updated');
});

exports.delete = catchAsync(async (req, res) => {
  const trip = findById(trips, req.params.id);
  if (!trip) throw new AppError('Trip not found', 404);
  if (trip.status !== 'Draft') throw new AppError('Only draft trips can be deleted', 400);
  deleteById(trips, req.params.id);
  successResponse(res, null, 'Trip deleted');
});

exports.dispatch = catchAsync(async (req, res) => {
  const trip = findById(trips, req.params.id);
  if (!trip) throw new AppError('Trip not found', 404);
  if (trip.status !== 'Draft') throw new AppError('Trip not in Draft status', 400);
  const vehicle = getVehicle(trip.vehicle_id);
  const driver = getDriver(trip.driver_id);
  if (vehicle.status !== 'Available' || vehicle.status === 'Retired') throw new AppError('Vehicle not available', 400);
  if (driver.status !== 'Available') throw new AppError('Driver not available', 400);
  if (new Date(driver.license_expiry) < new Date()) throw new AppError('Driver license expired', 400);
  if (trip.cargo_weight > vehicle.max_load_capacity) throw new AppError('Cargo weight exceeds vehicle capacity', 400);

  vehicle.status = 'On Trip';
  vehicle.updated_at = nowIso();
  driver.status = 'On Trip';
  driver.updated_at = nowIso();
  updateById(trips, trip.id, (record) => {
    record.status = 'Dispatched';
    record.dispatched_at = nowIso();
  });
  successResponse(res, null, 'Trip dispatched');
});

exports.complete = catchAsync(async (req, res) => {
  const trip = findById(trips, req.params.id);
  if (!trip) throw new AppError('Trip not found', 404);
  if (trip.status !== 'Dispatched') throw new AppError('Only dispatched trips can be completed', 400);
  const { actual_distance, revenue } = req.body;
  if (actual_distance === undefined || revenue === undefined) throw new AppError('Actual distance and revenue required', 400);

  const vehicle = getVehicle(trip.vehicle_id);
  const driver = getDriver(trip.driver_id);
  if (vehicle) {
    vehicle.status = 'Available';
    vehicle.updated_at = nowIso();
  }
  if (driver) {
    driver.status = 'Available';
    driver.updated_at = nowIso();
  }
  updateById(trips, trip.id, (record) => {
    record.status = 'Completed';
    record.actual_distance = toNumber(actual_distance, record.actual_distance);
    record.revenue = toNumber(revenue, record.revenue);
    record.completed_at = nowIso();
  });
  successResponse(res, null, 'Trip completed');
});

exports.cancel = catchAsync(async (req, res) => {
  const trip = findById(trips, req.params.id);
  if (!trip) throw new AppError('Trip not found', 404);
  if (trip.status === 'Completed') throw new AppError('Cannot cancel completed trip', 400);
  if (trip.status === 'Dispatched') {
    const vehicle = getVehicle(trip.vehicle_id);
    const driver = getDriver(trip.driver_id);
    if (vehicle) vehicle.status = 'Available';
    if (driver) driver.status = 'Available';
  }
  updateById(trips, trip.id, (record) => {
    record.status = 'Cancelled';
  });
  successResponse(res, null, 'Trip cancelled');
});