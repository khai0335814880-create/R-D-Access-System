const pool = require('../config/database');

class QuickRegistration {
  static async create(data) {
    const { requester_id, device_type, brand, serial_number, model_name } = data;
    const result = await pool.query(
      `INSERT INTO quick_registrations (requester_id, device_type, brand, serial_number, model_name) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [requester_id, device_type, brand, serial_number, model_name]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM quick_registrations WHERE request_id = $1', [id]);
    return result.rows[0];
  }

  static async findPending() {
    const result = await pool.query(
      `SELECT qr.*, u.full_name, u.username, u.employee_code
       FROM quick_registrations qr
       JOIN users u ON qr.requester_id = u.user_id
       WHERE qr.status = 'pending'
       ORDER BY qr.created_at DESC`
    );
    return result.rows;
  }

  static async updateStatus(id, data) {
    const { status, reviewed_by, reject_reason, device_id } = data;
    const result = await pool.query(
      `UPDATE quick_registrations SET 
        status = $1, 
        reviewed_by = $2, 
        reviewed_at = CURRENT_TIMESTAMP,
        reject_reason = $3,
        device_id = $4
       WHERE request_id = $5 RETURNING *`,
      [status, reviewed_by, reject_reason, device_id, id]
    );
    return result.rows[0];
  }
}

module.exports = QuickRegistration;
