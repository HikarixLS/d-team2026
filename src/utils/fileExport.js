/**
 * Utility hỗ trợ tải file và xuất file Excel tương thích đa nền tảng (Desktop, iOS Safari, Android Chrome, In-App WebViews Zalo/FB).
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
 * Tải xuống hoặc chia sẻ Blob/File tùy theo nền tảng
 * @param {Blob} blob - Dữ liệu Blob cần tải
 * @param {string} fileName - Tên file xuất ra (kèm đuôi mở rộng)
 * @param {string} mimeType - Kiểu MIME của file
 * @param {Function} [showToast] - Hàm hiển thị thông báo toast nếu có
 * @returns {Promise<boolean>}
 */
export async function downloadBlobOrFile(blob, fileName, mimeType = 'application/octet-stream', showToast = null) {
    try {
        const isMobile = isMobileDevice();

        // 1. Trên Mobile: Ưu tiên dùng Web Share API (File Sharing)
        // Cho phép người dùng chọn "Lưu vào Tệp / Save to Files" (iOS), "Tải xuống / Lưu vào máy / Drive / Zalo" (Android)
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
                // Nếu người dùng chủ động đóng hộp thoại Share (AbortError), không báo lỗi
                if (shareError.name === 'AbortError') {
                    return true;
                }
                console.warn('Web Share API gặp lỗi hoặc bị hủy, chuyển sang tải trực tiếp qua Object URL:', shareError);
            }
        }

        // 2. Tải trực tiếp qua Object URL (Desktop & Mobile Browser fallback)
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        link.setAttribute('download', fileName);

        // Đối với iOS Safari khi không dùng được Web Share, mở new tab để xem/tải
        if (/iPhone|iPad|iPod/i.test(navigator.userAgent || '')) {
            link.target = '_blank';
            link.rel = 'noopener';
        }

        link.style.display = 'none';
        document.body.appendChild(link);
        
        // Kích hoạt sự kiện click
        link.click();

        // Giữ ObjectURL trong 60 giây để trình duyệt di động hoàn tất quá trình lưu file
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

        // Nếu là Data URL hợp lệ
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

        // Nếu là đường link URL thông thường
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
