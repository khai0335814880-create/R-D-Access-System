const pool = require('../config/database');

class ActivityLog {
  static async create({ user_id, activity_type, description, metadata = {} }) {
    const query = `
      INSERT INTO activity_logs (user_id, activity_type, description, metadata)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [user_id, activity_type, description, JSON.stringify(metadata)];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findRecent(limit = 50) {
    const query = `
      SELECT al.*, u.full_name, u.username, u.role, u.avatar_url
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.user_id
      ORDER BY al.created_at DESC
      LIMIT $1
    `;
    const { rows } = await pool.query(query, [limit]);
    return rows;
  }

  static async findByUser(userId, limit = 50) {
    const query = `
      SELECT * FROM activity_logs
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;
    const { rows } = await pool.query(query, [userId, limit]);
    return rows;
  }
}

module.exports = ActivityLog;
