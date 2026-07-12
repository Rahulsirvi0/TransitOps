const pool = require('../config/db');

class Expense {
  static async findAll({ page = 1, limit = 10, vehicle_id, expense_type, startDate, endDate, sortBy = 'id', order = 'ASC' }) {
    let query = `SELECT e.*, v.name as vehicle_name FROM expenses e LEFT JOIN vehicles v ON e.vehicle_id = v.id WHERE 1=1`;
    const params = [];
    if (vehicle_id) { query += ` AND e.vehicle_id = ?`; params.push(vehicle_id); }
    if (expense_type) { query += ` AND e.expense_type = ?`; params.push(expense_type); }
    if (startDate) { query += ` AND e.expense_date >= ?`; params.push(startDate); }
    if (endDate) { query += ` AND e.expense_date <= ?`; params.push(endDate); }
    const countQuery = query.replace(`SELECT e.*, v.name as vehicle_name`, `SELECT COUNT(*) as total`);
    const [[{ total }]] = await pool.query(countQuery, params);
    const allowedSort = ['id','expense_date','cost','expense_type'];
    const sortColumn = allowedSort.includes(sortBy) ? sortBy : 'id';
    const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    query += ` ORDER BY e.${sortColumn} ${sortOrder}`;
    const offset = (page - 1) * limit;
    query += ` LIMIT ? OFFSET ?`;
    const [rows] = await pool.query(query, [...params, limit, offset]);
    return { data: rows, total, page, totalPages: Math.ceil(total / limit) };
  }

  static async findById(id) {
    const [rows] = await pool.query(`SELECT e.*, v.name as vehicle_name FROM expenses e LEFT JOIN vehicles v ON e.vehicle_id = v.id WHERE e.id = ?`, [id]);
    return rows[0];
  }

  static async create(data) {
    const { vehicle_id, expense_type, description, cost, expense_date } = data;
    const [result] = await pool.query(
      `INSERT INTO expenses (vehicle_id, expense_type, description, cost, expense_date) VALUES (?,?,?,?,?)`,
      [vehicle_id || null, expense_type, description, cost, expense_date]
    );
    return result.insertId;
  }

  static async update(id, data) {
    const fields = [];
    const params = [];
    for (let [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        params.push(value);
      }
    }
    params.push(id);
    await pool.query(`UPDATE expenses SET ${fields.join(', ')} WHERE id = ?`, params);
  }

  static async delete(id) {
    await pool.query(`DELETE FROM expenses WHERE id = ?`, [id]);
  }
}
module.exports = Expense;