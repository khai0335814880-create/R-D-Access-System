const pool = require('./config/database');

async function updateAvatars() {
    try {
        await pool.query("UPDATE users SET avatar_url = '/avatars/admin.png' WHERE username = 'admin'");
        await pool.query("UPDATE users SET avatar_url = '/avatars/security.png' WHERE username = 'security'");
        await pool.query("UPDATE users SET avatar_url = '/avatars/engineer1.png' WHERE username = 'engineer1'");
        await pool.query("UPDATE users SET avatar_url = '/avatars/engineer2.png' WHERE username = 'engineer2'");
        
        console.log('✓ Avatars updated successfully');
        process.exit(0);
    } catch (error) {
        console.error('Failed to update avatars:', error);
        process.exit(1);
    }
}

updateAvatars();
