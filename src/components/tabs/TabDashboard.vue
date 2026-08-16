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
          <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{{ currentUserRole === 'admin' ? 'Tỷ Lệ Đạt Chỉ Tiêu' : 'Tiến Độ Cá Nhân' }}</p>
          <p class="text-2xl font-black text-slate-800 dark:text-white mt-1">{{ currentUserRole === 'admin' ? targetPassRate + '%' : (personalProgressPercent + '%') }}</p>
          <p class="text-[11px] text-slate-400 dark:text-slate-400 mt-0.5" v-if="currentUserRole === 'admin'">{{ membersPassingTargetCount }}/{{ members.length }} thành viên đạt chỉ tiêu</p>
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
      <!-- 1. Top Thành Viên Trực Nhiều Nhất (Bar Chart) -->
      <div class="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 class="text-sm sm:text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <i class="fa-solid fa-chart-column text-indigo-600 dark:text-indigo-400"></i> Top Thành Viên Trực Nhiều Nhất
        </h3>
        <div class="relative h-64 flex items-center justify-center min-h-[256px]">
          <canvas id="topMembersBarChart" class="w-full h-full"></canvas>
        </div>
      </div>

      <!-- 2. Phân Bố Số Ca Trực (Ca 1 - 4) (Doughnut Chart) -->
      <div class="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 class="text-sm sm:text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <i class="fa-solid fa-chart-pie text-indigo-600 dark:text-indigo-400"></i> Phân Bố Số Ca Trực (Ca 1 - 4)
        </h3>
        <div class="relative h-64 flex items-center justify-center min-h-[256px]">
          <canvas id="shiftDistributionChart" class="w-full h-full"></canvas>
        </div>
      </div>
    </div>

    <!-- 3. Ma Trận Đánh Giá Theo Từng Tuần & Tổng Kết Tháng -->
    <div class="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 class="text-sm sm:text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <i class="fa-solid fa-table-list text-indigo-600 dark:text-indigo-400"></i> Ma Trận Đánh Giá Theo Từng Tuần &amp; Tổng Kết Tháng
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Định mức tiêu chuẩn: <strong class="text-indigo-600 dark:text-indigo-400 font-bold">2 ca/tuần</strong> cho mỗi thành viên • Tự động tổng hợp đánh giá theo tuần và toàn tháng {{ selectedMonth || '' }}
          </p>
        </div>
        <div class="relative w-full md:w-64">
          <input type="text"
                 v-model="matrixSearch"
                 placeholder="Tìm tên thành viên..."
                 class="w-full pl-3 pr-8 py-1.5 sm:py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium placeholder-slate-400">
          <i class="fa-solid fa-magnifying-glass absolute right-3 top-2.5 sm:top-3 text-xs text-slate-400 pointer-events-none"></i>
        </div>
      </div>

      <div class="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
        <table class="w-full text-left text-xs sm:text-sm border-collapse">
          <thead class="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 font-bold uppercase text-[11px] tracking-wider">
            <tr>
              <th class="py-3 px-4 text-left">THÀNH VIÊN</th>
              <th class="py-3 px-3 text-center">
                <div>TUẦN 1</div>
                <div class="text-[9px] font-bold text-slate-400 dark:text-slate-500 tracking-normal">TARGET: 2 CA</div>
              </th>
              <th class="py-3 px-3 text-center">
                <div>TUẦN 2</div>
                <div class="text-[9px] font-bold text-slate-400 dark:text-slate-500 tracking-normal">TARGET: 2 CA</div>
              </th>
              <th class="py-3 px-3 text-center">
                <div>TUẦN 3</div>
                <div class="text-[9px] font-bold text-slate-400 dark:text-slate-500 tracking-normal">TARGET: 2 CA</div>
              </th>
              <th class="py-3 px-3 text-center">
                <div>TUẦN 4</div>
                <div class="text-[9px] font-bold text-slate-400 dark:text-slate-500 tracking-normal">TARGET: 2 CA</div>
              </th>
              <th class="py-3 px-3 text-center">
                <div>TUẦN 5</div>
                <div class="text-[9px] font-bold text-slate-400 dark:text-slate-500 tracking-normal">TARGET: 2 CA</div>
              </th>
              <th class="py-3 px-3 text-center">TỔNG THÁNG</th>
              <th class="py-3 px-4 text-center">ĐÁNH GIÁ CUỐI THÁNG</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-if="filteredMatrixList.length === 0">
              <td colspan="8" class="text-center py-10 text-slate-400 dark:text-slate-500 text-xs sm:text-sm font-medium">
                Không tìm thấy thành viên nào phù hợp.
              </td>
            </tr>
            <tr v-for="item in filteredMatrixList" :key="item.member.id" class="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
              <!-- Member Info -->
              <td class="py-3 px-4">
                <div class="font-bold text-slate-800 dark:text-white text-xs sm:text-sm">{{ item.member.name || item.member.id }}</div>
                <div class="text-[11px] text-slate-400 font-medium">{{ item.member.id }} <span v-if="item.member.department">• {{ item.member.department }}</span></div>
              </td>

              <!-- Weeks 1 - 5 -->
              <td v-for="w in [1, 2, 3, 4, 5]" :key="w" class="py-3 px-3 text-center">
                <span v-if="item.weeks[w] >= 2" class="inline-flex items-center justify-center px-2 py-0.5 rounded-lg text-xs font-black bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {{ item.weeks[w] }} ca
                </span>
                <span v-else-if="item.weeks[w] === 1" class="inline-flex items-center justify-center px-2 py-0.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  {{ item.weeks[w] }} ca
                </span>
                <span v-else class="text-xs text-slate-300 dark:text-slate-600 font-medium">
                  0
                </span>
              </td>

              <!-- Month Total -->
              <td class="py-3 px-3 text-center">
                <span class="font-black text-slate-800 dark:text-white text-xs sm:text-sm">{{ item.totalShifts }}</span>
                <span class="text-[11px] font-medium text-slate-400"> / {{ item.targetShifts }} ca</span>
              </td>

              <!-- Assessment Status -->
              <td class="py-3 px-4 text-center">
                <span v-if="item.isPassed" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <i class="fa-solid fa-circle-check text-emerald-500"></i> Đạt chỉ tiêu
                </span>
                <span v-else class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  <i class="fa-solid fa-circle-xmark text-rose-500"></i> Chưa đạt
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount, nextTick } from 'vue';
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
  'pieChartTitle',
  'selectedMonth',
  'getMemberName',
  'getMemberDept'
]);

let topMembersChartInstance = null;
let shiftDistributionChartInstance = null;

const matrixSearch = ref('');

// Helper: Calculate week index (1 to 5) from a date string (YYYY-MM-DD)
const getWeekFromDate = (dateStr) => {
  if (!dateStr) return 1;
  const parts = dateStr.split('-');
  const day = parseInt(parts[2], 10) || 1;
  if (day <= 7) return 1;
  if (day <= 14) return 2;
  if (day <= 21) return 3;
  if (day <= 28) return 4;
  return 5;
};

// Helper: Get shifts for a specific member
const getMemberShifts = (memberId) => {
  if (!memberId) return [];
  const targetId = String(memberId).trim().toUpperCase();
  return (props.filteredShifts || []).filter(s => {
    return String(s.memberId || '').trim().toUpperCase() === targetId;
  });
};

// Matrix computed list for all members
const matrixList = computed(() => {
  const list = props.members || [];
  return list.map(member => {
    const shifts = getMemberShifts(member.id);
    const weeks = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    shifts.forEach(s => {
      const w = getWeekFromDate(s.date);
      if (weeks[w] !== undefined) {
        weeks[w]++;
      }
    });
    const totalShifts = shifts.length;
    const targetShifts = Number(member.targetShifts) || 10;
    const isPassed = totalShifts >= targetShifts;

    return {
      member,
      weeks,
      totalShifts,
      targetShifts,
      isPassed
    };
  });
});

// Search filter for matrix
const filteredMatrixList = computed(() => {
  const q = (matrixSearch.value || '').trim().toLowerCase();
  if (!q) return matrixList.value;
  return matrixList.value.filter(item => {
    const name = String(item.member.name || '').toLowerCase();
    const id = String(item.member.id || '').toLowerCase();
    const dept = String(item.member.department || '').toLowerCase();
    return name.includes(q) || id.includes(q) || dept.includes(q);
  });
});

// Render Charts Function
const renderCharts = () => {
  nextTick(() => {
    // 1. Top Thành Viên Trực Nhiều Nhất (Bar Chart)
    const canvas1 = document.getElementById('topMembersBarChart');
    if (canvas1) {
      if (topMembersChartInstance) {
        try { topMembersChartInstance.destroy(); } catch (e) {}
      }

      // Map member shift counts and sort
      const memberStats = (props.members || []).map(m => {
        const completed = getMemberShifts(m.id).length;
        const target = Number(m.targetShifts) || 10;
        return {
          name: m.name || m.id,
          completed,
          target
        };
      });

      // Filter only members who have active shifts or top members
      memberStats.sort((a, b) => b.completed - a.completed);
      const topList = memberStats.filter(m => m.completed > 0).slice(0, 7);

      const labels = topList.map(m => m.name);
      const completedData = topList.map(m => m.completed);
      const targetData = topList.map(m => m.target);

      const maxCompleted = completedData.length > 0 ? Math.max(...completedData, 1) : 1;

      topMembersChartInstance = new Chart(canvas1, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Ca Đã Trực',
              data: completedData,
              backgroundColor: '#4F46E5', // Indigo / Purple
              borderRadius: 4,
              borderSkipped: false,
              barPercentage: 0.5,
              categoryPercentage: 0.6
            },
            {
              label: 'Chỉ Tiêu Quy Định',
              data: targetData,
              backgroundColor: '#CBD5E1', // Light Gray
              borderRadius: 4,
              borderSkipped: false,
              barPercentage: 0.5,
              categoryPercentage: 0.6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              align: 'center',
              labels: {
                boxWidth: 20,
                boxHeight: 10,
                useBorderRadius: true,
                borderRadius: 2,
                font: { weight: 'bold', size: 12 },
                color: '#64748B',
                padding: 16
              }
            },
            tooltip: {
              padding: 10,
              cornerRadius: 8
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: {
                color: '#64748B',
                font: { weight: 'bold', size: 11 }
              }
            },
            y: {
              beginAtZero: true,
              suggestedMax: maxCompleted,
              ticks: {
                precision: 0,
                color: '#64748B',
                font: { weight: 'bold', size: 11 }
              },
              grid: {
                color: '#F1F5F9'
              }
            }
          }
        }
      });
    }

    // 2. Phân Bố Số Ca Trực (Ca 1 - 4) (Doughnut Chart)
    const canvas2 = document.getElementById('shiftDistributionChart');
    if (canvas2) {
      if (shiftDistributionChartInstance) {
        try { shiftDistributionChartInstance.destroy(); } catch (e) {}
      }

      const shiftList = props.filteredShifts || [];
      const standardShifts = [
        { id: 'Ca 1', name: 'Ca 1', color: '#3B82F6' }, // Blue
        { id: 'Ca 2', name: 'Ca 2', color: '#10B981' }, // Green
        { id: 'Ca 3', name: 'Ca 3', color: '#F59E0B' }, // Orange
        { id: 'Ca 4', name: 'Ca 4', color: '#8B5CF6' }  // Purple
      ];

      const labels = standardShifts.map(s => s.name);
      const data = standardShifts.map(s => {
        return shiftList.filter(shift => {
          const type = String(shift.shiftType || '').trim();
          return type.toLowerCase().includes(s.name.toLowerCase()) || type === s.id;
        }).length;
      });
      const colors = standardShifts.map(s => s.color);

      const totalCount = data.reduce((a, b) => a + b, 0);

      shiftDistributionChartInstance = new Chart(canvas2, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: totalCount > 0 ? data : [1, 0, 0, 0],
            backgroundColor: colors,
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '65%',
          plugins: {
            legend: {
              position: 'right',
              align: 'center',
              labels: {
                boxWidth: 18,
                boxHeight: 12,
                useBorderRadius: true,
                borderRadius: 2,
                font: { weight: 'bold', size: 12 },
                color: '#64748B',
                padding: 12,
                generateLabels: () => {
                  return standardShifts.map((s, i) => ({
                    text: s.name,
                    fillStyle: s.color,
                    strokeStyle: s.color,
                    lineWidth: 0,
                    hidden: false,
                    index: i
                  }));
                }
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || '';
                  const val = totalCount > 0 ? (data[context.dataIndex] || 0) : 0;
                  return ` ${label}: ${val} ca`;
                }
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
  if (topMembersChartInstance) try { topMembersChartInstance.destroy(); } catch (e) {}
  if (shiftDistributionChartInstance) try { shiftDistributionChartInstance.destroy(); } catch (e) {}
});

watch(
  () => [
    props.currentTab,
    props.currentUserRole,
    props.filteredShifts,
    props.members,
    props.selectedMonth
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
