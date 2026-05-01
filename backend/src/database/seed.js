const bcrypt = require('bcryptjs');
const pool = require('../config/database');

async function seedDatabase() {
  try {
    console.log('Seeding database with sample data...');

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const securityPassword = await bcrypt.hash('security123', 10);
    const engineerPassword = await bcrypt.hash('engineer123', 10);

    // Insert sample users
    const userQuery = `
      INSERT INTO users (username, email, password_hash, full_name, role, department, employee_id, status)
      VALUES 
        ('security', 'security@rnd.com', $1, 'Security Officer', 'security', 'IT', 'EMP001', 'active'),
        ('admin', 'admin@rnd.com', $2, 'System Administrator', 'admin', 'R&D', 'EMP002', 'active'),
        ('engineer1', 'engineer1@rnd.com', $3, 'Engineer One', 'engineer', 'R&D', 'EMP003', 'active'),
        ('engineer2', 'engineer2@rnd.com', $3, 'Engineer Two', 'engineer', 'R&D', 'EMP004', 'active')
      RETURNING id;
    `;

    const userResult = await pool.query(userQuery, [securityPassword, adminPassword, engineerPassword]);
    console.log('✓ Sample users created');

    // Insert sample devices
    const deviceQuery = `
      INSERT INTO devices (owner_id, device_type, brand, model, serial_number, status)
      VALUES 
        ($1, 'Laptop', 'Apple', 'MacBook Pro', 'SN12345', 'approved'),
        ($1, 'Phone', 'iPhone', 'iPhone 14', 'SN12346', 'approved'),
        ($2, 'Laptop', 'Dell', 'XPS 15', 'SN12347', 'pending'),
        ($2, 'Tablet', 'iPad', 'iPad Pro', 'SN12348', 'approved')
      RETURNING id;
    `;

    const deviceResult = await pool.query(deviceQuery, [userResult.rows[2].id, userResult.rows[3].id]);
    console.log('✓ Sample devices created');

    console.log('✓ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
