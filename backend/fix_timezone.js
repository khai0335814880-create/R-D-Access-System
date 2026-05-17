const pool = require('./src/config/database');

async function fix() {
  try {
    console.log('Altering columns to TIMESTAMPTZ...');
    await pool.query('ALTER TABLE access_logs ALTER COLUMN check_in_time TYPE TIMESTAMPTZ');
    await pool.query('ALTER TABLE access_logs ALTER COLUMN check_out_time TYPE TIMESTAMPTZ');
    await pool.query('ALTER TABLE access_logs ALTER COLUMN created_at TYPE TIMESTAMPTZ');
    await pool.query('ALTER TABLE activity_logs ALTER COLUMN created_at TYPE TIMESTAMPTZ');
    await pool.query('ALTER TABLE notifications ALTER COLUMN created_at TYPE TIMESTAMPTZ');
    console.log('✓ Columns altered successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Failed to alter columns:', err);
    process.exit(1);
  }
}

fix();
