import { ref, onMounted, onBeforeUnmount } from 'vue';
import { Network } from '@capacitor/network';
import { useHaptics } from './useHaptics.js';

const isOnline = ref(true);
const connectionType = ref('unknown');
const isCheckingNetwork = ref(false);
const wasOffline = ref(false);

let networkListenerHandle = null;

export function useNetwork() {
    const { notificationWarning, notificationSuccess } = useHaptics();

    const updateStatus = (status, onReconnect = null) => {
        const previouslyOnline = isOnline.value;
        isOnline.value = Boolean(status.connected);
        connectionType.value = status.connectionType || 'unknown';

        if (!status.connected) {
            wasOffline.value = true;
            notificationWarning();
        } else if (!previouslyOnline && status.connected && wasOffline.value) {
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
        try {
            isCheckingNetwork.value = true;
            const status = await Network.getStatus();
            updateStatus(status, onReconnect);
            return status;
        } catch (e) {
            const browserOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
            updateStatus({ connected: browserOnline, connectionType: 'browser' }, onReconnect);
            return { connected: browserOnline, connectionType: 'browser' };
        } finally {
            isCheckingNetwork.value = false;
        }
    };

    const initNetworkListener = async (onReconnect = null) => {
        await checkNetworkStatus(onReconnect);

        try {
            if (networkListenerHandle) {
                try { await networkListenerHandle.remove(); } catch (err) {}
            }
            networkListenerHandle = await Network.addListener('networkStatusChange', (status) => {
                updateStatus(status, onReconnect);
            });
        } catch (e) {
            if (typeof window !== 'undefined') {
                window.addEventListener('online', () => {
                    updateStatus({ connected: true, connectionType: 'browser' }, onReconnect);
                });
                window.addEventListener('offline', () => {
                    updateStatus({ connected: false, connectionType: 'browser' }, onReconnect);
                });
            }
        }
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
