import { ref } from 'vue';
import { useToast } from './useToast.js';
import { useHaptics } from './useHaptics.js';

const isDarkMode = ref(typeof localStorage !== 'undefined' ? localStorage.getItem('theme_mode') === 'dark' : false);

export function useTheme() {
    const { showToast } = useToast();
    const { impactLight } = useHaptics();

    const applyTheme = () => {
        if (typeof document === 'undefined') return;
        if (isDarkMode.value) {
            document.documentElement.classList.add('dark', 'dark-mode');
            document.body.classList.add('dark', 'dark-mode');
        } else {
            document.documentElement.classList.remove('dark', 'dark-mode');
            document.body.classList.remove('dark', 'dark-mode');
        }
    };

    const toggleTheme = () => {
        impactLight();
        isDarkMode.value = !isDarkMode.value;
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('theme_mode', isDarkMode.value ? 'dark' : 'light');
        }
        applyTheme();
        showToast(isDarkMode.value ? 'Đã chuyển sang Giao diện Tối 🌙' : 'Đã chuyển sang Giao diện Sáng ☀️');
    };

    return {
        isDarkMode,
        applyTheme,
        toggleTheme
    };
}
