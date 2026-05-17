const pool = require('../config/database');

class SessionDevice {
  static async create(data) {
    const { session_id, device_id, scan_status } = data;
    const result = await pool.query(
      `INSERT INTO session_devices (session_id, device_id, scan_status) 
       VALUES ($1, $2, $3) RETURNING *`,
      [session_id, device_id, scan_status || 'matched']
    );
    return result.rows[0];
  }

  static async findBySession(session_id) {
    const result = await pool.query(
      `SELECT sd.*, d.brand, d.model_name, d.device_type, d.serial_number, d.image_url
       FROM session_devices sd
       JOIN devices d ON sd.device_id = d.device_id
       WHERE sd.session_id = $1`,
      [session_id]
    );
    return result.rows;
  }

  static async deleteBySession(session_id) {
    await pool.query('DELETE FROM session_devices WHERE session_id = $1', [session_id]);
  }
}

module.exports = SessionDevice;
