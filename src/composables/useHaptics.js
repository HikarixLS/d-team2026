import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

const isNative = () => {
    return typeof window !== 'undefined' && window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform();
};

export function useHaptics() {
    const impactLight = async () => {
        try {
            if (isNative()) {
                await Haptics.impact({ style: ImpactStyle.Light });
            } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(10);
            }
        } catch (e) {}
    };

    const impactMedium = async () => {
        try {
            if (isNative()) {
                await Haptics.impact({ style: ImpactStyle.Medium });
            } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(25);
            }
        } catch (e) {}
    };

    const impactHeavy = async () => {
        try {
            if (isNative()) {
                await Haptics.impact({ style: ImpactStyle.Heavy });
            } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(50);
            }
        } catch (e) {}
    };

    const notificationSuccess = async () => {
        try {
            if (isNative()) {
                await Haptics.notification({ type: NotificationType.Success });
            } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate([15, 30, 20]);
            }
        } catch (e) {}
    };

    const notificationWarning = async () => {
        try {
            if (isNative()) {
                await Haptics.notification({ type: NotificationType.Warning });
            } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate([30, 40, 30]);
            }
        } catch (e) {}
    };

    const notificationError = async () => {
        try {
            if (isNative()) {
                await Haptics.notification({ type: NotificationType.Error });
            } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate([50, 50, 50]);
            }
        } catch (e) {}
    };

    const selectionChanged = async () => {
        try {
            if (isNative()) {
                await Haptics.selectionChanged();
            }
        } catch (e) {}
    };

    return {
        impactLight,
        impactMedium,
        impactHeavy,
        notificationSuccess,
        notificationWarning,
        notificationError,
        selectionChanged
    };
}
