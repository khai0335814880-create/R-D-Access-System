const pool = require('../config/database');

class AuditLog {
  static async create(data) {
    const { actor_id, action, target_table, target_id, old_value, new_value, reason } = data;
    const result = await pool.query(
      `INSERT INTO audit_logs (actor_id, action, target_table, target_id, old_value, new_value, reason) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [actor_id, action, target_table, target_id, old_value, new_value, reason]
    );
    return result.rows[0];
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT al.*, u.full_name as actor_name, u.username as actor_username
      FROM audit_logs al
      JOIN users u ON al.actor_id = u.user_id
      WHERE 1=1
    `;
    const values = [];

    if (filters.actor_id) {
      query += ' AND al.actor_id = $' + (values.length + 1);
      values.push(filters.actor_id);
    }

    if (filters.target_table) {
      query += ' AND al.target_table = $' + (values.length + 1);
      values.push(filters.target_table);
    }

    query += ' ORDER BY al.created_at DESC';
    const result = await pool.query(query, values);
    return result.rows;
  }
}

module.exports = AuditLog;
