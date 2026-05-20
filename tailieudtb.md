Chương 4: Thiết kế cơ sở dữ liệu
4.1. Phân tích yêu cầu dữ liệu
4.1.1. Nguồn yêu cầu dữ liệu
Yêu cầu dữ liệu của hệ thống được thu thập từ nhiều nguồn khác nhau trong quá trình phân tích nghiệp vụ tại phòng R&D của HCLTech. Cụ thể, các nguồn chính bao gồm:
Từ quy trình nghiệp vụ hiện tại: Sổ đăng ký giấy đang được sử dụng tại phòng R&D ghi nhận các trường thông tin gồm họ tên kỹ sư, mã số nhân viên, loại thiết bị, số serial và chữ ký xác nhận. Đây là cơ sở để xác định các trường dữ liệu cần được số hóa.
Quy trình nghiệp vụ đề xuất: Hệ thống được thiết kế để hỗ trợ quy trình check-in/check-out điện tử, trong đó dữ liệu được ghi nhận và lưu trữ tự động, cho phép truy xuất nhanh chóng và chính xác hơn so với phương pháp thủ công.
Yêu cầu chức năng của hệ thống: Bao gồm các chức năng như quản lý tài sản, vận hành check-in/check-out, giám sát và phê duyệt, quản trị hệ thống. Đặt ra các nhu cầu lưu trữ dữ liệu cụ thể, bao gồm thông tin nhân viên, thiết bị, phiên ra/vào, ảnh chân dung và nhật ký kiểm toán.
Yêu cầu phi chức năng: Các ràng buộc về hiệu năng, tính toàn vẹn (không trùng serial, không trùng phiên), bảo mật và khả năng phục hồi ảnh hưởng trực tiếp đến cách tổ chức và thiết kế cơ sở dữ liệu.
Từ kết quả phỏng vấn và khảo sát: Các bên liên quan (kỹ sư, bảo vệ, đối soát viên ANZ, admin HCL) đã xác nhận các trường dữ liệu cần thiết như ảnh chân dung tại thời điểm check-in, lịch sử phê duyệt thiết bị, trạng thái phiên làm việc và nhật ký thay đổi quyền hạn tài khoản.
4.1.2. Các nhóm dữ liệu cần quản lý 
4.1.2.1. Dữ liệu nhân viên 
Nhóm này lưu trữ thông tin định danh của từng nhân viên (mã nhân viên, họ tên, email, ảnh đại diện), vai trò trong hệ thống (kỹ sư, bảo vệ, admin, đối soát viên) và trạng thái hiện tại (đang làm việc, đã nghỉ, tạm đình chỉ). Mã QR định danh cá nhân cũng được sinh ra và gắn với mỗi nhân viên trong nhóm dữ liệu này.
4.1.2.2. Dữ liệu thiết bị 
Nhóm này lưu trữ toàn bộ thông tin về các thiết bị được đăng ký vào hệ thống, bao gồm số serial (là định danh duy nhất), loại thiết bị, hãng sản xuất, hình ảnh đối chứng, mã QR thiết bị và trạng thái phê duyệt (Approved, Rejected). Mỗi thiết bị được liên kết với một kỹ sư sở hữu cụ thể.
4.1.2.3. Dữ liệu phiên ra/vào 
Đây là nhóm dữ liệu vận hành cốt lõi, ghi nhận mỗi lượt check-in và check-out của kỹ sư tại phòng R&D. Thông tin được lưu bao gồm thời gian check-in, thời gian check-out, danh sách thiết bị đi kèm trong phiên, đường dẫn ảnh chân dung được chụp tại thời điểm check-in, phương thức xác thực (QR hoặc nhập thủ công) và trạng thái phiên (In/Out/Forced Close).
4.1.2.4. Dữ liệu yêu cầu đăng ký nhanh 
Nhóm này lưu trữ tạm thời các yêu cầu đăng ký thiết bị phát sinh ngay tại Kiosk, khi kỹ sư chưa đăng ký thiết bị qua Web từ trước. Dữ liệu bao gồm thông tin thiết bị do kỹ sư nhập tại chỗ, trạng thái xử lý (Pending/Approved/Rejected), ID của bảo vệ đã thực hiện phán quyết và thời điểm xử lý.
4.1.2.5. Dữ liệu nhật ký truy cập
Nhóm này ghi nhận chi tiết từng sự kiện ra vào, bao gồm cả các trường hợp thất bại hoặc bị từ chối. Đây là nguồn dữ liệu phục vụ xuất báo cáo kiểm toán theo yêu cầu của ANZ, với yêu cầu dữ liệu phải bất biến và lưu trữ tối thiểu 6 tháng.
4.1.2.6. Dữ liệu nhật ký quản trị 
Nhóm này ghi lại toàn bộ các hành động thay đổi dữ liệu của Admin (thêm/sửa/xóa người dùng, phân quyền, đóng phiên cưỡng bức, cập nhật thiết bị). Mỗi bản ghi bao gồm định danh người thực hiện, thời gian, hành động, đối tượng bị tác động, và giá trị trước/sau khi thay đổi. Nhóm dữ liệu này không có bất kỳ chức năng sửa hoặc xóa nào trên giao diện hệ thống.
4.2. Thiết kế mô hình dữ liệu 
4.2.1. Xác định thực thể 
STT
Tên thực thể
Tên bảng 
Mô tả nghiệp vụ
1
Nhân viên
users
Lưu thông tin định danh và vai trò của toàn bộ nhân viên tham gia hệ thống
2
Thiết bị
devices
Lưu thông tin các thiết bị được đăng ký bởi kỹ sư
3
Phiên ra/vào
sessions
Ghi nhận mỗi lượt check-in/check-out của kỹ sư
4
Chi tiết thiết bị trong phiên
session_devices
Lưu danh sách thiết bị thực tế được mang vào trong mỗi phiên
5
Yêu cầu đăng ký nhanh
quick_registrations
Lưu tạm yêu cầu đăng ký thiết bị phát sinh tại Kiosk
6
Nhật ký truy cập
access_logs
Ghi nhận toàn bộ sự kiện ra vào bao gồm cả thành công và thất bại
7
Nhật ký quản trị
audit_logs
Ghi nhận toàn bộ thay đổi dữ liệu do Admin thực hiện

Bảng 4.1: Danh sách các thực thể của hệ thống
4.2.2. Đặc tả chi tiết các thực thể
Tên thực thể
Thuộc tính
Kiểu dữ liệu
Ràng buộc
Mô tả
1. users
user_id
UUID
PRIMARY KEY
Định danh duy nhất của nhân viên trong hệ thống
employee_code
VARCHAR(20)
UNIQUE, NOT NULL
Mã nhân viên đồng bộ từ HRM
full_name
VARCHAR(100)
NOT NULL
Họ và tên đầy đủ
email
VARCHAR(150)
UNIQUE, NOT NULL
Email công ty dùng để đăng nhập
password_hash
VARCHAR(255)
NOT NULL
Mật khẩu đã mã hóa một chiều (bcrypt)
role
ENUM
NOT NULL
Vai trò: engineer, security, admin, auditor
avatar_url
TEXT
NULLABLE
Đường dẫn ảnh đại diện
qr_code_url
TEXT
NULLABLE
Đường dẫn file mã QR định danh cá nhân
department
VARCHAR(100)
NULLABLE
Phòng ban
status
ENUM
NOT NULL, DEFAULT 'active'
Trạng thái: active, inactive, suspended
created_at
TIMESTAMP
NOT NULL, DEFAULT NOW()
Thời điểm tạo tài khoản
updated_at
TIMESTAMP
NOT NULL, DEFAULT NOW()
Thời điểm cập nhật gần nhất
2. devices
device_id
UUID
PRIMARY KEY
Định danh duy nhất thiết bị trong hệ thống
owner_id
UUID
FOREIGN KEY → users
Kỹ sư sở hữu thiết bị
device_type
VARCHAR(50)
NOT NULL
Loại thiết bị (Laptop, Tablet, v.v.)
brand
VARCHAR(50)
NOT NULL
Hãng sản xuất (Apple, Lenovo, Dell, v.v.)
serial_number
VARCHAR(100)
UNIQUE, NOT NULL
Số serial vật lý, là định danh duy nhất của thiết bị
model_name
VARCHAR(100)
NULLABLE
Tên model cụ thể (MacBook Pro 14, ThinkPad X1, v.v.)
image_url
TEXT
NOT NULL
Đường dẫn hình ảnh đối chứng
qr_code_url
TEXT
NULLABLE
Đường dẫn file mã QR định danh thiết bị
status
ENUM
NOT NULL, DEFAULT 'approved'
Trạng thái: approved, rejected, inactive
registered_via
ENUM
NOT NULL
Nguồn đăng ký: web, kiosk_quick
approved_by
UUID
FOREIGN KEY → users, NULLABLE
ID bảo vệ phê duyệt (chỉ có nếu đăng ký nhanh tại Kiosk)
approved_at
TIMESTAMP
NULLABLE
Thời điểm phê duyệt
created_at
TIMESTAMP
NOT NULL, DEFAULT NOW()
Thời điểm đăng ký
updated_at
TIMESTAMP
NOT NULL, DEFAULT NOW()
Thời điểm cập nhật gần nhất
3. sessions
session_id
UUID
PRIMARY KEY
Định danh duy nhất của phiên làm việc
user_id
UUID
FOREIGN KEY → users, NOT NULL
Kỹ sư thực hiện check-in
check_in_at
TIMESTAMP
NOT NULL
Thời điểm check-in (lấy từ server)
check_out_at
TIMESTAMP
NULLABLE
Thời điểm check-out (NULL nếu đang trong phòng)
face_image_url
TEXT
NULLABLE
Đường dẫn ảnh chân dung chụp tại thời điểm check-in
auth_method
ENUM
NOT NULL
Phương thức xác thực: qr_scan, manual_input
status
ENUM
NOT NULL, DEFAULT 'in'
Trạng thái phiên: in, out, forced_close
forced_close_by
UUID
FOREIGN KEY → users, NULLABLE
ID Admin xử lý kẹt phiên (nếu có)
forced_close_at
TIMESTAMP
NULLABLE
Thời điểm Admin đóng phiên cưỡng bức
notes
TEXT
NULLABLE
Ghi chú của Admin khi đóng phiên
created_at
TIMESTAMP
NOT NULL, DEFAULT NOW()
Thời điểm tạo bản ghi
4. session_devices
session_device_id
UUID
PRIMARY KEY
Định danh duy nhất bản ghi
session_id
UUID
FOREIGN KEY → sessions, NOT NULL
Phiên làm việc tương ứng
device_id
UUID
FOREIGN KEY → devices, NOT NULL
Thiết bị được mang vào trong phiên
scan_status
ENUM
NOT NULL
Trạng thái đối soát: matched, unregistered, quick_registered
created_at
TIMESTAMP
NOT NULL, DEFAULT NOW()
Thời điểm ghi nhận
5. quick_registrations
request_id
UUID
PRIMARY KEY
Định danh duy nhất yêu cầu
requester_id
UUID
FOREIGN KEY → users, NOT NULL
Kỹ sư gửi yêu cầu
device_type
VARCHAR(50)
NOT NULL
Loại thiết bị khai báo tại Kiosk
brand
VARCHAR(50)
NOT NULL
Hãng sản xuất
serial_number
VARCHAR(100)
NOT NULL
Số serial khai báo tại chỗ
model_name
VARCHAR(100)
NULLABLE
Tên model
status
ENUM
NOT NULL, DEFAULT 'pending'
Trạng thái: pending, approved, rejected
reviewed_by
UUID
FOREIGN KEY → users, NULLABLE
ID bảo vệ xử lý yêu cầu
reviewed_at
TIMESTAMP
NULLABLE
Thời điểm xử lý
reject_reason
TEXT
NULLABLE
Lý do từ chối (nếu bảo vệ nhập)
device_id
UUID
FOREIGN KEY → devices, NULLABLE
Liên kết sang bảng devices nếu được duyệt
created_at
TIMESTAMP
NOT NULL, DEFAULT NOW()
Thời điểm gửi yêu cầu
6. access_logs
log_id
UUID
PRIMARY KEY
Định danh duy nhất bản ghi
event_type
ENUM
NOT NULL
Loại sự kiện: check_in, check_out, check_in_failed, unauthorized_access, device_alert
user_id
UUID
FOREIGN KEY → users, NULLABLE
Nhân viên liên quan (NULL nếu là người lạ)
session_id
UUID
FOREIGN KEY → sessions, NULLABLE
Phiên liên quan (nếu có)
device_id
UUID
FOREIGN KEY → devices, NULLABLE
Thiết bị liên quan (nếu có)
scanned_qr_value
TEXT
NULLABLE
Giá trị QR thực tế đã quét (dùng cho trường hợp thất bại hoặc truy cập trái phép)
auth_method
ENUM
NULLABLE
Phương thức xác thực: qr_scan, manual_input
result
ENUM
NOT NULL
Kết quả: success, failed, warning
alert_message
TEXT
NULLABLE
Nội dung cảnh báo (nếu có)
ip_address
INET
NULLABLE
Địa chỉ IP thiết bị Kiosk
created_at
TIMESTAMP
NOT NULL, DEFAULT NOW()
Thời điểm xảy ra sự kiện
7. audit_logs
audit_id
UUID
PRIMARY KEY
Định danh duy nhất bản ghi
actor_id
UUID
FOREIGN KEY → users, NOT NULL
Admin thực hiện hành động
action
VARCHAR(100)
NOT NULL
Hành động thực hiện (ví dụ: UPDATE_ROLE, FORCE_CLOSE_SESSION, DEACTIVATE_USER)
target_table
VARCHAR(50)
NOT NULL
Bảng dữ liệu bị tác động
target_id
UUID
NOT NULL
ID bản ghi bị tác động
old_value
JSONB
NULLABLE
Giá trị trước khi thay đổi (lưu dạng JSON)
new_value
JSONB
NULLABLE
Giá trị sau khi thay đổi (lưu dạng JSON)
reason
TEXT
NULLABLE
Lý do thực hiện hành động (Admin nhập tùy chọn)
created_at
TIMESTAMP
NOT NULL, DEFAULT NOW()
Thời điểm ghi nhận


4.2.3. Xác định mối quan hệ 
STT
Thực thể A
Thực thể B
Kiểu quan hệ
Mô tả
1
users
devices
1 – N
Một nhân viên có thể đăng ký nhiều thiết bị, nhưng mỗi thiết bị chỉ thuộc về một nhân viên duy nhất. Hay một bảo vệ có thể phê duyệt nhiều thiết bị đăng ký nhanh tại Kiosk. 
2
users
sessions
1 – N
Một nhân viên có thể có nhiều phiên ra/vào khác nhau theo thời gian, nhưng tại mỗi thời điểm chỉ được phép tồn tại một phiên có trạng thái in. Hay một Admin có thể đóng cưỡng bức nhiều phiên bị kẹt của các kỹ sư khác nhau. 
3
sessions
devices
N – N
Một phiên có thể bao gồm nhiều thiết bị, và một thiết bị có thể xuất hiện trong nhiều phiên khác nhau theo thời gian.
4
users
quick_registrations
1 – N 
Một kỹ sư có thể gửi nhiều yêu cầu đăng ký nhanh. Hay một bảo vệ có thể xử lý nhiều yêu cầu đăng ký nhanh.
5
quick_registrations
devices
1 – 1
Khi một yêu cầu đăng ký nhanh được bảo vệ phê duyệt, hệ thống tự động tạo một bản ghi thiết bị mới trong bảng devices.
6
users
access_logs
1 – N
Mỗi sự kiện truy cập được gắn với một nhân viên cụ thể (nếu xác định được danh tính).
7
users
audit_logs
1 – N
Một Admin có thể thực hiện nhiều hành động quản trị khác nhau theo thời gian. 
8
sessions
access_logs
1 – N
Mỗi phiên làm việc có thể phát sinh nhiều sự kiện được ghi vào nhật ký truy cập.
9
devices
access_logs
1 – N
Một thiết bị có thể xuất hiện trong nhiều sự kiện nhật ký khác nhau theo thời gian. 

Bảng 4.3: Tổng hợp các mối quan hệ giữa các thực thể
4.2.4. Thiết kế sơ đồ ERD 

Thực thể users đóng vai trò là trung tâm kết nối với hầu hết các thực thể còn lại trong hệ thống do mọi nghiệp vụ đều gắn liền với danh tính người dùng. Thực thể session_devices đóng vai trò bảng trung gian phân giải quan hệ nhiều-nhiều giữa sessions và devices. Các thực thể access_logs và audit_logs có tính chất append-only, chỉ nhận dữ liệu ghi vào mà không cho phép cập nhật hay xóa.
4.2.5. Chuẩn hóa dữ liệu
Quá trình chuẩn hóa được thực hiện nhằm loại bỏ dư thừa dữ liệu, đảm bảo tính nhất quán và tối ưu khả năng bảo trì. Thiết kế hiện tại được kiểm tra lần lượt qua ba dạng chuẩn.
Dạng chuẩn 1 (1NF – First Normal Form)
Tất cả các bảng trong hệ thống đều đáp ứng 1NF: mỗi thuộc tính chỉ chứa một giá trị nguyên tử, không có nhóm thuộc tính lặp lại. Cụ thể, danh sách thiết bị trong một phiên không được lưu dưới dạng mảng trong bảng sessions mà được tách thành bảng riêng session_devices, đảm bảo mỗi dòng chỉ chứa một thiết bị.
Dạng chuẩn 2 (2NF – Second Normal Form)
Tất cả các bảng đều có khóa chính đơn (UUID), do đó không tồn tại phụ thuộc hàm bộ phận. Bảng trung gian session_devices có khóa chính là session_device_id và mọi thuộc tính đều phụ thuộc hoàn toàn vào khóa này, đảm bảo đạt 2NF.
Dạng chuẩn 3 (3NF – Third Normal Form)
Không tồn tại phụ thuộc bắc cầu (transitive dependency) trong các bảng. Ví dụ, thông tin hãng sản xuất (brand) và loại thiết bị (device_type) phụ thuộc trực tiếp vào device_id, không phụ thuộc vào owner_id. Thông tin nhân viên không được lưu lặp trong bảng sessions mà chỉ tham chiếu qua user_id.
Một ngoại lệ có chủ ý được áp dụng cho bảng audit_logs: trường old_value và new_value được lưu dưới dạng JSONB thay vì tách thành các bảng riêng. Đây là quyết định thiết kế có chủ đích nhằm đảm bảo tính linh hoạt của nhật ký quản trị khi cần ghi lại các thay đổi từ nhiều bảng dữ liệu khác nhau mà không làm phức tạp cấu trúc cơ sở dữ liệu. Cách tiếp cận này phù hợp với đặc tính append-only của bảng nhật ký và được chấp nhận trong thiết kế hệ thống kiểm toán.
4.3. Thiết kế cơ sở dữ liệu vật lý 
Phần này trình bày chi tiết kiến trúc cơ sở dữ liệu vật lý, hạ tầng triển khai Cloud và các cơ chế bảo mật chuyên sâu được áp dụng cho hệ thống R&D Access Management System. Hệ thống được xây dựng trên nền tảng Supabase kết hợp PostgreSQL nhằm đảm bảo khả năng mở rộng, hiệu năng xử lý cao, tính sẵn sàng liên tục và mức độ an toàn dữ liệu tối ưu cho môi trường quản lý an ninh và kiểm soát ra vào.
4.3.1. Hệ quản trị cơ sở dữ liệu và các tiện ích mở rộng
Hệ thống sử dụng PostgreSQL 15.x làm hệ quản trị cơ sở dữ liệu trung tâm nhờ khả năng xử lý mạnh mẽ, độ ổn định cao và hỗ trợ tốt cho các hệ thống yêu cầu bảo mật nghiêm ngặt. Để đáp ứng các nghiệp vụ đặc thù của hệ thống, một số thư viện mở rộng (Extensions) được kích hoạt như sau:
uuid-ossp: Được sử dụng để sinh mã định danh UUID v4 ngẫu nhiên cho các thực thể như người dùng, thiết bị và phiên truy cập. Việc sử dụng UUID giúp hạn chế nguy cơ dự đoán ID trên URL hoặc khai thác tuần tự dữ liệu, từ đó nâng cao tính bảo mật cho hệ thống.
pgcrypto: Cung cấp các hàm mã hóa và băm dữ liệu mạnh mẽ. Extension này được sử dụng để mã hóa thông tin nhạy cảm và hỗ trợ bảo vệ dữ liệu người dùng trước khi lưu xuống cơ sở dữ liệu.
pg_stat_statements: Hỗ trợ giám sát và thống kê hiệu năng truy vấn SQL theo thời gian thực. Công cụ này cho phép phân tích các câu lệnh tiêu tốn nhiều tài nguyên nhằm phục vụ quá trình tối ưu hóa truy vấn và xây dựng chiến lược Index phù hợp.
4.3.2. Hạ tầng Cloud và quản lý kết nối (Connection Infrastructure)
Hệ thống được triển khai trên nền tảng Supabase Cloud sử dụng hạ tầng AWS ap-southeast-1 (Singapore) nhằm đảm bảo độ ổn định cao, khả năng mở rộng linh hoạt và tối ưu độ trễ kết nối cho người dùng tại Việt Nam.
Transaction Pooler (PgBouncer): Hệ thống sử dụng PgBouncer thông qua cổng 6543 để quản lý và tái sử dụng các kết nối cơ sở dữ liệu từ máy chủ ứng dụng Node.js. Thay vì tạo mới kết nối cho từng yêu cầu, cơ chế Pooling giúp tận dụng các kết nối hiện có, giảm tiêu thụ tài nguyên RAM và nâng cao khả năng chịu tải của hệ thống khi số lượng truy cập tăng cao.
SSL Enforcement: Toàn bộ kết nối đến cơ sở dữ liệu đều bắt buộc sử dụng giao thức mã hóa TLS 1.3. Các kết nối không bảo mật hoặc truy cập thông qua cổng không hợp lệ sẽ bị chặn trực tiếp tại tầng Firewall nhằm đảm bảo tính an toàn trong quá trình truyền tải dữ liệu.
4.3.3. Thiết kế chỉ mục tối ưu hiệu năng
Để đảm bảo tốc độ truy xuất dữ liệu nhanh và thời gian phản hồi thấp, hệ thống triển khai nhiều loại chỉ mục (Index) khác nhau tùy theo đặc điểm dữ liệu và nhu cầu truy vấn.
B-Tree Index: Được áp dụng cho các trường định danh và các cột có tần suất tìm kiếm cao như user_id, device_id và serial_number. Đây là loại Index phù hợp cho các thao tác tìm kiếm, sắp xếp và so sánh dữ liệu thông thường.
GIN (Generalized Inverted Index): Được sử dụng cho bảng audit_logs với dữ liệu dạng JSONB. Loại Index này cho phép truy vấn nhanh các thuộc tính nằm sâu bên trong cấu trúc dữ liệu phi cấu trúc, đặc biệt phù hợp với các nghiệp vụ lưu trữ nhật ký hoạt động và lịch sử truy cập
Covering Index: Hệ thống kết hợp nhiều trường thường xuyên được truy vấn cùng nhau như full_name và employee_code trong cùng một Index nhằm giảm số lần truy cập trực tiếp vào bảng dữ liệu gốc, từ đó tối ưu I/O và cải thiện hiệu năng tổng thể.
4.3.4. Bảo mật tầng vật lý và phân quyền mức dòng (Row Level Security)
Bảo mật dữ liệu là yêu cầu cốt lõi của hệ thống quản lý an ninh và kiểm soát ra vào. Vì vậy, hệ thống triển khai nhiều lớp bảo vệ nhằm hạn chế tối đa nguy cơ truy cập trái phép.
RLS Policies (Row Level Security): Mỗi bảng dữ liệu đều được cấu hình chính sách RLS riêng biệt theo mô hình Zero Trust. Cơ chế này đảm bảo người dùng chỉ có thể truy cập dữ liệu thuộc phạm vi được cấp quyền, ngay cả trong trường hợp Token xác thực bị rò rỉ.
Database Roles: Hệ thống phân chia quyền truy cập thành nhiều cấp độ khác nhau:
postgres: Quyền quản trị cao nhất, chỉ sử dụng cho quá trình migration và quản trị hệ thống.
authenticated: Quyền dành cho người dùng đã xác thực, được kiểm soát thông qua RLS.
anon: Quyền truy cập giới hạn dành cho các chức năng công khai như đăng nhập hoặc truy cập tài liệu chung.
Encryption at Rest: Toàn bộ dữ liệu vật lý lưu trữ trên hệ thống đều được mã hóa theo chuẩn AES-256, giúp bảo vệ dữ liệu trong trường hợp xảy ra sự cố liên quan đến hạ tầng lưu trữ hoặc thất thoát thiết bị vật lý.
4.3.5. Cơ chế sao lưu và phục hồi dữ liệu 
Để đảm bảo tính liên tục và an toàn dữ liệu, hệ thống triển khai cơ chế sao lưu và phục hồi theo nhiều lớp.
Daily Snapshots: Supabase tự động thực hiện sao lưu hệ thống định kỳ mỗi ngày dưới dạng Snapshot. Các bản sao lưu được lưu trữ tại khu vực địa lý độc lập nhằm đảm bảo khả năng phục hồi khi xảy ra sự cố hạ tầng.
Write-Ahead Logging (WAL): Mọi giao dịch đều được ghi nhận vào WAL trước khi thực hiện trên cơ sở dữ liệu chính. Cơ chế này hỗ trợ phục hồi dữ liệu chính xác đến từng thời điểm trong trường hợp mất điện hoặc lỗi hệ thống đột ngột.
Point-in-Time Recovery (PITR): Hệ thống hỗ trợ phục hồi dữ liệu theo từng mốc thời gian cụ thể trong vòng 7 ngày gần nhất. Tính năng này đặc biệt hữu ích trong các trường hợp xóa nhầm dữ liệu hoặc xảy ra tấn công mã độc ransomware.
4.3.6. Giám sát tài nguyên và cảnh báo hệ thống
Hệ thống triển khai cơ chế giám sát tài nguyên liên tục nhằm phát hiện sớm các nguy cơ ảnh hưởng đến hiệu năng vận hành.
CPU/RAM Alerts: Tự động gửi cảnh báo qua Email hoặc Slack khi mức sử dụng CPU hoặc RAM vượt quá ngưỡng 80% trong thời gian liên tục 5 phút.
Slow Query Logs: Các câu lệnh SQL có thời gian thực thi vượt quá 1 giây sẽ được tự động ghi nhận vào hệ thống nhật ký để phục vụ quá trình phân tích và tối ưu hóa hiệu năng truy vấn.
4.4. Thiết kế truy vấn và hỗ trợ nghiệp vụ
4.4.1. Truy vấn xác thực và phân quyền người dùng
Hệ thống áp dụng cơ chế xác thực dựa trên tài khoản định danh duy nhất kết hợp mô hình phân quyền theo vai trò (Role-Based Access Control – RBAC).
Mục đích: Đảm bảo chỉ những người dùng hợp lệ mới có thể truy cập hệ thống và thực hiện đúng các chức năng được cấp quyền.
Luồng xử lý: Quá trình xác thực được thực hiện theo các bước:
Tìm kiếm thông tin người dùng thông qua username hoặc employee_code.
Kiểm tra trạng thái tài khoản (status = 'active').
Trả về thông tin vai trò để Middleware xử lý phân quyền truy cập.
Câu lệnh SQL tiêu biểu:
SELECT user_id, password_hash, role, status
FROM users
WHERE username = $1
AND status = 'active';

Ý nghĩa nghiệp vụ: Sau khi xác thực thành công, hệ thống sẽ cấp JWT Token và giới hạn quyền truy cập theo vai trò như Admin, Security hoặc Employee nhằm đảm bảo an toàn dữ liệu và tránh truy cập trái phép.
4.4.2. Truy vấn quản lý kiểm soát ra vào
Đây là nghiệp vụ trung tâm của hệ thống, chịu trách nhiệm xử lý hoạt động check-in/check-out của nhân viên cùng các thiết bị mang theo khi ra vào khu vực R&D.
Mục đích: Ghi nhận đầy đủ thông tin phiên truy cập bao gồm thời gian, phương thức xác thực, hình ảnh nhận diện và danh sách thiết bị đi kèm.
Luồng xử lý: Hệ thống thực hiện chuỗi thao tác dưới dạng Atomic Transaction nhằm đảm bảo dữ liệu luôn đồng nhất:
Tạo phiên làm việc mới trong bảng sessions.
Liên kết các thiết bị vào phiên thông qua bảng session_devices.
Ghi lịch sử hoạt động vào bảng access_logs.
Tối ưu hiệu năng: Sử dụng cơ chế INSERT ... SELECT kết hợp unnest() để thêm nhiều thiết bị trong một câu lệnh duy nhất thay vì thực hiện nhiều truy vấn lặp, giúp giảm tải cho Database và tăng tốc độ xử lý.
Câu lệnh SQL tiêu biểu (Luồng Check-in):
-- Tạo phiên làm việc mới
INSERT INTO sessions (user_id, face_image_url, auth_method)
VALUES ($1, $2, $3)
RETURNING session_id;

-- Liên kết danh sách thiết bị với phiên
INSERT INTO session_devices (session_id, device_id)
SELECT 'session_uuid_vua_tao',
       unnest(ARRAY['device_uuid_1', 'device_uuid_2']);
Ý nghĩa nghiệp vụ: Cơ chế này giúp hệ thống theo dõi chính xác các thiết bị được mang vào khu vực nghiên cứu, phục vụ đối soát an ninh và truy vết khi xảy ra sự cố.
4.4.3. Truy vấn nhật ký và giám sát an ninh
Hệ thống Dashboard dành cho bảo vệ yêu cầu dữ liệu được cập nhật nhanh chóng, đầy đủ và trực quan nhằm hỗ trợ giám sát liên tục.
Mục đích: Hiển thị danh sách hoạt động ra vào theo thời gian thực kèm thông tin người dùng, ảnh xác thực và trạng thái truy cập.
Luồng xử lý: Hệ thống sử dụng JOIN và LEFT JOIN giữa các bảng access_logs, users và sessions để tổng hợp dữ liệu phục vụ Dashboard giám sát.
Câu lệnh SQL tiêu biểu:
SELECT al.*,
       u.full_name,
       s.face_image_url AS entry_photo
FROM access_logs al
JOIN users u
ON al.user_id = u.user_id
LEFT JOIN sessions s
ON al.session_id = s.session_id
ORDER BY al.created_at DESC
LIMIT 50;
Ý nghĩa nghiệp vụ: Thông tin truy cập được hiển thị tức thời giúp bộ phận an ninh dễ dàng đối chiếu người ra vào, phát hiện các hành vi bất thường và hỗ trợ xử lý sự cố nhanh chóng.
4.4.4. Truy vấn báo cáo và thống kê
Hệ thống hỗ trợ nhiều truy vấn thống kê nhằm phục vụ công tác quản lý, phân tích lưu lượng ra vào và đánh giá hiệu quả vận hành phòng Lab.
Mục đích: Thống kê số lượng lượt truy cập theo thời gian, phân tích mật độ hoạt động và theo dõi tình trạng hiện diện trong khu vực kiểm soát.
Kỹ thuật xử lý: Sử dụng hàm date_trunc() để gom nhóm dữ liệu theo giờ, ngày hoặc tháng phục vụ việc xây dựng Dashboard và biểu đồ thống kê.
Câu lệnh SQL tiêu biểu:
SELECT date_trunc('hour', created_at) AS hour,
       COUNT(*) AS total_checkin
FROM access_logs
WHERE event_type = 'check_in'
GROUP BY hour;
Ý nghĩa nghiệp vụ: Kết quả thống kê hỗ trợ quản trị viên đánh giá tần suất sử dụng phòng Lab, phân tích khung giờ cao điểm và tối ưu công tác quản lý an ninh.
4.4.5. Tối ưu hóa truy vấn
Để đảm bảo thời gian phản hồi thấp và khả năng xử lý ổn định khi dữ liệu tăng lớn, hệ thống áp dụng nhiều kỹ thuật tối ưu truy vấn.
Giới hạn dữ liệu truy xuất: Hạn chế sử dụng SELECT *, chỉ truy xuất các trường cần thiết nhằm giảm tải băng thông và bộ nhớ.
Lưu trữ Metadata bằng JSONB: Các dữ liệu phụ như IP, trình duyệt hoặc thông tin thiết bị được lưu trong cột JSONB để giảm số lượng cột vật lý và tăng tính linh hoạt mở rộng.
Keyset Pagination: Thay thế OFFSET bằng điều kiện thời gian nhằm giữ tốc độ phân trang ổn định ngay cả khi bảng dữ liệu có hàng triệu bản ghi.
Ví dụ Keyset Pagination:
SELECT *
FROM access_logs
WHERE created_at < '2026-05-10 10:00:00'
ORDER BY created_at DESC
LIMIT 20;
Ví dụ truy vấn dữ liệu JSONB:
SELECT description
FROM activity_logs
WHERE metadata->>'ip' = '192.168.1.1';
Ý nghĩa nghiệp vụ: Các kỹ thuật tối ưu giúp hệ thống duy trì tốc độ phản hồi nhanh, nâng cao trải nghiệm người dùng và đảm bảo khả năng mở rộng lâu dài.
4.4.6. Hỗ trợ nghiệp vụ thời gian thực 
Hệ thống hỗ trợ cập nhật dữ liệu theo thời gian thực nhằm đảm bảo bộ phận an ninh luôn nhận được thông tin mới nhất mà không cần tải lại trang.
Cơ chế hoạt động: Kết hợp giữa PostgreSQL Listen/Notify và Socket.io để truyền dữ liệu realtime từ Database đến Dashboard.
Luồng dữ liệu:
Database phát sinh bản ghi mới.
Trigger kích hoạt sự kiện NOTIFY.
Backend nhận thông báo và phát dữ liệu qua Socket.
Frontend Dashboard cập nhật giao diện ngay lập tức.
Mã SQL cấu hình Trigger Notify:
-- Hàm gửi thông báo realtime
CREATE OR REPLACE FUNCTION notify_activity()
RETURNS trigger AS $$
BEGIN
  PERFORM pg_notify(
    'new_activity_event',
    row_to_json(NEW)::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger tự động kích hoạt khi có dữ liệu mới
CREATE TRIGGER trg_notify_activity
AFTER INSERT ON access_logs
FOR EACH ROW
EXECUTE FUNCTION notify_activity();
Ý nghĩa nghiệp vụ: Cơ chế realtime giúp Dashboard an ninh hiển thị ngay lập tức các lượt ra vào, cảnh báo truy cập bất thường và nâng cao khả năng phản ứng khi xảy ra sự cố bảo mật.

4.4.1. Dữ liệu mẫu và câu lệnh INSERT
4.4.2.  Các truy vấn phục vụ nghiệp vụ 
4.4.3. Xây dựng và kiểm chứng câu lệnh SQL 
 

