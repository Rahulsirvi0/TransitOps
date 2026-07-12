const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/response');
const { validationResult } = require('express-validator');
const vehicles = require('../data/vehicles');
const { nextId, paginate, sortRecords, matchesSearch, matchesAny, toNumber, nowIso, findById, updateById, deleteById } = require('../config/db');

const allowedTypes = ['Truck', 'Van', 'Bus', 'Trailer', 'Pickup'];
const allowedStatuses = ['Available', 'On Trip', 'In Shop', 'Retired'];

const buildVehicle = (vehicle) => ({
  ...vehicle,
  region_name: vehicle.region_name || (vehicle.region_id ? `Region ${vehicle.region_id}` : null),
});

exports.list = catchAsync(async (req, res) => {
  const { page, limit, search, status, type, region, sortBy, order } = req.query;
  const filtered = vehicles
    .filter((vehicle) => matchesSearch(vehicle, search, ['registration_number', 'name', 'model', 'vehicle_type', 'status', 'region_name']))
    .filter((vehicle) => matchesAny(vehicle.status, status))
    .filter((vehicle) => !type || String(vehicle.vehicle_type) === String(type))
    .filter((vehicle) => !region || String(vehicle.region_id) === String(region) || String(vehicle.region_name).toLowerCase() === String(region).toLowerCase());

  const ordered = sortRecords(filtered, sortBy || 'created_at', order || 'desc').map(buildVehicle);
  successResponse(res, paginate(ordered, page, limit));
});

exports.getById = catchAsync(async (req, res) => {
  const vehicle = findById(vehicles, req.params.id);
  if (!vehicle) throw new AppError('Vehicle not found', 404);
  successResponse(res, buildVehicle(vehicle));
});

exports.create = catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new AppError(errors.array().map(e => e.msg).join(', '), 400);
  const registrationNumber = String(req.body.registration_number || '').trim();
  if (!registrationNumber) throw new AppError('Registration number required', 400);
  if (vehicles.some((vehicle) => vehicle.registration_number.toLowerCase() === registrationNumber.toLowerCase())) {
    throw new AppError('Registration number already exists', 400);
  }

  const vehicleType = req.body.vehicle_type;
  if (!allowedTypes.includes(vehicleType)) throw new AppError('Invalid type', 400);

  const newVehicle = {
    id: nextId(vehicles),
    registration_number: registrationNumber,
    name: String(req.body.name || '').trim(),
    model: String(req.body.model || '').trim(),
    vehicle_type: vehicleType,
    max_load_capacity: toNumber(req.body.max_load_capacity),
    current_odometer: toNumber(req.body.current_odometer),
    acquisition_cost: toNumber(req.body.acquisition_cost),
    region_id: req.body.region_id === '' || req.body.region_id == null ? null : toNumber(req.body.region_id),
    region_name: req.body.region_name || (req.body.region_id ? `Region ${req.body.region_id}` : null),
    status: allowedStatuses.includes(req.body.status) ? req.body.status : 'Available',
    created_at: nowIso(),
    updated_at: nowIso(),
  };

  vehicles.unshift(newVehicle);
  successResponse(res, { id: newVehicle.id }, 'Vehicle created', 201);
});

exports.update = catchAsync(async (req, res) => {
  const vehicle = findById(vehicles, req.params.id);
  if (!vehicle) throw new AppError('Vehicle not found', 404);
  const registrationNumber = req.body.registration_number ? String(req.body.registration_number).trim() : null;
  if (registrationNumber && registrationNumber.toLowerCase() !== vehicle.registration_number.toLowerCase()) {
    const duplicate = vehicles.find((item) => item.registration_number.toLowerCase() === registrationNumber.toLowerCase());
    if (duplicate) throw new AppError('Registration number already in use', 400);
  }

  if (req.body.vehicle_type && !allowedTypes.includes(req.body.vehicle_type)) throw new AppError('Invalid type', 400);
  if (req.body.status && !allowedStatuses.includes(req.body.status)) throw new AppError('Invalid status', 400);

  updateById(vehicles, req.params.id, (record) => {
    if (registrationNumber) record.registration_number = registrationNumber;
    if (req.body.name != null) record.name = String(req.body.name).trim();
    if (req.body.model != null) record.model = String(req.body.model).trim();
    if (req.body.vehicle_type) record.vehicle_type = req.body.vehicle_type;
    if (req.body.max_load_capacity != null) record.max_load_capacity = toNumber(req.body.max_load_capacity, record.max_load_capacity);
    if (req.body.current_odometer != null) record.current_odometer = toNumber(req.body.current_odometer, record.current_odometer);
    if (req.body.acquisition_cost != null) record.acquisition_cost = toNumber(req.body.acquisition_cost, record.acquisition_cost);
    if (req.body.region_id !== undefined) record.region_id = req.body.region_id === '' || req.body.region_id == null ? null : toNumber(req.body.region_id, record.region_id);
    if (req.body.region_name != null) record.region_name = String(req.body.region_name).trim();
    if (req.body.status) record.status = req.body.status;
  });
  successResponse(res, null, 'Vehicle updated');
});

exports.delete = catchAsync(async (req, res) => {
  const vehicle = findById(vehicles, req.params.id);
  if (!vehicle) throw new AppError('Vehicle not found', 404);
  deleteById(vehicles, req.params.id);
  successResponse(res, null, 'Vehicle deleted');
});