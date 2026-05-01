const pool = require('../config/database');

class Notification {
  static async create({ user_id, title, message, type = 'info' }) {
    const result = await pool.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4) RETURNING *',
      [user_id, title, message, type]
    );
    return result.rows[0];
  }

  static async findByUser(user_id, limit = 50) {
    const result = await pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
      [user_id, limit]
    );
    return result.rows;
  }

  static async markAsRead(id, user_id) {
    const result = await pool.query(
      'UPDATE notifications SET read = TRUE WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, user_id]
    );
    return result.rows[0];
  }

  static async markAllAsRead(user_id) {
    const result = await pool.query(
      'UPDATE notifications SET read = TRUE WHERE user_id = $1 RETURNING *',
      [user_id]
    );
    return result.rows;
  }

  static async delete(id, user_id) {
    await pool.query('DELETE FROM notifications WHERE id = $1 AND user_id = $2', [id, user_id]);
    return true;
  }

  static async getUnreadCount(user_id) {
    const result = await pool.query(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND read = FALSE',
      [user_id]
    );
    return parseInt(result.rows[0].count);
  }
}

module.exports = Notification;
