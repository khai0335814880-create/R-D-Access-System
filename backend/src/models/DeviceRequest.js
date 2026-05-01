const pool = require('../config/database');

class DeviceRequest {
  static async create(requestData) {
    const { device_id, requester_id, approver_id } = requestData;
    const result = await pool.query(
      `INSERT INTO device_requests (device_id, requester_id, approver_id) 
       VALUES ($1, $2, $3) RETURNING *`,
      [device_id, requester_id, approver_id]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM device_requests WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async findPending() {
    const result = await pool.query(
      `SELECT 
        dr.id as id, 
        dr.requested_at, 
        dr.status as request_status,
        d.id as device_id,
        d.device_type, d.brand, d.model, d.serial_number, d.description,
        u.full_name, u.username 
       FROM device_requests dr
       JOIN devices d ON dr.device_id = d.id
       JOIN users u ON dr.requester_id = u.id
       WHERE dr.status = 'pending'
       ORDER BY dr.requested_at DESC`
    );
    return result.rows;
  }

  static async findByApprover(approver_id) {
    const result = await pool.query(
      `SELECT 
        dr.id as id, 
        dr.requested_at, 
        dr.status as request_status,
        d.id as device_id,
        d.device_type, d.brand, d.model, d.serial_number, d.description,
        u.full_name, u.username 
       FROM device_requests dr
       JOIN devices d ON dr.device_id = d.id
       JOIN users u ON dr.requester_id = u.id
       WHERE dr.approver_id = $1
       ORDER BY dr.requested_at DESC`,
      [approver_id]
    );
    return result.rows;
  }

  static async approve(id, comments = '') {
    const result = await pool.query(
      `UPDATE device_requests SET status = 'approved', comments = $1, approved_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
      [comments, id]
    );
    
    // Also update device status
    if (result.rows[0]) {
      await pool.query(
        `UPDATE devices SET status = 'approved', approval_date = CURRENT_TIMESTAMP 
         WHERE id = $1`,
        [result.rows[0].device_id]
      );
    }

    return result.rows[0];
  }

  static async reject(id, comments = '') {
    const result = await pool.query(
      `UPDATE device_requests SET status = 'rejected', comments = $1
       WHERE id = $2 RETURNING *`,
      [comments, id]
    );

    // Also update device status
    if (result.rows[0]) {
      await pool.query(
        `UPDATE devices SET status = 'rejected' WHERE id = $1`,
        [result.rows[0].device_id]
      );
    }

    return result.rows[0];
  }
}

module.exports = DeviceRequest;
