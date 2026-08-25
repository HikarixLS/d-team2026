import { ref } from 'vue';
import { useToast } from './useToast.js';
import { useHaptics } from './useHaptics.js';

export const CURRENT_APP_VERSION = '1.2.0';
export const CURRENT_BUILD_CODE = 120;
export const CURRENT_RELEASE_DATE = '18/08/2026';
export const DEFAULT_APK_DOWNLOAD_URL = 'https://drive.google.com/drive/folders/1v2WA8dH8C49x_9iFRYcYhMMawEagZkpa';

const isChecking = ref(false);
const hasUpdate = ref(false);
const showUpdateModal = ref(false);
const updateInfo = ref({
    latestVersion: CURRENT_APP_VERSION,
    buildCode: CURRENT_BUILD_CODE,
    releaseDate: CURRENT_RELEASE_DATE,
    releaseNotes: '',
    downloadUrl: DEFAULT_APK_DOWNLOAD_URL,
    forceUpdate: false
});

// Helper kiểm tra môi trường chạy ứng dụng (Native Android App vs Web Browser)
export const isNativePlatform = () => {
    return typeof window !== 'undefined' && Boolean(window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform());
};

// Helper định dạng link tải (hỗ trợ tự động chuyển link Google Drive sang link tải trực tiếp)
export const formatDownloadUrl = (url) => {
    if (!url) return '';
    const trimmed = String(url).trim();
    
    // Nếu là Google Drive folder link: giữ nguyên link để mở trực tiếp thư mục Drive
    if (trimmed.includes('drive.google.com/drive/folders/')) {
        return trimmed;
    }

    // Tự động nhận diện và chuyển đổi link Google Drive File sang link tải trực tiếp
    if (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com')) {
        const fileIdMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (fileIdMatch && fileIdMatch[1]) {
            return `https://drive.google.com/uc?export=download&id=${fileIdMatch[1]}`;
        }
    }
    return trimmed;
};

// Helper so sánh phiên bản dạng Semantic Versioning (ví dụ: '1.2.1' > '1.2.0')
export const isNewerVersion = (latest, current) => {
    if (!latest || !current) return false;
    const parse = (v) => String(v).replace(/[^0-9.]/g, '').split('.').map(n => parseInt(n, 10) || 0);
    const [lMaj = 0, lMin = 0, lPat = 0] = parse(latest);
    const [cMaj = 0, cMin = 0, cPat = 0] = parse(current);

    if (lMaj !== cMaj) return lMaj > cMaj;
    if (lMin !== cMin) return lMin > cMin;
    return lPat > cPat;
};

export function useAppUpdater() {
    const { showToast } = useToast();
    const { notificationSuccess, notificationWarning, impactMedium } = useHaptics();

    // 1. Kiểm tra bản cập nhật mới từ Cloud Firestore (Chỉ áp dụng cho App Mobile)
    const checkForUpdate = async (isManual = false) => {
        // Nếu là phiên bản Website (trình duyệt máy tính/điện thoại), không tự động hiển thị popup cập nhật APK
        if (!isNativePlatform()) {
            if (isManual) {
                showToast('Bạn đang sử dụng phiên bản Web (luôn tự động đồng bộ mới nhất)! 🌐', 'info');
            }
            return;
        }

        if (isChecking.value) return;
        isChecking.value = true;

        try {
            let remoteData = null;

            // Kiểm tra qua Firestore Cloud nếu có kết nối
            if (window.firebaseDb && window.FirebaseSDK) {
                try {
                    const { doc, getDoc } = window.FirebaseSDK;
                    const docSnap = await getDoc(doc(window.firebaseDb, 'app_config', 'version'));
                    if (docSnap.exists()) {
                        remoteData = docSnap.data();
                    }
                } catch (err) {
                    console.warn('[Updater] Firestore fetch failed:', err);
                }
            }

            // Dữ liệu phiên bản dự phòng nếu Cloud chưa có cấu hình
            if (!remoteData) {
                remoteData = {
                    latestVersion: CURRENT_APP_VERSION,
                    buildCode: CURRENT_BUILD_CODE,
                    releaseDate: CURRENT_RELEASE_DATE,
                    releaseNotes: 'Phiên bản hợp nhất Web & Native Android với đầy đủ tính năng thông báo và quản lý offline.',
                    downloadUrl: DEFAULT_APK_DOWNLOAD_URL,
                    forceUpdate: false
                };
            }

            const latestVer = remoteData.latestVersion || CURRENT_APP_VERSION;
            const isNew = isNewerVersion(latestVer, CURRENT_APP_VERSION);

            updateInfo.value = {
                latestVersion: latestVer,
                buildCode: remoteData.buildCode || CURRENT_BUILD_CODE,
                releaseDate: remoteData.releaseDate || CURRENT_RELEASE_DATE,
                releaseNotes: remoteData.releaseNotes || 'Có bản cập nhật mới với nhiều tính năng nâng cấp và sửa lỗi.',
                downloadUrl: remoteData.downloadUrl || DEFAULT_APK_DOWNLOAD_URL,
                forceUpdate: Boolean(remoteData.forceUpdate)
            };

            if (isNew) {
                hasUpdate.value = true;
                showUpdateModal.value = true;
                if (updateInfo.value.forceUpdate) {
                    notificationWarning();
                } else {
                    notificationSuccess();
                }
                if (isManual) {
                    showToast(`Phát hiện bản cập nhật mới v${latestVer}! 🚀`);
                }
            } else {
                hasUpdate.value = false;
                if (isManual) {
                    impactMedium();
                    showToast(`Bạn đang sử dụng phiên bản mới nhất (v${CURRENT_APP_VERSION}) 🎉`);
                }
            }
        } catch (e) {
            console.warn('[Updater] Error checking update:', e);
            if (isManual) {
                showToast('Không thể kiểm tra bản cập nhật lúc này!', 'error');
            }
        } finally {
            isChecking.value = false;
        }
    };

    // 2. Tải và cài đặt bản cập nhật
    const downloadAndInstall = () => {
        const rawUrl = updateInfo.value.downloadUrl || DEFAULT_APK_DOWNLOAD_URL;
        const url = formatDownloadUrl(rawUrl);
        showToast('Đang mở liên kết tải bản cập nhật... ⬇️\nSau khi tải xong, hãy mở file để cài đặt!', 'info', 5000);

        try {
            if (typeof window !== 'undefined') {
                window.open(url, '_system') || window.open(url, '_blank');
            }
        } catch (e) {
            window.location.href = url;
        }
    };

    // 3. Dành cho Quản Trị Viên: Phát hành phiên bản mới lên Cloud Firestore
    const publishVersion = async (versionPayload) => {
        if (!window.firebaseDb || !window.FirebaseSDK) {
            showToast('Firebase Cloud chưa sẵn sàng để phát hành phiên bản!', 'error');
            return false;
        }

        try {
            const { doc, setDoc } = window.FirebaseSDK;
            const docRef = doc(window.firebaseDb, 'app_config', 'version');
            const cleanDownloadUrl = formatDownloadUrl(versionPayload.downloadUrl || DEFAULT_APK_DOWNLOAD_URL);

            await setDoc(docRef, {
                latestVersion: versionPayload.latestVersion.trim(),
                buildCode: Number(versionPayload.buildCode) || CURRENT_BUILD_CODE + 1,
                releaseDate: versionPayload.releaseDate || new Date().toLocaleDateString('vi-VN'),
                releaseNotes: versionPayload.releaseNotes.trim(),
                downloadUrl: cleanDownloadUrl,
                forceUpdate: Boolean(versionPayload.forceUpdate),
                updatedAt: new Date().toISOString()
            }, { merge: true });

            showToast(`Đã phát hành phiên bản v${versionPayload.latestVersion} lên Cloud OTA thành công! 🚀`);
            return true;
        } catch (err) {
            console.error('[Updater] Error publishing version:', err);
            showToast('Lỗi khi phát hành phiên bản mới: ' + (err.message || err), 'error');
            return false;
        }
    };

    return {
        CURRENT_APP_VERSION,
        CURRENT_BUILD_CODE,
        CURRENT_RELEASE_DATE,
        DEFAULT_APK_DOWNLOAD_URL,
        isNativePlatform,
        isChecking,
        hasUpdate,
        showUpdateModal,
        updateInfo,
        checkForUpdate,
        downloadAndInstall,
        publishVersion
    };
}
