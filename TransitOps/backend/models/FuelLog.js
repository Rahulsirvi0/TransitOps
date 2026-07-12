const pool = require('../config/db');

class FuelLog {
  static async findAll({ page = 1, limit = 10, vehicle_id, trip_id, startDate, endDate, sortBy = 'id', order = 'ASC' }) {
    let query = `SELECT f.*, v.name as vehicle_name, t.trip_number 
                 FROM fuel_logs f 
                 JOIN vehicles v ON f.vehicle_id = v.id 
                 LEFT JOIN trips t ON f.trip_id = t.id 
                 WHERE 1=1`;
    const params = [];
    if (vehicle_id) { query += ` AND f.vehicle_id = ?`; params.push(vehicle_id); }
    if (trip_id) { query += ` AND f.trip_id = ?`; params.push(trip_id); }
    if (startDate) { query += ` AND f.log_date >= ?`; params.push(startDate); }
    if (endDate) { query += ` AND f.log_date <= ?`; params.push(endDate); }
    const countQuery = query.replace(`SELECT f.*, v.name as vehicle_name, t.trip_number`, `SELECT COUNT(*) as total`);
    const [[{ total }]] = await pool.query(countQuery, params);
    const allowedSort = ['id','log_date','fuel_liters','fuel_cost','odometer_reading'];
    const sortColumn = allowedSort.includes(sortBy) ? sortBy : 'id';
    const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    query += ` ORDER BY f.${sortColumn} ${sortOrder}`;
    const offset = (page - 1) * limit;
    query += ` LIMIT ? OFFSET ?`;
    const [rows] = await pool.query(query, [...params, limit, offset]);
    return { data: rows, total, page, totalPages: Math.ceil(total / limit) };
  }

  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT f.*, v.name as vehicle_name FROM fuel_logs f JOIN vehicles v ON f.vehicle_id = v.id WHERE f.id = ?`, [id]
    );
    return rows[0];
  }

  static async create(data) {
    const { vehicle_id, trip_id, fuel_liters, fuel_cost, log_date, odometer_reading } = data;
    const [result] = await pool.query(
      `INSERT INTO fuel_logs (vehicle_id, trip_id, fuel_liters, fuel_cost, log_date, odometer_reading) VALUES (?,?,?,?,?,?)`,
      [vehicle_id, trip_id || null, fuel_liters, fuel_cost, log_date, odometer_reading]
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
    await pool.query(`UPDATE fuel_logs SET ${fields.join(', ')} WHERE id = ?`, params);
  }

  static async delete(id) {
    await pool.query(`DELETE FROM fuel_logs WHERE id = ?`, [id]);
  }
}
module.exports = FuelLog;