<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- Stat Cards Overview -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-xs font-bold text-slate-500 uppercase">{{ currentUserRole === 'admin' ? 'Tổng Ca Trực Toàn Đội' : 'Ca Trực Cá Nhân' }}</p>
          <p class="text-2xl font-black text-slate-800 mt-1">{{ currentUserRole === 'admin' ? filteredShifts.length : personalShiftsCount }} <span class="text-xs font-medium text-slate-400">ca</span></p>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold border border-indigo-100">
          <i class="fa-solid fa-clipboard-list"></i>
        </div>
      </div>

      <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-xs font-bold text-slate-500 uppercase">{{ currentUserRole === 'admin' ? 'Tổng Ca Đăng Ký Toàn Đội' : 'Ca Đăng Ký Cá Nhân' }}</p>
          <p class="text-2xl font-black text-slate-800 mt-1">{{ currentUserRole === 'admin' ? registrations.length : personalRegistrationsCount }} <span class="text-xs font-medium text-slate-400">ca</span></p>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center text-xl font-bold border border-sky-100">
          <i class="fa-solid fa-calendar-check"></i>
        </div>
      </div>

      <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-xs font-bold text-slate-500 uppercase">{{ currentUserRole === 'admin' ? 'Tỷ Lệ Đạt Chỉ Tiêu (10 Ca)' : 'Tiến Độ Cá Nhân' }}</p>
          <p class="text-2xl font-black text-slate-800 mt-1">{{ currentUserRole === 'admin' ? targetPassRate + '%' : (personalProgressPercent + '%') }}</p>
          <p class="text-[11px] text-slate-400 mt-0.5" v-if="currentUserRole === 'admin'">{{ membersPassingTargetCount }}/{{ members.length }} thành viên đạt 10 ca</p>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold border border-emerald-100">
          <i class="fa-solid fa-chart-line"></i>
        </div>
      </div>

      <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-xs font-bold text-slate-500 uppercase">{{ currentUserRole === 'admin' ? 'Đơn Xin Nghỉ Phép Toàn Đội' : 'Đơn Nghỉ Phép Cá Nhân' }}</p>
          <p class="text-2xl font-black text-slate-800 mt-1">{{ currentUserRole === 'admin' ? leaveRequests.length : personalLeaveRequests.length }} <span class="text-xs font-medium text-slate-400">đơn</span></p>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold border border-amber-100">
          <i class="fa-solid fa-envelope-open-text"></i>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 class="text-base font-bold text-slate-800 flex items-center gap-2">
          <i class="fa-solid fa-chart-pie text-indigo-600"></i> {{ pieChartTitle }}
        </h3>
        <div class="relative h-64 flex items-center justify-center">
          <canvas id="targetPieChart"></canvas>
        </div>
      </div>

      <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 class="text-base font-bold text-slate-800 flex items-center gap-2">
          <i class="fa-solid fa-chart-pie text-sky-600"></i> Biểu Đồ Tròn: Phân Bổ Các Ca Trực Trong Tháng (Ca 1 - 4)
        </h3>
        <p class="text-xs text-slate-500">Ca 1 (7h30-9h20), Ca 2 (9h20-11h30), Ca 3 (13h00-15h20), Ca 4 (15h20-17h00)</p>
        <div class="relative h-64 flex items-center justify-center">
          <canvas id="shiftTypeChart"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps([
  'currentUserRole',
  'filteredShifts',
  'personalShiftsCount',
  'registrations',
  'personalRegistrationsCount',
  'targetPassRate',
  'personalProgressPercent',
  'membersPassingTargetCount',
  'members',
  'leaveRequests',
  'personalLeaveRequests',
  'pieChartTitle'
]);
</script>
