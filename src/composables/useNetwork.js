import { ref } from 'vue';
import { useHaptics } from './useHaptics.js';

const isOnline = ref(typeof navigator !== 'undefined' ? navigator.onLine : true);
const connectionType = ref('browser');
const isCheckingNetwork = ref(false);
const wasOffline = ref(false);

let isListenerSetup = false;

export function useNetwork() {
    const { notificationWarning, notificationSuccess } = useHaptics();

    const updateStatus = (online, onReconnect = null) => {
        const previouslyOnline = isOnline.value;
        isOnline.value = Boolean(online);

        if (!online) {
            wasOffline.value = true;
            notificationWarning();
        } else if (!previouslyOnline && online && wasOffline.value) {
            notificationSuccess();
            if (typeof onReconnect === 'function') {
                try {
                    onReconnect();
                } catch (e) {
                    console.warn('[Network] Error executing onReconnect callback:', e);
                }
            }
        }
    };

    const checkNetworkStatus = async (onReconnect = null) => {
        isCheckingNetwork.value = true;
        try {
            const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
            updateStatus(online, onReconnect);
            return { connected: online, connectionType: 'browser' };
        } finally {
            isCheckingNetwork.value = false;
        }
    };

    const initNetworkListener = (onReconnect = null) => {
        checkNetworkStatus(onReconnect);

        if (isListenerSetup || typeof window === 'undefined') return;
        isListenerSetup = true;

        window.addEventListener('online', () => {
            updateStatus(true, onReconnect);
        });
        window.addEventListener('offline', () => {
            updateStatus(false, onReconnect);
        });
    };

    return {
        isOnline,
        connectionType,
        isCheckingNetwork,
        wasOffline,
        checkNetworkStatus,
        initNetworkListener
    };
}
