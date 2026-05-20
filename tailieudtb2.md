4.3.1. Câu lệnh tạo bảng (CREATE TABLE) 
Bước 1: Kích hoạt extension UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
Bước 2: Tạo các kiểu ENUM
CREATE TYPE user_role AS ENUM ( 'engineer', 'security', 'admin', 'auditor' );
CREATE TYPE user_status AS ENUM ( 'active', 'inactive', 'suspended' );
CREATE TYPE device_status AS ENUM ( 'approved', 'rejected', 'inactive' );
CREATE TYPE device_registered_via AS ENUM ( 'web', 'kiosk_quick' );
CREATE TYPE session_status AS ENUM ( 'in', 'out', 'forced_close' );
CREATE TYPE auth_method AS ENUM ( 'qr_scan', 'manual_input' );
CREATE TYPE scan_status AS ENUM ( 'matched', 'unregistered', 'quick_registered' );
CREATE TYPE quick_reg_status AS ENUM ( 'pending', 'approved', 'rejected' );
CREATE TYPE access_event_type AS ENUM ( 'check_in', 'check_out', 'check_in_failed', 'unauthorized_access', 'device_alert' );
CREATE TYPE access_result AS ENUM ( 'success', 'failed', 'warning' );
Bước 3: Tạo bảng
CREATE TABLE users (
	user_id     	UUID        	PRIMARY KEY DEFAULT gen_random_uuid(),
	employee_code   VARCHAR(20) 	NOT NULL UNIQUE,
	full_name   	VARCHAR(100)	NOT NULL,
	email       	VARCHAR(150)	NOT NULL UNIQUE,
	password_hash   VARCHAR(255)	NOT NULL,
	role        	user_role   	NOT NULL,
	avatar_url  	TEXT,
	qr_code_url 	TEXT,
	department  	VARCHAR(100),
	status      	user_status 	NOT NULL DEFAULT 'active',
	hrm_synced_at   TIMESTAMP,
	created_at  	TIMESTAMP   	NOT NULL DEFAULT NOW(),
	updated_at  	TIMESTAMP   	NOT NULL DEFAULT NOW()
);
 
CREATE TABLE devices (
	device_id   	UUID                	PRIMARY KEY DEFAULT gen_random_uuid(),
	owner_id    	UUID                	NOT NULL
                    	REFERENCES users(user_id) ON DELETE RESTRICT,
	device_type 	VARCHAR(50)         	NOT NULL,
	brand       	VARCHAR(50)         	NOT NULL,
	serial_number   VARCHAR(100)        	NOT NULL UNIQUE,
	model_name  	VARCHAR(100),
	image_url   	TEXT,
	qr_code_url 	TEXT,
	status      	device_status       	NOT NULL DEFAULT 'approved',
	registered_via  device_registered_via   NOT NULL DEFAULT 'web',
	approved_by 	UUID
                    	REFERENCES users(user_id) ON DELETE SET NULL,
	approved_at 	TIMESTAMP,
	created_at  	TIMESTAMP           	NOT NULL DEFAULT NOW(),
	updated_at  	TIMESTAMP           	NOT NULL DEFAULT NOW()
);
 
CREATE TABLE sessions (
	session_id      	UUID        	PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id         	UUID        	NOT NULL
                        	REFERENCES users(user_id) ON DELETE RESTRICT,
	check_in_at     	TIMESTAMP   	NOT NULL DEFAULT NOW(),
	check_out_at    	TIMESTAMP,
	face_image_url  	TEXT,
	auth_method     	auth_method 	NOT NULL,
	status          	session_status  NOT NULL DEFAULT 'in',
	forced_close_by 	UUID
                        	REFERENCES users(user_id) ON DELETE SET NULL,
	forced_close_at 	TIMESTAMP,
	notes           	TEXT,
	created_at      	TIMESTAMP   	NOT NULL DEFAULT NOW(),
 
	CONSTRAINT chk_checkout_after_checkin
    	CHECK (check_out_at IS NULL OR check_out_at > check_in_at),
 
	CONSTRAINT chk_forced_close_consistency
    	CHECK (
        	status != 'forced_close' OR
        	(forced_close_by IS NOT NULL AND forced_close_at IS NOT NULL)
    	)
);
 
CREATE TABLE session_devices (
	session_device_id   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
	session_id      	UUID    	NOT NULL
                        	REFERENCES sessions(session_id) ON DELETE RESTRICT,
	device_id       	UUID    	NOT NULL
                        	REFERENCES devices(device_id) ON DELETE RESTRICT,
	scan_status     	scan_status NOT NULL,
	created_at      	TIMESTAMP   NOT NULL DEFAULT NOW(),
 
	CONSTRAINT uq_session_device UNIQUE (session_id, device_id)
);
 
CREATE TABLE quick_registrations (
	request_id  	UUID            	PRIMARY KEY DEFAULT gen_random_uuid(),
	requester_id	UUID            	NOT NULL
                    	REFERENCES users(user_id) ON DELETE RESTRICT,
	device_type 	VARCHAR(50)     	NOT NULL,
	brand       	VARCHAR(50)     	NOT NULL,
	serial_number   VARCHAR(100)    	NOT NULL,
	model_name  	VARCHAR(100),
	status      	quick_reg_status	NOT NULL DEFAULT 'pending',
	reviewed_by 	UUID
                    	REFERENCES users(user_id) ON DELETE SET NULL,
	reviewed_at 	TIMESTAMP,
	reject_reason   TEXT,
	device_id   	UUID
                    	REFERENCES devices(device_id) ON DELETE SET NULL,
	created_at  	TIMESTAMP       	NOT NULL DEFAULT NOW(),
 
	CONSTRAINT chk_review_consistency
    	CHECK (
        	status = 'pending' OR
        	(reviewed_by IS NOT NULL AND reviewed_at IS NOT NULL)
    	),
 
	CONSTRAINT chk_approved_has_device
    	CHECK (status != 'approved' OR device_id IS NOT NULL)
);
 
CREATE TABLE access_logs (
	log_id          	UUID            	PRIMARY KEY DEFAULT gen_random_uuid(),
	event_type      	access_event_type   NOT NULL,
	user_id         	UUID
                        	REFERENCES users(user_id) ON DELETE SET NULL,
	session_id      	UUID
                        	REFERENCES sessions(session_id) ON DELETE SET NULL,
	device_id       	UUID
                        	REFERENCES devices(device_id) ON DELETE SET NULL,
	scanned_qr_value	TEXT,
	auth_method     	auth_method,
	result          	access_result   	NOT NULL,
	alert_message   	TEXT,
	ip_address      	VARCHAR(50),
	created_at      	TIMESTAMP       	NOT NULL DEFAULT NOW()
);
 
CREATE TABLE audit_logs (
	audit_id    	UUID        	PRIMARY KEY DEFAULT gen_random_uuid(),
	actor_id    	UUID        	NOT NULL
                    	REFERENCES users(user_id) ON DELETE RESTRICT,
	action      	VARCHAR(100)	NOT NULL,
	target_table	VARCHAR(50) 	NOT NULL,
	target_id   	UUID        	NOT NULL,
	old_value   	JSONB,
	new_value   	JSONB,
	reason      	TEXT,
	created_at  	TIMESTAMP   	NOT NULL DEFAULT NOW()
);
4.3.2. Thiết kế Index tối ưu truy vấn 
-- Bảng users
CREATE INDEX idx_users_employee_code ON users(employee_code);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role ON users(role);
 
-- Bảng devices
CREATE INDEX idx_devices_serial_number ON devices(serial_number);
CREATE INDEX idx_devices_owner_id ON devices(owner_id);
CREATE INDEX idx_devices_status ON devices(status);
 
-- Bảng sessions
-- Partial Unique Index: mỗi kỹ sư chỉ có tối đa 1 phiên 'in' tại một thời điểm
CREATE UNIQUE INDEX idx_sessions_active_user
	ON sessions(user_id)
	WHERE status = 'in';
 
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_check_in_at ON sessions(check_in_at DESC);
CREATE INDEX idx_sessions_status ON sessions(status);
 
-- Bảng session_devices
CREATE INDEX idx_session_devices_session_id ON session_devices(session_id);
CREATE INDEX idx_session_devices_device_id ON session_devices(device_id);
 
-- Bảng quick_registrations
CREATE INDEX idx_quick_reg_pending
	ON quick_registrations(status)
	WHERE status = 'pending';
CREATE INDEX idx_quick_reg_requester ON quick_registrations(requester_id);
 
-- Bảng access_logs
CREATE INDEX idx_access_logs_created_at ON access_logs(created_at DESC);
CREATE INDEX idx_access_logs_user_id ON access_logs(user_id);
CREATE INDEX idx_access_logs_event_type ON access_logs(event_type);
 
-- Bảng audit_logs
CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_target ON audit_logs(target_table, target_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
4.3.3. Ràng buộc nâng cao và Trigger 
Trigger 1: Tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = NOW();
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;
 
CREATE TRIGGER trg_users_updated_at
	BEFORE UPDATE ON users
	FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
 
CREATE TRIGGER trg_devices_updated_at
	BEFORE UPDATE ON devices
	FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
Trigger 2: Bảo vệ tính bất biến của nhật ký
CREATE OR REPLACE FUNCTION fn_protect_immutable_log()
RETURNS TRIGGER AS $$
BEGIN
	RAISE EXCEPTION
    	'Bảng % là append-only, không được phép sửa hoặc xóa dữ liệu
     	theo yêu cầu kiểm toán của ANZ.',
    	TG_TABLE_NAME;
	RETURN NULL;
END;
$$ LANGUAGE plpgsql;
 
CREATE TRIGGER trg_protect_access_logs
	BEFORE UPDATE OR DELETE ON access_logs
	FOR EACH ROW EXECUTE FUNCTION fn_protect_immutable_log();
 
CREATE TRIGGER trg_protect_audit_logs
	BEFORE UPDATE OR DELETE ON audit_logs
	FOR EACH ROW EXECUTE FUNCTION fn_protect_immutable_log();
Trigger 3: Tự động ghi audit log khi Admin thay đổi thông tin users
CREATE OR REPLACE FUNCTION fn_audit_users_changes()
RETURNS TRIGGER AS $$
BEGIN
	INSERT INTO audit_logs (
    	actor_id, action, target_table,
    	target_id, old_value, new_value
	) VALUES (
        current_setting('app.current_user_id')::UUID,
    	'UPDATE_USER',
    	'users',
    	OLD.user_id,
    	to_jsonb(OLD),
    	to_jsonb(NEW)
	);
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;
 
CREATE TRIGGER trg_audit_users
	AFTER UPDATE ON users
	FOR EACH ROW EXECUTE FUNCTION fn_audit_users_changes();
Trigger 4: Tự động ghi audit log khi Admin đóng phiên cưỡng bức
CREATE OR REPLACE FUNCTION fn_audit_forced_close()
RETURNS TRIGGER AS $$
BEGIN
	IF NEW.status = 'forced_close' AND OLD.status = 'in' THEN
    	INSERT INTO audit_logs (
        	actor_id, action, target_table,
        	target_id, old_value, new_value, reason
    	) VALUES (
            NEW.forced_close_by,
            'FORCE_CLOSE_SESSION',
            'sessions',
            NEW.session_id,
            jsonb_build_object('status', OLD.status),
            jsonb_build_object(
                'status', NEW.status,
                'forced_close_at', NEW.forced_close_at
        	),
        	NEW.notes
    	);
	END IF;
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;
 
CREATE TRIGGER trg_audit_forced_close
	AFTER UPDATE ON sessions
	FOR EACH ROW EXECUTE FUNCTION fn_audit_forced_close();
4.3.4. Triển khai cơ sở dữ liệu trên nền tảng cloud (Supabase) 
Bước 1: Tạo project trên Supabase
Đặt tên project à đặt mật khẩu à chọn miền
Vào Project Settings à Database để lấy thông tin kết nối
Bước 2: Chạy migration SQL qua SQL Editor
Vào SQL Editor trên dashboard Supabase, chạy lần lượt theo thứ tự:
File 01_extensions.sql   → Kích hoạt pgcrypto
File 02_enums.sql        → Tạo toàn bộ kiểu ENUM
File 03_tables.sql       → Tạo 7 bảng theo thứ tự phụ thuộc FK
File 04_indexes.sql      → Tạo toàn bộ index
File 05_triggers.sql     → Tạo functions và triggers
Bước 3: Kiểm tra Database, ví dụ
-- Chạy trong SQL Editor để kiểm tra tất cả bảng
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
 
-- Kết quả kỳ vọng:
-- access_logs
-- audit_logs
-- devices
-- quick_registrations
-- session_devices
-- sessions
-- users
 
-- Kiểm tra tất cả ENUM đã được tạo
SELECT typname
FROM pg_type
WHERE typtype = 'e'
ORDER BY typname;
 
-- Kết quả kỳ vọng:
-- access_event_type
-- access_result
-- auth_method
-- device_registered_via
-- device_status
-- quick_reg_status
-- scan_status
-- session_status
-- user_role
-- user_status
 
-- Kiểm tra tất cả index đã được tạo
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
Bước 4: Lấy connection string cho backend

