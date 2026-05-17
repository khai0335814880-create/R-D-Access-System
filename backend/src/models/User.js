const pool = require('../config/database');

class User {
  static async findById(id) {
    const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [id]);
    return result.rows[0];
  }

  static async findByUsername(username) {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  static async findByEmployeeCode(code) {
    const result = await pool.query('SELECT * FROM users WHERE employee_code = $1', [code]);
    return result.rows[0];
  }

  static async create(userData) {
    const { username, email, password_hash, full_name, role, department, employee_code, avatar_url, qr_code_url } = userData;
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, full_name, role, department, employee_code, avatar_url, qr_code_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [username, email, password_hash, full_name, role || 'engineer', department, employee_code, avatar_url, qr_code_url]
    );
    return result.rows[0];
  }

  static async findAll(filters = {}) {
    let query = 'SELECT * FROM users WHERE 1=1';
    const values = [];

    if (filters.role) {
      query += ' AND role = $' + (values.length + 1);
      values.push(filters.role);
    }

    if (filters.status) {
      query += ' AND status = $' + (values.length + 1);
      values.push(filters.status);
    }

    const result = await pool.query(query, values);
    return result.rows;
  }

  static async update(id, updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updateData)) {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    values.push(id);
    const query = `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE user_id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM users WHERE user_id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
}

module.exports = User;

