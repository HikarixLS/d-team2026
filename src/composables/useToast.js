import { ref } from 'vue';
import { useHaptics } from './useHaptics.js';

const toast = ref({ show: false, message: '', type: 'success' });

export function useToast() {
    const { notificationSuccess, notificationError, notificationWarning, impactLight } = useHaptics();

    const showToast = (msg, type = 'success') => {
        toast.value = { show: true, message: msg, type };

        // Trigger appropriate haptic feedback based on toast type
        if (type === 'error') {
            notificationError();
        } else if (type === 'warning') {
            notificationWarning();
        } else if (type === 'success') {
            notificationSuccess();
        } else {
            impactLight();
        }

        setTimeout(() => { toast.value.show = false; }, 3500);
    };

    return {
        toast,
        showToast
    };
}
