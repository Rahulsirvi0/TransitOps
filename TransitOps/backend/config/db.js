const clone = (value) => {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
};

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const nowIso = () => new Date().toISOString();

const nextId = (records) => records.reduce((maxId, record) => Math.max(maxId, toNumber(record.id)), 0) + 1;

const paginate = (records, page = 1, limit = 10) => {
  const safePage = Math.max(1, toNumber(page, 1));
  const safeLimit = Math.max(1, toNumber(limit, 10));
  const total = records.length;
  const totalPages = Math.max(1, Math.ceil(total / safeLimit));
  const start = (safePage - 1) * safeLimit;
  return {
    data: records.slice(start, start + safeLimit).map(clone),
    page: safePage,
    limit: safeLimit,
    total,
    totalPages,
  };
};

const sortRecords = (records, sortBy = 'created_at', order = 'desc') => {
  const direction = String(order).toLowerCase() === 'asc' ? 1 : -1;
  return [...records].sort((left, right) => {
    const leftValue = left?.[sortBy];
    const rightValue = right?.[sortBy];

    if (leftValue === rightValue) return 0;
    if (leftValue == null) return 1;
    if (rightValue == null) return -1;

    const leftDate = Date.parse(leftValue);
    const rightDate = Date.parse(rightValue);
    if (!Number.isNaN(leftDate) && !Number.isNaN(rightDate)) {
      return (leftDate - rightDate) * direction;
    }

    if (typeof leftValue === 'number' && typeof rightValue === 'number') {
      return (leftValue - rightValue) * direction;
    }

    return String(leftValue).localeCompare(String(rightValue)) * direction;
  });
};

const matchesSearch = (record, search, fields = []) => {
  const term = String(search || '').trim().toLowerCase();
  if (!term) return true;
  return fields.some((field) => String(record?.[field] ?? '').toLowerCase().includes(term));
};

const matchesAny = (value, query) => {
  const terms = String(query || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  if (!terms.length) return true;
  return terms.includes(String(value));
};

const withinDateRange = (value, startDate, endDate) => {
  if (!startDate && !endDate) return true;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  if (startDate) {
    const start = new Date(startDate);
    if (!Number.isNaN(start.getTime()) && date < start) return false;
  }

  if (endDate) {
    const end = new Date(endDate);
    if (!Number.isNaN(end.getTime())) {
      end.setHours(23, 59, 59, 999);
      if (date > end) return false;
    }
  }

  return true;
};

const findById = (records, id) => records.find((record) => String(record.id) === String(id));

const updateById = (records, id, updater) => {
  const record = findById(records, id);
  if (!record) return null;
  updater(record);
  record.updated_at = nowIso();
  return record;
};

const deleteById = (records, id) => {
  const index = records.findIndex((record) => String(record.id) === String(id));
  if (index < 0) return null;
  const [removed] = records.splice(index, 1);
  return removed;
};

const sumBy = (records, selector) => records.reduce((total, record) => total + toNumber(selector(record), 0), 0);

const groupBy = (records, selector) => {
  return records.reduce((groups, record) => {
    const key = selector(record);
    if (!groups[key]) groups[key] = [];
    groups[key].push(record);
    return groups;
  }, {});
};

module.exports = {
  clone,
  toNumber,
  nowIso,
  nextId,
  paginate,
  sortRecords,
  matchesSearch,
  matchesAny,
  withinDateRange,
  findById,
  updateById,
  deleteById,
  sumBy,
  groupBy,
};