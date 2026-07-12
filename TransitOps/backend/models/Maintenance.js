const pool = require('../config/db');

class Maintenance {
  static async findAll({ page = 1, limit = 10, vehicle_id, status, startDate, endDate, sortBy = 'id', order = 'ASC' }) {
    let query = `SELECT m.*, v.name as vehicle_name FROM maintenance m JOIN vehicles v ON m.vehicle_id = v.id WHERE 1=1`;
    const params = [];
    if (vehicle_id) { query += ` AND m.vehicle_id = ?`; params.push(vehicle_id); }
    if (status) { query += ` AND m.status = ?`; params.push(status); }
    if (startDate) { query += ` AND m.maintenance_date >= ?`; params.push(startDate); }
    if (endDate) { query += ` AND m.maintenance_date <= ?`; params.push(endDate); }
    const countQuery = query.replace(`SELECT m.*, v.name as vehicle_name`, `SELECT COUNT(*) as total`);
    const [[{ total }]] = await pool.query(countQuery, params);
    const allowedSort = ['id','maintenance_date','cost','status'];
    const sortColumn = allowedSort.includes(sortBy) ? sortBy : 'id';
    const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    query += ` ORDER BY m.${sortColumn} ${sortOrder}`;
    const offset = (page - 1) * limit;
    query += ` LIMIT ? OFFSET ?`;
    const [rows] = await pool.query(query, [...params, limit, offset]);
    return { data: rows, total, page, totalPages: Math.ceil(total / limit) };
  }

  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT m.*, v.name as vehicle_name FROM maintenance m JOIN vehicles v ON m.vehicle_id = v.id WHERE m.id = ?`, [id]
    );
    return rows[0];
  }

  static async create(data) {
    const { vehicle_id, maintenance_type, description, cost, maintenance_date } = data;
    const [result] = await pool.query(
      `INSERT INTO maintenance (vehicle_id, maintenance_type, description, cost, maintenance_date) VALUES (?,?,?,?,?)`,
      [vehicle_id, maintenance_type, description, cost, maintenance_date]
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
    await pool.query(`UPDATE maintenance SET ${fields.join(', ')} WHERE id = ?`, params);
  }

  static async updateStatus(id, status) {
    await pool.query(`UPDATE maintenance SET status = ? WHERE id = ?`, [status, id]);
  }

  static async delete(id) {
    await pool.query(`DELETE FROM maintenance WHERE id = ?`, [id]);
  }
}
module.exports = Maintenance;