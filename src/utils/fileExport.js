/**
 * Utility hỗ trợ tải file và xuất file Excel tương thích đa nền tảng
 * (Capacitor Android/iOS App, Desktop, iOS Safari, Android Chrome, In-App WebViews Zalo/FB).
 */

/**
 * Kiểm tra xem thiết bị hiện tại có phải là thiết bị di động (Mobile / Tablet) hay không
 */
export function isMobileDevice() {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || '';
    const isTouch = (typeof window !== 'undefined' && ('ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 1)));
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    return isMobileUA || (isTouch && window.innerWidth <= 1024);
}

/**
 * Chuyển Blob thành chuỗi Base64
 */
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = reader.result;
            if (typeof dataUrl === 'string') {
                const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
                resolve(base64);
            } else {
                reject(new Error('Failed to convert blob to base64'));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/**
 * Tải xuống hoặc chia sẻ Blob/File tùy theo nền tảng
 * @param {Blob} blob - Dữ liệu Blob cần tải
 * @param {string} fileName - Tên file xuất ra (kèm đuôi mở rộng)
 * @param {string} mimeType - Kiểu MIME của file
 * @param {Function} [showToast] - Hàm hiển thị thông báo toast nếu có
 * @returns {Promise<boolean>}
 */
export async function downloadBlobOrFile(blob, fileName, mimeType = 'application/octet-stream', showToast = null) {
    try {
        // 1. Nếu đang chạy trong ứng dụng Capacitor Native (Android APK / iOS App)
        if (typeof window !== 'undefined' && window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform()) {
            try {
                const fsPkg = '@capacitor/filesystem';
                const sharePkg = '@capacitor/share';
                const { Filesystem, Directory } = await import(/* @vite-ignore */ fsPkg).catch(() => ({}));
                const { Share } = await import(/* @vite-ignore */ sharePkg).catch(() => ({}));

                if (Filesystem && Share) {
                    const rawBase64 = await blobToBase64(blob);
                    const fileWriteRes = await Filesystem.writeFile({
                        path: fileName,
                        data: rawBase64,
                        directory: Directory.Cache
                    });

                    await Share.share({
                        title: fileName,
                        text: `Xuất file: ${fileName}`,
                        url: fileWriteRes.uri,
                        dialogTitle: `Lưu hoặc Chia sẻ file "${fileName}"`
                    });

                    if (showToast) {
                        showToast(`Đã xuất file "${fileName}" thành công! 📊`, 'success');
                    }
                    return true;
                }
            } catch (capErr) {
                if (capErr.name === 'AbortError' || (capErr.message && (capErr.message.includes('cancel') || capErr.message.includes('canceled') || capErr.message.includes('cancelled')))) {
                    return true;
                }
                console.warn('Capacitor native share failed, trying Web Share / URL fallback:', capErr);
            }
        }

        const isMobile = isMobileDevice();

        // 2. Trên Web Mobile: Ưu tiên dùng Web Share API (File Sharing)
        if (isMobile && typeof navigator !== 'undefined' && typeof navigator.share === 'function' && typeof File !== 'undefined') {
            try {
                const file = new File([blob], fileName, { type: mimeType || blob.type || 'application/octet-stream' });
                
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: fileName,
                        text: `Xuất file: ${fileName}`
                    });
                    if (showToast) {
                        showToast(`Đã xuất file "${fileName}" thành công! 📊`, 'success');
                    }
                    return true;
                }
            } catch (shareError) {
                if (shareError.name === 'AbortError') {
                    return true;
                }
                console.warn('Web Share API gặp lỗi hoặc bị hủy, chuyển sang tải trực tiếp qua Object URL:', shareError);
            }
        }

        // 3. Tải trực tiếp qua Object URL (Desktop & Mobile Browser fallback)
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        link.setAttribute('download', fileName);

        if (/iPhone|iPad|iPod/i.test(navigator.userAgent || '')) {
            link.target = '_blank';
            link.rel = 'noopener';
        }

        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
            if (document.body.contains(link)) {
                document.body.removeChild(link);
            }
            URL.revokeObjectURL(blobUrl);
        }, 60000);

        if (showToast) {
            showToast(`Đã xuất file "${fileName}" thành công! 📊`, 'success');
        }
        return true;
    } catch (err) {
        console.error('Lỗi khi tải file:', err);
        if (showToast) {
            showToast(`Lỗi khi xuất file: ${err.message || err}`, 'error');
        }
        return false;
    }
}

/**
 * Xuất Workbook của SheetJS thành file Excel (.xlsx) tương thích Mobile & Desktop
 * @param {Object} workbook - Đối tượng Workbook của SheetJS (XLSX.utils.book_new())
 * @param {string} fileName - Tên file .xlsx
 * @param {Function} [showToast] - Hàm thông báo
 * @returns {Promise<boolean>}
 */
export async function exportExcelFile(workbook, fileName, showToast = null) {
    try {
        const XLSX = window.XLSX;
        if (!XLSX) {
            if (showToast) showToast('Thư viện XLSX chưa sẵn sàng!', 'error');
            return false;
        }

        const safeFileName = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;

        // Chuyển workbook thành mảng nhị phân chuẩn (ArrayBuffer)
        const wbout = XLSX.write(workbook, {
            bookType: 'xlsx',
            type: 'array',
            compression: true
        });

        const mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        const blob = new Blob([wbout], { type: mimeType });

        return await downloadBlobOrFile(blob, safeFileName, mimeType, showToast);
    } catch (error) {
        console.error('Lỗi khi xuất file Excel:', error);
        if (showToast) {
            showToast(`Không thể tạo file Excel: ${error.message || error}`, 'error');
        }
        return false;
    }
}

/**
 * Tải file từ dữ liệu Base64 (dành cho ảnh chụp minh chứng, v.v.)
 * @param {string} base64Data - Chuỗi Base64 Data URL (data:image/jpeg;base64,...)
 * @param {string} fileName - Tên file lưu lại
 * @param {Function} [showToast] - Hàm thông báo
 * @returns {Promise<boolean>}
 */
export async function downloadBase64File(base64Data, fileName, showToast = null) {
    try {
        if (!base64Data) {
            if (showToast) showToast('Không có dữ liệu ảnh để tải về!', 'error');
            return false;
        }

        // 1. Nếu đang chạy trong ứng dụng Capacitor Native
        if (typeof window !== 'undefined' && window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform()) {
            try {
                const fsPkg = '@capacitor/filesystem';
                const sharePkg = '@capacitor/share';
                const { Filesystem, Directory } = await import(/* @vite-ignore */ fsPkg).catch(() => ({}));
                const { Share } = await import(/* @vite-ignore */ sharePkg).catch(() => ({}));
                if (Filesystem && Share) {
                    const rawBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
                    const fileWriteRes = await Filesystem.writeFile({
                        path: fileName,
                        data: rawBase64,
                        directory: Directory.Cache
                    });
                    await Share.share({
                        title: fileName,
                        text: `Tải ảnh: ${fileName}`,
                        url: fileWriteRes.uri,
                        dialogTitle: `Lưu hoặc Chia sẻ ảnh "${fileName}"`
                    });
                    if (showToast) showToast(`Đã tải ảnh "${fileName}" thành công!`, 'success');
                    return true;
                }
            } catch (capErr) {
                if (capErr.name === 'AbortError' || (capErr.message && (capErr.message.includes('cancel') || capErr.message.includes('canceled') || capErr.message.includes('cancelled')))) {
                    return true;
                }
                console.warn('Capacitor native image share failed, falling back:', capErr);
            }
        }

        // 2. Nếu là Data URL hợp lệ
        if (base64Data.startsWith('data:')) {
            const parts = base64Data.split(',');
            let mimeType = 'image/jpeg';
            const mimeMatch = parts[0].match(/:(.*?);/);
            if (mimeMatch) {
                mimeType = mimeMatch[1];
            }

            const byteCharacters = atob(parts[1] || '');
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: mimeType });

            return await downloadBlobOrFile(blob, fileName, mimeType, showToast);
        }

        // 3. Nếu là đường link URL thông thường
        const link = document.createElement('a');
        link.href = base64Data;
        link.download = fileName;
        link.target = '_blank';
        link.rel = 'noopener';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
            if (document.body.contains(link)) {
                document.body.removeChild(link);
            }
        }, 5000);

        if (showToast) showToast(`Đã tải ảnh "${fileName}" thành công!`, 'success');
        return true;
    } catch (err) {
        console.error('Lỗi khi tải ảnh:', err);
        if (showToast) showToast(`Lỗi khi tải ảnh: ${err.message || err}`, 'error');
        return false;
    }
}
