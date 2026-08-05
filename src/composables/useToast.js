import { ref } from 'vue';

const toast = ref({ show: false, message: '', type: 'success' });

export function useToast() {
    const showToast = (msg, type = 'success') => {
        toast.value = { show: true, message: msg, type };
        setTimeout(() => { toast.value.show = false; }, 3500);
    };

    return {
        toast,
        showToast
    };
}
