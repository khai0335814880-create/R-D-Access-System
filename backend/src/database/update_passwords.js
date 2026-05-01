const bcrypt = require('bcryptjs');
const pool = require('../config/database');

async function updatePasswords() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Hash new passwords
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const securityPasswordHash = await bcrypt.hash('security123', 10);

    // Update 'admin' password
    const res1 = await client.query(
      "UPDATE users SET password_hash = $1 WHERE username = 'admin' RETURNING id",
      [adminPasswordHash]
    );
    console.log(`Updated password for 'admin'. Rows affected: ${res1.rowCount}`);

    // Update 'security' password
    const res2 = await client.query(
      "UPDATE users SET password_hash = $1 WHERE username = 'security' RETURNING id",
      [securityPasswordHash]
    );
    console.log(`Updated password for 'security'. Rows affected: ${res2.rowCount}`);

    await client.query('COMMIT');
    console.log('✓ Passwords updated successfully!');
    process.exit(0);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update failed, rolled back:', error);
    process.exit(1);
  } finally {
    client.release();
  }
}

updatePasswords();
