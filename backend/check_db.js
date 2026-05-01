const pool = require('./src/config/database');

async function checkColumns() {
  try {
    const resLogs = await pool.query(`
      SELECT column_name FROM information_schema.columns WHERE table_name = 'access_logs'
    `);
    const resNotify = await pool.query(`
      SELECT table_name FROM information_schema.tables WHERE table_name = 'notifications'
    `);
    console.log('Access Logs columns:', resLogs.rows.map(r => r.column_name).join(', '));
    console.log('Notifications table exists:', resNotify.rows.length > 0);
    process.exit(0);
  } catch (err) {
    console.error('Error checking columns:', err);
    process.exit(1);
  }
}

checkColumns();
