const pool = require('../config/db');

class Vehicle {
  static async findAll({ page = 1, limit = 10, search, status, type, region, sortBy = 'id', order = 'ASC' }) {
    let query = `SELECT v.*, r.name as region_name FROM vehicles v LEFT JOIN regions r ON v.region_id = r.id WHERE 1=1`;
    const params = [];
    if (search) { query += ` AND (v.registration_number LIKE ? OR v.name LIKE ? OR v.model LIKE ?)`; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
    if (status) { query += ` AND v.status = ?`; params.push(status); }
    if (type) { query += ` AND v.vehicle_type = ?`; params.push(type); }
    if (region) { query += ` AND v.region_id = ?`; params.push(region); }
    // count total
    const countQuery = query.replace(`SELECT v.*, r.name as region_name`, `SELECT COUNT(*) as total`);
    const [[{ total }]] = await pool.query(countQuery, params);
    // sorting allowed fields
    const allowedSort = ['id','registration_number','name','model','vehicle_type','max_load_capacity','current_odometer','status','created_at'];
    const sortColumn = allowedSort.includes(sortBy) ? sortBy : 'id';
    const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    query += ` ORDER BY v.${sortColumn} ${sortOrder}`;
    const offset = (page - 1) * limit;
    query += ` LIMIT ? OFFSET ?`;
    const [rows] = await pool.query(query, [...params, limit, offset]);
    return { data: rows, total, page, totalPages: Math.ceil(total / limit) };
  }

  static async findById(id) {
    const [rows] = await pool.query(`SELECT v.*, r.name as region_name FROM vehicles v LEFT JOIN regions r ON v.region_id = r.id WHERE v.id = ?`, [id]);
    return rows[0];
  }

  static async findByRegNumber(reg) {
    const [rows] = await pool.query(`SELECT * FROM vehicles WHERE registration_number = ?`, [reg]);
    return rows[0];
  }

  static async create(data) {
    const { registration_number, name, model, vehicle_type, max_load_capacity, current_odometer, acquisition_cost, region_id } = data;
    const [result] = await pool.query(
      `INSERT INTO vehicles (registration_number, name, model, vehicle_type, max_load_capacity, current_odometer, acquisition_cost, region_id) VALUES (?,?,?,?,?,?,?,?)`,
      [registration_number, name, model, vehicle_type, max_load_capacity, current_odometer || 0, acquisition_cost || 0, region_id || null]
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
    await pool.query(`UPDATE vehicles SET ${fields.join(', ')} WHERE id = ?`, params);
  }

  static async delete(id) {
    await pool.query(`DELETE FROM vehicles WHERE id = ?`, [id]);
  }

  static async updateStatus(id, status) {
    await pool.query(`UPDATE vehicles SET status = ? WHERE id = ?`, [status, id]);
  }
}
module.exports = Vehicle;