<template>
  <div class="space-y-4 sm:space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
      <!-- Left: Form Đăng ký ca trực -->
      <div class="md:col-span-1 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 sm:p-5 space-y-4">
        <div class="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
          <div>
            <h3 class="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <i class="fa-solid fa-calendar-plus text-sky-600 dark:text-sky-400"></i> Đăng Ký Lịch Trực
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Đăng ký lịch trực dự kiến theo tuần</p>
          </div>
          <button v-if="currentUserRole === 'admin'" @click="$emit('open-shift-settings')" type="button"
                  class="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded-xl text-[11px] font-bold border border-indigo-200 dark:border-indigo-800 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="Tùy chỉnh số lượng người trực mỗi ca & danh sách ca không giới hạn">
            <i class="fa-solid fa-sliders"></i> Cấu hình ca
          </button>
        </div>

        <form @submit.prevent="$emit('save-registration')" class="space-y-3.5">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Thành Viên Đăng Ký <span class="text-red-500">*</span>
            </label>

            <!-- Admin view: Select Member Dropdown -->
            <select v-if="currentUserRole === 'admin'" v-model="regForm.memberId" required
                    class="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white dark:bg-slate-900 dark:text-white font-medium">
              <option value="" disabled>-- Chọn thành viên --</option>
              <option v-for="m in members" :key="m.id" :value="m.id">
                [{{ m.id }}] {{ m.name }} ({{ m.department || 'Ban chưa đặt' }})
              </option>
            </select>

            <!-- Member view: Auto-filled Logged In Member Card -->
            <div v-else class="p-3 bg-sky-50/80 dark:bg-sky-950/40 rounded-xl border border-sky-200/80 dark:border-sky-900/60 flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-sky-600 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                {{ getMemberName(loggedInMemberId)?.charAt(0)?.toUpperCase() || 'U' }}
              </div>
              <div class="overflow-hidden">
                <div class="text-xs font-black text-slate-800 dark:text-white truncate">
                  {{ getMemberName(loggedInMemberId) }}
                </div>
                <div class="text-[11px] text-sky-600 dark:text-sky-300 font-bold truncate">
                  MSSV: {{ loggedInMemberId }} • {{ getMemberDept(loggedInMemberId) }}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Ngày Đăng Ký Trực <span class="text-red-500">*</span>
            </label>
            <input type="date" v-model="regForm.date" :min="todayDate" required class="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white rounded-lg p-2 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none">
            <div class="flex items-center justify-between mt-1 text-[11px]" v-if="regForm.date">
              <span class="text-sky-600 dark:text-sky-400 font-medium">📅 {{ getWeekNameFromDate(regForm.date) }}</span>
              <span class="font-bold" :class="isRegDateFull ? 'text-rose-600' : 'text-emerald-600'">
                {{ isRegDateFull ? '🔴 Đã kín toàn bộ ca' : ((!shiftSettings?.maxPerShift || shiftSettings.maxPerShift <= 0) ? '🟢 Không giới hạn' : `🟢 Đã kín ${getTakenShiftsCountForDate(regForm.date)}/${dynamicShiftTypes.length} ca`) }}
              </span>
            </div>
            <p v-if="regForm.date && regForm.date < todayDate" class="text-[11px] text-rose-600 font-bold mt-1">
              ⚠️ Không thể chọn ngày trong quá khứ!
            </p>
          </div>

          <div v-if="isRegDateFull" class="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs text-rose-700 dark:text-rose-300 font-bold flex items-center gap-2">
            <i class="fa-solid fa-ban text-lg text-rose-600 shrink-0"></i>
            <div>
              <p class="font-black text-rose-800 dark:text-rose-200">🔴 NGÀY ĐÃ KÍN TOÀN BỘ CA</p>
              <p class="text-[11px] font-normal text-rose-600 dark:text-rose-300">Tất cả các ca trực ngày {{ formatDate(regForm.date) }} đều đã đạt số lượng tối đa. Vui lòng chọn ngày khác!</p>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Ca Trực Muốn Đăng Ký <span class="text-red-500">*</span>
            </label>
            <select v-model="regForm.shiftType" required :disabled="isRegDateFull || (regForm.date && regForm.date < todayDate)"
                    class="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white dark:bg-slate-900 dark:text-white font-medium">
              <option v-for="st in dynamicShiftTypes" :key="st.id || st.name" :value="st.name || st.id" :disabled="isShiftFullOnDate(st.name || st.id, regForm.date)">
                {{ st.name }} {{ st.time ? '(' + st.time + ')' : '' }} — [{{ getShiftSlotLabel(st.name || st.id, regForm.date) }}] {{ isShiftFullOnDate(st.name || st.id, regForm.date) ? '🔴 [FULL]' : '🟢 [Còn chỗ]' }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">Ghi Chú (Tùy chọn)</label>
            <input type="text" v-model="regForm.notes" placeholder="VD: Đăng ký cố định hàng tuần..." class="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white rounded-lg p-2 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none">
            <p class="text-[11px] text-amber-600 dark:text-amber-400 mt-1.5 font-semibold flex items-center gap-1">
              <i class="fa-solid fa-circle-info"></i> Quy định: {{ (!shiftSettings?.maxPerShift || shiftSettings.maxPerShift <= 0) ? 'Không giới hạn số người/ca' : 'Tối đa ' + shiftSettings.maxPerShift + ' người/ca' }} • {{ (!shiftSettings?.maxPerDay || shiftSettings.maxPerDay <= 0) ? 'Không giới hạn số ca/ngày' : 'Tối đa ' + shiftSettings.maxPerDay + ' ca/ngày' }}
            </p>
          </div>

          <button type="submit" :disabled="isRegDateFull || (regForm.date && regForm.date < todayDate)"
                  class="w-full py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                  :class="(isRegDateFull || (regForm.date && regForm.date < todayDate)) ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-700 text-white cursor-pointer'">
            <i class="fa-solid" :class="isRegDateFull ? 'fa-ban' : 'fa-paper-plane'"></i>
            {{ isRegDateFull ? 'Ngày Đã Kín Ca (Full)' : 'Đăng Ký Lịch Trực' }}
          </button>
        </form>
      </div>

      <!-- Right: Danh sách ca trực đã đăng ký -->
      <div class="md:col-span-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 sm:p-5 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 class="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <i class="fa-solid fa-list-check text-sky-600 dark:text-sky-400"></i> Danh Sách Ca Trực Đã Đăng Ký
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Hiển thị lịch đăng ký ca trực dự kiến của toàn đội</p>
          </div>
          <div class="flex items-center gap-2">
            <button @click="$emit('export-matrix-excel')" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer" title="Xuất ma trận ca làm theo mẫu Excel">
              <i class="fa-solid fa-file-excel"></i> Xuất Mẫu Ca Làm
            </button>
            <span class="px-3 py-1 bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-xs font-bold rounded-full">
              Tổng: {{ filteredRegistrations.length }} Đăng Ký
            </span>
          </div>
        </div>

        <div class="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
          <div v-for="r in filteredRegistrations" :key="r.id"
               class="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="font-bold text-slate-800 dark:text-white text-sm">{{ getMemberName(r.memberId) }}</span>
                <span class="px-2 py-0.5 text-[10px] font-extrabold bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 rounded-md border border-sky-300 dark:border-sky-800">
                  {{ r.shiftType }}
                </span>
                <span class="text-xs text-slate-400 font-semibold">• {{ getMemberDept(r.memberId) }}</span>
              </div>
              <div class="text-xs text-slate-600 dark:text-slate-300 font-medium">
                🗓️ Ngày {{ formatDate(r.date) }} <span class="text-slate-400">({{ getWeekNameFromDate(r.date) }})</span>
                <span v-if="r.notes" class="text-slate-500 dark:text-slate-400 italic font-normal ml-2">"{{ r.notes }}"</span>
              </div>
            </div>

            <div class="flex items-center gap-1.5">
              <button v-if="currentUserRole === 'admin'"
                      @click.stop.prevent="$emit('delete-registration', r)"
                      class="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer" title="Quản trị viên xóa ca này">
                <i class="fa-solid fa-trash-can text-sm"></i>
              </button>
              <span v-else-if="r.memberId === loggedInMemberId" class="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700" title="Muốn hủy ca đã đăng ký? Vui lòng gửi Đơn xin nghỉ phép để Admin duyệt">
                🔒 Nộp Đơn Nghỉ Để Hủy
              </span>
            </div>
          </div>

          <div v-if="filteredRegistrations.length === 0" class="p-8 text-center text-slate-400 text-xs">
            Chưa có lịch đăng ký ca trực nào.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps([
  'regForm',
  'members',
  'currentUserRole',
  'loggedInMemberId',
  'filteredRegistrations',
  'todayDate',
  'shiftTypes',
  'shiftSettings',
  'getMemberName',
  'getMemberDept',
  'formatDate',
  'getWeekNameFromDate',
  'getShiftRegisteredCount',
  'isShiftFullOnDate',
  'isShiftTakenOnDate',
  'getTakenShiftsCountForDate',
  'isRegDateFull'
]);

defineEmits(['save-registration', 'delete-registration', 'open-shift-settings', 'export-matrix-excel']);

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

const getShiftSlotLabel = (shiftName, dateStr) => {
  const count = props.getShiftRegisteredCount ? props.getShiftRegisteredCount(shiftName, dateStr) : 0;
  const max = Number(props.shiftSettings?.maxPerShift) || 0;
  if (max <= 0) {
    return `${count} người (Không giới hạn)`;
  }
  return `${count}/${max} người`;
};
</script>
