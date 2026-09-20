<template>
  <Transition name="modal-fade">
    <div v-if="show" class="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800 my-auto max-h-[90vh] overflow-y-auto text-slate-800 dark:text-slate-100 relative">
        
        <!-- Header -->
        <div class="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg shadow-xs">
              <i class="fa-solid fa-bell"></i>
            </div>
            <div>
              <h3 class="font-extrabold text-slate-900 dark:text-white text-base">
                Trung Tâm Thông Báo &amp; Nhắc Ca
              </h3>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Lời nhắc ca trực, hoạt động và thông báo đẩy trên trình duyệt
              </p>
            </div>
          </div>
          <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <!-- Section 1: Danh Sách Thông Báo & Lời Nhắc Thực Tế (Live Alerts) -->
        <div class="space-y-2.5">
          <div class="flex items-center justify-between">
            <h4 class="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <i class="fa-solid fa-bell-ring text-amber-500"></i> Thông Báo Hiện Tại
            </h4>
            <span class="text-[10px] font-black px-2 py-0.5 rounded-full"
                  :class="activeAlerts.length > 0 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'">
              {{ activeAlerts.length }} lời nhắc
            </span>
          </div>

          <!-- Alert Items List -->
          <div v-if="activeAlerts.length > 0" class="space-y-2 max-h-56 overflow-y-auto pr-1">
            <div v-for="(alert, idx) in activeAlerts" :key="idx"
                 class="p-3 rounded-2xl border transition flex items-start justify-between gap-3 text-xs"
                 :class="alert.bgClass">
              <div class="flex items-start gap-2.5">
                <div class="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5" :class="alert.iconBgClass">
                  <i :class="alert.iconClass"></i>
                </div>
                <div class="space-y-0.5">
                  <div class="font-bold text-slate-900 dark:text-white leading-tight">
                    {{ alert.title }}
                  </div>
                  <p class="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                    {{ alert.message }}
                  </p>
                </div>
              </div>

              <!-- Action button if any -->
              <button v-if="alert.actionTab"
                      @click="$emit('go-tab', alert.actionTab); $emit('close')"
                      class="px-2.5 py-1 rounded-xl font-bold text-[11px] shrink-0 transition cursor-pointer shadow-xs whitespace-nowrap active:scale-95"
                      :class="alert.btnClass">
                {{ alert.actionText }} ➔
              </button>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-center space-y-1">
            <p class="text-xs font-bold text-slate-700 dark:text-slate-300">
              ✨ Không có lời nhắc nào đang chờ xử lý!
            </p>
            <p class="text-[11px] text-slate-400">
              Bạn đã xem hết các thông báo ca trực và hoạt động mới nhất.
            </p>
          </div>
        </div>

        <!-- Section 2: Cài Đặt Thông Báo Trình Duyệt (Web Push Notifications) -->
        <div class="space-y-3 bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/40">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-mobile-screen-button text-indigo-600 dark:text-indigo-400"></i>
              <h4 class="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                Thông Báo Đẩy Trên Trình Duyệt
              </h4>
            </div>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                  :class="hasPermission ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'">
              <i class="fa-solid" :class="hasPermission ? 'fa-circle-check' : 'fa-triangle-exclamation'"></i>
              {{ hasPermission ? 'Đã Bật' : 'Chưa Bật' }}
            </span>
          </div>

          <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Hệ thống hỗ trợ gửi thông báo đẩy trực tiếp trên điện thoại và máy tính để nhắc bạn trước khi vào ca trực:
          </p>

          <!-- Action Buttons -->
          <div class="flex flex-wrap items-center gap-2 pt-1">
            <button v-if="!hasPermission" @click="handleRequestPermission"
                    class="flex-1 min-w-[130px] py-2 px-3 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs">
              <i class="fa-solid fa-shield-check"></i> Cấp Quyền Thông Báo
            </button>
            <button @click="handleTestNotification"
                    class="flex-1 min-w-[130px] py-2 px-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs">
              <i class="fa-solid fa-paper-plane"></i> Thử Gửi Thông Báo
            </button>
            <button @click="handleSyncReminders"
                    class="py-2 px-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer">
              <i class="fa-solid fa-arrows-rotate"></i> Đồng bộ ca
            </button>
          </div>

          <!-- Browser Tip -->
          <p class="text-[11px] text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 leading-normal flex items-start gap-1.5">
            <i class="fa-solid fa-circle-info text-indigo-500 shrink-0 mt-0.5"></i>
            <span><strong>Mẹo:</strong> Nếu trình duyệt không hiện thông báo, bạn hãy bấm vào biểu tượng <strong>ổ khóa 🔒</strong> trên thanh địa chỉ và bật mục <strong>"Thông báo (Notifications)"</strong> sang <strong>Cho phép</strong>.</span>
          </p>
        </div>

        <!-- Section 3: Admin Options (chỉ hiện khi là admin) -->
        <div v-if="currentUserRole === 'admin'" class="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <i class="fa-solid fa-crown"></i> Quản Trị Viên:
            </span>
            <button @click="$emit('open-config')" class="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer flex items-center gap-1">
              <i class="fa-solid fa-gear"></i> Mở Cấu Hình Hệ Thống
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
import { ref, computed, onMounted } from 'vue';
import { useNotifications } from '../../composables/useNotifications.js';

const props = defineProps({
  show: Boolean,
  currentUserRole: String,
  loggedInMemberId: String,
  registrations: {
    type: Array,
    default: () => []
  },
  shifts: {
    type: Array,
    default: () => []
  },
  leaveRequests: {
    type: Array,
    default: () => []
  },
  activities: {
    type: Array,
    default: () => []
  },
  pendingLeaveCount: {
    type: Number,
    default: 0
  },
  todayDate: String,
  formatDate: Function,
  getMemberName: Function
});

defineEmits(['close', 'open-config', 'go-tab']);

const {
  hasNotificationPermission,
  checkPermissionState,
  requestLocalPermissions,
  sendTestNotification,
  syncAllUpcomingShiftReminders
} = useNotifications();

const hasPermission = ref(false);

const checkCurrentPermission = () => {
  hasPermission.value = checkPermissionState() === 'granted';
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
    'Thông báo nhắc ca trực đang hoạt động rất tốt trên trình duyệt của bạn! 🎉'
  );
  hasPermission.value = hasNotificationPermission.value;
};

const handleSyncReminders = () => {
  if (props.loggedInMemberId && props.registrations) {
    const myId = String(props.loggedInMemberId).trim().toLowerCase();
    const userRegs = props.registrations.filter(r => String(r.memberId).trim().toLowerCase() === myId);
    const name = props.getMemberName ? props.getMemberName(props.loggedInMemberId) : '';
    syncAllUpcomingShiftReminders(userRegs, name);
  }
};

// Danh sách thông báo thực tế cần nhắc nhở
const activeAlerts = computed(() => {
  const alerts = [];
  const isAdmin = props.currentUserRole === 'admin';
  const myId = String(props.loggedInMemberId || '').trim().toLowerCase();
  const today = props.todayDate || new Date().toISOString().split('T')[0];

  // 1. Admin: Đơn nghỉ phép chờ duyệt
  if (isAdmin && props.pendingLeaveCount > 0) {
    alerts.push({
      title: 'Đơn Xin Nghỉ Phép Chờ Duyệt',
      message: `Có ${props.pendingLeaveCount} đơn xin nghỉ phép của thành viên đang chờ bạn xét duyệt.`,
      iconClass: 'fa-solid fa-file-pen text-amber-600',
      iconBgClass: 'bg-amber-100 dark:bg-amber-950',
      bgClass: 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800',
      btnClass: 'bg-amber-600 hover:bg-amber-700 text-white',
      actionTab: 'leave',
      actionText: 'Duyệt Đơn'
    });
  }

  // 2. Member: Ca trực hôm nay
  if (!isAdmin && props.registrations && myId) {
    const todayRegs = props.registrations.filter(r =>
      String(r.memberId).trim().toLowerCase() === myId &&
      r.date === today
    );

    for (const reg of todayRegs) {
      // Kiểm tra đã điểm danh chưa
      const isCheckedIn = (props.shifts || []).some(s =>
        String(s.memberId).trim().toLowerCase() === myId &&
        s.date === today &&
        s.shiftType === reg.shiftType
      );

      if (!isCheckedIn) {
        alerts.push({
          title: `Hôm Nay: ${reg.shiftType}`,
          message: `Bạn có lịch trực ${reg.shiftType} hôm nay (${props.formatDate ? props.formatDate(today) : today}). Đừng quên vào điểm danh!`,
          iconClass: 'fa-solid fa-bolt text-emerald-600',
          iconBgClass: 'bg-emerald-100 dark:bg-emerald-950',
          bgClass: 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800',
          btnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
          actionTab: 'entry',
          actionText: 'Điểm Danh'
        });
      }
    }

    // 3. Member: Trạng thái đơn xin nghỉ gần đây
    if (props.leaveRequests) {
      const myLeaves = props.leaveRequests.filter(l =>
        String(l.memberId).trim().toLowerCase() === myId &&
        l.status === 'Chờ duyệt'
      );
      if (myLeaves.length > 0) {
        alerts.push({
          title: 'Đơn Xin Nghỉ Phép',
          message: `Bạn đang có ${myLeaves.length} đơn xin nghỉ phép ca trực đang chờ Quản trị viên phê duyệt.`,
          iconClass: 'fa-solid fa-clock text-sky-600',
          iconBgClass: 'bg-sky-100 dark:bg-sky-950',
          bgClass: 'bg-sky-50/60 dark:bg-sky-950/20 border-sky-200 dark:border-sky-800',
          btnClass: 'bg-sky-600 hover:bg-sky-700 text-white',
          actionTab: 'leave',
          actionText: 'Xem Đơn'
        });
      }
    }
  }

  return alerts;
});
</script>
