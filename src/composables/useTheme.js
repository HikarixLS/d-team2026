import { ref } from 'vue';
import { useToast } from './useToast.js';

const isDarkMode = ref(localStorage.getItem('theme_mode') === 'dark');

export function useTheme() {
    const { showToast } = useToast();

    const applyTheme = () => {
        if (isDarkMode.value) {
            document.documentElement.classList.add('dark', 'dark-mode');
            document.body.classList.add('dark', 'dark-mode');
        } else {
            document.documentElement.classList.remove('dark', 'dark-mode');
            document.body.classList.remove('dark', 'dark-mode');
        }
    };

    const toggleTheme = () => {
        isDarkMode.value = !isDarkMode.value;
        localStorage.setItem('theme_mode', isDarkMode.value ? 'dark' : 'light');
        applyTheme();
        showToast(isDarkMode.value ? 'Đã chuyển sang Giao diện Tối 🌙' : 'Đã chuyển sang Giao diện Sáng ☀️');
    };

    return {
        isDarkMode,
        applyTheme,
        toggleTheme
    };
}
