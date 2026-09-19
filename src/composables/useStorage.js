const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export function useStorage() {
    const setItem = async (key, value) => {
        try {
            const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
            if (isBrowser) {
                localStorage.setItem(key, stringValue);
            }
            return true;
        } catch (e) {
            console.warn(`[Storage] Error setting key "${key}":`, e);
            return false;
        }
    };

    const getItem = async (key, defaultValue = null) => {
        try {
            if (isBrowser) {
                const localVal = localStorage.getItem(key);
                if (localVal !== null && localVal !== undefined) {
                    try {
                        return JSON.parse(localVal);
                    } catch (e) {
                        return localVal;
                    }
                }
            }
            return defaultValue;
        } catch (e) {
            return defaultValue;
        }
    };

    const removeItem = async (key) => {
        try {
            if (isBrowser) {
                localStorage.removeItem(key);
            }
            return true;
        } catch (e) {
            return false;
        }
    };

    const clear = async () => {
        try {
            if (isBrowser) {
                localStorage.clear();
            }
            return true;
        } catch (e) {
            return false;
        }
    };

    return {
        setItem,
        getItem,
        removeItem,
        clear
    };
}
