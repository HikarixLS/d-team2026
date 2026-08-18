import { ref } from 'vue';
import { StatusBar, Style } from '@capacitor/status-bar';
import { useToast } from './useToast.js';
import { useHaptics } from './useHaptics.js';

const isNative = () => typeof window !== 'undefined' && window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform();

const isDarkMode = ref(localStorage.getItem('theme_mode') === 'dark');

export function useTheme() {
    const { showToast } = useToast();
    const { impactLight } = useHaptics();

    const updateNativeStatusBar = async (dark) => {
        if (!isNative()) return;
        try {
            if (dark) {
                await StatusBar.setStyle({ style: Style.Dark });
                await StatusBar.setBackgroundColor({ color: '#0b1120' });
            } else {
                await StatusBar.setStyle({ style: Style.Light });
                await StatusBar.setBackgroundColor({ color: '#1e1b4b' });
            }
        } catch (e) {
            console.warn('[StatusBar] Error updating style:', e);
        }
    };

    const applyTheme = () => {
        if (isDarkMode.value) {
            document.documentElement.classList.add('dark', 'dark-mode');
            document.body.classList.add('dark', 'dark-mode');
        } else {
            document.documentElement.classList.remove('dark', 'dark-mode');
            document.body.classList.remove('dark', 'dark-mode');
        }
        updateNativeStatusBar(isDarkMode.value);
    };

    const toggleTheme = () => {
        impactLight();
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
