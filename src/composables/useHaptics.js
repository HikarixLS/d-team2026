export function useHaptics() {
    const vibrate = (pattern) => {
        try {
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(pattern);
            }
        } catch (e) {}
    };

    const impactLight = () => vibrate(10);
    const impactMedium = () => vibrate(25);
    const impactHeavy = () => vibrate(50);
    const notificationSuccess = () => vibrate([15, 30, 20]);
    const notificationWarning = () => vibrate([30, 40, 30]);
    const notificationError = () => vibrate([50, 50, 50]);
    const selectionChanged = () => vibrate(5);

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
