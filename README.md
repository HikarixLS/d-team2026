# 🏢 HỆ THỐNG QUẢN LÝ ĐIỆN TỬ - ĐỘI VĂN PHÒNG ĐOÀN - HỘI TDTU
### *(Sổ Ca Trực, Quản Lý Hoạt Động & Điểm Danh Minh Chứng)*

Hệ thống quản lý toàn diện dành cho **Đội Văn Phòng Đoàn - Hội TDTU**, hỗ trợ phân công & đăng ký ca trực, quản lý hoạt động & điểm danh minh chứng, theo dõi tiến độ nộp hồ sơ, đánh giá ma trận ca trực theo tuần và xuất báo cáo Excel chuẩn hóa. Dự án xây dựng trên nền tảng **Web Application (Vue 3 + Vite + Tailwind CSS)** với đồng bộ thời gian thực qua **Google Firebase Cloud Firestore**.

---

## 🚀 Công Nghệ Sử Dụng (Tech Stack)

![Vue 3](https://img.shields.io/badge/Vue.js-v3.4-4FC08D?style=for-the-badge&logo=vuedotjs&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-v6.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v3.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-v4.4-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)
![SheetJS](https://img.shields.io/badge/SheetJS-XLSX-217346?style=for-the-badge&logo=microsoftexcel&logoColor=white)

- **Frontend Core**: Vue 3 (Composition API / `<script setup>`), Tailwind CSS, FontAwesome 6, Google Fonts (Inter).
- **Database & Realtime Sync**: Google Firebase Cloud Firestore (Real-time snapshots, offline persistence, auto-reconnect).
- **Visualization & Export**: Chart.js 4, SheetJS (XLSX).

---

## ✨ Tính Năng Nổi Bật

### 1. 🎯 Quản Lý Hoạt Động & Điểm Danh Minh Chứng
- **Quản lý Hoạt động (Admin)**: Tạo hoạt động mới, gắn học kỳ, theo dõi tiến độ nộp hồ sơ quy định (3 ngày), cảnh báo trễ hạn, xác nhận nộp điểm rèn luyện và xuất danh sách sinh viên tham gia chuẩn MSSV.
- **Cổng Hoạt động (Thành viên)**: Xem danh sách hoạt động theo tháng/học kỳ, đăng ký ca làm việc, điểm danh trực tuyến bằng ảnh chụp minh chứng trực tiếp và xin nghỉ hoạt động kèm lý do.

### 2. 📝 Quản Lý Sổ Ca Trực Điện Tử
- **Ghi Ca Trực**: Ghi nhận ca trực thực tế theo trang sổ gốc, STT, ban hoạt động và ghi chú.
- **Đăng Ký Ca Trực**: Thành viên chủ động đăng ký ca trực theo ngày/tuần/tháng; Admin có thể linh hoạt mở/khóa cổng đăng ký và cấu hình giới hạn số người/ca.
- **Quản Lý Đơn Nghỉ Phép**: Thành viên xin nghỉ phép ca trực; Admin xét duyệt trực tiếp trên hệ thống.

### 3. 📊 Thống Kê & Ma Trận Đánh Giá Ca Trực
- **Biểu đồ Cột**: `Top Thành Viên Trực Nhiều Nhất` so sánh giữa *Ca Đã Trực* và *Chỉ Tiêu Quy Định*.
- **Biểu đồ Tròn**: `Phân Bố Số Ca Trực (Ca 1 - 4)` thể hiện tỷ lệ các ca trực trong tháng.
- **Ma Trận Đánh Giá Theo Từng Tuần & Tổng Kết Tháng**: Định mức tiêu chuẩn 2 ca/tuần (phân chia 5 tuần trong tháng), tự động tính tổng ca và đánh giá kết quả *Đạt chỉ tiêu / Chưa đạt* kèm bộ lọc tìm kiếm nhanh.

### 4. 👥 Phân Quyền & Menu Giao Diện Thông Minh
- **Thành viên (User)**: Tối giản giao diện tập trung vào thao tác cá nhân (*Trang Hoạt Động*, *Ghi Ca Trực*, *Đăng Ký Ca*, *Xin Nghỉ Phép*).
- **Quản trị viên (Admin)**: Toàn quyền truy cập 7 phân hệ quản trị (*Quản Lý Hoạt Động*, *Ghi Ca*, *Đăng Ký*, *Duyệt Nghỉ Phép*, *Thống Kê & Chỉ Tiêu*, *Nhật Ký & Tra Cứu*, *Danh Sách Thành Viên*).

### 5. 💻 Trải Nghiệm Người Dùng & Giao Diện Web
- **Full Width Responsive Layout**: Giao diện mở rộng tối ưu cho cả máy tính, tablet và điện thoại di động.
- **Dark / Light Mode**: Chuyển đổi giao diện sáng/tối linh hoạt.
- **Xuất File & Chia Sẻ**: Xuất báo cáo Excel (.xlsx) chuẩn hóa hoặc chia sẻ trực tiếp qua Web Share API.

---

## 📁 Cấu Trúc Dự Án Web

```text
VUE/
├── index.html                       # HTML Entry Point & Firebase SDK CDN
├── package.json                     # Dependencies & Build Scripts
├── vite.config.js                   # Cấu hình Vite
├── public/                          # Static Assets (Logo, Background, Icons)
│   ├── logo.jpg
│   └── app-bg.jpg
└── src/
    ├── main.js                      # Khởi tạo Vue Application
    ├── App.vue                      # Master Layout, Navigation & Routing
    ├── style.css                    # Design System & Tailwind Utilities
    ├── composables/                 # State Management & Business Logic
    │   ├── useActivities.js         # Quản lý Hoạt động & Điểm danh
    │   ├── useAuth.js               # Xác thực & Phân quyền User/Admin
    │   ├── useCloud.js              # Đồng bộ Realtime Firestore
    │   ├── useMembers.js            # Quản lý Danh sách Thành viên
    │   ├── useShifts.js             # Quản lý Ca trực, Đăng ký & Xin nghỉ
    │   ├── useTheme.js              # Giao diện Sáng / Tối
    │   └── useToast.js              # Thông báo Toast Alert
    ├── components/                  # Giao diện thành phần (Components)
    │   ├── activities/              # AdminActivityManager, UserActivityPortal
    │   ├── auth/                    # LoginGatekeeper
    │   ├── common/                  # AppHeader, AppNavigation, Toast
    │   ├── modals/                  # ActivityDetailModal, MemberModal, ConfigModal,...
    │   └── tabs/                    # TabDashboard, TabShiftEntry, TabShiftRegister,...
    └── utils/
        └── fileExport.js            # Xuất Excel và tải file Web
```

---

## 🛠️ Hướng Dẫn Cài Đặt & Phát Triển

### 1. Cài đặt Dependencies

```bash
npm install
```

### 2. Chạy Môi Trường Phát Triển (Local Dev)

```bash
npm run dev
```

### 3. Build Web Production

```bash
npm run build
```

---

## 📄 Bản Quyền & Giấy Phép

Dự án được xây dựng và duy trì bởi **Đội Văn Phòng Đoàn - Hội TDTU (D-Team 2026)**.
Mọi quyền được bảo lưu.
