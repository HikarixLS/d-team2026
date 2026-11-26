# 🏢 HỆ THỐNG QUẢN LÝ ĐIỆN TỬ - ĐỘI VĂN PHÒNG ĐOÀN - HỘI TDTU
### *(Sổ Ca Trực, Quản Lý Hoạt Động & Điểm Danh Minh Chứng)*

Hệ thống quản lý toàn diện dành cho **Đội Văn Phòng Đoàn - Hội TDTU**, hỗ trợ đăng ký & điểm danh ca trực, quản lý hoạt động & điểm danh minh chứng, theo dõi tiến độ nộp hồ sơ, đánh giá ma trận ca trực theo tuần, quản lý đơn xin nghỉ phép và xuất báo cáo Excel chuẩn hóa. Dự án xây dựng trên nền tảng **Web Application (Vue 3 + Vite + Tailwind CSS)** với đồng bộ thời gian thực qua **Google Firebase Cloud Firestore**, tối ưu bộ nhớ đệm ngoại tuyến (Offline Cache) và hỗ trợ triển khai tự động qua **GitHub Pages**.

---

## 🚀 Công Nghệ Sử Dụng (Tech Stack)

![Vue 3](https://img.shields.io/badge/Vue.js-v3.4-4FC08D?style=for-the-badge&logo=vuedotjs&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-v6.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v3.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Anime.js](https://img.shields.io/badge/Anime.js-v4.5-F74F4D?style=for-the-badge&logo=javascript&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-v4.4-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)
![SheetJS](https://img.shields.io/badge/SheetJS-XLSX-217346?style=for-the-badge&logo=microsoftexcel&logoColor=white)

- **Frontend Core**: Vue 3 (`^3.4.0`, Composition API / `<script setup>`), Tailwind CSS (Dark/Light Mode), Anime.js (`^4.5.0`), FontAwesome 6.4, Google Fonts (Inter).
- **Database & Realtime Sync**: Google Firebase Cloud Firestore (Real-time `onSnapshot`, IndexedDB offline persistence, tối ưu lượt đọc theo cửa sổ 60 ngày gần nhất & tải lưu trữ theo yêu cầu).
- **Visualization & Export**: Chart.js (`^4.4.1`), SheetJS / XLSX (`^0.18.5`).
- **Notifications & Mobile UX**: Service Worker (`/sw.js`) hỗ trợ Web Notifications, phản hồi rung (Vibration/Haptics API) và phát hiện trạng thái mạng.
- **CI/CD**: GitHub Actions tự động build và triển khai lên **GitHub Pages** khi push vào nhánh `main`.

---

## ✨ Tính Năng Nổi Bật

### 1. 🎯 Quản Lý Hoạt Động & Điểm Danh Minh Chứng
- **Quản lý Hoạt động (Admin)**: Tạo hoạt động mới, gắn học kỳ, theo dõi tiến độ nộp hồ sơ quy định, cảnh báo trễ hạn, xác nhận nộp điểm rèn luyện, điểm danh hộ thành viên theo đúng ca đăng ký, xem thống kê ca vắng chi tiết và xuất danh sách sinh viên tham gia chuẩn MSSV.
- **Cổng Hoạt động (Thành viên)**: Xem danh sách hoạt động theo tháng/học kỳ, đăng ký ca làm việc, điểm danh trực tuyến bằng ảnh chụp minh chứng và xin nghỉ hoạt động theo từng ca cụ thể kèm lý do.

### 2. 📝 Quản Lý Sổ Ca Trực Điện Tử
- **Điểm Danh Ca Trực**: Ghi nhận ca trực thực tế theo trang sổ gốc, STT, ban hoạt động và ghi chú; hỗ trợ tìm kiếm nhanh thành viên.
- **Đăng Ký Ca & Ca Đã Đăng Ký**: Thành viên chủ động đăng ký ca trực theo ngày/tuần/tháng và theo dõi/quản lý danh sách ca đã đăng ký tại tab *Ca Đã Đăng Ký*; Admin có thể mở/khóa cổng đăng ký và cấu hình giới hạn số người/ca, số ca/ngày qua `ShiftSettingsModal`.
- **Quản Lý Đơn Nghỉ Phép**: Thành viên gửi đơn xin nghỉ phép ca trực; Admin xét duyệt trực tiếp trên hệ thống kèm huy hiệu đếm số đơn chờ duyệt.

### 3. 📊 Thống Kê & Ma Trận Đánh Giá Ca Trực
- **Biểu đồ Cột**: `Top Thành Viên Trực Nhiều Nhất` so sánh giữa *Ca Đã Trực* và *Chỉ Tiêu Quy Định*.
- **Biểu đồ Tròn**: `Phân Bố Số Ca Trực` thể hiện tỷ lệ các ca trực trong tháng.
- **Ma Trận Đánh Giá Theo Từng Tuần & Tổng Kết Tháng**: Phân chia 4 mốc tuần trong tháng (*Tuần 1: 1-8*, *Tuần 2: 9-18*, *Tuần 3: 19-25*, *Tuần 4: 26-Cuối*), tự động tính tổng ca, đánh giá kết quả *Đạt chỉ tiêu / Chưa đạt* kèm thanh tìm kiếm thành viên.

### 4. 👥 Phân Quyền & Giao Diện Theo Vai Trò
- **Thành viên (Member)**: Tập trung vào 5 phân hệ cá nhân (*Trang Hoạt Động*, *Điểm Danh Ca Trực*, *Đăng Ký Ca*, *Ca Đã Đăng Ký*, *Xin Nghỉ Phép*).
- **Quản trị viên (Admin)**: Toàn quyền truy cập 8 phân hệ quản trị (bao gồm thêm *Thống Kê & Chỉ Tiêu*, *Nhật Ký & Tra Cứu*, *Danh Sách Thành Viên* với tính năng thêm/sửa và nhập danh sách hàng loạt `BatchImportModal`).

### 5. 💻 Trải Nghiệm Người Dùng, Thông Báo & Xuất Dữ Liệu
- **Responsive Layout & Animations**: Giao diện tối ưu cho desktop, tablet và mobile (bottom navigation), tích hợp hiệu ứng chuyển động Anime.js v4.
- **Dark / Light Mode & Network Banner**: Chuyển đổi giao diện sáng/tối linh hoạt, cảnh báo khi mất kết nối mạng và tự động đồng bộ lại khi có mạng.
- **Trung Tâm Thông Báo (`NotificationModal`)**: Hỗ trợ Web Push / Local Notifications qua Service Worker (`/sw.js`).
- **Xuất File Excel (.xlsx)**: Xuất báo cáo ca trực, danh sách hoạt động chuẩn hóa qua SheetJS.

---

## 📁 Cấu Trúc Dự Án

```text
VUE/
├── .github/workflows/
│   └── deploy.yml                   # CI/CD tự động deploy lên GitHub Pages
├── index.html                       # HTML Entry Point & Firebase SDK v10 CDN
├── package.json                     # Dependencies & Scripts
├── vite.config.js                   # Cấu hình Vite (port 3000, build ./dist)
├── public/                          # Static Assets & Service Worker
│   ├── app-bg.jpg
│   ├── logo.jpg / logo.png
│   └── sw.js                        # Service Worker cho Web Notifications
└── src/
    ├── main.js                      # Khởi tạo Vue Application
    ├── App.vue                      # Master Layout, Global Filters & Tab Routing
    ├── style.css                    # Design System & Custom Styles
    ├── assets/                      # Static assets nội bộ (logo)
    ├── composables/                 # State Management & Business Logic
    │   ├── useActivities.js         # Quản lý Hoạt động, Học kỳ & Điểm danh
    │   ├── useAnime.js              # Hiệu ứng Anime.js v4 (stagger, counter, transitions)
    │   ├── useAuth.js               # Xác thực MSSV / Admin & Phân quyền
    │   ├── useCloud.js              # Đồng bộ Realtime Firestore & Tối ưu Quota/Cache
    │   ├── useHaptics.js            # Phản hồi rung (Vibration API) trên thiết bị di động
    │   ├── useMembers.js            # Quản lý Danh sách Thành viên & Phòng ban
    │   ├── useNetwork.js            # Giám sát kết nối mạng & tự động reconnect
    │   ├── useNotifications.js      # Quản lý quyền & thông báo Web/Service Worker
    │   ├── useShifts.js             # Quản lý Ca trực, Đăng ký & Đơn nghỉ phép
    │   ├── useStorage.js            # Wrapper thao tác localStorage an toàn
    │   ├── useTheme.js              # Giao diện Sáng / Tối
    │   └── useToast.js              # Thông báo Toast Alert
    ├── components/                  # Giao diện thành phần (Components)
    │   ├── activities/              # AdminActivityManager, UserActivityPortal
    │   ├── auth/                    # LoginGatekeeper
    │   ├── common/                  # AppHeader, AppNavigation, NetworkStatusBanner, Toast
    │   ├── modals/                  # ActivityDetailModal, BatchImportModal, ConfigModal,
    │   │                            # ConfirmDeleteModal, LeaveActivityModal, MemberModal,
    │   │                            # NotificationModal, ShiftSettingsModal
    │   └── tabs/                    # TabDashboard, TabLeaveRequests, TabMembersList,
    │                                # TabMyRegisteredShifts, TabShiftEntry,
    │                                # TabShiftHistory, TabShiftRegister
    └── utils/
        └── fileExport.js            # Xuất Excel (.xlsx) và tải file Web
```

---

## 🛠️ Hướng Dẫn Cài Đặt & Phát Triển

### 1. Cài đặt Dependencies

```bash
npm install
```

### 2. Chạy Môi Trường Phát Triển (Local Dev)

Mặc định server chạy ở cổng `3000` (`vite.config.js`):

```bash
npm run dev
```

### 3. Build & Preview Production

```bash
npm run build
npm run preview
```

---

## 📄 Bản Quyền & Giấy Phép

Dự án được xây dựng và duy trì bởi **Đội Văn Phòng Đoàn - Hội TDTU (D-Team 2026)**.
Mọi quyền được bảo lưu.
