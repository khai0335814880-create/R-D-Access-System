const bcrypt = require('bcryptjs');
const pool = require('./config/database');

async function debugDatabase() {
    try {
        console.log('--- Testing Database Connection ---');
        const dbRes = await pool.query('SELECT NOW()');
        console.log('Database time:', dbRes.rows[0].now);

        console.log('\n--- Listing All Users ---');
        const usersRes = await pool.query('SELECT user_id, username, password_hash, role FROM users');
        console.log('Total users:', usersRes.rowCount);
        usersRes.rows.forEach(u => {
            console.log(`User: ${u.username}, Role: ${u.role}, PassHash length: ${u.password_hash?.length}`);
        });

        if (usersRes.rowCount > 0) {
            const admin = usersRes.rows.find(u => u.username === 'admin');
            if (admin) {
                console.log('\n--- Testing Password for admin ---');
                const valid = await bcrypt.compare('admin123', admin.password_hash);
                console.log('admin / admin123 -> valid:', valid);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Debug failed:', error);
        process.exit(1);
    }
}

debugDatabase();
