const pool = require('./src/config/database');

async function check() {
  try {
    const res = await pool.query('SELECT NOW(), CURRENT_TIMESTAMP');
    console.log(res.rows[0]);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
