import { ref } from 'vue';
import { LocalNotifications } from '@capacitor/local-notifications';
import { useHaptics } from './useHaptics.js';
import { useToast } from './useToast.js';

const isNativePlatform = () => {
    return typeof window !== 'undefined' && window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform();
};

const hasNotificationPermission = ref(false);
let isListenerRegistered = false;

export function useNotifications() {
    const { notificationSuccess, impactLight } = useHaptics();
    const { showToast } = useToast();

    // 1. Xin quyền & Khởi tạo Notifications an toàn (Không bao giờ gây crash app)
    const initNotifications = async (onActionCallback = null) => {
        if (!isNativePlatform()) {
            return { supported: false, granted: true };
        }

        try {
            // Khởi tạo channel cho Android 8+
            try {
                await LocalNotifications.createChannel({
                    id: 'shift_reminders',
                    name: 'Nhắc nhở ca trực & Hoạt động',
                    description: 'Thông báo nhắc nhở ca trực trước 15 phút và hạn nộp hồ sơ',
                    importance: 5,
                    visibility: 1,
                    vibration: true,
                    sound: 'beep.wav'
                });
            } catch (chanErr) {
                console.warn('[Notifications] Channel creation:', chanErr);
            }

            let permStatus = await LocalNotifications.checkPermissions();
            if (permStatus.display === 'prompt' || permStatus.display === 'prompt-with-rationale') {
                permStatus = await LocalNotifications.requestPermissions();
            }

            hasNotificationPermission.value = permStatus.display === 'granted';

            if (!isListenerRegistered) {
                isListenerRegistered = true;

                // Lắng nghe khi người dùng bấm vào thông báo để chuyển tab
                LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
                    impactLight();
                    if (typeof onActionCallback === 'function') {
                        onActionCallback(action);
                    }
                });
            }

            return { supported: true, granted: hasNotificationPermission.value };
        } catch (e) {
            console.warn('[Notifications] Error requesting permissions:', e);
            return { supported: false, error: e };
        }
    };

    // Alias cho tương thích ngược
    const initPushNotifications = initNotifications;

    const requestLocalPermissions = async () => {
        if (!isNativePlatform()) return true;
        try {
            let status = await LocalNotifications.checkPermissions();
            if (status.display !== 'granted') {
                status = await LocalNotifications.requestPermissions();
            }
            hasNotificationPermission.value = status.display === 'granted';
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

    // Lên lịch nhắc nhở cho 1 ca trực cụ thể (trước 15 phút)
    const scheduleShiftReminder = async (shift, memberName = '') => {
        if (!isNativePlatform() || !shift || !shift.date) return false;

        try {
            const granted = await requestLocalPermissions();
            if (!granted) return false;

            const dateParts = shift.date.split('-');
            if (dateParts.length < 3) return false;

            const year = parseInt(dateParts[0], 10);
            const month = parseInt(dateParts[1], 10) - 1;
            const day = parseInt(dateParts[2], 10);

            const { hour, minute } = getShiftStartTime(shift.shiftType);

            // Thời gian ca bắt đầu
            const shiftStartTime = new Date(year, month, day, hour, minute, 0);
            // Nhắc nhở trước 15 phút
            const notifyTime = new Date(shiftStartTime.getTime() - 15 * 60 * 1000);

            const now = new Date();
            if (notifyTime.getTime() <= now.getTime()) {
                // Ca đã qua hoặc sắp bắt đầu ngay lập tức
                return false;
            }

            // Tạo id số nguyên duy nhất từ chuỗi ngày và ca
            const notifId = Math.abs((year * 10000 + (month + 1) * 100 + day) * 10 + (hour % 10));

            await LocalNotifications.schedule({
                notifications: [
                    {
                        id: notifId,
                        title: `⏰ Nhắc nhở ca trực: ${shift.shiftType || 'Ca trực'}`,
                        body: `Chào ${memberName || 'bạn'}, bạn có lịch trực ${shift.shiftType || ''} sẽ bắt đầu lúc ${String(hour).padStart(2, '0')}h${String(minute).padStart(2, '0')}. Vui lòng chuẩn bị có mặt đúng giờ! 🚀`,
                        schedule: { at: notifyTime },
                        sound: 'beep.wav',
                        smallIcon: 'ic_launcher',
                        iconColor: '#4F46E5',
                        channelId: 'shift_reminders',
                        extra: {
                            type: 'shift_reminder',
                            date: shift.date,
                            shiftType: shift.shiftType
                        }
                    }
                ]
            });

            return true;
        } catch (e) {
            console.warn('[LocalNotifications] Error scheduling shift reminder:', e);
            return false;
        }
    };

    // Lên lịch nhắc nhở hạn nộp hồ sơ hoạt động
    const scheduleActivityReminder = async (activity) => {
        if (!isNativePlatform() || !activity || !activity.name) return false;

        try {
            const granted = await requestLocalPermissions();
            if (!granted) return false;

            const deadline = activity.submitDeadlineDate;
            if (!deadline) return false;

            const parts = deadline.split('-');
            if (parts.length < 3) return false;

            const deadlineTime = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), 9, 0, 0);
            // Nhắc nhở trước 1 ngày lúc 9h sáng
            const notifyTime = new Date(deadlineTime.getTime() - 24 * 60 * 60 * 1000);

            const now = new Date();
            if (notifyTime.getTime() <= now.getTime()) return false;

            const notifId = Math.abs(parseInt(activity.id || '1', 10) || Math.floor(Math.random() * 100000));

            await LocalNotifications.schedule({
                notifications: [
                    {
                        id: notifId,
                        title: `📌 Nhắc hạn gửi hồ sơ: ${activity.name}`,
                        body: `Hoạt động "${activity.name}" có hạn gửi hồ sơ vào ngày ${deadline}. Vui lòng hoàn tất nộp hồ sơ đúng hạn!`,
                        schedule: { at: notifyTime },
                        sound: 'beep.wav',
                        smallIcon: 'ic_launcher',
                        iconColor: '#4F46E5',
                        channelId: 'shift_reminders',
                        extra: {
                            type: 'activity_reminder',
                            activityId: activity.id
                        }
                    }
                ]
            });
            return true;
        } catch (e) {
            return false;
        }
    };

    // Tự động đồng bộ toàn bộ lịch nhắc nhở ca trực cá nhân trong tháng
    const syncAllUpcomingShiftReminders = async (userShifts = [], memberName = '') => {
        if (!isNativePlatform() || !Array.isArray(userShifts) || userShifts.length === 0) return;

        try {
            const todayStr = new Date().toISOString().split('T')[0];
            const upcoming = userShifts.filter(s => s && s.date && s.date >= todayStr);

            for (const shift of upcoming) {
                await scheduleShiftReminder(shift, memberName);
            }
        } catch (e) {
            console.warn('[LocalNotifications] Error syncing reminders:', e);
        }
    };

    // Gửi thông báo thử nghiệm ngay lập tức
    const sendTestNotification = async (title = 'Hệ Thống Quản Lý ĐVP', body = 'Thông báo hoạt động tốt trên thiết bị của bạn! 🎉') => {
        if (!isNativePlatform()) {
            showToast(`🔔 ${title}: ${body}`);
            return;
        }

        try {
            const granted = await requestLocalPermissions();
            if (!granted) {
                showToast('Bạn chưa cấp quyền thông báo cho ứng dụng!', 'warning');
                return;
            }

            await LocalNotifications.schedule({
                notifications: [
                    {
                        id: Math.floor(Math.random() * 100000),
                        title,
                        body,
                        schedule: { at: new Date(Date.now() + 500) },
                        sound: 'beep.wav',
                        smallIcon: 'ic_launcher',
                        iconColor: '#4F46E5',
                        channelId: 'shift_reminders'
                    }
                ]
            });
            notificationSuccess();
            showToast('Đã gửi thông báo thử nghiệm thành công! 🚀');
        } catch (e) {
            showToast('Không thể gửi thông báo: ' + (e.message || e), 'error');
        }
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
