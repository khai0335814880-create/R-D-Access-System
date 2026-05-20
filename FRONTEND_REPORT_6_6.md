### 6.6. Frontend (Giao diện người dùng)

#### 6.6.1. Component dùng chung (Header, Sidebar, Footer, Layout)

**6.6.1.1. Sidebar điều hướng theo role (khác nhau cho engineer, security, admin)**
Thanh điều hướng bên trái (Sidebar) đóng vai trò là xương sống trong việc di chuyển giữa các chức năng chính của hệ thống. Sidebar được thiết kế động, tự động nhận diện và hiển thị các menu tương ứng dựa trên phân quyền (role) của người dùng hiện tại (Engineer, Security, hoặc Admin). Giao diện bao gồm các biểu tượng trực quan đi kèm nhãn văn bản, có khả năng thu gọn (collapse) để tối ưu không gian hiển thị màn hình. Người dùng thao tác bằng cách nhấp vào các mục menu để chuyển đổi nội dung hiển thị mà không cần tải lại trang. Thông tin phân quyền được trích xuất từ global state và JWT token, đảm bảo tính bảo mật và trải nghiệm cá nhân hóa.

**6.6.1.2. Header hiển thị thông tin user, avatar, nút đăng xuất**
Header là thành phần giao diện nằm ở khu vực trên cùng của trang web, giữ trạng thái cố định (sticky) khi cuộn trang. Nó hiển thị tóm tắt về người dùng đang đăng nhập bao gồm: lời chào, họ tên, hình đại diện (avatar). Góc bên phải chứa một menu thả xuống (dropdown) cung cấp các truy cập nhanh vào hồ sơ cá nhân và nút Đăng xuất (Logout). Khi người dùng nhấp vào Đăng xuất, hệ thống thực thi hàm dọn dẹp (cleanup function), xóa token khỏi `sessionStorage`, ngắt kết nối an toàn với máy chủ WebSocket và ngay lập tức điều hướng luồng về trang đăng nhập.

**6.6.1.3. Global Layout (Dark mode, hiệu ứng Glassmorphism kính mờ)**
Global Layout đóng vai trò là bộ khung bao bọc toàn bộ các trang nội bộ của ứng dụng, duy trì sự đồng nhất về UI/UX. Điểm nhấn thiết kế là việc áp dụng hiệu ứng Glassmorphism (kính mờ) trên các lớp phủ (overlays) và thanh Header, tạo ra một giao diện hiện đại, có chiều sâu thị giác. Layout cũng hỗ trợ tính năng chuyển đổi giao diện Sáng/Tối (Dark/Light mode). Người dùng có thể nhấp vào biểu tượng chuyên dụng để thay đổi giao diện. Tailwind CSS được cấu hình để chuyển đổi mượt mà toàn bộ bảng màu từ nền, văn bản đến viền bảo vệ.

**6.6.1.4. Tích hợp đa ngôn ngữ (Language Switcher với react-i18next)**
Nhằm hỗ trợ môi trường làm việc đa quốc gia, hệ thống tích hợp thành phần Language Switcher trên thanh Header. Giao diện là một bộ chuyển đổi nhỏ gọn cho phép người dùng thay đổi giữa Tiếng Anh và Tiếng Việt. Khi người dùng thao tác nhấp chọn, thư viện `react-i18next` sẽ ngay lập tức áp dụng bộ từ điển tương ứng và thay đổi toàn bộ văn bản trên giao diện theo thời gian thực (real-time) mà không cần nạp lại trang. Cấu hình ngôn ngữ được lưu cục bộ giúp duy trì tùy chọn của người dùng trong suốt các phiên làm việc.

#### 6.6.2. Trang Đăng nhập và Xác thực

**6.6.2.1. Form đăng nhập (email/mã nhân viên, mật khẩu)**
Màn hình đăng nhập là cửa ngõ duy nhất để truy cập vào hệ thống dashboard nội bộ. Giao diện được thiết kế tối giản, tập trung vào form đăng nhập đặt ở trung tâm. Các thành phần bao gồm trường nhập liệu cho ID/Mã nhân viên (hoặc email), trường nhập mật khẩu (có nút ẩn/hiện mật khẩu) và nút Đăng nhập kích thước lớn. Người dùng điền thông tin và nhấn Enter hoặc nhấp chuột để gửi đi. Các cảnh báo lỗi (sai mật khẩu, tài khoản không tồn tại) sẽ hiển thị nổi bật bằng màu đỏ ngay bên dưới form.

**6.6.2.2. Tích hợp JWT, lưu token, chuyển hướng theo role**
Phía sau giao diện, luồng xử lý đăng nhập thực hiện thao tác gọi API xác thực đến máy chủ. Khi phản hồi thành công, JSON Web Token (JWT) và thông tin người dùng được lưu trữ an toàn vào `sessionStorage` và state management (Zustand). Dựa trên trường `role` trả về, một bộ định tuyến bảo vệ (`ProtectedRoute`) sẽ đánh giá và tự động chuyển hướng người dùng đến trang đích phù hợp: Kỹ sư được điều hướng đến trang quản lý thiết bị, trong khi Bảo vệ và Admin được dẫn trực tiếp tới Dashboard giám sát tổng quan.

#### 6.6.3. Các trang chính cho Kỹ sư

**6.6.3.1. Dashboard cá nhân (thông báo, thiết bị gần đây)**
Màn hình này cung cấp cái nhìn tổng quan về trạng thái hoạt động cá nhân của Kỹ sư. Giao diện sử dụng các thẻ (cards) thống kê để hiển thị tổng số thiết bị đang sở hữu, trạng thái check-in/out hiện tại, và một danh sách lịch sử truy cập gần nhất. Người dùng có thể nhanh chóng kiểm tra xem thiết bị nào của mình đang ở trong phòng lab hoặc đã được check-out an toàn, hỗ trợ quản lý tài sản cá nhân một cách chặt chẽ.

**6.6.3.2. Danh sách thiết bị đã đăng ký (bảng, tìm kiếm, lọc)**
Màn hình hiển thị toàn bộ danh sách các thiết bị điện tử mang cá nhân của Kỹ sư dưới dạng bảng (Data Table). Bảng cung cấp các cột thông tin chi tiết: Loại thiết bị, Hãng, Số Serial, và Trạng thái phê duyệt. Người dùng có thể nhập từ khóa vào thanh tìm kiếm hoặc sử dụng công cụ lọc thả xuống để tìm nhanh một thiết bị cụ thể. Bảng dữ liệu hỗ trợ phân trang giúp xử lý mượt mà khi danh sách tài sản tăng lên.

**6.6.3.3. Form đăng ký thiết bị mới (serial, loại máy, hãng, ảnh)**
Khi một Kỹ sư cần mang thiết bị mới vào R&D Lab, họ phải khai báo qua biểu mẫu này. Giao diện form được thiết kế thân thiện với người dùng, bao gồm các ô nhập liệu văn bản cho Serial Number, dropdown chọn hãng sản xuất, và một vùng kéo-thả (drag-and-drop) chuyên dụng để tải lên ảnh chụp minh chứng của thiết bị. Khi nhấp nút "Gửi yêu cầu", hệ thống đóng gói dữ liệu và gửi lên backend chờ Bảo vệ hoặc Quản lý phê duyệt.

**6.6.3.4. Hiển thị QR Code cá nhân (dùng để check-in tại Kiosk) và mã QR thiết bị – tải file PNG**
Đây là trang cung cấp "chìa khóa" ảo cho Kỹ sư. Tại đây, hệ thống hiển thị hai loại mã QR: một mã định danh cá nhân (dùng thay thế thẻ từ khi check-in tại Kiosk) và các mã QR tương ứng cho từng thiết bị đã được phê duyệt. Giao diện cung cấp nút "Tải xuống" bên dưới mỗi mã, cho phép người dùng nhấp để lưu mã dưới dạng tệp hình ảnh PNG chuẩn mực. Kỹ sư có thể in mã QR thiết bị để dán trực tiếp lên mặt lưng của Laptop hoặc Điện thoại, chuẩn bị cho việc quét xác thực nhanh.

#### 6.6.4. Các trang chính cho Bảo vệ (Security)

**6.6.4.1. Dashboard giám sát (Occupancy – danh sách người trong phòng, real-time)**
Đây là trung tâm điều khiển chiến lược dành cho nhân viên an ninh. Giao diện bao gồm các khối thông số thống kê nổi bật ở phần trên (Tổng số người hiện diện, Số lượng thiết bị). Phần nội dung chính là danh sách "Occupancy" hiển thị chi tiết thông tin của từng nhân sự đang có mặt trong cơ sở tại thời điểm hiện tại. Bảng dữ liệu này được kết nối trực tiếp với WebSocket, giúp danh sách tự động cập nhật ngay lập tức (thêm người vào hoặc xóa người ra) mỗi khi có một sự kiện check-in/out diễn ra tại trạm Kiosk mà không cần nhân viên làm mới trang.

**6.6.4.2. Activity Feed (dòng thời gian check-in/out, cập nhật qua WebSocket)**
Nằm cạnh bảng Occupancy là khu vực Activity Feed, hiển thị dòng thời gian dạng cuộn dọc ghi nhận mọi sự kiện vào/ra cơ sở. Mỗi dòng nhật ký được thiết kế theo thẻ chứa hình ảnh avatar, tên người dùng, thời gian chính xác, và biểu tượng hướng đi (mũi tên màu xanh cho Check-in, màu đỏ cho Check-out). Tương tự như Occupancy, Activity Feed nhận dữ liệu theo thời gian thực qua socket, cung cấp cho Bảo vệ một luồng thông tin giám sát liên tục.

**6.6.4.2b. Biểu đồ lưu lượng truy cập (Traffic Timeline Chart) sử dụng recharts**
Để cung cấp cái nhìn vĩ mô về mật độ di chuyển, Dashboard được trang bị một biểu đồ vùng (Area Chart) xây dựng thông qua thư viện `recharts`. Giao diện hiển thị trực quan lưu lượng người ra/vào theo các mốc thời gian trong ngày. Trục X đại diện cho thời gian, trục Y hiển thị số lượt quét. Người dùng có thể di chuột lên các điểm trên biểu đồ để xem thông số chi tiết thông qua Tooltip.

**6.6.4.3. Khu vực xử lý yêu cầu đăng ký nhanh (thẻ pending, nút Duyệt/Từ chối)**
Khu vực này giải quyết các yêu cầu mang thiết bị lạ vào phòng của kỹ sư (Quick Registration). Giao diện hiển thị danh sách các yêu cầu dưới dạng các thẻ thông tin nổi (Floating cards). Mỗi thẻ chứa hình ảnh chụp thiết bị từ Kiosk, thông tin nhân viên yêu cầu và hai nút thao tác: "Duyệt" (màu xanh) và "Từ chối" (màu đỏ). Bảo vệ chỉ cần nhấp chuột để ra quyết định, kết quả sẽ lập tức được truyền ngược lại về trạm Kiosk thông qua WebSocket để thông báo cho nhân viên.

**6.6.4.4. Live Kiosk Monitor – giám sát trực tiếp lượt quét tại Kiosk, popup đỏ, cảnh báo âm thanh**
Thành phần Live Monitor hiển thị dưới dạng một dải các hình ảnh chụp lại khoảnh khắc quét thẻ/quét thiết bị tại trạm Kiosk. Đây là tính năng giám sát theo thời gian thực mạnh mẽ nhất. Khi hệ thống phát hiện có sự bất đồng bộ (người lạ, thiết bị chưa đăng ký), giao diện ngay lập tức hiển thị thẻ viền đỏ nổi bật, đi kèm hiệu ứng nhấp nháy, chữ cảnh báo rủi ro an ninh, đồng thời phát một tệp âm thanh bíp (audio alert) để thu hút sự chú ý của bảo vệ, giúp phản ứng kịp thời với các xâm nhập trái phép.

**6.6.4.5. Tìm kiếm, lọc danh sách theo tên kỹ sư, thiết bị**
Công cụ tìm kiếm mạnh mẽ được tích hợp trực tiếp vào thanh công cụ của Dashboard. Thanh tìm kiếm hỗ trợ nhập văn bản (text input) và các nút lọc. Khi người dùng gõ từ khóa (tên nhân viên, mã số thiết bị), thuật toán frontend sẽ ngay lập tức ẩn đi các hàng dữ liệu không khớp, hỗ trợ bảo vệ truy xuất thông tin của một cá nhân cụ thể trong tích tắc giữa hàng trăm luồng dữ liệu.

#### 6.6.5. Các trang chính cho Admin (Quản lý)

**6.6.5.1. Quản lý người dùng (xem, thêm, sửa, xóa, phân quyền)**
Giao diện quản lý người dùng được trình bày dưới dạng một bảng Data Table đầy đủ chức năng dành riêng cho Admin. Quản trị viên có thể xem thông tin chi tiết, nhấp vào nút chức năng để chỉnh sửa phòng ban, trạng thái hoạt động (Active/Inactive) hoặc thay đổi cấp độ quyền hạn (Role) của một tài khoản. Việc xóa tài khoản hoặc tạo mới được thao tác thông qua các Modal (hộp thoại) xác nhận, đảm bảo dữ liệu không bị thay đổi một cách vô tình.

**6.6.5.2. Quản lý phiên (danh sách active session, nút Force close, nhập lý do)**
Màn hình chuyên biệt hiển thị các phiên làm việc (session) đang diễn ra. Mỗi phiên là một lần kỹ sư check-in vào phòng lab. Điểm nổi bật là nút "Force Close" (Cưỡng chế đóng phiên) dành cho quản trị viên. Khi nhấp vào nút này, một cửa sổ popup sẽ bật lên yêu cầu Admin bắt buộc phải nhập "Lý do đóng" (ví dụ: nhân viên quên check-out, sơ tán khẩn cấp) trước khi xác nhận. Thao tác này sẽ dọn dẹp phiên và ghi log lại hệ thống.

**6.6.5.3. Xuất dữ liệu (Export to Excel với xlsx) – chọn loại báo cáo, khoảng thời gian, xuất Excel/PDF**
Nhằm phục vụ công tác báo cáo định kỳ, tính năng xuất dữ liệu được thiết kế dưới dạng một giao diện cấu hình trực quan. Người dùng nhấp chọn phạm vi thời gian (từ ngày - đến ngày), chọn module cần trích xuất (Occupancy, Activity Logs) thông qua dropdown. Khi nhấp nút "Tải xuống", thư viện `xlsx` ở client-side sẽ tổng hợp dữ liệu JSON, định dạng thành các cột báo cáo chuyên nghiệp và kích hoạt luồng tải tệp Excel (.xlsx) trực tiếp về máy tính của người dùng.

**6.6.5.4. Xem nhật ký hệ thống (Audit Log – read-only, lọc, tìm kiếm)**
Nhật ký kiểm toán (Audit Log) là trang hiển thị lịch sử mọi thao tác nhạy cảm trên hệ thống, được thiết kế ở dạng chỉ đọc (Read-only) nhằm đảm bảo tính toàn vẹn dữ liệu. Bảng log ghi nhận ID giao dịch, người thực hiện, hành động và thời gian cụ thể. Admin sử dụng các công cụ tìm kiếm và lọc thời gian để truy vết nguồn gốc của các sự cố an ninh hoặc hành vi thay đổi cấu hình, đáp ứng tiêu chuẩn kiểm soát nội bộ.

#### 6.6.6. Màn hình Kiosk (trang riêng, fullscreen)

**6.6.6.1. Component QRScanner (html5-qrcode, khung ngắm)**
Đây là thành phần cốt lõi của giao diện trạm Kiosk. Component QRScanner được xây dựng bằng cách gói gọn thư viện `html5-qrcode`. Giao diện hiển thị một khung hình vuông bắt nguồn cấp dữ liệu trực tiếp từ camera của máy tính bảng/kiosk, được trang trí bằng một vạch quét gradient di chuyển lên xuống (animation scan-line) mô phỏng trải nghiệm máy quét laser truyền thống. Khi quét thành công, component lập tức tạm dừng khung hình và phát tín hiệu cho hệ thống.

**6.6.6.2. Component CameraCapture (chụp ảnh snapshot, lưu base64)**
Component CameraCapture đảm nhiệm việc chụp hình định danh nhân viên. Giao diện hiển thị luồng video (video stream) kèm theo lời nhắc văn bản. Khi hệ thống yêu cầu (hoặc khi đếm ngược kết thúc), component kích hoạt thao tác ghi hình ảnh trên canvas HTML5, chuyển đổi hình ảnh ngay lập tức thành chuỗi chuẩn Base64. Chuỗi dữ liệu hình ảnh này sau đó được gắn kèm vào yêu cầu API để hệ thống hậu kiểm lưu trữ làm minh chứng.

**6.6.6.3. Luồng check-in: (1) Quét QR Nhân viên / Nhập mã thủ công → (2) Quét QR Thiết bị cầm theo → (3) Ký cam kết bảo mật → (4) Chụp ảnh → (5) Xác nhận thành công**
Trải nghiệm Check-in tại Kiosk được thiết kế thành một luồng từng bước (Step-by-step wizard) không gián đoạn: Đầu tiên, giao diện Idle yêu cầu nhân viên quét mã QR cá nhân. Tiếp theo, giao diện chuyển sang màn hình thứ hai yêu cầu quét toàn bộ mã QR của các thiết bị mang theo. Sau khi danh sách thiết bị hiện lên đầy đủ, người dùng nhấp tích vào ô đồng ý cam kết bảo mật. Màn hình cuối yêu cầu người dùng đứng ngay ngắn để CameraCapture ghi nhận khuôn mặt, trước khi nhấp "Xác nhận". Khi hoàn tất, một màn hình màu xanh lá cây xuất hiện báo hiệu việc mở cửa thành công.

**6.6.6.4. Luồng check-out: quét QR → hiển thị phiên → xác nhận**
Quá trình check-out được tinh gọn hóa tối đa. Người dùng quét thẻ ID tại Kiosk, giao diện sẽ nhận diện rằng nhân viên này đang có một phiên làm việc (Active Session). Kiosk lập tức chuyển sang chế độ Check-out, hiển thị thông báo yêu cầu nhân viên để lại ảnh chụp khuôn mặt trước khi rời đi. Người dùng nhấp nút Xác nhận, hệ thống ghi nhận đóng phiên và đóng cửa an toàn.

**6.6.6.5. Xử lý ngoại lệ: Nhập ID thủ công (Fallback Mode), quên check-out, mất kết nối**
Màn hình Kiosk được thiết kế để chống chịu các tình huống gián đoạn:
*   **Fallback Mode:** Nếu thẻ nhân viên bị hỏng, người dùng có thể nhấp vào nút "Nhập ID thủ công", màn hình sẽ hiển thị form nhập liệu text để xác thực thay thế.
*   **Quên check-out:** Nếu hệ thống phát hiện nhân viên quét mã thẻ vào buổi sáng hôm sau mà chưa đóng phiên của hôm trước, một popup cảnh báo đỏ "Quên Check-out" sẽ bật lên, yêu cầu nhân viên ký xác nhận lỗi trước khi bắt đầu phiên mới.
*   **Cơ chế Loading đè (Blur overlay):** Trạng thái tải luôn được phủ mờ lên giao diện hiện tại thay vì chuyển trang đột ngột, ngăn chặn lỗi mất đối tượng camera trong React.

**6.6.6.6. Tính năng Đăng ký tài sản nhanh tại Kiosk**
Tính năng đột phá này cho phép kỹ sư mang theo thiết bị lạ (chưa khai báo) vào phòng. Giao diện cung cấp một nút "Đăng ký nhanh" với form nổi lên tại Kiosk. Người dùng nhập hãng, chụp ảnh thiết bị qua camera của Kiosk. Nhấp "Gửi yêu cầu", giao diện chuyển sang trạng thái "Đang chờ phê duyệt" cùng vòng xoay (Spinner). Ở backend, hệ thống bắn tín hiệu qua WebSocket lên Dashboard của bảo vệ. Ngay khi bảo vệ nhấp "Duyệt", màn hình Kiosk tự động nhận tín hiệu trả về, chuyển sang dấu tích xanh và lập tức đưa thiết bị lạ vào danh sách hợp lệ để nhân viên mang vào phòng.
