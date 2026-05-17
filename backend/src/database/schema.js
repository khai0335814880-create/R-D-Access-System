const pool = require('../config/database');

// Define database schema V2
const createTablesSQL = `
  -- Enable UUID extension
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

  -- 0. Create ENUM types
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
      CREATE TYPE user_role AS ENUM ('engineer', 'security', 'admin', 'auditor');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
      CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'device_status') THEN
      CREATE TYPE device_status AS ENUM ('approved', 'rejected', 'inactive');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'registration_source') THEN
      CREATE TYPE registration_source AS ENUM ('web', 'kiosk_quick');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'session_status') THEN
      CREATE TYPE session_status AS ENUM ('in', 'out', 'forced_close');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'auth_method') THEN
      CREATE TYPE auth_method AS ENUM ('qr_scan', 'manual_input');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_type') THEN
      CREATE TYPE event_type AS ENUM ('check_in', 'check_out', 'check_in_failed', 'unauthorized_access', 'device_alert');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'result_type') THEN
      CREATE TYPE result_type AS ENUM ('success', 'failed', 'warning');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
      CREATE TYPE notification_type AS ENUM ('info', 'success', 'warning', 'error');
    END IF;
  END $$;

  -- 1. Users Table
  CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_code VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL, -- Keep username for compatibility
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'engineer',
    avatar_url TEXT,
    qr_code_url TEXT,
    department VARCHAR(100),
    status user_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- 2. Devices Table
  CREATE TABLE IF NOT EXISTS devices (
    device_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    device_type VARCHAR(50) NOT NULL,
    brand VARCHAR(50) NOT NULL,
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    model_name VARCHAR(100),
    image_url TEXT,
    qr_code_url TEXT,
    status device_status NOT NULL DEFAULT 'approved',
    registered_via registration_source NOT NULL DEFAULT 'web',
    approved_by UUID REFERENCES users(user_id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- 3. Sessions Table
  CREATE TABLE IF NOT EXISTS sessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    check_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    check_out_at TIMESTAMPTZ,
    face_image_url TEXT,
    exit_face_image_url TEXT,
    auth_method auth_method NOT NULL DEFAULT 'qr_scan',
    status session_status NOT NULL DEFAULT 'in',
    forced_close_by UUID REFERENCES users(user_id),
    forced_close_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- 4. Session Devices (Many-to-Many)
  CREATE TABLE IF NOT EXISTS session_devices (
    session_device_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
    device_id UUID NOT NULL REFERENCES devices(device_id) ON DELETE CASCADE,
    scan_status VARCHAR(50) NOT NULL DEFAULT 'matched', -- matched, unregistered, quick_registered
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- 5. Quick Registrations
  CREATE TABLE IF NOT EXISTS quick_registrations (
    request_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    device_type VARCHAR(50) NOT NULL,
    brand VARCHAR(50) NOT NULL,
    serial_number VARCHAR(100) NOT NULL,
    model_name VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, approved, rejected
    reviewed_by UUID REFERENCES users(user_id),
    reviewed_at TIMESTAMPTZ,
    reject_reason TEXT,
    device_id UUID REFERENCES devices(device_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- 6. Access Logs (Event Logs)
  CREATE TABLE IF NOT EXISTS access_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type event_type NOT NULL,
    user_id UUID REFERENCES users(user_id),
    session_id UUID REFERENCES sessions(session_id),
    device_id UUID REFERENCES devices(device_id),
    scanned_qr_value TEXT,
    auth_method auth_method,
    result result_type NOT NULL,
    alert_message TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- 7. Audit Logs (Admin Actions)
  CREATE TABLE IF NOT EXISTS audit_logs (
    audit_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID NOT NULL REFERENCES users(user_id),
    action VARCHAR(100) NOT NULL,
    target_table VARCHAR(50) NOT NULL,
    target_id UUID NOT NULL,
    old_value JSONB,
    new_value JSONB,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- 8. Notifications (Kept for compatibility)
  CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type notification_type DEFAULT 'info',
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- 9. Activity Logs (General System Activity)
  CREATE TABLE IF NOT EXISTS activity_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    activity_type VARCHAR(100) NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_users_employee_code ON users(employee_code);
  CREATE INDEX IF NOT EXISTS idx_devices_serial_number ON devices(serial_number);
  CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
  CREATE INDEX IF NOT EXISTS idx_access_logs_created_at ON access_logs(created_at);
  CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
  CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
`;

async function createTables() {
  try {
    await pool.query(createTablesSQL);
    console.log('✓ Database tables V2 created successfully');
  } catch (error) {
    console.error('Error creating tables V2:', error);
    throw error;
  }
}

module.exports = { createTables };

