# GEMINI.md — Hướng Dẫn Ngữ Cảnh Dự Án (D-Team 2026)

Tài liệu này cung cấp ngữ cảnh kiến trúc, quy ước mã nguồn và lưu ý vận hành cho AI agent và lập trình viên khi làm việc trên repository **Hệ thống Quản lý Điện tử - Đội Văn Phòng Đoàn - Hội TDTU**.

---

## 1. Tổng Quan Kiến Trúc

- **Framework**: Vue 3 (`^3.4.0`) sử dụng `<script setup>` và hệ thống **Composables** (`src/composables/*`) để quản lý trạng thái và nghiệp vụ, không dùng Vuex/Pinia hay Vue Router (điều hướng tab trực tiếp qua `currentTab` trong `src/App.vue`).
- **Build Tool**: Vite (`^6.2.0`), cấu hình `base: './'`, dev server chạy tại port `3000`, build output ra `dist/`.
- **Styling**: Tailwind CSS (nạp qua CDN trong `index.html` với `darkMode: 'class'`) kết hợp `src/style.css`.
- **Backend / Database**: Google Firebase Cloud Firestore (dự án `sctdt-a6bf9`), SDK v10.8.0 nạp qua CDN trong `index.html` gắn vào `window.FirebaseSDK`, `window.firebaseDb`, `window.firebaseAuth` cùng IndexedDB offline persistence (`persistentLocalCache` + `persistentMultipleTabManager`).

---

## 2. Cấu Trúc Thư Mục & Trách Nhiệm

- `src/App.vue`: Root component, quản lý layout tổng thể, bộ lọc tháng/tuần toàn cục (`selectedMonth`, `selectedWeek`), danh sách `tabs` phân quyền theo `currentUserRole` (`admin` vs `member`), và gắn kết tất cả composables/modals.
- `src/composables/`:
  - `useCloud.js`: Quản lý kết nối Firebase, listener `onSnapshot`, tối ưu lượt đọc Firestore và đồng bộ cache `localStorage`.
  - `useAuth.js`: Đăng nhập bằng MSSV hoặc tài khoản `admin`, xác định vai trò, lưu phiên đăng nhập (`socatruc_*` trong `localStorage`).
  - `useActivities.js`: Nghiệp vụ hoạt động, học kỳ, đăng ký ca hoạt động, điểm danh minh chứng & đơn xin nghỉ hoạt động.
  - `useShifts.js`: Nghiệp vụ điểm danh ca trực, đăng ký ca, ca đã đăng ký và xét duyệt đơn nghỉ phép.
  - `useMembers.js`: Quản lý danh sách thành viên, ban hoạt động và nhập hàng loạt.
  - `useAnime.js`: Wrapper Anime.js v4 (`animateStagger`, `animateCounter`, `animateTabEnter`).
  - `useNotifications.js` + `public/sw.js`: Thông báo trình duyệt qua Service Worker (`/sw.js`).
  - `useNetwork.js`, `useHaptics.js`, `useStorage.js`, `useTheme.js`, `useToast.js`: Tiện ích mạng, rung phản hồi, lưu trữ, giao diện sáng/tối và toast.
- `src/components/`:
  - `activities/`: `AdminActivityManager.vue`, `UserActivityPortal.vue`
  - `auth/`: `LoginGatekeeper.vue`
  - `common/`: `AppHeader.vue`, `AppNavigation.vue`, `NetworkStatusBanner.vue`, `Toast.vue`
  - `modals/`: `ActivityDetailModal.vue`, `BatchImportModal.vue`, `ConfigModal.vue`, `ConfirmDeleteModal.vue`, `LeaveActivityModal.vue`, `MemberModal.vue`, `NotificationModal.vue`, `ShiftSettingsModal.vue`
  - `tabs/`: `TabDashboard.vue`, `TabLeaveRequests.vue`, `TabMembersList.vue`, `TabMyRegisteredShifts.vue`, `TabShiftEntry.vue`, `TabShiftHistory.vue`, `TabShiftRegister.vue`
- `src/utils/fileExport.js`: Xuất báo cáo Excel (`.xlsx`) bằng SheetJS (`xlsx`).

---

## 3. Quy Ước Quan Trọng Khi Sửa Code

1. **Tối ưu lượt đọc Firestore (`useCloud.js`)**:
   - Không mở `onSnapshot` toàn bộ lịch sử không giới hạn cho `shifts`, `registrations`, `leave_requests`, `activities`, `activity_registrations`. Các collection này đang được giới hạn bằng `where('date', '>=', minDate)` (cửa sổ từ ngày 01 của tháng trước) và gộp với cache `localStorage`.
   - Khi người dùng xem tháng cũ hơn cửa sổ active, sử dụng `fetchArchiveMonthShifts(monthStr)` để truy vấn theo nhu cầu (`getDocs`).
   - `admin_accounts` chỉ đọc 1 lần bằng `getDocs` khi khởi tạo, không giữ listener realtime.
   - Tránh gọi `initCloudRealtime(true)` nếu không thực sự thay đổi cấu hình Firebase.
2. **Phân quyền Tab (`src/App.vue`)**:
   - `member` thấy 5 tab: `activities`, `entry`, `register`, `my-shifts`, `leave`.
   - `admin` thấy 8 tab: thêm `dashboard`, `history`, `members` và badge số đơn nghỉ phép chờ duyệt trên tab `leave`.
3. **Giao diện Mobile & Dark Mode**:
   - Đảm bảo tương thích lớp `.dark-mode` (CSS custom / Tailwind `darkMode: 'class'`).
   - Lưu ý khoảng đệm đáy (`pb-36 sm:pb-8` ở `<main>`) để thanh `AppNavigation` dạng bottom-bar trên mobile không che khuất nội dung.
4. **Ngôn ngữ hiển thị**:
   - Toàn bộ UI, thông báo Toast và nhãn giao diện sử dụng **tiếng Việt**.

---

## 4. Lệnh Phát Triển & Triển Khai

- Cài đặt thư viện: `npm install`
- Chạy dev server (port 3000): `npm run dev`
- Build production: `npm run build` (xuất ra `dist/`)
- Deploy: Tự động qua GitHub Actions (`.github/workflows/deploy.yml`) khi push lên nhánh `main`.
