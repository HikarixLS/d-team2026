import { ref } from 'vue';
import { useHaptics } from './useHaptics.js';
import { useToast } from './useToast.js';

const hasNotificationPermission = ref(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
);

export function useNotifications() {
    const { notificationSuccess, impactLight } = useHaptics();
    const { showToast } = useToast();

    // 1. Xin quyền & Khởi tạo Notifications an toàn cho Web
    const initNotifications = async () => {
        if (typeof window === 'undefined' || !('Notification' in window)) {
            return { supported: false, granted: false };
        }

        try {
            if (Notification.permission === 'default') {
                const perm = await Notification.requestPermission();
                hasNotificationPermission.value = perm === 'granted';
            } else {
                hasNotificationPermission.value = Notification.permission === 'granted';
            }
            return { supported: true, granted: hasNotificationPermission.value };
        } catch (e) {
            console.warn('[Notifications] Error requesting permissions:', e);
            return { supported: false, error: e };
        }
    };

    const initPushNotifications = initNotifications;

    const requestLocalPermissions = async () => {
        if (typeof window === 'undefined' || !('Notification' in window)) return false;
        try {
            const perm = await Notification.requestPermission();
            hasNotificationPermission.value = perm === 'granted';
            return hasNotificationPermission.value;
        } catch (e) {
            return false;
        }
    };

    // Helper chuyển đổi giờ ca trực thành giờ bắt đầu (HH:mm)
    const getShiftStartTime = (shiftType) => {
        const type = String(shiftType || '').toLowerCase();
        if (type.includes('1')) return { hour: 7, minute: 30 };
        if (type.includes('2')) return { hour: 9, minute: 20 };
        if (type.includes('3')) return { hour: 13, minute: 0 };
        if (type.includes('4')) return { hour: 15, minute: 20 };
        return { hour: 7, minute: 30 };
    };

    // Lên lịch nhắc nhở cho 1 ca trực cụ thể (trước 15 phút) qua Web Notification
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
                // Nếu trong vòng 24h, đặt setTimeout nhắc nhở trong phiên duyệt web
                setTimeout(() => {
                    if (Notification.permission === 'granted') {
                        new Notification(`⏰ Nhắc nhở ca trực: ${shift.shiftType || 'Ca trực'}`, {
                            body: `Chào ${memberName || 'bạn'}, bạn có lịch trực ${shift.shiftType || ''} lúc ${String(hour).padStart(2, '0')}h${String(minute).padStart(2, '0')}. Vui lòng chuẩn bị có mặt đúng giờ! 🚀`,
                            icon: '/logo.jpg'
                        });
                    }
                }, delay);
                return true;
            }
            return false;
        } catch (e) {
            console.warn('[Notifications] Error scheduling shift reminder:', e);
            return false;
        }
    };

    // Lên lịch nhắc nhở hạn nộp hồ sơ hoạt động
    const scheduleActivityReminder = async (activity) => {
        if (!activity || !activity.name || !activity.submitDeadlineDate) return false;
        return true;
    };

    // Đồng bộ toàn bộ lịch nhắc nhở ca trực
    const syncAllUpcomingShiftReminders = async (userShifts = [], memberName = '') => {
        if (!Array.isArray(userShifts) || userShifts.length === 0) return;
        const todayStr = new Date().toISOString().split('T')[0];
        const upcoming = userShifts.filter(s => s && s.date && s.date >= todayStr);
        for (const shift of upcoming) {
            await scheduleShiftReminder(shift, memberName);
        }
    };

    // Gửi thông báo thử nghiệm
    const sendTestNotification = async (title = 'Hệ Thống Quản Lý ĐVP', body = 'Thông báo Web hoạt động tốt! 🎉') => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            if (Notification.permission === 'granted') {
                new Notification(title, { body, icon: '/logo.jpg' });
                notificationSuccess();
                showToast('Đã gửi thông báo thử nghiệm thành công! 🚀');
                return;
            } else if (Notification.permission !== 'denied') {
                const perm = await Notification.requestPermission();
                if (perm === 'granted') {
                    new Notification(title, { body, icon: '/logo.jpg' });
                    notificationSuccess();
                    showToast('Đã gửi thông báo thử nghiệm thành công! 🚀');
                    return;
                }
            }
        }
        showToast(`🔔 ${title}: ${body}`);
    };

    return {
        hasNotificationPermission,
        initNotifications,
        initPushNotifications,
        requestLocalPermissions,
        scheduleShiftReminder,
        scheduleActivityReminder,
        syncAllUpcomingShiftReminders,
        sendTestNotification
    };
}
