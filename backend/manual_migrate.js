const pool = require('./src/config/database');

async function migrate() {
  try {
    console.log('Running manual migration...');
    await pool.query(`
      ALTER TABLE access_logs 
      ADD COLUMN IF NOT EXISTS entry_photo TEXT;
    `);
    console.log('✓ Column entry_photo added successfully');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

migrate();
