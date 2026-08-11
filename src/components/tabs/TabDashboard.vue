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
        <div class="relative h-64 flex items-center justify-center min-h-[256px]">
          <canvas id="targetPieChart" class="w-full h-full"></canvas>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 class="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <i class="fa-solid fa-chart-pie text-sky-600 dark:text-sky-400"></i> Biểu Đồ Tròn: Phân Bổ Các Ca Trực Trong Tháng
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400">Thống kê phân bổ tỷ lệ các ca trực đã hoàn thành</p>
        <div class="relative h-64 flex items-center justify-center min-h-[256px]">
          <canvas id="shiftTypeChart" class="w-full h-full"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, watch, onBeforeUnmount, nextTick } from 'vue';
import Chart from 'chart.js/auto';

const props = defineProps([
  'currentTab',
  'currentUserRole',
  'filteredShifts',
  'shiftTypes',
  'personalShiftsCount',
  'registrations',
  'personalRegistrationsCount',
  'targetPassRate',
  'personalProgressPercent',
  'membersPassingTargetCount',
  'membersInProgressCount',
  'membersZeroCount',
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
        try { targetChartInstance.destroy(); } catch (e) {}
      }

      const isAdmin = props.currentUserRole === 'admin';
      let chartLabels = [];
      let chartData = [];
      let chartColors = [];

      if (isAdmin) {
        const pass = props.membersPassingTargetCount || 0;
        const inProgress = props.membersInProgressCount || 0;
        const zero = props.membersZeroCount !== undefined ? props.membersZeroCount : Math.max(0, (props.members?.length || 0) - pass - inProgress);

        chartLabels = [
          `Đạt chỉ tiêu (≥10 ca): ${pass}`,
          `Đang trực (1 - 9 ca): ${inProgress}`,
          `Chưa trực ca nào (0 ca): ${zero}`
        ];
        chartData = [pass, inProgress, zero];
        chartColors = ['#10B981', '#6366F1', '#94A3B8'];
      } else {
        const done = Math.min(10, props.personalShiftsCount || 0);
        const remaining = Math.max(0, 10 - done);

        chartLabels = [
          `Đã hoàn thành: ${done} ca`,
          `Còn thiếu: ${remaining} ca`
        ];
        chartData = [done, remaining];
        chartColors = ['#10B981', '#6366F1'];
      }

      targetChartInstance = new Chart(canvas1, {
        type: 'pie',
        data: {
          labels: chartLabels,
          datasets: [{
            data: chartData,
            backgroundColor: chartColors,
            borderWidth: 2,
            borderColor: '#ffffff'
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
                color: '#64748B'
              }
            }
          }
        }
      });
    }

    // 2. Shift Distribution Chart (Dynamic shift types)
    const canvas2 = document.getElementById('shiftTypeChart');
    if (canvas2) {
      if (shiftTypeChartInstance) {
        try { shiftTypeChartInstance.destroy(); } catch (e) {}
      }

      const shiftList = props.filteredShifts || [];
      const sTypes = (props.shiftTypes && props.shiftTypes.length > 0)
        ? props.shiftTypes
        : [
            { id: 'Ca 1', name: 'Ca 1', time: '7h30-9h20' },
            { id: 'Ca 2', name: 'Ca 2', time: '9h20-11h30' },
            { id: 'Ca 3', name: 'Ca 3', time: '13h00-15h20' },
            { id: 'Ca 4', name: 'Ca 4', time: '15h20-17h00' }
          ];

      const palette = ['#6366F1', '#0284C7', '#F59E0B', '#F43F5E', '#10B981', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];
      const chartLabels = sTypes.map(st => {
        const count = shiftList.filter(s => s.shiftType === st.name || s.shiftType === st.id).length;
        return `${st.name} ${st.time ? '(' + st.time + ')' : ''}: ${count}`;
      });
      const chartData = sTypes.map(st => shiftList.filter(s => s.shiftType === st.name || s.shiftType === st.id).length);
      const chartColors = sTypes.map((_, i) => palette[i % palette.length]);

      shiftTypeChartInstance = new Chart(canvas2, {
        type: 'doughnut',
        data: {
          labels: chartLabels,
          datasets: [{
            data: chartData,
            backgroundColor: chartColors,
            borderWidth: 2,
            borderColor: '#ffffff'
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
                color: '#64748B'
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
  if (targetChartInstance) try { targetChartInstance.destroy(); } catch (e) {}
  if (shiftTypeChartInstance) try { shiftTypeChartInstance.destroy(); } catch (e) {}
});

watch(
  () => [
    props.currentTab,
    props.currentUserRole,
    props.filteredShifts,
    props.members,
    props.membersPassingTargetCount,
    props.personalShiftsCount
  ],
  () => {
    if (props.currentTab === 'dashboard') {
      nextTick(() => {
        setTimeout(renderCharts, 50);
      });
    }
  },
  { deep: true, immediate: true }
);
</script>
