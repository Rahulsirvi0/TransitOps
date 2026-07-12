const pool = require('../config/db');

class User {
  static async findByEmail(email) {
    const [rows] = await pool.query(
      `SELECT u.*, r.name as role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = ?`,
      [email]
    );
    return rows[0];
  }

  static async create({ email, password_hash, full_name, role_id }) {
    const [result] = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, role_id) VALUES (?,?,?,?)`,
      [email, password_hash, full_name, role_id]
    );
    return result.insertId;
  }
}
module.exports = User;