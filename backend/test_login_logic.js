require('dotenv').config();
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

async function testLogin() {
  try {
    const username = 'admin';
    const password = 'admin123';
    
    console.log(`Testing login for user: ${username}`);
    const user = await User.findByUsername(username);
    
    if (!user) {
      console.log('User not found in database');
      process.exit(1);
    }
    
    console.log('User found:', { user_id: user.user_id, username: user.username, status: user.status });
    
    const validPassword = await bcrypt.compare(password, user.password_hash);
    console.log('Password valid:', validPassword);
    
    if (validPassword) {
      console.log('Login logic SUCCESS');
    } else {
      console.log('Login logic FAILED: Incorrect password');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

testLogin();
