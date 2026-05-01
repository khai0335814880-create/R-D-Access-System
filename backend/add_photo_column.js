const pool = require('./src/config/database');

async function addColumn() {
  try {
    console.log('Altering devices table to add device_photo column...');
    await pool.query('ALTER TABLE devices ADD COLUMN IF NOT EXISTS device_photo TEXT');
    console.log('✓ Column added successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Failed to add column:', err);
    process.exit(1);
  }
}

addColumn();
