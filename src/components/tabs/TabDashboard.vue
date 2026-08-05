<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- Stat Cards Overview -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <div class="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{{ currentUserRole === 'admin' ? 'Tổng Ca Trực Toàn Đội' : 'Ca Trực Cá Nhân' }}</p>
          <p class="text-2xl font-black text-slate-800 dark:text-white mt-1">{{ currentUserRole === 'admin' ? filteredShifts.length : personalShiftsCount }} <span class="text-xs font-medium text-slate-400">ca</span></p>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300 flex items-center justify-center text-xl font-bold border border-indigo-100 dark:border-indigo-900">
          <i class="fa-solid fa-clipboard-list"></i>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{{ currentUserRole === 'admin' ? 'Tổng Ca Đăng Ký Toàn Đội' : 'Ca Đăng Ký Cá Nhân' }}</p>
          <p class="text-2xl font-black text-slate-800 dark:text-white mt-1">{{ currentUserRole === 'admin' ? registrations.length : personalRegistrationsCount }} <span class="text-xs font-medium text-slate-400">ca</span></p>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-300 flex items-center justify-center text-xl font-bold border border-sky-100 dark:border-sky-900">
          <i class="fa-solid fa-calendar-check"></i>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{{ currentUserRole === 'admin' ? 'Tỷ Lệ Đạt Chỉ Tiêu (10 Ca)' : 'Tiến Độ Cá Nhân' }}</p>
          <p class="text-2xl font-black text-slate-800 dark:text-white mt-1">{{ currentUserRole === 'admin' ? targetPassRate + '%' : (personalProgressPercent + '%') }}</p>
          <p class="text-[11px] text-slate-400 dark:text-slate-400 mt-0.5" v-if="currentUserRole === 'admin'">{{ membersPassingTargetCount }}/{{ members.length }} thành viên đạt 10 ca</p>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center text-xl font-bold border border-emerald-100 dark:border-emerald-900">
          <i class="fa-solid fa-chart-line"></i>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{{ currentUserRole === 'admin' ? 'Đơn Xin Nghỉ Phép Toàn Đội' : 'Đơn Nghỉ Phép Cá Nhân' }}</p>
          <p class="text-2xl font-black text-slate-800 dark:text-white mt-1">{{ currentUserRole === 'admin' ? leaveRequests.length : personalLeaveRequests.length }} <span class="text-xs font-medium text-slate-400">đơn</span></p>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300 flex items-center justify-center text-xl font-bold border border-amber-100 dark:border-amber-900">
          <i class="fa-solid fa-envelope-open-text"></i>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <div class="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 class="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <i class="fa-solid fa-chart-pie text-indigo-600 dark:text-indigo-400"></i> {{ pieChartTitle }}
        </h3>
        <div class="relative h-64 flex items-center justify-center">
          <canvas id="targetPieChart"></canvas>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 class="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <i class="fa-solid fa-chart-pie text-sky-600 dark:text-sky-400"></i> Biểu Đồ Tròn: Phân Bổ Các Ca Trực Trong Tháng (Ca 1 - 4)
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400">Ca 1 (7h30-9h20), Ca 2 (9h20-11h30), Ca 3 (13h00-15h20), Ca 4 (15h20-17h00)</p>
        <div class="relative h-64 flex items-center justify-center">
          <canvas id="shiftTypeChart"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, watch, onBeforeUnmount, nextTick } from 'vue';
import Chart from 'chart.js/auto';

const props = defineProps([
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

let targetChartInstance = null;
let shiftTypeChartInstance = null;

const renderCharts = () => {
  nextTick(() => {
    // 1. Target Pass Rate Chart
    const canvas1 = document.getElementById('targetPieChart');
    if (canvas1) {
      if (targetChartInstance) {
        targetChartInstance.destroy();
      }

      const isAdmin = props.currentUserRole === 'admin';
      const passCount = isAdmin ? (props.membersPassingTargetCount || 0) : Math.min(10, props.personalShiftsCount || 0);
      const totalCount = isAdmin ? Math.max(1, (props.members?.length || 0)) : 10;
      const pendingCount = Math.max(0, totalCount - passCount);

      targetChartInstance = new Chart(canvas1, {
        type: 'pie',
        data: {
          labels: isAdmin
            ? ['Đạt chỉ tiêu (≥10 ca)', 'Chưa đạt chỉ tiêu (<10 ca)']
            : ['Đã hoàn thành', 'Còn thiếu (Chỉ tiêu 10 ca)'],
          datasets: [{
            data: [passCount, pendingCount],
            backgroundColor: ['#10B981', '#6366F1'],
            borderWidth: 2,
            borderColor: '#1E293B'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                font: { weight: 'bold', size: 11 },
                color: '#94A3B8'
              }
            }
          }
        }
      });
    }

    // 2. Shift Distribution Chart (Ca 1 - 4)
    const canvas2 = document.getElementById('shiftTypeChart');
    if (canvas2) {
      if (shiftTypeChartInstance) {
        shiftTypeChartInstance.destroy();
      }

      const shiftList = props.filteredShifts || [];
      const ca1 = shiftList.filter(s => s.shiftType === 'Ca 1').length;
      const ca2 = shiftList.filter(s => s.shiftType === 'Ca 2').length;
      const ca3 = shiftList.filter(s => s.shiftType === 'Ca 3').length;
      const ca4 = shiftList.filter(s => s.shiftType === 'Ca 4').length;

      shiftTypeChartInstance = new Chart(canvas2, {
        type: 'doughnut',
        data: {
          labels: [
            'Ca 1 (7h30-9h20)',
            'Ca 2 (9h20-11h30)',
            'Ca 3 (13h00-15h20)',
            'Ca 4 (15h20-17h00)'
          ],
          datasets: [{
            data: [ca1, ca2, ca3, ca4],
            backgroundColor: ['#6366F1', '#0284C7', '#F59E0B', '#F43F5E'],
            borderWidth: 2,
            borderColor: '#1E293B'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                font: { weight: 'bold', size: 11 },
                color: '#94A3B8'
              }
            }
          }
        }
      });
    }
  });
};

onMounted(() => {
  renderCharts();
});

onBeforeUnmount(() => {
  if (targetChartInstance) targetChartInstance.destroy();
  if (shiftTypeChartInstance) shiftTypeChartInstance.destroy();
});

watch(
  () => [
    props.currentUserRole,
    props.filteredShifts,
    props.members,
    props.membersPassingTargetCount,
    props.personalShiftsCount
  ],
  () => {
    renderCharts();
  },
  { deep: true }
);
</script>
