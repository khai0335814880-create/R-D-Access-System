const pool = require('../config/database');

class AccessLog {
  static async create(data) {
    const { event_type, user_id, session_id, device_id, scanned_qr_value, auth_method, result, alert_message, ip_address } = data;
    const res = await pool.query(
      `INSERT INTO access_logs (event_type, user_id, session_id, device_id, scanned_qr_value, auth_method, result, alert_message, ip_address) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [event_type, user_id, session_id, device_id, scanned_qr_value, auth_method, result, alert_message, ip_address]
    );
    return res.rows[0];
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT al.*, u.full_name, u.username, u.employee_code, u.avatar_url 
      FROM access_logs al 
      LEFT JOIN users u ON al.user_id = u.user_id 
      WHERE 1=1
    `;
    const values = [];

    if (filters.user_id) {
      query += ' AND al.user_id = $' + (values.length + 1);
      values.push(filters.user_id);
    }

    if (filters.event_type) {
      query += ' AND al.event_type = $' + (values.length + 1);
      values.push(filters.event_type);
    }

    query += ' ORDER BY al.created_at DESC';
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async getRecentActivity(limit = 50) {
    const result = await pool.query(
      `SELECT 
        al.*, 
        u.full_name, u.username, u.employee_code, u.avatar_url,
        s.face_image_url as entry_photo,
        (SELECT COUNT(*) FROM session_devices sd WHERE sd.session_id = al.session_id) as device_count
       FROM access_logs al
       LEFT JOIN users u ON al.user_id = u.user_id
       LEFT JOIN sessions s ON al.session_id = s.session_id
       ORDER BY al.created_at DESC LIMIT $1`,
      [limit]
    );
    return result.rows;
  }
}

module.exports = AccessLog;

