const pool = require('../config/database');

class AccessLog {
  static async create(accessData) {
    const { user_id, device_ids, status, entry_photo } = accessData;
    const result = await pool.query(
      `INSERT INTO access_logs (user_id, device_ids, status, entry_photo) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [user_id, device_ids, status, entry_photo]
    );
    return result.rows[0];
  }

  static async checkOut(log_id) {
    const result = await pool.query(
      `UPDATE access_logs SET check_out_time = CURRENT_TIMESTAMP, status = 'checked_out' 
       WHERE id = $1 RETURNING *`,
      [log_id]
    );
    return result.rows[0];
  }

  static async findActiveByUser(user_id) {
    const result = await pool.query(
      `SELECT * FROM access_logs WHERE user_id = $1 AND status = 'checked_in' 
       ORDER BY check_in_time DESC LIMIT 1`,
      [user_id]
    );
    return result.rows[0];
  }

  static async findAll(filters = {}) {
    let query = 'SELECT al.*, u.full_name, u.username FROM access_logs al LEFT JOIN users u ON al.user_id = u.id WHERE 1=1';
    const values = [];

    if (filters.user_id) {
      query += ' AND al.user_id = $' + (values.length + 1);
      values.push(filters.user_id);
    }

    if (filters.status) {
      query += ' AND al.status = $' + (values.length + 1);
      values.push(filters.status);
    }

    query += ' ORDER BY al.check_in_time DESC';
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async getRecentActivity(limit = 50) {
    const result = await pool.query(
      `SELECT al.*, u.full_name, u.username FROM access_logs al
       JOIN users u ON al.user_id = u.id
       ORDER BY al.check_in_time DESC LIMIT $1`,
      [limit]
    );
    return result.rows;
  }
}

module.exports = AccessLog;
