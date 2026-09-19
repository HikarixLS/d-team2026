<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- User Personal Welcome & Stats Banner -->
    <div class="bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl border border-sky-700/40 relative overflow-hidden">
      <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-400/20 text-sky-300 text-xs font-black mb-2 border border-sky-400/30">
            <i class="fa-solid fa-clipboard-user"></i> Lịch Trực Cá Nhân
          </div>
          <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight">Mục Xem Lại Ca Đã Đăng Ký</h2>
          <p class="text-xs sm:text-sm text-sky-200 mt-1">
            Tra cứu toàn bộ lịch ca trực tuần và ca hoạt động bạn đã đăng ký • Xem trạng thái điểm danh &amp; xin nghỉ phép.
          </p>
        </div>

        <!-- Personal Info Card -->
        <div class="flex items-center gap-3 bg-sky-950/70 backdrop-blur-md px-4 py-3 rounded-2xl border border-sky-700/50 shadow-md">
          <div class="w-11 h-11 rounded-2xl bg-sky-500 text-white font-black text-lg flex items-center justify-center shadow-md shrink-0">
            {{ activeMemberName ? activeMemberName.trim().slice(-1).toUpperCase() : 'U' }}
          </div>
          <div>
            <div class="text-xs font-black text-white flex items-center gap-1.5">
              <i class="fa-solid fa-circle-user text-sky-400"></i>
              <span>{{ activeMemberName || `Thành viên (${loggedInMemberId})` }}</span>
            </div>
            <div class="text-[11px] font-bold text-sky-300 flex items-center gap-1.5 mt-0.5">
              <span>MSSV: {{ loggedInMemberId }}</span>
              <span v-if="activeMemberDept" class="text-sky-400">• {{ activeMemberDept }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary Metrics Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      <!-- Total Duty Shifts -->
      <div @click="activeFilterType = 'duty'"
           class="bg-white dark:bg-slate-900 rounded-2xl p-4 border transition cursor-pointer shadow-xs flex items-center gap-3"
           :class="activeFilterType === 'duty' ? 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/40 dark:bg-sky-950/20' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'">
        <div class="w-11 h-11 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center text-xl shrink-0">
          <i class="fa-solid fa-calendar-check"></i>
        </div>
        <div>
          <div class="text-2xl font-black text-slate-800 dark:text-white leading-none">
            {{ myDutyShifts.length }}
          </div>
          <div class="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
            Ca Trực Tuần
          </div>
        </div>
      </div>

      <!-- Total Activity Shifts -->
      <div @click="activeFilterType = 'activity'"
           class="bg-white dark:bg-slate-900 rounded-2xl p-4 border transition cursor-pointer shadow-xs flex items-center gap-3"
           :class="activeFilterType === 'activity' ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-950/20' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'">
        <div class="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl shrink-0">
          <i class="fa-solid fa-users-viewfinder"></i>
        </div>
        <div>
          <div class="text-2xl font-black text-indigo-600 dark:text-indigo-400 leading-none">
            {{ myActivityShifts.length }}
          </div>
          <div class="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
            Ca Hoạt Động
          </div>
        </div>
      </div>

      <!-- Upcoming Shifts -->
      <div @click="activeFilterType = 'upcoming'"
           class="bg-white dark:bg-slate-900 rounded-2xl p-4 border transition cursor-pointer shadow-xs flex items-center gap-3"
           :class="activeFilterType === 'upcoming' ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/40 dark:bg-amber-950/20' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'">
        <div class="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl shrink-0">
          <i class="fa-solid fa-hourglass-half"></i>
        </div>
        <div>
          <div class="text-2xl font-black text-amber-600 dark:text-amber-400 leading-none">
            {{ upcomingShiftsCount }}
          </div>
          <div class="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
            Ca Sắp Diễn Ra
          </div>
        </div>
      </div>

      <!-- Shifts Today -->
      <div @click="activeFilterType = 'today'"
           class="bg-white dark:bg-slate-900 rounded-2xl p-4 border transition cursor-pointer shadow-xs flex items-center gap-3"
           :class="activeFilterType === 'today' ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'">
        <div class="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl shrink-0">
          <i class="fa-solid fa-bolt animate-pulse"></i>
        </div>
        <div>
          <div class="text-2xl font-black text-emerald-600 dark:text-emerald-400 leading-none">
            {{ todayShiftsCount }}
          </div>
          <div class="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
            Ca Trực Hôm Nay
          </div>
        </div>
      </div>
    </div>

    <!-- Filter & Control Bar -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
      <!-- Tabs Switcher -->
      <div class="flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
        <button @click="activeFilterType = 'all'"
                class="px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0"
                :class="activeFilterType === 'all' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'">
          <i class="fa-solid fa-list-ul"></i> Tất Cả Ca ({{ myDutyShifts.length + myActivityShifts.length }})
        </button>

        <button @click="activeFilterType = 'duty'"
                class="px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0"
                :class="activeFilterType === 'duty' ? 'bg-sky-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'">
          <i class="fa-solid fa-calendar-days"></i> Ca Trực Tuần ({{ myDutyShifts.length }})
        </button>

        <button @click="activeFilterType = 'activity'"
                class="px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0"
                :class="activeFilterType === 'activity' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'">
          <i class="fa-solid fa-users-rectangle"></i> Ca Hoạt Động ({{ myActivityShifts.length }})
        </button>
      </div>

      <!-- Quick Action Buttons -->
      <div class="flex items-center gap-2">
        <button @click="$emit('go-tab', 'register')"
                class="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer">
          <i class="fa-solid fa-plus"></i> Đăng Ký Thêm Ca Trực
        </button>
        <button @click="$emit('go-tab', 'activities')"
                class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer">
          <i class="fa-solid fa-calendar-plus"></i> Đăng Ký Ca Hoạt Động
        </button>
      </div>
    </div>

    <!-- SECTION 1: CA TRỰC TUẦN ĐÃ ĐĂNG KÝ -->
    <div v-if="activeFilterType === 'all' || activeFilterType === 'duty' || activeFilterType === 'upcoming' || activeFilterType === 'today'"
         class="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
      <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <h3 class="font-extrabold text-slate-800 dark:text-white text-base flex items-center gap-2">
            <i class="fa-solid fa-calendar-days text-sky-600"></i> Ca Trực Tuần Đã Đăng Ký
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
              {{ displayedDutyShifts.length }} ca
            </span>
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Lịch trực văn phòng Đoàn - Hội đã đăng ký trong tháng {{ selectedMonth }}
          </p>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="displayedDutyShifts.length === 0" class="py-8 text-center text-slate-400 space-y-2">
        <i class="fa-solid fa-calendar-xmark text-3xl text-slate-300"></i>
        <div class="text-xs font-bold">Bạn chưa đăng ký ca trực tuần nào phù hợp bộ lọc hiện tại.</div>
        <button @click="$emit('go-tab', 'register')" class="text-xs text-sky-600 dark:text-sky-400 font-bold hover:underline cursor-pointer">
          Bấm vào đây để đăng ký ca trực tuần ngay ➔
        </button>
      </div>

      <!-- Duty Shifts Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div v-for="r in displayedDutyShifts" :key="r.id"
             class="p-4 rounded-2xl border transition flex flex-col justify-between space-y-3"
             :class="[
               r.date === todayDate
                 ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 shadow-sm'
                 : (r.date > todayDate
                     ? 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80'
                     : 'bg-slate-100/50 dark:bg-slate-800/20 border-slate-200/60 dark:border-slate-800 opacity-80')
             ]">
          <div>
            <div class="flex items-center justify-between gap-2 mb-2">
              <span class="px-2.5 py-1 rounded-xl text-xs font-black bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800 flex items-center gap-1.5">
                <i class="fa-solid fa-clock text-sky-600"></i> {{ r.shiftType }}
              </span>

              <!-- Status badge -->
              <span v-if="r.date === todayDate" class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white animate-pulse flex items-center gap-1">
                <i class="fa-solid fa-bolt"></i> Hôm Nay
              </span>
              <span v-else-if="r.date > todayDate" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
                ⏳ Sắp diễn ra
              </span>
              <span v-else class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                ✓ Đã qua
              </span>
            </div>

            <div class="text-xs space-y-1 text-slate-700 dark:text-slate-300 font-medium">
              <p class="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-sm">
                <i class="fa-solid fa-calendar-day text-indigo-500"></i>
                <span>Ngày: {{ formatDate(r.date) }}</span>
                <span class="text-xs text-slate-400 font-semibold">({{ getWeekNameFromDate(r.date) }})</span>
              </p>
              <p v-if="r.notes" class="text-xs text-slate-500 dark:text-slate-400 italic pt-1">
                "{{ r.notes }}"
              </p>
            </div>
          </div>

          <!-- Bottom Action: Điểm danh nếu hôm nay & Xin nghỉ phép nếu bận -->
          <div class="pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
            <button v-if="r.date === todayDate"
                    @click="$emit('go-tab', 'entry')"
                    class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold transition flex items-center gap-1 cursor-pointer shadow-xs">
              <i class="fa-solid fa-bolt"></i> Điểm Danh Ngay
            </button>
            <span v-else class="text-[11px] text-slate-400 font-semibold">Ca trực định kỳ</span>

            <button v-if="r.date >= todayDate"
                    @click="$emit('go-tab', 'leave')"
                    class="px-2.5 py-1 bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-200 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer"
                    title="Nếu bận đột xuất, bấm để nộp đơn xin nghỉ phép">
              <i class="fa-solid fa-file-pen text-[10px]"></i> Xin Nghỉ Ca Này
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- SECTION 2: CA HOẠT ĐỘNG ĐÃ ĐĂNG KÝ -->
    <div v-if="activeFilterType === 'all' || activeFilterType === 'activity' || activeFilterType === 'upcoming' || activeFilterType === 'today'"
         class="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
      <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <h3 class="font-extrabold text-slate-800 dark:text-white text-base flex items-center gap-2">
            <i class="fa-solid fa-users-viewfinder text-indigo-600"></i> Ca Hoạt Động Đã Đăng Ký
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              {{ displayedActivityShifts.length }} ca
            </span>
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Lịch các ca tham gia hỗ trợ chương trình / hoạt động ngoại khóa
          </p>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="displayedActivityShifts.length === 0" class="py-8 text-center text-slate-400 space-y-2">
        <i class="fa-solid fa-calendar-xmark text-3xl text-slate-300"></i>
        <div class="text-xs font-bold">Bạn chưa đăng ký ca hoạt động nào phù hợp bộ lọc hiện tại.</div>
        <button @click="$emit('go-tab', 'activities')" class="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer">
          Bấm vào đây để xem các hoạt động đang mở đăng ký ➔
        </button>
      </div>

      <!-- Activity Shifts Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div v-for="ar in displayedActivityShifts" :key="ar.id"
             class="p-4 rounded-2xl border transition flex flex-col justify-between space-y-3"
             :class="[
               ar.date === todayDate
                 ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 shadow-sm'
                 : (ar.date > todayDate
                     ? 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80'
                     : 'bg-slate-100/50 dark:bg-slate-800/20 border-slate-200/60 dark:border-slate-800 opacity-80')
             ]">
          <div>
            <div class="flex items-center justify-between gap-2 mb-2">
              <span class="px-2.5 py-1 rounded-xl text-xs font-black bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800 flex items-center gap-1.5">
                <i class="fa-solid fa-flag text-indigo-600"></i> {{ ar.shiftType }}
              </span>

              <!-- Attendance / Leave status -->
              <span v-if="getActivityCheckInStatus(ar.activityId)?.status === 'present'"
                    class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1 border border-emerald-300">
                <i class="fa-solid fa-circle-check text-emerald-600"></i> Đã Điểm Danh
              </span>
              <span v-else-if="getActivityCheckInStatus(ar.activityId)?.status === 'leave'"
                    class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1 border border-amber-300">
                <i class="fa-solid fa-clock"></i> Đã Xin Nghỉ
              </span>
              <span v-else-if="ar.date === todayDate"
                    class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white animate-pulse flex items-center gap-1">
                <i class="fa-solid fa-bolt"></i> Sẵn Sàng Điểm Danh (Hôm Nay)
              </span>
              <span v-else-if="ar.date > todayDate"
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
                ⏳ Chờ điểm danh
              </span>
              <span v-else
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                ⚠️ Quá hạn
              </span>
            </div>

            <div class="space-y-1">
              <h4 class="font-extrabold text-slate-900 dark:text-white text-sm leading-snug">
                {{ getActivityName(ar.activityId) }}
              </h4>
              <div class="text-xs text-slate-600 dark:text-slate-400 font-medium space-y-0.5 pt-1">
                <p class="flex items-center gap-1.5">
                  <i class="fa-solid fa-calendar-day text-indigo-500"></i>
                  <span class="font-bold">Ngày trực:</span> {{ formatDate(ar.date) }}
                </p>
                <p class="flex items-center gap-1.5">
                  <i class="fa-solid fa-location-dot text-rose-500"></i>
                  <span class="font-bold">Địa điểm:</span> {{ getActivityLocation(ar.activityId) }}
                </p>
                <p v-if="ar.notes" class="text-xs text-slate-500 italic pt-0.5">
                  "{{ ar.notes }}"
                </p>
              </div>
            </div>
          </div>

          <!-- Bottom Actions: Hủy ca nếu chưa diễn ra & Điểm danh nếu hôm nay -->
          <div class="pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2 text-xs">
            <!-- Điểm danh ngay nếu hôm nay -->
            <button v-if="ar.date === todayDate && getActivityCheckInStatus(ar.activityId)?.status !== 'present'"
                    @click="$emit('go-tab', 'activities')"
                    class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold transition flex items-center gap-1 cursor-pointer shadow-xs">
              <i class="fa-solid fa-bolt"></i> Điểm Danh Ngay
            </button>
            <span v-else class="text-[11px] text-slate-400">Ca tham gia</span>

            <!-- Nút Hủy Đăng Ký Ca nếu muốn đổi ca -->
            <button v-if="ar.date >= todayDate && getActivityCheckInStatus(ar.activityId)?.status !== 'present'"
                    @click="confirmCancelActivityReg(ar)"
                    class="px-2.5 py-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer"
                    title="Bấm để hủy đăng ký ca này nếu bạn muốn đổi ca">
              <i class="fa-solid fa-trash-can text-[11px]"></i> Hủy Ca
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm Cancel Activity Registration Modal -->
    <div v-if="cancelingRegObj" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 max-w-sm w-full shadow-2xl space-y-4">
        <div class="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center text-2xl mx-auto">
          <i class="fa-solid fa-triangle-exclamation"></i>
        </div>
        <div class="text-center space-y-1">
          <h3 class="font-extrabold text-slate-900 dark:text-white text-base">Hủy Đăng Ký Ca Hoạt Động?</h3>
          <p class="text-xs text-slate-500 leading-relaxed">
            Bạn có chắc muốn hủy đăng ký ca <strong>{{ cancelingRegObj.shiftType }}</strong> ngày <strong>{{ formatDate(cancelingRegObj.date) }}</strong> của hoạt động "<strong>{{ getActivityName(cancelingRegObj.activityId) }}</strong>"?
          </p>
        </div>
        <div class="flex items-center gap-2 pt-2">
          <button @click="cancelingRegObj = null" type="button"
                  class="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs transition cursor-pointer">
            Không hủy
          </button>
          <button @click="executeCancelActivityReg" type="button"
                  class="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs transition cursor-pointer shadow-md">
            Xác Nhận Hủy Ca
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  loggedInMemberId: String,
  activeMemberName: String,
  activeMemberDept: String,
  currentUserRole: String,
  registrations: {
    type: Array,
    default: () => []
  },
  activityRegistrations: {
    type: Array,
    default: () => []
  },
  activities: {
    type: Array,
    default: () => []
  },
  activityCheckIns: {
    type: Array,
    default: () => []
  },
  selectedMonth: String,
  formatDate: Function,
  getWeekNameFromDate: Function,
  getMemberName: Function,
  getMemberDept: Function
});

const emit = defineEmits(['go-tab', 'delete-activity-reg']);

const activeFilterType = ref('all'); // 'all' | 'duty' | 'activity' | 'upcoming' | 'today'
const cancelingRegObj = ref(null);

const todayDate = computed(() => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
});

// All registered duty shifts of the logged-in member
const myDutyShifts = computed(() => {
  if (!props.loggedInMemberId || !props.registrations) return [];
  const myId = String(props.loggedInMemberId).trim().toLowerCase();
  return props.registrations
    .filter(r => String(r.memberId).trim().toLowerCase() === myId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
});

// All registered activity shifts of the logged-in member
const myActivityShifts = computed(() => {
  if (!props.loggedInMemberId || !props.activityRegistrations) return [];
  const myId = String(props.loggedInMemberId).trim().toLowerCase();
  return props.activityRegistrations
    .filter(r => String(r.memberId).trim().toLowerCase() === myId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
});

const upcomingShiftsCount = computed(() => {
  const t = todayDate.value;
  const dCount = myDutyShifts.value.filter(s => s.date >= t).length;
  const aCount = myActivityShifts.value.filter(s => s.date >= t).length;
  return dCount + aCount;
});

const todayShiftsCount = computed(() => {
  const t = todayDate.value;
  const dCount = myDutyShifts.value.filter(s => s.date === t).length;
  const aCount = myActivityShifts.value.filter(s => s.date === t).length;
  return dCount + aCount;
});

// Filtered Duty Shifts according to activeFilterType
const displayedDutyShifts = computed(() => {
  let list = myDutyShifts.value;
  const t = todayDate.value;
  if (activeFilterType.value === 'upcoming') {
    list = list.filter(s => s.date >= t);
  } else if (activeFilterType.value === 'today') {
    list = list.filter(s => s.date === t);
  }
  return list;
});

// Filtered Activity Shifts according to activeFilterType
const displayedActivityShifts = computed(() => {
  let list = myActivityShifts.value;
  const t = todayDate.value;
  if (activeFilterType.value === 'upcoming') {
    list = list.filter(s => s.date >= t);
  } else if (activeFilterType.value === 'today') {
    list = list.filter(s => s.date === t);
  }
  return list;
});

const getActivityName = (actId) => {
  const act = props.activities?.find(a => a.id === actId);
  return act ? act.name : 'Hoạt động';
};

const getActivityLocation = (actId) => {
  const act = props.activities?.find(a => a.id === actId);
  return act?.location || 'Trường ĐH';
};

const getActivityCheckInStatus = (actId) => {
  if (!props.activityCheckIns || !props.loggedInMemberId) return null;
  const myId = String(props.loggedInMemberId).trim().toLowerCase();
  return props.activityCheckIns.find(
    c => c.activityId === actId && String(c.memberId).trim().toLowerCase() === myId
  ) || null;
};

const confirmCancelActivityReg = (regObj) => {
  cancelingRegObj.value = regObj;
};

const executeCancelActivityReg = () => {
  if (!cancelingRegObj.value) return;
  emit('delete-activity-reg', cancelingRegObj.value.id);
  cancelingRegObj.value = null;
};
</script>
