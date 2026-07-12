const pool = require('../config/db');

class Driver {
  static async findAll({ page = 1, limit = 10, search, status, licenseCategory, sortBy = 'id', order = 'ASC' }) {
    let query = `SELECT * FROM drivers WHERE 1=1`;
    const params = [];
    if (search) { query += ` AND (name LIKE ? OR email LIKE ? OR license_number LIKE ?)`; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
    if (status) { query += ` AND status = ?`; params.push(status); }
    if (licenseCategory) { query += ` AND license_category = ?`; params.push(licenseCategory); }
    const countQuery = query.replace(`SELECT *`, `SELECT COUNT(*) as total`);
    const [[{ total }]] = await pool.query(countQuery, params);
    const allowedSort = ['id','name','email','license_number','license_expiry','safety_score','status'];
    const sortColumn = allowedSort.includes(sortBy) ? sortBy : 'id';
    const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    query += ` ORDER BY ${sortColumn} ${sortOrder}`;
    const offset = (page - 1) * limit;
    query += ` LIMIT ? OFFSET ?`;
    const [rows] = await pool.query(query, [...params, limit, offset]);
    return { data: rows, total, page, totalPages: Math.ceil(total / limit) };
  }

  static async findById(id) {
    const [rows] = await pool.query(`SELECT * FROM drivers WHERE id = ?`, [id]);
    return rows[0];
  }

  static async findByLicense(license) {
    const [rows] = await pool.query(`SELECT * FROM drivers WHERE license_number = ?`, [license]);
    return rows[0];
  }

  static async create(data) {
    const { name, email, phone, license_number, license_category, license_expiry, safety_score } = data;
    const [result] = await pool.query(
      `INSERT INTO drivers (name, email, phone, license_number, license_category, license_expiry, safety_score) VALUES (?,?,?,?,?,?,?)`,
      [name, email, phone, license_number, license_category, license_expiry, safety_score || 5.0]
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
    await pool.query(`UPDATE drivers SET ${fields.join(', ')} WHERE id = ?`, params);
  }

  static async delete(id) {
    await pool.query(`DELETE FROM drivers WHERE id = ?`, [id]);
  }

  static async updateStatus(id, status) {
    await pool.query(`UPDATE drivers SET status = ? WHERE id = ?`, [status, id]);
  }
}
module.exports = Driver;