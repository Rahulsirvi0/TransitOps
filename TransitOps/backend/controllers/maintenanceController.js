const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/response');
const maintenance = require('../data/maintenance');
const vehicles = require('../data/vehicles');
const { nextId, paginate, sortRecords, matchesSearch, matchesAny, withinDateRange, toNumber, nowIso, findById, updateById, deleteById } = require('../config/db');

const getVehicle = (vehicleId) => findById(vehicles, vehicleId);

const enrichMaintenance = (record) => ({
  ...record,
  vehicle_name: getVehicle(record.vehicle_id)?.name || 'Unknown vehicle',
});

exports.list = catchAsync(async (req, res) => {
  const { page, limit, vehicle_id, status, startDate, endDate, search, sortBy, order } = req.query;
  const filtered = maintenance
    .map(enrichMaintenance)
    .filter((record) => matchesSearch(record, search, ['maintenance_type', 'description', 'vehicle_name', 'status']))
    .filter((record) => matchesAny(record.status, status))
    .filter((record) => !vehicle_id || String(record.vehicle_id) === String(vehicle_id))
    .filter((record) => withinDateRange(record.maintenance_date, startDate, endDate));

  successResponse(res, paginate(sortRecords(filtered, sortBy || 'created_at', order || 'desc'), page, limit));
});

exports.getById = catchAsync(async (req, res) => {
  const record = findById(maintenance, req.params.id);
  if (!record) throw new AppError('Maintenance record not found', 404);
  successResponse(res, enrichMaintenance(record));
});

exports.create = catchAsync(async (req, res) => {
  const vehicle = getVehicle(req.body.vehicle_id);
  if (!vehicle) throw new AppError('Vehicle not found', 404);

  vehicle.status = 'In Shop';
  vehicle.updated_at = nowIso();

  const record = {
    id: nextId(maintenance),
    vehicle_id: toNumber(req.body.vehicle_id),
    maintenance_type: String(req.body.maintenance_type || '').trim(),
    description: String(req.body.description || '').trim(),
    cost: toNumber(req.body.cost),
    maintenance_date: req.body.maintenance_date,
    status: 'Open',
    created_at: nowIso(),
    updated_at: nowIso(),
  };

  maintenance.unshift(record);
  successResponse(res, { id: record.id }, 'Maintenance record created, vehicle set to In Shop', 201);
});

exports.update = catchAsync(async (req, res) => {
  const record = findById(maintenance, req.params.id);
  if (!record) throw new AppError('Maintenance record not found', 404);

  const nextVehicleId = req.body.vehicle_id !== undefined ? toNumber(req.body.vehicle_id) : record.vehicle_id;
  const nextVehicle = getVehicle(nextVehicleId);
  if (!nextVehicle) throw new AppError('Vehicle not found', 404);

  if (req.body.vehicle_id != null && String(req.body.vehicle_id) !== String(record.vehicle_id)) {
    const previousVehicle = getVehicle(record.vehicle_id);
    if (previousVehicle && record.status !== 'Completed') {
      previousVehicle.status = 'Available';
    }
    nextVehicle.status = 'In Shop';
    nextVehicle.updated_at = nowIso();
  }

  updateById(maintenance, req.params.id, (item) => {
    if (req.body.vehicle_id != null) item.vehicle_id = nextVehicleId;
    if (req.body.maintenance_type != null) item.maintenance_type = String(req.body.maintenance_type).trim();
    if (req.body.description != null) item.description = String(req.body.description).trim();
    if (req.body.cost != null) item.cost = toNumber(req.body.cost, item.cost);
    if (req.body.maintenance_date != null) item.maintenance_date = req.body.maintenance_date;
  });
  successResponse(res, null, 'Maintenance updated');
});

exports.updateStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  if (!['Open', 'In Progress', 'Completed'].includes(status)) throw new AppError('Invalid status', 400);
  const record = findById(maintenance, req.params.id);
  if (!record) throw new AppError('Maintenance record not found', 404);
  const previousStatus = record.status;
  updateById(maintenance, req.params.id, (item) => {
    item.status = status;
  });

  if (status === 'Completed' && previousStatus !== 'Completed') {
    const vehicle = getVehicle(record.vehicle_id);
    if (vehicle && vehicle.status !== 'Retired') {
      vehicle.status = 'Available';
      vehicle.updated_at = nowIso();
    }
  }
  successResponse(res, null, `Maintenance status updated to ${status}`);
});

exports.delete = catchAsync(async (req, res) => {
  const record = findById(maintenance, req.params.id);
  if (!record) throw new AppError('Maintenance record not found', 404);
  const vehicle = getVehicle(record.vehicle_id);
  if (vehicle && record.status !== 'Completed' && vehicle.status === 'In Shop') {
    vehicle.status = 'Available';
    vehicle.updated_at = nowIso();
  }
  deleteById(maintenance, req.params.id);
  successResponse(res, null, 'Maintenance record deleted');
});