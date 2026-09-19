<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- Notice / Header -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 sm:p-6">
      <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4 sm:mb-6">
        <div>
          <h2 class="text-base sm:text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <i class="fa-solid fa-pen-to-square text-indigo-600 dark:text-indigo-400"></i> Ghi Nhận Ca Trực Đã Hoàn Thành (Sổ Gốc)
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Ghi nhận thông tin trực từ sổ giấy vào hệ thống để theo dõi chỉ tiêu ca trực</p>
        </div>
        <span class="text-xs font-bold px-3 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-full border border-indigo-200 dark:border-indigo-800 hidden sm:inline-block">
          Sổ Gốc Ca Trực
        </span>
      </div>

      <!-- Case 1: Member has NO registered shift today -->
      <div v-if="currentUserRole !== 'admin' && todayMemberRegistrations.length === 0"
           class="py-8 px-4 text-center space-y-4 border border-dashed border-amber-300 dark:border-amber-800/80 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20">
        <div class="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center text-3xl mx-auto shadow-inner">
          <i class="fa-solid fa-calendar-xmark"></i>
        </div>
        <div class="max-w-md mx-auto space-y-1.5">
          <h3 class="text-base sm:text-lg font-black text-slate-800 dark:text-white">
            Hôm Nay Bạn Không Có Ca Trực Đã Đăng Ký
          </h3>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            Hôm nay (<strong>{{ formatDate(todayDate) }}</strong>) bạn không có lịch trực nào. Theo quy định, thành viên chỉ được điểm danh khi tới ca làm đã đăng ký trước. Hệ thống không mở điểm danh cho những ngày không có ca đăng ký.
          </p>
        </div>

        <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button @click="$emit('go-tab', 'my-shifts')"
                  class="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer active:scale-95">
            <i class="fa-solid fa-clipboard-user"></i> Xem Ca Đã Đăng Ký
          </button>
          <button @click="$emit('go-tab', 'register')"
                  class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer active:scale-95">
            <i class="fa-solid fa-calendar-plus"></i> Đăng Ký Ca Trực Mới
          </button>
        </div>
      </div>

      <!-- Case 2: Admin OR Member has registered shift today -->
      <form v-else @submit.prevent="$emit('save-shift')" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <!-- Thành Viên Trực -->
          <div class="sm:col-span-2">
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Thành Viên Trực <span class="text-red-500">*</span>
            </label>
            <!-- Admin: Select member -->
            <select v-if="currentUserRole === 'admin'"
                    v-model="shiftForm.memberId" required
                    class="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-base sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-slate-900 dark:text-white min-h-[44px]">
              <option value="" disabled>-- Chọn thành viên theo MSSV/Họ tên --</option>
              <option v-for="m in members" :key="m.id" :value="m.id">
                [{{ m.id }}] {{ m.name }} - {{ m.department || 'Ban chưa đặt' }}
              </option>
            </select>
            <!-- Member: Display current member info (Cannot change) -->
            <div v-else class="w-full border border-slate-200 dark:border-slate-700 rounded-lg p-3 bg-slate-50 dark:bg-slate-800 flex items-center justify-between min-h-[44px]">
              <span class="text-sm font-bold text-slate-800 dark:text-white">
                [{{ loggedInMemberId }}] {{ getMemberName(loggedInMemberId) }}
              </span>
              <span class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
                Thành viên
              </span>
            </div>
          </div>

          <!-- Ngày Trực (Điểm Danh) -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Ngày Trực (Điểm Danh) <span class="text-red-500">*</span>
            </label>
            <!-- Admin: Cho phép chọn mọi ngày (date picker) -->
            <template v-if="currentUserRole === 'admin'">
              <input type="date" v-model="shiftForm.date" required
                     class="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-base sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[44px] font-bold bg-white dark:bg-slate-900 dark:text-white">
              <p class="text-[11px] text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 p-2 rounded-lg border border-indigo-200 dark:border-indigo-800 mt-1.5 font-bold flex items-center gap-1.5 leading-snug">
                <i class="fa-solid fa-user-shield text-indigo-600 dark:text-indigo-400 shrink-0"></i> Quyền Quản trị viên: Được phép chọn tất cả các ngày (bao gồm các ngày trước đó) để ghi nhận / điểm danh bù cho thành viên.
              </p>
            </template>
            <!-- Member: KHÓA CỐ ĐỊNH NGÀY HÔM NAY - Tuyệt đối không dùng input date để tránh mở popup lịch chọn ngày không đăng ký -->
            <template v-else>
              <div class="w-full border border-emerald-300 dark:border-emerald-700 rounded-lg p-2.5 bg-emerald-50/60 dark:bg-emerald-950/30 flex items-center justify-between min-h-[44px]">
                <div class="flex items-center gap-2">
                  <i class="fa-solid fa-calendar-check text-emerald-600"></i>
                  <span class="text-sm font-black text-slate-800 dark:text-white">
                    Hôm nay: {{ formatDate(todayDate) }}
                  </span>
                </div>
                <span class="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 border border-emerald-300">
                  ✓ Đã đăng ký ca
                </span>
              </div>
              <p class="text-[11px] text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-300 dark:border-emerald-800 mt-1.5 font-bold flex items-center gap-1.5 leading-snug">
                <i class="fa-solid fa-circle-check text-emerald-600 shrink-0"></i> Điểm danh hôm nay: Hệ thống đã khóa cố định ngày trực hôm nay theo ca bạn đã đăng ký.
              </p>
            </template>
          </div>

          <!-- Ca Trực -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Ca Trực <span class="text-red-500">*</span>
            </label>
            <select v-model="shiftForm.shiftType" required
                    class="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-base sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-slate-900 dark:text-white min-h-[44px] font-bold">
              <option v-for="st in memberShiftOptions" :key="st.id || st.name" :value="st.name || st.id">
                {{ st.name }} {{ st.time ? '(' + st.time + ')' : '' }}
              </option>
            </select>

            <!-- Cảnh báo nếu ca này đã được điểm danh -->
            <div v-if="currentUserRole !== 'admin' && isShiftAlreadyRecorded(shiftForm.shiftType)"
                 class="text-[11px] text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg border border-rose-300 dark:border-rose-800 mt-1.5 font-bold flex items-center gap-1.5 leading-snug">
              <i class="fa-solid fa-triangle-exclamation text-rose-600 shrink-0"></i> Bạn đã điểm danh ca này trong ngày hôm nay rồi! Không thể điểm danh lại.
            </div>
            <p v-else-if="currentUserRole !== 'admin'" class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
              🗓️ Ca bạn đã đăng ký hôm nay: <strong class="text-indigo-600 dark:text-indigo-400">{{ todayMemberRegistrations.map(r => r.shiftType).join(', ') }}</strong>
            </p>
          </div>

          <!-- Trang Số -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1 flex items-center justify-between">
              <span>Trang Số <span class="text-red-500">*</span></span>
              <span class="text-[10px] text-indigo-600 dark:text-indigo-400 normal-case">(Trong sổ giấy)</span>
            </label>
            <input type="number" min="1" v-model="shiftForm.pageNo" required placeholder="VD: 12"
                   class="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-base sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[44px] bg-white dark:bg-slate-900 dark:text-white">
          </div>

          <!-- STT Trang -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1 flex items-center justify-between">
              <span>STT Trang <span class="text-red-500">*</span></span>
              <span class="text-[10px] text-indigo-600 dark:text-indigo-400 normal-case">(Trong sổ giấy)</span>
            </label>
            <input type="number" min="1" v-model="shiftForm.sttNo" required placeholder="VD: 5"
                   class="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-base sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[44px] bg-white dark:bg-slate-900 dark:text-white">
          </div>

          <!-- Trạng Thái Ca Trực -->
          <div class="sm:col-span-2">
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">Trạng Thái Ca Trực</label>
            <select v-model="shiftForm.status" class="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-base sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-slate-900 dark:text-white min-h-[44px]">
              <option value="Đúng giờ">Đúng giờ</option>
              <option value="Đi trễ">Đi trễ</option>
              <option value="Về sớm">Về sớm</option>
              <option value="Trực thay">Trực thay</option>
            </select>
          </div>

          <!-- Ghi Chú / Bàn Giao Ca -->
          <div class="sm:col-span-2">
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">Ghi Chú / Bàn Giao Ca</label>
            <textarea v-model="shiftForm.notes" rows="2" placeholder="Ghi nhận bàn giao hoặc thông tin chú ý..."
                      class="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-base sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[60px] bg-white dark:bg-slate-900 dark:text-white"></textarea>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button type="button" @click="$emit('reset-form')" class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold text-xs transition active:scale-95 cursor-pointer">
            Làm Mới
          </button>
          <button type="submit"
                  :disabled="currentUserRole !== 'admin' && isShiftAlreadyRecorded(shiftForm.shiftType)"
                  class="px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2 active:scale-95 cursor-pointer"
                  :class="currentUserRole !== 'admin' && isShiftAlreadyRecorded(shiftForm.shiftType)
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'">
            <i class="fa-solid fa-cloud-arrow-up"></i> Lưu Đồng Bộ
          </button>
        </div>
      </form>
    </div>

    <!-- Recent Shifts Preview List -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 sm:p-5">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <i class="fa-solid fa-clock-rotate-left text-indigo-600 dark:text-indigo-400"></i> Ca Trực Mới Ghi Nhận
        </h3>
        <button @click="$emit('go-tab', 'history')" class="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer">Xem tất cả</button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        <div v-for="s in shifts.slice(0, 6)" :key="s.id" class="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
          <div class="flex items-center justify-between font-bold text-slate-800 dark:text-white">
            <span>{{ getMemberName(s.memberId) }}</span>
            <span class="px-2 py-0.5 text-[10px] rounded-md font-extrabold"
                  :class="s.status === 'Đúng giờ' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'">
              {{ s.status }}
            </span>
          </div>
          <div class="text-slate-500 dark:text-slate-400 font-medium">
            🗓️ {{ formatDate(s.date) }} • {{ s.shiftType }}
          </div>
          <div class="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
            Sổ gốc: Trang {{ s.pageNo }} - STT {{ s.sttNo }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue';

const props = defineProps([
  'shiftForm',
  'members',
  'shiftTypes',
  'currentUserRole',
  'todayDate',
  'shifts',
  'registrations',
  'loggedInMemberId',
  'getMemberName',
  'formatDate'
]);

defineEmits(['save-shift', 'reset-form', 'go-tab']);

const dynamicShiftTypes = computed(() => {
  if (props.shiftTypes && Array.isArray(props.shiftTypes) && props.shiftTypes.length > 0) {
    return props.shiftTypes;
  }
  return [
    { id: 'Ca 1', name: 'Ca 1', time: '7h30 - 9h20' },
    { id: 'Ca 2', name: 'Ca 2', time: '9h20 - 11h30' },
    { id: 'Ca 3', name: 'Ca 3', time: '13h00 - 15h20' },
    { id: 'Ca 4', name: 'Ca 4', time: '15h20 - 17h00' }
  ];
});

// Danh sách các ca mà thành viên đăng nhập đã đăng ký trong ngày hôm nay
const todayMemberRegistrations = computed(() => {
  if (props.currentUserRole === 'admin') return [];
  const mId = props.loggedInMemberId;
  if (!mId) return [];
  return (props.registrations || []).filter(r =>
    String(r.memberId).trim().toLowerCase() === String(mId).trim().toLowerCase() &&
    r.date === props.todayDate
  );
});

// Danh sách ca để chọn: Admin thấy hết, Thành viên chỉ thấy ca đã đăng ký hôm nay
const memberShiftOptions = computed(() => {
  if (props.currentUserRole === 'admin') {
    return dynamicShiftTypes.value;
  }
  const registeredTypes = todayMemberRegistrations.value.map(r => r.shiftType);
  return dynamicShiftTypes.value.filter(st => registeredTypes.includes(st.name || st.id));
});

// Kiểm tra xem ca này trong ngày hôm nay đã được điểm danh chưa
const isShiftAlreadyRecorded = (shiftType) => {
  if (!shiftType) return false;
  const mId = props.currentUserRole === 'admin' ? props.shiftForm?.memberId : props.loggedInMemberId;
  const date = props.currentUserRole === 'admin' ? props.shiftForm?.date : props.todayDate;
  if (!mId || !date) return false;
  return (props.shifts || []).some(s =>
    String(s.memberId).trim().toLowerCase() === String(mId).trim().toLowerCase() &&
    s.date === date &&
    s.shiftType === shiftType
  );
};

// Đồng bộ form tự động cho thành viên: Gán ngày hôm nay, memberId và chọn ca trực hợp lệ
const syncMemberForm = () => {
  if (props.currentUserRole !== 'admin') {
    if (props.loggedInMemberId && props.shiftForm) {
      props.shiftForm.memberId = props.loggedInMemberId;
    }
    if (props.todayDate && props.shiftForm) {
      props.shiftForm.date = props.todayDate;
    }
    if (todayMemberRegistrations.value.length > 0 && props.shiftForm) {
      const availableTypes = todayMemberRegistrations.value.map(r => r.shiftType);
      if (!availableTypes.includes(props.shiftForm.shiftType)) {
        props.shiftForm.shiftType = availableTypes[0];
      }
    }
  }
};

watch(
  () => [props.currentUserRole, props.loggedInMemberId, props.todayDate, todayMemberRegistrations.value],
  () => {
    syncMemberForm();
  },
  { immediate: true }
);
</script>
