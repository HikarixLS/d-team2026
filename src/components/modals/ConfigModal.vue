<template>
  <Transition name="modal-fade">
    <div v-if="show" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800 my-auto max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 class="font-extrabold text-slate-800 dark:text-white text-base flex items-center gap-2">
              <i class="fa-solid fa-cloud-bolt text-indigo-600"></i> Cấu Hình Hệ Thống &amp; Cập Nhật
            </h3>
            <p class="text-[11px] text-slate-400 font-semibold mt-0.5">
              Phiên bản hiện tại: <span class="text-indigo-600 dark:text-indigo-400 font-mono font-bold">v{{ CURRENT_APP_VERSION }} (Build {{ CURRENT_BUILD_CODE }})</span>
            </p>
          </div>
          <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <!-- Firebase Cloud Config -->
        <div class="text-xs space-y-1.5">
          <label class="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <i class="fa-solid fa-fire text-amber-500"></i> 1. Cấu Hình Firebase Firestore Cloud:
          </label>
          <textarea :value="configInput" @input="$emit('update:configInput', $event.target.value)" rows="3"
                    placeholder='{"apiKey": "AIza...", "projectId": "sctdt-a6bf9"}'
                    class="w-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl p-3 font-mono text-[11px] text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"></textarea>
          <p class="text-[10px] text-slate-400">Dán trực tiếp JSON config Firebase từ Firebase Console > Project Settings</p>
        </div>

        <!-- Google Drive Script URL Config -->
        <div class="text-xs space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label class="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <i class="fa-brands fa-google-drive text-emerald-500"></i> 2. Google Apps Script Web App URL (Sao Lưu Drive):
          </label>
          <input type="url" v-model="driveScriptUrlInput"
                 placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                 class="w-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl p-3 font-mono text-[11px] text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          <p class="text-[10px] text-slate-400">Dán URL Web App đã triển khai từ Google Apps Script để sao lưu ảnh thẻ sinh viên lên Drive</p>
        </div>

        <!-- OTA Updates & Native Mobile Actions -->
        <div class="text-xs space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label class="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span class="flex items-center gap-1.5"><i class="fa-solid fa-cloud-arrow-down text-indigo-500"></i> 3. Cập Nhật OTA &amp; Tiện Ích Native:</span>
            <button type="button" @click="handleManualCheckUpdate"
                    class="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[10px] flex items-center gap-1 cursor-pointer transition shadow-xs">
              <i class="fa-solid fa-arrows-rotate" :class="{ 'animate-spin': isChecking }"></i> Kiểm tra cập nhật
            </button>
          </label>
          <div class="grid grid-cols-2 gap-2">
            <button type="button" @click="handleTestNotif"
                    class="p-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs">
              <i class="fa-solid fa-bell text-indigo-500"></i> Thử Thông Báo
            </button>
            <button type="button" @click="handleTestHaptic"
                    class="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs">
              <i class="fa-solid fa-hand-pointer text-amber-500"></i> Thử Rung Phản Hồi
            </button>
          </div>
        </div>

        <!-- Admin Publish OTA Section -->
        <div class="text-xs space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div @click="showPublishSection = !showPublishSection" class="flex justify-between items-center cursor-pointer p-2 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 transition">
            <span class="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <i class="fa-solid fa-rocket text-purple-500"></i> 4. Phát Hành Bản Cập Nhật OTA Mới (Admin)
            </span>
            <i class="fa-solid text-slate-400 text-xs" :class="showPublishSection ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
          </div>

          <div v-if="showPublishSection" class="space-y-2.5 p-3 bg-purple-50/50 dark:bg-purple-950/20 rounded-2xl border border-purple-200 dark:border-purple-900/40">
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="font-bold text-[11px] text-slate-700 dark:text-slate-300 block mb-1">Phiên Bản Mới (vd: 1.2.1):</label>
                <input type="text" v-model="publishForm.latestVersion" placeholder="1.2.1"
                       class="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl px-2.5 py-1.5 font-mono text-[11px] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500" />
              </div>
              <div>
                <label class="font-bold text-[11px] text-slate-700 dark:text-slate-300 block mb-1">Build Code (vd: 121):</label>
                <input type="number" v-model="publishForm.buildCode" placeholder="121"
                       class="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl px-2.5 py-1.5 font-mono text-[11px] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500" />
              </div>
            </div>

            <div>
              <label class="font-bold text-[11px] text-slate-700 dark:text-slate-300 block mb-1">Ghi Chú Cập Nhật (Release Notes):</label>
              <textarea v-model="publishForm.releaseNotes" rows="3" placeholder="• Thêm tính năng cập nhật OTA tự động&#10;• Cải thiện giao diện"
                        class="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl p-2.5 text-[11px] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"></textarea>
            </div>

            <div>
              <label class="font-bold text-[11px] text-slate-700 dark:text-slate-300 block mb-1">Link Tải APK Trực Tiếp:</label>
              <input type="url" v-model="publishForm.downloadUrl" placeholder="https://github.com/..."
                     class="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl px-2.5 py-1.5 font-mono text-[10px] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500" />
            </div>

            <div class="flex items-center justify-between pt-1">
              <label class="flex items-center gap-2 cursor-pointer text-[11px] font-bold text-slate-700 dark:text-slate-300">
                <input type="checkbox" v-model="publishForm.forceUpdate" class="rounded text-purple-600 focus:ring-purple-500">
                <span>Bắt buộc cập nhật (Force Update)</span>
              </label>
              <button type="button" @click="handlePublishNewVersion"
                      class="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-[11px] shadow-sm transition cursor-pointer flex items-center gap-1.5">
                <i class="fa-solid fa-paper-plane"></i> Phát hành ngay
              </button>
            </div>
          </div>
        </div>

        <div class="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
          <button @click="$emit('reset-default')" class="text-xs text-rose-600 dark:text-rose-400 font-bold hover:underline cursor-pointer">
            Khôi phục mặc định
          </button>
          <div class="flex gap-2">
            <button @click="$emit('close')" class="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl cursor-pointer">
              Đóng
            </button>
            <button @click="handleSaveAll" class="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow cursor-pointer transition">
              Lưu cấu hình
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useNotifications } from '../../composables/useNotifications.js';
import { useHaptics } from '../../composables/useHaptics.js';
import { useAppUpdater, CURRENT_APP_VERSION, CURRENT_BUILD_CODE, DEFAULT_APK_DOWNLOAD_URL } from '../../composables/useAppUpdater.js';

defineProps(['show', 'configInput']);
const emit = defineEmits(['close', 'save', 'reset-default', 'update:configInput']);

const { sendTestNotification } = useNotifications();
const { notificationSuccess } = useHaptics();
const { isChecking, checkForUpdate, publishVersion } = useAppUpdater();

const driveScriptUrlInput = ref(localStorage.getItem('google_drive_script_url') || '');
const showPublishSection = ref(false);

const publishForm = ref({
  latestVersion: '1.2.1',
  buildCode: CURRENT_BUILD_CODE + 1,
  releaseDate: new Date().toLocaleDateString('vi-VN'),
  releaseNotes: '• Cập nhật và tối ưu hóa hệ thống\n• Nâng cấp tính năng OTA',
  downloadUrl: DEFAULT_APK_DOWNLOAD_URL,
  forceUpdate: false
});

onMounted(() => {
  driveScriptUrlInput.value = localStorage.getItem('google_drive_script_url') || '';
});

const handleManualCheckUpdate = () => {
  checkForUpdate(true);
};

const handleTestNotif = () => {
  sendTestNotification('Hệ Thống Quản Lý ĐVP', 'Kiểm tra thông báo và nhắc ca trực hoạt động tốt! 🚀');
};

const handleTestHaptic = () => {
  notificationSuccess();
};

const handlePublishNewVersion = async () => {
  if (!publishForm.value.latestVersion.trim()) return;
  const ok = await publishVersion(publishForm.value);
  if (ok) {
    showPublishSection.value = false;
  }
};

const handleSaveAll = () => {
  if (driveScriptUrlInput.value) {
    localStorage.setItem('google_drive_script_url', driveScriptUrlInput.value.trim());
  } else {
    localStorage.removeItem('google_drive_script_url');
  }
  emit('save');
};
</script>
