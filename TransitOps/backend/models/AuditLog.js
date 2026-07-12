const pool = require('../config/db');

class AuditLog {
  static async log(user_id, action, entity_type, entity_id, details = {}) {
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?,?,?,?,?)`,
      [user_id, action, entity_type, entity_id, JSON.stringify(details)]
    );
  }

  static async findByUser(user_id, limit = 50) {
    const [rows] = await pool.query(
      `SELECT * FROM audit_logs WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?`,
      [user_id, limit]
    );
    return rows;
  }
}
module.exports = AuditLog;