import { ref } from 'vue';
import { useHaptics } from './useHaptics.js';
import { useToast } from './useToast.js';

const hasNotificationPermission = ref(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
);

let swRegistration = null;

// Khởi tạo đăng ký Service Worker cho Web Notifications (đặc biệt hỗ trợ Android Chrome)
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => {
                swRegistration = reg;
            })
            .catch(err => {
                console.warn('[SW] Registration failed:', err);
            });
    });
}

export function useNotifications() {
    const { notificationSuccess, impactLight } = useHaptics();
    const { showToast } = useToast();

    // 1. Kiểm tra & cập nhật trạng thái quyền
    const checkPermissionState = () => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            hasNotificationPermission.value = Notification.permission === 'granted';
            return Notification.permission;
        }
        return 'unsupported';
    };

    // 2. Yêu cầu cấp quyền thông báo trình duyệt
    const requestLocalPermissions = async () => {
        if (typeof window === 'undefined' || !('Notification' in window)) {
            showToast('Trình duyệt này không hỗ trợ thông báo đẩy Web!', 'warning');
            return false;
        }

        try {
            const perm = await Notification.requestPermission();
            hasNotificationPermission.value = perm === 'granted';

            if (perm === 'granted') {
                showToast('Đã bật quyền thông báo thành công! 🎉');
                notificationSuccess();
            } else if (perm === 'denied') {
                showToast('Quyền thông báo đã bị từ chối trong cài đặt trình duyệt!', 'error');
            }
            return hasNotificationPermission.value;
        } catch (e) {
            console.warn('[Notifications] Error requesting permission:', e);
            return false;
        }
    };

    // 3. Hiển thị thông báo trên Web (Tự động thích ứng Mobile Android & Desktop)
    const showWebNotification = async (title, options = {}) => {
        const notifOptions = {
            icon: '/logo.jpg',
            badge: '/logo.jpg',
            vibrate: [200, 100, 200],
            ...options
        };

        // Phương án 1: Dùng Service Worker (BẮT BUỘC trên Chrome Android)
        if ('serviceWorker' in navigator) {
            try {
                let reg = swRegistration || await navigator.serviceWorker.ready;
                if (reg && reg.showNotification) {
                    await reg.showNotification(title, notifOptions);
                    return true;
                }
            } catch (e) {
                console.warn('[Notifications] SW showNotification error:', e);
            }
        }

        // Phương án 2: Dùng new Notification() chuẩn (dành cho Desktop Chrome, Firefox, Safari)
        if ('Notification' in window && Notification.permission === 'granted') {
            try {
                new Notification(title, notifOptions);
                return true;
            } catch (e) {
                console.warn('[Notifications] new Notification error:', e);
            }
        }

        return false;
    };

    // 4. Helper chuyển đổi giờ ca trực thành giờ bắt đầu (HH:mm)
    const getShiftStartTime = (shiftType) => {
        const type = String(shiftType || '').toLowerCase();
        if (type.includes('1')) return { hour: 7, minute: 30 };
        if (type.includes('2')) return { hour: 9, minute: 20 };
        if (type.includes('3')) return { hour: 13, minute: 0 };
        if (type.includes('4')) return { hour: 15, minute: 20 };
        return { hour: 7, minute: 30 };
    };

    // 5. Lên lịch nhắc nhở cho 1 ca trực cụ thể (trước 15 phút) qua Web Notification
    const scheduleShiftReminder = async (shift, memberName = '') => {
        if (!shift || !shift.date) return false;
        if (typeof window === 'undefined' || !('Notification' in window)) return false;

        try {
            const dateParts = shift.date.split('-');
            if (dateParts.length < 3) return false;

            const year = parseInt(dateParts[0], 10);
            const month = parseInt(dateParts[1], 10) - 1;
            const day = parseInt(dateParts[2], 10);

            const { hour, minute } = getShiftStartTime(shift.shiftType);
            const shiftStartTime = new Date(year, month, day, hour, minute, 0);
            const notifyTime = new Date(shiftStartTime.getTime() - 15 * 60 * 1000);

            const now = new Date();
            const delay = notifyTime.getTime() - now.getTime();

            if (delay > 0 && delay < 24 * 60 * 60 * 1000) {
                setTimeout(async () => {
                    if (Notification.permission === 'granted') {
                        await showWebNotification(`⏰ Nhắc nhở: ${shift.shiftType || 'Ca trực'}`, {
                            body: `Chào ${memberName || 'bạn'}, ca trực ${shift.shiftType || ''} sắp bắt đầu lúc ${String(hour).padStart(2, '0')}h${String(minute).padStart(2, '0')}. Chuẩn bị có mặt bạn nhé! 🚀`,
                            tag: `shift-${shift.id || shift.date}`
                        });
                    }
                }, delay);
                return true;
            }
            return false;
        } catch (e) {
            console.warn('[Notifications] Error scheduling reminder:', e);
            return false;
        }
    };

    // 6. Đồng bộ toàn bộ lịch nhắc nhở ca trực
    const syncAllUpcomingShiftReminders = async (userShifts = [], memberName = '') => {
        if (!Array.isArray(userShifts) || userShifts.length === 0) return;
        const todayStr = new Date().toISOString().split('T')[0];
        const upcoming = userShifts.filter(s => s && s.date && s.date >= todayStr);
        for (const shift of upcoming) {
            await scheduleShiftReminder(shift, memberName);
        }
        showToast(`Đã đồng bộ nhắc nhở cho ${upcoming.length} ca trực sắp tới!`);
    };

    // 7. Gửi thông báo thử nghiệm
    const sendTestNotification = async (title = '⏰ Hệ Thống Quản Lý ĐVP', body = 'Thông báo Web đang hoạt động rất tốt trên thiết bị của bạn! 🎉') => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            if (Notification.permission !== 'granted') {
                const granted = await requestLocalPermissions();
                if (!granted) {
                    showToast(`🔔 [Xem trước]: ${title} - ${body}`, 'info');
                    return;
                }
            }

            const sent = await showWebNotification(title, { body });
            if (sent) {
                notificationSuccess();
                showToast('Đã gửi thông báo thành công đến thiết bị của bạn! 🚀');
                return;
            }
        }
        showToast(`🔔 [Thông báo]: ${title} - ${body}`, 'info');
    };

    return {
        hasNotificationPermission,
        checkPermissionState,
        requestLocalPermissions,
        showWebNotification,
        scheduleShiftReminder,
        syncAllUpcomingShiftReminders,
        sendTestNotification
    };
}
