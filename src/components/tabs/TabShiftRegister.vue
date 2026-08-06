<template>
  <div class="space-y-4 sm:space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
      <!-- Left: Form Đăng ký ca trực -->
      <div class="md:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-5 space-y-4">
        <div class="border-b border-slate-100 pb-3">
          <h3 class="text-base font-bold text-slate-800 flex items-center gap-2">
            <i class="fa-solid fa-calendar-plus text-sky-600"></i> Đăng Ký Lịch Trực Sắp Tới
          </h3>
          <p class="text-xs text-slate-500 mt-0.5">Đăng ký lịch trực dự kiến theo tuần để Ban Điều hành sắp xếp</p>
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
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Ngày Đăng Ký Trực <span class="text-red-500">*</span>
            </label>
            <input type="date" v-model="regForm.date" :min="todayDate" required class="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none">
            <div class="flex items-center justify-between mt-1 text-[11px]" v-if="regForm.date">
              <span class="text-sky-600 font-medium">📅 {{ getWeekNameFromDate(regForm.date) }}</span>
              <span class="font-bold" :class="isRegDateFull ? 'text-rose-600' : 'text-emerald-600'">
                {{ isRegDateFull ? '🔴 Đã kín ca (Full 4/4 ca)' : `🟢 Đã kín ${getTakenShiftsCountForDate(regForm.date)}/4 ca` }}
              </span>
            </div>
            <p v-if="regForm.date && regForm.date < todayDate" class="text-[11px] text-rose-600 font-bold mt-1">
              ⚠️ Không thể chọn ngày trong quá khứ!
            </p>
          </div>

          <div v-if="isRegDateFull" class="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold flex items-center gap-2">
            <i class="fa-solid fa-ban text-lg text-rose-600 shrink-0"></i>
            <div>
              <p class="font-black text-rose-800">🔴 NGÀY ĐÃ KÍN CA (FULL 4/4 CA)</p>
              <p class="text-[11px] font-normal text-rose-600">Tất cả 4 ca trực ngày {{ formatDate(regForm.date) }} đều đã đạt tối đa 3/3 người. Vui lòng chọn ngày khác!</p>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Ca Trực Muốn Đăng Ký <span class="text-red-500">*</span>
            </label>
            <select v-model="regForm.shiftType" required :disabled="isRegDateFull || (regForm.date && regForm.date < todayDate)"
                    class="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white font-medium">
              <option value="Ca 1" :disabled="isShiftFullOnDate('Ca 1', regForm.date)">
                Ca 1 (7h30 - 9h20) — [{{ getShiftRegisteredCount('Ca 1', regForm.date) }}/3 người] {{ isShiftFullOnDate('Ca 1', regForm.date) ? '🔴 [FULL]' : '🟢 [Còn chỗ]' }}
              </option>
              <option value="Ca 2" :disabled="isShiftFullOnDate('Ca 2', regForm.date)">
                Ca 2 (9h20 - 11h30) — [{{ getShiftRegisteredCount('Ca 2', regForm.date) }}/3 người] {{ isShiftFullOnDate('Ca 2', regForm.date) ? '🔴 [FULL]' : '🟢 [Còn chỗ]' }}
              </option>
              <option value="Ca 3" :disabled="isShiftFullOnDate('Ca 3', regForm.date)">
                Ca 3 (13h00 - 15h20) — [{{ getShiftRegisteredCount('Ca 3', regForm.date) }}/3 người] {{ isShiftFullOnDate('Ca 3', regForm.date) ? '🔴 [FULL]' : '🟢 [Còn chỗ]' }}
              </option>
              <option value="Ca 4" :disabled="isShiftFullOnDate('Ca 4', regForm.date)">
                Ca 4 (15h20 - 17h00) — [{{ getShiftRegisteredCount('Ca 4', regForm.date) }}/3 người] {{ isShiftFullOnDate('Ca 4', regForm.date) ? '🔴 [FULL]' : '🟢 [Còn chỗ]' }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Ghi Chú (Tùy chọn)</label>
            <input type="text" v-model="regForm.notes" placeholder="VD: Đăng ký cố định hàng tuần..." class="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none">
            <p class="text-[11px] text-amber-600 mt-1.5 font-semibold flex items-center gap-1">
              <i class="fa-solid fa-circle-info"></i> Quy định: Tối đa 3 người/ca và mỗi thành viên đăng ký tối đa 3 ca/ngày.
            </p>
          </div>

          <button type="submit" :disabled="isRegDateFull || (regForm.date && regForm.date < todayDate)"
                  class="w-full py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                  :class="(isRegDateFull || (regForm.date && regForm.date < todayDate)) ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-700 text-white cursor-pointer'">
            <i class="fa-solid" :class="isRegDateFull ? 'fa-ban' : 'fa-paper-plane'"></i>
            {{ isRegDateFull ? 'Ngày Đã Kín Ca (Full)' : 'Đăng Ký Lịch Trực' }}
          </button>
        </form>
      </div>

      <!-- Right: Danh sách ca trực đã đăng ký -->
      <div class="md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-5 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 class="text-base font-bold text-slate-800 flex items-center gap-2">
              <i class="fa-solid fa-list-check text-sky-600"></i> Danh Sách Ca Trực Đã Đăng Ký
            </h3>
            <p class="text-xs text-slate-500 mt-0.5">Hiển thị lịch đăng ký ca trực dự kiến của toàn đội</p>
          </div>
          <span class="px-3 py-1 bg-sky-50 text-sky-700 border border-sky-200 text-xs font-bold rounded-full">
            Tổng: {{ filteredRegistrations.length }} Đăng Ký
          </span>
        </div>

        <div class="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
          <div v-for="r in filteredRegistrations" :key="r.id"
               class="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between hover:bg-slate-100 transition">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="font-bold text-slate-800 text-sm">{{ getMemberName(r.memberId) }}</span>
                <span class="px-2 py-0.5 text-[10px] font-extrabold bg-sky-100 text-sky-800 rounded-md border border-sky-300">
                  {{ r.shiftType }}
                </span>
                <span class="text-xs text-slate-400 font-semibold">• {{ getMemberDept(r.memberId) }}</span>
              </div>
              <div class="text-xs text-slate-600 font-medium">
                🗓️ Ngày {{ formatDate(r.date) }} <span class="text-slate-400">({{ getWeekNameFromDate(r.date) }})</span>
                <span v-if="r.notes" class="text-slate-500 italic font-normal ml-2">"{{ r.notes }}"</span>
              </div>
            </div>

            <div class="flex items-center gap-1.5">
              <button v-if="currentUserRole === 'admin'"
                      @click.stop.prevent="$emit('delete-registration', r)"
                      class="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition cursor-pointer" title="Quản trị viên xóa ca này">
                <i class="fa-solid fa-trash-can text-sm"></i>
              </button>
              <span v-else-if="r.memberId === loggedInMemberId" class="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200" title="Muốn hủy ca đã đăng ký? Vui lòng gửi Đơn xin nghỉ phép để Admin duyệt">
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
defineProps([
  'regForm',
  'members',
  'currentUserRole',
  'loggedInMemberId',
  'filteredRegistrations',
  'todayDate',
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
defineEmits(['save-registration', 'delete-registration']);
</script>
