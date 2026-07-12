const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/response');
const fuel = require('../data/fuel');
const vehicles = require('../data/vehicles');
const trips = require('../data/trips');
const { nextId, paginate, sortRecords, matchesSearch, matchesAny, withinDateRange, toNumber, nowIso, findById, updateById, deleteById } = require('../config/db');

const getVehicle = (vehicleId) => findById(vehicles, vehicleId);
const getTrip = (tripId) => findById(trips, tripId);

const enrichFuel = (record) => ({
  ...record,
  vehicle_name: getVehicle(record.vehicle_id)?.name || 'Unknown vehicle',
  trip_number: record.trip_id ? getTrip(record.trip_id)?.trip_number || null : null,
});

exports.list = catchAsync(async (req, res) => {
  const { page, limit, vehicle_id, trip_id, startDate, endDate, search, sortBy, order } = req.query;
  const filtered = fuel
    .map(enrichFuel)
    .filter((record) => matchesSearch(record, search, ['vehicle_name', 'trip_number']))
    .filter((record) => !vehicle_id || String(record.vehicle_id) === String(vehicle_id))
    .filter((record) => !trip_id || String(record.trip_id) === String(trip_id))
    .filter((record) => withinDateRange(record.log_date, startDate, endDate));

  successResponse(res, paginate(sortRecords(filtered, sortBy || 'created_at', order || 'desc'), page, limit));
});

exports.getById = catchAsync(async (req, res) => {
  const record = findById(fuel, req.params.id);
  if (!record) throw new AppError('Fuel log not found', 404);
  successResponse(res, enrichFuel(record));
});

exports.create = catchAsync(async (req, res) => {
  const vehicle = getVehicle(req.body.vehicle_id);
  if (!vehicle) throw new AppError('Vehicle not found', 404);

  if (req.body.trip_id) {
    const trip = getTrip(req.body.trip_id);
    if (!trip) throw new AppError('Trip not found', 404);
    if (String(trip.vehicle_id) !== String(vehicle.id)) throw new AppError('Trip does not belong to selected vehicle', 400);
  }

  const record = {
    id: nextId(fuel),
    vehicle_id: toNumber(req.body.vehicle_id),
    trip_id: req.body.trip_id === '' || req.body.trip_id == null ? null : toNumber(req.body.trip_id),
    fuel_liters: toNumber(req.body.fuel_liters),
    fuel_cost: toNumber(req.body.fuel_cost),
    log_date: req.body.log_date,
    odometer_reading: req.body.odometer_reading === '' || req.body.odometer_reading == null ? null : toNumber(req.body.odometer_reading),
    created_at: nowIso(),
    updated_at: nowIso(),
  };

  fuel.unshift(record);
  if (record.odometer_reading != null) {
    vehicle.current_odometer = Math.max(Number(vehicle.current_odometer || 0), record.odometer_reading);
    vehicle.updated_at = nowIso();
  }
  successResponse(res, { id: record.id }, 'Fuel log created', 201);
});

exports.update = catchAsync(async (req, res) => {
  const record = findById(fuel, req.params.id);
  if (!record) throw new AppError('Fuel log not found', 404);

  const nextVehicleId = req.body.vehicle_id != null ? toNumber(req.body.vehicle_id) : record.vehicle_id;
  const nextVehicle = getVehicle(nextVehicleId);
  if (!nextVehicle) throw new AppError('Vehicle not found', 404);

  const nextTripId = req.body.trip_id === undefined ? record.trip_id : (req.body.trip_id === '' || req.body.trip_id == null ? null : toNumber(req.body.trip_id));
  if (nextTripId != null) {
    const trip = getTrip(nextTripId);
    if (!trip) throw new AppError('Trip not found', 404);
    if (String(trip.vehicle_id) !== String(nextVehicle.id)) throw new AppError('Trip does not belong to selected vehicle', 400);
  }

  updateById(fuel, req.params.id, (item) => {
    if (req.body.vehicle_id != null) item.vehicle_id = nextVehicleId;
    if (req.body.trip_id !== undefined) item.trip_id = nextTripId;
    if (req.body.fuel_liters != null) item.fuel_liters = toNumber(req.body.fuel_liters, item.fuel_liters);
    if (req.body.fuel_cost != null) item.fuel_cost = toNumber(req.body.fuel_cost, item.fuel_cost);
    if (req.body.log_date != null) item.log_date = req.body.log_date;
    if (req.body.odometer_reading !== undefined) item.odometer_reading = req.body.odometer_reading === '' || req.body.odometer_reading == null ? null : toNumber(req.body.odometer_reading);
  });

  if (req.body.odometer_reading != null) {
    nextVehicle.current_odometer = Math.max(Number(nextVehicle.current_odometer || 0), toNumber(req.body.odometer_reading));
    nextVehicle.updated_at = nowIso();
  }
  successResponse(res, null, 'Fuel log updated');
});

exports.delete = catchAsync(async (req, res) => {
  const record = findById(fuel, req.params.id);
  if (!record) throw new AppError('Fuel log not found', 404);
  deleteById(fuel, req.params.id);
  successResponse(res, null, 'Fuel log deleted');
});