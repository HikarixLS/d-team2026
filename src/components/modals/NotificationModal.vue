<template>
  <Transition name="modal-fade">
    <div v-if="show" class="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800 my-auto max-h-[90vh] overflow-y-auto text-slate-800 dark:text-slate-100 relative">
        
        <!-- Header -->
        <div class="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg">
              <i class="fa-solid fa-bell"></i>
            </div>
            <div>
              <h3 class="font-extrabold text-slate-900 dark:text-white text-base">
                Thông Báo &amp; Cập Nhật App
              </h3>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Quản lý quyền thông báo đẩy, nhắc nhở ca trực &amp; phiên bản
              </p>
            </div>
          </div>
          <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <!-- Section 1: Thông Báo Đẩy & Nhắc Nhở Ca Trực -->
        <div class="space-y-3 bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/40">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-bell-ring text-indigo-600 dark:text-indigo-400"></i>
              <h4 class="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                1. Tính Năng Thông Báo Đẩy
              </h4>
            </div>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                  :class="hasPermission ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'">
              <i class="fa-solid" :class="hasPermission ? 'fa-circle-check' : 'fa-triangle-exclamation'"></i>
              {{ hasPermission ? 'Đã cấp quyền' : 'Chưa cấp quyền' }}
            </span>
          </div>

          <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Ứng dụng tự động lên lịch thông báo cục bộ và thông báo đẩy trên điện thoại:
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div class="flex items-start gap-2 bg-white dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <i class="fa-solid fa-clock text-amber-500 mt-0.5"></i>
              <div>
                <span class="font-bold text-slate-900 dark:text-white block">Nhắc nhở ca trực:</span>
                <span class="text-slate-500 dark:text-slate-400">Tự động báo trước 15 phút mỗi khi có ca trực đã đăng ký.</span>
              </div>
            </div>
            <div class="flex items-start gap-2 bg-white dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <i class="fa-solid fa-calendar-check text-emerald-500 mt-0.5"></i>
              <div>
                <span class="font-bold text-slate-900 dark:text-white block">Nhắc nộp hồ sơ:</span>
                <span class="text-slate-500 dark:text-slate-400">Báo trước 1 ngày lúc 9h sáng khi hoạt động sắp đến hạn.</span>
              </div>
            </div>
          </div>

          <!-- Notification Action Buttons -->
          <div class="flex flex-wrap items-center gap-2 pt-1">
            <button v-if="!hasPermission" @click="handleRequestPermission"
                    class="flex-1 py-2 px-3 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs">
              <i class="fa-solid fa-shield-check"></i> Cấp Quyền Thông Báo
            </button>
            <button @click="handleTestNotification"
                    class="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs">
              <i class="fa-solid fa-paper-plane"></i> Thử Gửi Thông Báo Ngay
            </button>
            <button @click="handleSyncReminders"
                    class="py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer">
              <i class="fa-solid fa-arrows-rotate"></i> Đồng bộ nhắc ca
            </button>
          </div>
        </div>

        <!-- Section 2: Kiểm Tra Cập Nhật Phiên Bản -->
        <div class="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-code-compare text-emerald-600 dark:text-emerald-400"></i>
              <h4 class="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                2. Phiên Bản Ứng Dụng &amp; Cập Nhật OTA
              </h4>
            </div>
            <span class="px-2 py-0.5 rounded-md font-mono font-bold text-xs bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              v{{ currentVersion }}
            </span>
          </div>

          <div class="text-xs space-y-1 text-slate-600 dark:text-slate-300">
            <div class="flex items-center justify-between text-[11px] py-1 border-b border-slate-200 dark:border-slate-700/60">
              <span class="text-slate-500">Môi Trường:</span>
              <span class="font-bold text-[10px] px-2 py-0.5 rounded-full"
                    :class="isNative ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'">
                {{ isNative ? '📱 Ứng Dụng Android (App)' : '🌐 Phiên Bản Web' }}
              </span>
            </div>
            <div class="flex items-center justify-between text-[11px] py-1 border-b border-slate-200 dark:border-slate-700/60">
              <span class="text-slate-500">Mã Bản Build (Build Code):</span>
              <span class="font-mono font-bold text-slate-800 dark:text-slate-200">{{ buildCode }}</span>
            </div>
            <div class="flex items-center justify-between text-[11px] py-1 border-b border-slate-200 dark:border-slate-700/60">
              <span class="text-slate-500">Ngày Phát Hành:</span>
              <span class="font-bold text-slate-800 dark:text-slate-200">{{ releaseDate }}</span>
            </div>
            <div class="flex items-center justify-between text-[11px] py-1">
              <span class="text-slate-500">Cập Nhật OTA:</span>
              <span class="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <i class="fa-solid fa-cloud-arrow-down"></i> {{ isNative ? 'Tự động kiểm tra trên App' : 'Tự động đồng bộ trên Web' }}
              </span>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2 pt-1">
            <button @click="handleCheckUpdate"
                    class="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs">
              <i class="fa-solid fa-arrows-rotate" :class="{ 'animate-spin': isChecking }"></i>
              {{ isNative ? 'Kiểm Tra Bản Cập Nhật Mới' : 'Kiểm Tra Phiên Bản' }}
            </button>
            <a v-if="!isNative" :href="downloadUrl" target="_system"
               class="py-2 px-3 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs">
              <i class="fa-solid fa-download"></i> Tải APK Cho Android
            </a>
          </div>
        </div>

        <!-- Section 3: Admin Options (chỉ hiện khi là admin) -->
        <div v-if="currentUserRole === 'admin'" class="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <i class="fa-solid fa-crown"></i> Dành Cho Quản Trị Viên:
            </span>
            <button @click="$emit('open-config')" class="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer flex items-center gap-1">
              <i class="fa-solid fa-gear"></i> Mở Cấu Hình Hệ Thống &amp; OTA
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
          <button @click="$emit('close')" class="px-5 py-2 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer">
            Đóng Lại
          </button>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useNotifications } from '../../composables/useNotifications.js';
import { useAppUpdater, CURRENT_APP_VERSION, CURRENT_BUILD_CODE, CURRENT_RELEASE_DATE, DEFAULT_APK_DOWNLOAD_URL, isNativePlatform } from '../../composables/useAppUpdater.js';

const props = defineProps({
  show: Boolean,
  currentUserRole: String,
  loggedInMemberId: String,
  searchedShifts: Array,
  getMemberName: Function
});

const emit = defineEmits(['close', 'open-config']);

const { hasNotificationPermission, requestLocalPermissions, sendTestNotification, syncAllUpcomingShiftReminders } = useNotifications();
const { isChecking, checkForUpdate } = useAppUpdater();

const isNative = isNativePlatform();
const hasPermission = ref(false);
const currentVersion = CURRENT_APP_VERSION;
const buildCode = CURRENT_BUILD_CODE;
const releaseDate = CURRENT_RELEASE_DATE;
const downloadUrl = DEFAULT_APK_DOWNLOAD_URL;

const checkCurrentPermission = async () => {
  hasPermission.value = hasNotificationPermission.value;
};

onMounted(() => {
  checkCurrentPermission();
});

const handleRequestPermission = async () => {
  const granted = await requestLocalPermissions();
  hasPermission.value = granted;
};

const handleTestNotification = async () => {
  await sendTestNotification(
    '⏰ Hệ Thống Quản Lý ĐVP',
    'Thông báo nhắc nhở ca trực và hạn hoạt động đang hoạt động rất tốt trên thiết bị của bạn! 🎉'
  );
  hasPermission.value = true;
};

const handleSyncReminders = () => {
  if (props.loggedInMemberId && props.searchedShifts) {
    const userShifts = props.searchedShifts.filter(s => String(s.memberId).toUpperCase() === String(props.loggedInMemberId).toUpperCase());
    const name = props.getMemberName ? props.getMemberName(props.loggedInMemberId) : '';
    syncAllUpcomingShiftReminders(userShifts, name);
  }
};

const handleCheckUpdate = () => {
  checkForUpdate(true);
};
</script>
