import { Preferences } from '@capacitor/preferences';

const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export function useStorage() {
    const setItem = async (key, value) => {
        try {
            const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
            if (isBrowser) {
                try { localStorage.setItem(key, stringValue); } catch (e) {}
            }
            await Preferences.set({ key, value: stringValue });
            return true;
        } catch (e) {
            console.warn(`[Preferences] Error setting key "${key}":`, e);
            if (isBrowser) {
                try {
                    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
                    localStorage.setItem(key, stringValue);
                } catch (err) {}
            }
            return false;
        }
    };

    const getItem = async (key, defaultValue = null) => {
        try {
            const { value } = await Preferences.get({ key });
            if (value !== null && value !== undefined) {
                try {
                    return JSON.parse(value);
                } catch (e) {
                    return value;
                }
            }
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
            if (isBrowser) {
                const localVal = localStorage.getItem(key);
                if (localVal !== null && localVal !== undefined) {
                    try {
                        return JSON.parse(localVal);
                    } catch (err) {
                        return localVal;
                    }
                }
            }
            return defaultValue;
        }
    };

    const removeItem = async (key) => {
        try {
            if (isBrowser) {
                try { localStorage.removeItem(key); } catch (e) {}
            }
            await Preferences.remove({ key });
            return true;
        } catch (e) {
            if (isBrowser) {
                try { localStorage.removeItem(key); } catch (err) {}
            }
            return false;
        }
    };

    const clear = async () => {
        try {
            if (isBrowser) {
                try { localStorage.clear(); } catch (e) {}
            }
            await Preferences.clear();
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
