const pool = require('../config/db');

class Trip {
  static async findAll({ page = 1, limit = 10, search, status, vehicle_id, driver_id, startDate, endDate, sortBy = 'id', order = 'ASC' }) {
    let query = `SELECT t.*, v.name as vehicle_name, d.name as driver_name 
                 FROM trips t 
                 JOIN vehicles v ON t.vehicle_id = v.id 
                 JOIN drivers d ON t.driver_id = d.id 
                 WHERE 1=1`;
    const params = [];
    if (search) { query += ` AND (t.trip_number LIKE ? OR t.source LIKE ? OR t.destination LIKE ?)`; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
    if (status) { query += ` AND t.status = ?`; params.push(status); }
    if (vehicle_id) { query += ` AND t.vehicle_id = ?`; params.push(vehicle_id); }
    if (driver_id) { query += ` AND t.driver_id = ?`; params.push(driver_id); }
    if (startDate) { query += ` AND t.created_at >= ?`; params.push(startDate); }
    if (endDate) { query += ` AND t.created_at <= ?`; params.push(endDate + ' 23:59:59'); }
    const countQuery = query.replace(`SELECT t.*, v.name as vehicle_name, d.name as driver_name`, `SELECT COUNT(*) as total`);
    const [[{ total }]] = await pool.query(countQuery, params);
    const allowedSort = ['id','trip_number','source','destination','cargo_weight','planned_distance','actual_distance','revenue','status','created_at'];
    const sortColumn = allowedSort.includes(sortBy) ? sortBy : 'id';
    const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    query += ` ORDER BY t.${sortColumn} ${sortOrder}`;
    const offset = (page - 1) * limit;
    query += ` LIMIT ? OFFSET ?`;
    const [rows] = await pool.query(query, [...params, limit, offset]);
    return { data: rows, total, page, totalPages: Math.ceil(total / limit) };
  }

  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT t.*, v.name as vehicle_name, d.name as driver_name 
       FROM trips t 
       JOIN vehicles v ON t.vehicle_id = v.id 
       JOIN drivers d ON t.driver_id = d.id 
       WHERE t.id = ?`, [id]
    );
    return rows[0];
  }

  static async findByTripNumber(number) {
    const [rows] = await pool.query(`SELECT * FROM trips WHERE trip_number = ?`, [number]);
    return rows[0];
  }

  static async create(data) {
    const { trip_number, source, destination, vehicle_id, driver_id, cargo_weight, planned_distance, revenue } = data;
    const [result] = await pool.query(
      `INSERT INTO trips (trip_number, source, destination, vehicle_id, driver_id, cargo_weight, planned_distance, revenue) VALUES (?,?,?,?,?,?,?,?)`,
      [trip_number, source, destination, vehicle_id, driver_id, cargo_weight, planned_distance || 0, revenue || 0]
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
    await pool.query(`UPDATE trips SET ${fields.join(', ')} WHERE id = ?`, params);
  }

  static async delete(id) {
    await pool.query(`DELETE FROM trips WHERE id = ?`, [id]);
  }

  static async updateStatus(id, status) {
    await pool.query(`UPDATE trips SET status = ? WHERE id = ?`, [status, id]);
  }

  static async complete(id, actual_distance, revenue) {
    await pool.query(
      `UPDATE trips SET status = 'Completed', actual_distance = ?, revenue = ? WHERE id = ?`,
      [actual_distance, revenue, id]
    );
  }
}
module.exports = Trip;