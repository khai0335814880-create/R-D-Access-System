const pool = require('../config/database');

async function updateUsers() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Rename 'admin' to 'security' (avoid unique constraint violation)
    const res1 = await client.query(
      "UPDATE users SET username = 'security' WHERE username = 'admin' RETURNING id"
    );
    console.log(`Updated 'admin' to 'security'. Rows affected: ${res1.rowCount}`);

    // 2. Rename 'project_manager' to 'admin' and set role to 'admin'
    const res2 = await client.query(
      "UPDATE users SET username = 'admin', role = 'admin' WHERE username = 'project_manager' RETURNING id"
    );
    console.log(`Updated 'project_manager' to 'admin'. Rows affected: ${res2.rowCount}`);

    await client.query('COMMIT');
    console.log('✓ Database update completed successfully!');
    process.exit(0);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update failed, rolled back:', error);
    process.exit(1);
  } finally {
    client.release();
  }
}

updateUsers();
