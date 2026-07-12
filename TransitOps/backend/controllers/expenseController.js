const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/response');
const expenses = require('../data/expenses');
const vehicles = require('../data/vehicles');
const { nextId, paginate, sortRecords, matchesSearch, matchesAny, withinDateRange, toNumber, nowIso, findById, updateById, deleteById } = require('../config/db');

const getVehicle = (vehicleId) => findById(vehicles, vehicleId);

const enrichExpense = (record) => ({
  ...record,
  vehicle_name: getVehicle(record.vehicle_id)?.name || 'Unknown vehicle',
});

exports.list = catchAsync(async (req, res) => {
  const { page, limit, vehicle_id, expense_type, startDate, endDate, search, sortBy, order } = req.query;
  const filtered = expenses
    .map(enrichExpense)
    .filter((record) => matchesSearch(record, search, ['vehicle_name', 'expense_type', 'description']))
    .filter((record) => !vehicle_id || String(record.vehicle_id) === String(vehicle_id))
    .filter((record) => !expense_type || String(record.expense_type) === String(expense_type))
    .filter((record) => withinDateRange(record.expense_date, startDate, endDate));

  successResponse(res, paginate(sortRecords(filtered, sortBy || 'created_at', order || 'desc'), page, limit));
});

exports.getById = catchAsync(async (req, res) => {
  const record = findById(expenses, req.params.id);
  if (!record) throw new AppError('Expense not found', 404);
  successResponse(res, enrichExpense(record));
});

exports.create = catchAsync(async (req, res) => {
  const vehicle = req.body.vehicle_id ? getVehicle(req.body.vehicle_id) : null;
  if (req.body.vehicle_id && !vehicle) throw new AppError('Vehicle not found', 404);

  const record = {
    id: nextId(expenses),
    vehicle_id: req.body.vehicle_id === '' || req.body.vehicle_id == null ? null : toNumber(req.body.vehicle_id),
    expense_type: String(req.body.expense_type || '').trim(),
    description: String(req.body.description || '').trim(),
    cost: toNumber(req.body.cost),
    expense_date: req.body.expense_date,
    created_at: nowIso(),
    updated_at: nowIso(),
  };

  expenses.unshift(record);
  successResponse(res, { id: record.id }, 'Expense created', 201);
});

exports.update = catchAsync(async (req, res) => {
  const record = findById(expenses, req.params.id);
  if (!record) throw new AppError('Expense not found', 404);

  if (req.body.vehicle_id != null && req.body.vehicle_id !== '') {
    const vehicle = getVehicle(req.body.vehicle_id);
    if (!vehicle) throw new AppError('Vehicle not found', 404);
  }

  updateById(expenses, req.params.id, (item) => {
    if (req.body.vehicle_id !== undefined) item.vehicle_id = req.body.vehicle_id === '' || req.body.vehicle_id == null ? null : toNumber(req.body.vehicle_id);
    if (req.body.expense_type != null) item.expense_type = String(req.body.expense_type).trim();
    if (req.body.description != null) item.description = String(req.body.description).trim();
    if (req.body.cost != null) item.cost = toNumber(req.body.cost, item.cost);
    if (req.body.expense_date != null) item.expense_date = req.body.expense_date;
  });
  successResponse(res, null, 'Expense updated');
});

exports.delete = catchAsync(async (req, res) => {
  const record = findById(expenses, req.params.id);
  if (!record) throw new AppError('Expense not found', 404);
  deleteById(expenses, req.params.id);
  successResponse(res, null, 'Expense deleted');
});