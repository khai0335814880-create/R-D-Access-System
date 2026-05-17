const pool = require('../config/database');

class Session {
  static async findById(id) {
    const result = await pool.query('SELECT * FROM sessions WHERE session_id = $1', [id]);
    return result.rows[0];
  }

  static async findActiveByUser(user_id) {
    const result = await pool.query(
      `SELECT * FROM sessions WHERE user_id = $1 AND status = 'in' 
       ORDER BY check_in_at DESC LIMIT 1`,
      [user_id]
    );
    return result.rows[0];
  }

  static async create(sessionData) {
    const { user_id, face_image_url, auth_method, notes } = sessionData;
    const result = await pool.query(
      `INSERT INTO sessions (user_id, face_image_url, auth_method, status, notes) 
       VALUES ($1, $2, $3, 'in', $4) RETURNING *`,
      [user_id, face_image_url, auth_method || 'qr_scan', notes]
    );
    return result.rows[0];
  }

  static async checkOut(session_id, notes, exit_face_image_url) {
    const result = await pool.query(
      `UPDATE sessions SET 
        check_out_at = CURRENT_TIMESTAMP, 
        status = 'out',
        notes = COALESCE($2, notes),
        exit_face_image_url = $3
       WHERE session_id = $1 RETURNING *`,
      [session_id, notes, exit_face_image_url]
    );
    return result.rows[0];
  }

  static async forceClose(session_id, admin_id, notes) {
    const result = await pool.query(
      `UPDATE sessions SET 
        check_out_at = CURRENT_TIMESTAMP, 
        status = 'forced_close',
        forced_close_by = $2,
        forced_close_at = CURRENT_TIMESTAMP,
        notes = $3
       WHERE session_id = $1 RETURNING *`,
      [session_id, admin_id, notes]
    );
    return result.rows[0];
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT 
        s.*, 
        u.full_name, u.username, u.employee_code, u.avatar_url,
        s.face_image_url as entry_photo,
        s.exit_face_image_url as exit_photo,
        COALESCE(
          (SELECT json_agg(json_build_object('brand', d2.brand, 'model_name', d2.model_name, 'serial_number', d2.serial_number))
           FROM session_devices sd 
           JOIN devices d2 ON sd.device_id = d2.device_id 
           WHERE sd.session_id = s.session_id), 
          '[]'::json
        ) as devices
      FROM sessions s
      JOIN users u ON s.user_id = u.user_id
      WHERE 1=1
    `;
    const values = [];

    if (filters.user_id) {
      query += ' AND s.user_id = $' + (values.length + 1);
      values.push(filters.user_id);
    }

    if (filters.status) {
      query += ' AND s.status = $' + (values.length + 1);
      values.push(filters.status);
    }

    query += ' ORDER BY s.check_in_at DESC';
    const result = await pool.query(query, values);
    return result.rows;
  }
}

module.exports = Session;
