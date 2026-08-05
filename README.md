# 📘 SỔ CA TRỰC ĐIỆN TỬ (Vue 3 + Firebase Cloud)

Hệ thống quản lý ca trực điện tử hiện đại, hỗ trợ phân công công việc, đăng ký lịch trực, duyệt đơn xin nghỉ phép và thống kê báo cáo chỉ tiêu ca trực tích hợp đồng bộ thời gian thực với **Google Firebase Cloud Firestore**.

![Vue 3](https://img.shields.io/badge/Vue.js-v3.4-4FC08D?style=for-the-badge&logo=vuedotjs&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-v6.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v3.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

---

## ✨ Tính Năng Nổi Bật

- 🛡️ **Xác Thực & Phân Quyền**: Hỗ trợ 2 chế độ đăng nhập dành cho **Thành Viên** và **Quản Trị Viên (Admin)**, bảo mật và xác thực real-time theo dữ liệu Cloud Firestore.
- 📝 **Ghi Ca Trực Điện Tử**: Ghi nhận thông tin ca trực theo số trang sổ gốc, STT, ban hoạt động và ghi chú.
- 📅 **Đăng Ký Lịch Trực**: Đăng ký ca trực linh hoạt theo tuần/tháng với tính năng giới hạn số lượng người trực theo ca.
- 📄 **Quản Lý Đơn Nghỉ Phép**: Thành viên chủ động xin nghỉ phép; Admin xem và xét duyệt/từ chối ngay trên hệ thống.
- 📊 **Thống Kê & Chỉ Tiêu (Chart.js)**: Trực quan hóa biểu đồ cá nhân và biểu đồ tổ chức, theo dõi tiến độ đạt chỉ tiêu 10 ca/tháng.
- 📗 **Nhật Ký & Xuất File Excel (SheetJS)**: Tra cứu lịch sử ca trực theo từ khóa, tháng/tuần và xuất báo cáo file `.xlsx` chỉ với 1-click.
- 🌙 **Giao Diện Đa Năng (Light/Dark Mode)**: Tối ưu UI/UX với Tailwind CSS, hiệu ứng Glassmorphism và chế độ tối bảo vệ mắt.
- 🌐 **Expose Mạng Nội Bộ (LAN/Wi-Fi)**: Dễ dàng mở server truy cập trực tiếp bằng điện thoại di động hoặc các máy tính cùng mạng.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Core Framework**: Vue 3 (Composition API / `<script setup>`)
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS, FontAwesome 6 Icons, Google Fonts (Inter)
- **Database & Cloud Sync**: Google Firebase Cloud Firestore (Real-time Snapshots & Anonymous Auth)
- **Visualization & Export**: Chart.js, SheetJS (XLSX)

---

## 📁 Cấu Trúc Thư Mục Dự Án

```text
VUE/
├── index.html                  # HTML Entry Point & Firebase SDK Initialization
├── package.json                # Dependencies & Build Scripts
├── vite.config.js              # Cấu hình Vite & Server Host Port
├── src/
│   ├── main.js                 # Khởi tạo Vue Application
│   ├── App.vue                 # App Master Layout & Route Logic
│   ├── style.css               # Design System & Theme Utilities
│   ├── composables/            # State Management Modules (Composables)
│   │   ├── useAuth.js          # Quản lý Đăng nhập & Phân quyền Admin
│   │   ├── useCloud.js         # Đồng bộ dữ liệu Realtime với Firestore
│   │   ├── useMembers.js       # Quản lý Danh sách Thành viên & Modal
│   │   ├── useShifts.js        # Quản lý Ca trực, Đăng ký & Xin nghỉ phép
│   │   ├── useTheme.js         # Chế độ Sáng / Tối (Light / Dark Mode)
│   │   └── useToast.js         # Hệ thống Thông báo Toast Alert
│   └── components/             # Reusable UI Components
│       ├── auth/               # LoginGatekeeper Component
│       ├── common/             # AppHeader, AppNavigation, Toast
│       ├── modals/             # ConfigModal, MemberModal, BatchModal, ConfirmDeleteModal
│       └── tabs/               # TabShiftEntry, TabShiftRegister, TabLeaveRequests, TabDashboard, TabShiftHistory, TabMembersList
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Local

### 1. Clone Repository & Chuyển vào thư mục VUE

```bash
git clone https://github.com/HikarixLS/d-team2026.git
cd d-team2026/VUE
```

### 2. Cài Đặt Package Dependencies

```bash
npm install
```

### 3. Chạy Server Môi Trường Development

```bash
npm run dev
```

Mở trình duyệt truy cập: `http://localhost:3000/`

### 4. Truy Cập Từ Điện Thoại (Mạng Nội Bộ Wi-Fi/LAN)

Ứng dụng đã được cấu hình tự động mở cổng (`host: true`). Nhập địa chỉ IP hiển thị tại dòng `Network` trên thiết bị di động:
```text
  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.x.x:3000/
```

### 5. Build Sản Phẩm Production

```bash
npm run build
```

---

## 🔑 Tài Khoản Đăng Nhập Mẫu

| Vai Trò | Mã Số Sinh Viên (MSSV) | Mật Khẩu Mặc Định |
| :--- | :--- | :--- |
| **Super Admin** | `admin` | `123` (hoặc `admin`) |
| **Admin Ban Điều Hành** | `42300016` (Đỗ Khánh Duy) | `123` |
| **Admin Ban Điều Hành** | `C2300023` (Lý Gia Huy) | `123` |
| **Thành Viên** | `20210001` (Nguyễn Văn An) | *Không yêu cầu mật khẩu* |

---

## 📄 License

Dự án được phát triển và sở hữu bởi **D-Team 2026**.
