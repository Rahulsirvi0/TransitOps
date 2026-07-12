const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/response');
const drivers = require('../data/drivers');
const { nextId, paginate, sortRecords, matchesSearch, matchesAny, toNumber, nowIso, findById, updateById, deleteById } = require('../config/db');

const allowedStatuses = ['Available', 'On Trip', 'Off Duty', 'Suspended'];

exports.list = catchAsync(async (req, res) => {
  const { page, limit, search, status, licenseCategory, sortBy, order } = req.query;
  const filtered = drivers
    .filter((driver) => matchesSearch(driver, search, ['name', 'email', 'phone', 'license_number', 'license_category', 'status']))
    .filter((driver) => matchesAny(driver.status, status))
    .filter((driver) => !licenseCategory || String(driver.license_category) === String(licenseCategory));

  successResponse(res, paginate(sortRecords(filtered, sortBy || 'created_at', order || 'desc'), page, limit));
});

exports.getById = catchAsync(async (req, res) => {
  const driver = findById(drivers, req.params.id);
  if (!driver) throw new AppError('Driver not found', 404);
  successResponse(res, driver);
});

exports.create = catchAsync(async (req, res) => {
  const name = String(req.body.name || '').trim();
  const licenseNumber = String(req.body.license_number || '').trim();
  if (!name) throw new AppError('Name required', 400);
  if (!licenseNumber) throw new AppError('License number required', 400);
  if (drivers.some((driver) => driver.license_number.toLowerCase() === licenseNumber.toLowerCase())) {
    throw new AppError('License number already exists', 400);
  }

  const newDriver = {
    id: nextId(drivers),
    name,
    email: String(req.body.email || '').trim(),
    phone: String(req.body.phone || '').trim(),
    license_number: licenseNumber,
    license_category: String(req.body.license_category || '').trim(),
    license_expiry: req.body.license_expiry,
    safety_score: req.body.safety_score !== undefined ? toNumber(req.body.safety_score, 5) : 5,
    status: allowedStatuses.includes(req.body.status) ? req.body.status : 'Available',
    region_id: req.body.region_id === '' || req.body.region_id == null ? null : toNumber(req.body.region_id),
    created_at: nowIso(),
    updated_at: nowIso(),
  };

  drivers.unshift(newDriver);
  successResponse(res, { id: newDriver.id }, 'Driver created', 201);
});

exports.update = catchAsync(async (req, res) => {
  const driver = findById(drivers, req.params.id);
  if (!driver) throw new AppError('Driver not found', 404);
  const licenseNumber = req.body.license_number ? String(req.body.license_number).trim() : null;
  if (licenseNumber && licenseNumber.toLowerCase() !== driver.license_number.toLowerCase()) {
    const duplicate = drivers.find((item) => item.license_number.toLowerCase() === licenseNumber.toLowerCase());
    if (duplicate) throw new AppError('License number already in use', 400);
  }

  if (req.body.status && !allowedStatuses.includes(req.body.status)) throw new AppError('Invalid status', 400);

  updateById(drivers, req.params.id, (record) => {
    if (req.body.name != null) record.name = String(req.body.name).trim();
    if (req.body.email != null) record.email = String(req.body.email).trim();
    if (req.body.phone != null) record.phone = String(req.body.phone).trim();
    if (licenseNumber) record.license_number = licenseNumber;
    if (req.body.license_category != null) record.license_category = String(req.body.license_category).trim();
    if (req.body.license_expiry != null) record.license_expiry = req.body.license_expiry;
    if (req.body.safety_score != null) record.safety_score = toNumber(req.body.safety_score, record.safety_score);
    if (req.body.status) record.status = req.body.status;
    if (req.body.region_id !== undefined) record.region_id = req.body.region_id === '' || req.body.region_id == null ? null : toNumber(req.body.region_id, record.region_id);
  });
  successResponse(res, null, 'Driver updated');
});

exports.delete = catchAsync(async (req, res) => {
  const driver = findById(drivers, req.params.id);
  if (!driver) throw new AppError('Driver not found', 404);
  deleteById(drivers, req.params.id);
  successResponse(res, null, 'Driver deleted');
});