<template>
  <div class="space-y-4 sm:space-y-6">
    <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 sm:p-5 space-y-4">
      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <h3 class="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <i class="fa-solid fa-table-cells text-emerald-600"></i> Bảng Phân Ca & Ma Trận Lịch Trực
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {{ viewMode === 'matrix' ? 'Ma trận lịch trực chuẩn mẫu Hỗ trợ nhập học.xlsx' : 'Tra cứu & nhật ký chi tiết từng ca trực (Sổ gốc)' }}
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <!-- View Toggle -->
          <div class="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
            <button @click="viewMode = 'matrix'"
                    class="px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    :class="viewMode === 'matrix' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'">
              <i class="fa-solid fa-table-cells"></i> Dạng Ma Trận
            </button>
            <button @click="viewMode = 'list'"
                    class="px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    :class="viewMode === 'list' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'">
              <i class="fa-solid fa-list-check"></i> Dạng Danh Sách
            </button>
          </div>

          <!-- Export Buttons -->
          <button @click="$emit('export-matrix-excel', activeDataList)"
                  class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  title="Xuất file Excel đúng mẫu ma trận Hỗ trợ nhập học">
            <i class="fa-solid fa-file-excel"></i> Xuất Mẫu Ca Làm
          </button>
          <button @click="$emit('export-excel')"
                  class="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  title="Xuất báo cáo chi tiết từng dòng ca trực">
            <i class="fa-solid fa-file-export"></i> Xuất Báo Cáo
          </button>
        </div>
      </div>

      <!-- Filters & Data Source Controls -->
      <div class="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs font-bold text-slate-700 dark:text-slate-300">Nguồn dữ liệu:</span>
          <div class="inline-flex rounded-lg bg-white dark:bg-slate-900 p-0.5 border border-slate-300 dark:border-slate-700">
            <button @click="dataSource = 'registrations'"
                    class="px-2.5 py-1 text-xs font-bold rounded-md transition cursor-pointer"
                    :class="dataSource === 'registrations' ? 'bg-sky-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100'">
              🗓️ Lịch Đăng Ký ({{ registrations ? registrations.length : 0 }})
            </button>
            <button @click="dataSource = 'shifts'"
                    class="px-2.5 py-1 text-xs font-bold rounded-md transition cursor-pointer"
                    :class="dataSource === 'shifts' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100'">
              📝 Nhật Ký Điểm Danh ({{ searchedShifts ? searchedShifts.length : 0 }})
            </button>
          </div>
        </div>

        <div v-if="viewMode === 'list'" class="flex-1 min-w-[240px] grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input type="text" v-model="historyFilter.keyword" placeholder="Tìm tên, MSSV, trang số, STT..."
                 class="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs bg-white dark:bg-slate-900 dark:text-white">
          <select v-model="historyFilter.shiftType" class="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs bg-white dark:bg-slate-900 dark:text-white">
            <option value="">-- Tất cả ca --</option>
            <option v-for="st in effectiveShiftTypes" :key="st" :value="st">{{ st }}</option>
          </select>
        </div>

        <div class="text-xs font-bold text-slate-500 dark:text-slate-400">
          Tổng số ngày trực: <span class="text-emerald-600 dark:text-emerald-400 font-extrabold">{{ matrixDates.length }} ngày</span>
        </div>
      </div>

      <!-- VIEW 1: MATRIX SPREADSHEET VIEW (MATCHING USER TEMPLATE IMAGE) -->
      <div v-if="viewMode === 'matrix'" class="space-y-2">
        <div class="overflow-x-auto max-h-[680px] border border-slate-400 rounded-xl shadow-xs">
          <table class="w-full text-left border-collapse text-xs select-text">
            <thead>
              <!-- Header Row 1: BUỔI, STT, Dates merged -->
              <tr class="sticky top-0 z-30">
                <th rowspan="2" class="bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-black text-center py-2 px-3 border border-slate-400 uppercase tracking-wider sticky left-0 z-40 min-w-[75px] shadow-xs">
                  BUỔI
                </th>
                <th rowspan="2" class="bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-black text-center py-2 px-2 border border-slate-400 uppercase tracking-wider sticky left-[75px] z-40 min-w-[50px] shadow-xs">
                  STT
                </th>
                <th v-for="d in matrixDates" :key="'date_' + d" colspan="2"
                    class="bg-[#1e7e34] text-white font-black text-center py-2 px-3 border border-slate-400 text-sm whitespace-nowrap min-w-[260px] tracking-wide">
                  {{ formatDayMonth(d) }}
                </th>
              </tr>

              <!-- Header Row 2: MSSV, HỌ VÀ TÊN -->
              <tr class="sticky top-[37px] z-30">
                <template v-for="d in matrixDates" :key="'sub_' + d">
                  <th class="bg-[#ffecb3] text-amber-950 font-black text-center py-1.5 px-2 border border-slate-400 text-[11px] whitespace-nowrap min-w-[100px]">
                    MSSV
                  </th>
                  <th class="bg-[#ffecb3] text-amber-950 font-black text-center py-1.5 px-3 border border-slate-400 text-[11px] whitespace-nowrap min-w-[160px]">
                    HỌ VÀ TÊN
                  </th>
                </template>
              </tr>
            </thead>
            <tbody>
              <!-- Shift Blocks -->
              <template v-for="st in effectiveShiftTypes" :key="st">
                <tr v-for="idx in getBlockRowCount(st)" :key="st + '_' + idx"
                    class="hover:bg-amber-50/40 dark:hover:bg-slate-800/40 transition">
                  <!-- BUỔI cell (rendered only on first row of shift block with rowspan) -->
                  <td v-if="idx === 1" :rowspan="getBlockRowCount(st)"
                      class="bg-[#fff9db] dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 font-black text-center text-sm border border-slate-400 p-2 sticky left-0 z-20 align-middle whitespace-nowrap shadow-xs">
                    {{ st.toUpperCase() }}
                  </td>

                  <!-- STT column -->
                  <td class="bg-slate-100 dark:bg-slate-900 text-center font-black text-slate-700 dark:text-slate-300 border border-slate-400 p-1.5 sticky left-[75px] z-20 text-xs shadow-xs">
                    {{ idx }}
                  </td>

                  <!-- Data Cells for each Date: MSSV & HỌ VÀ TÊN -->
                  <template v-for="d in matrixDates" :key="st + '_' + idx + '_' + d">
                    <td class="border border-slate-400 px-2 py-1 font-mono font-bold text-center whitespace-nowrap text-xs"
                        :class="getStudentAt(st, d, idx - 1) ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300' : 'bg-white/40 dark:bg-slate-900/20 text-slate-300'">
                      {{ getStudentAt(st, d, idx - 1)?.mssv || '' }}
                    </td>
                    <td class="border border-slate-400 px-3 py-1 font-extrabold whitespace-nowrap text-xs"
                        :class="getStudentAt(st, d, idx - 1) ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white' : 'bg-white/40 dark:bg-slate-900/20 text-slate-300'">
                      {{ getStudentAt(st, d, idx - 1)?.name || '' }}
                    </td>
                  </template>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>

      <!-- VIEW 2: STANDARD LIST VIEW -->
      <div v-else class="space-y-3">
        <div class="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <th class="p-3">STT</th>
                <th class="p-3">MSSV</th>
                <th class="p-3">Họ và Tên</th>
                <th class="p-3">Ban</th>
                <th class="p-3">Ngày Trực</th>
                <th class="p-3">Ca Trực</th>
                <th v-if="dataSource === 'shifts'" class="p-3">Sổ Gốc</th>
                <th v-if="dataSource === 'shifts'" class="p-3">Trạng Thái</th>
                <th class="p-3">Ghi Chú</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr v-for="(item, idx) in filteredList" :key="item.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition">
                <td class="p-3 text-slate-400 font-mono">{{ idx + 1 }}</td>
                <td class="p-3 font-mono font-bold text-slate-700 dark:text-slate-300">{{ item.memberId }}</td>
                <td class="p-3 font-bold text-slate-900 dark:text-white">{{ getMemberName(item.memberId) }}</td>
                <td class="p-3 text-slate-500 dark:text-slate-400">{{ getMemberDept(item.memberId) }}</td>
                <td class="p-3 font-semibold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">{{ formatDate(item.date) }}</td>
                <td class="p-3">
                  <span class="px-2 py-0.5 rounded-md font-bold text-[10px] bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                    {{ item.shiftType }}
                  </span>
                </td>
                <td v-if="dataSource === 'shifts'" class="p-3 text-slate-600 dark:text-slate-300 font-medium">
                  Trang {{ item.pageNo }} - STT {{ item.sttNo }}
                </td>
                <td v-if="dataSource === 'shifts'" class="p-3">
                  <span class="px-2 py-0.5 rounded-md font-bold text-[10px]"
                        :class="item.status === 'Đúng giờ' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200' : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200'">
                    {{ item.status }}
                  </span>
                </td>
                <td class="p-3 text-slate-500 dark:text-slate-400 italic text-[11px]">
                  {{ item.notes || '—' }}
                </td>
              </tr>
              <tr v-if="filteredList.length === 0">
                <td colspan="9" class="p-8 text-center text-slate-400 text-xs">
                  Không tìm thấy dữ liệu ca trực phù hợp.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps([
  'historySubtitle',
  'historyFilter',
  'members',
  'searchedShifts',
  'registrations',
  'filteredRegistrations',
  'shifts',
  'shiftTypes',
  'selectedMonth',
  'selectedWeek',
  'getMemberName',
  'getMemberDept',
  'formatDate'
]);

defineEmits(['export-excel', 'export-matrix-excel']);

const viewMode = ref('matrix'); // 'matrix' (default) or 'list'
const dataSource = ref('registrations'); // 'registrations' or 'shifts'

const isDateInSelectedWeek = (dateStr) => {
  if (!dateStr) return false;
  if (!props.selectedWeek || props.selectedWeek === 'all') return true;
  const parts = dateStr.split('-');
  if (parts.length < 3) return true;
  const day = parseInt(parts[2], 10);
  if (props.selectedWeek === '1') return day >= 1 && day <= 8;
  if (props.selectedWeek === '2') return day >= 9 && day <= 18;
  if (props.selectedWeek === '3') return day >= 19 && day <= 25;
  if (props.selectedWeek === '4') return day >= 26;
  return true;
};

const activeDataList = computed(() => {
  let list = [];
  if (dataSource.value === 'registrations') {
    list = props.filteredRegistrations && props.filteredRegistrations.length > 0 ? props.filteredRegistrations : (props.registrations || []);
  } else {
    list = props.searchedShifts && props.searchedShifts.length > 0 ? props.searchedShifts : (props.shifts || []);
  }
  return list.filter(r => isDateInSelectedWeek(r.date));
});

const effectiveShiftTypes = computed(() => {
  const defaultList = (props.shiftTypes && props.shiftTypes.length > 0)
    ? props.shiftTypes.map(st => typeof st === 'string' ? st : (st.name || st.id))
    : ['Ca 1', 'Ca 2', 'Ca 3', 'Ca 4'];
  const set = new Set(defaultList);
  const list = activeDataList.value;
  list.forEach(r => {
    if (r.shiftType) set.add(r.shiftType);
  });
  return Array.from(set);
});

const formatDayMonth = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  return `${parseInt(parts[2], 10)}/${parseInt(parts[1], 10)}`;
};

// Unique sorted dates filtered by selected week
const matrixDates = computed(() => {
  const list = activeDataList.value;
  const set = new Set();
  list.forEach(r => {
    if (r.date && isDateInSelectedWeek(r.date)) {
      set.add(r.date);
    }
  });
  return Array.from(set).sort();
});

// Map of shift -> date -> array of students
const matrixMap = computed(() => {
  const map = {};
  effectiveShiftTypes.value.forEach(st => {
    map[st] = {};
    matrixDates.value.forEach(d => {
      map[st][d] = [];
    });
  });

  const list = activeDataList.value;
  list.forEach(r => {
    const st = r.shiftType || (effectiveShiftTypes.value[0] || 'Ca 1');
    const d = r.date;
    if (map[st] && map[st][d]) {
      const mId = String(r.memberId || '').trim();
      const mObj = props.members ? props.members.find(m => String(m.id).toUpperCase() === mId.toUpperCase()) : null;
      const name = r.memberName || mObj?.name || props.getMemberName(mId);
      map[st][d].push({
        mssv: mId,
        name: name
      });
    }
  });

  return map;
});

const getStudentAt = (st, d, index) => {
  const list = matrixMap.value[st]?.[d];
  if (!list || !list[index]) return null;
  return list[index];
};

const getBlockRowCount = (st) => {
  let maxCount = 0;
  matrixDates.value.forEach(d => {
    const len = matrixMap.value[st]?.[d]?.length || 0;
    if (len > maxCount) maxCount = len;
  });
  return Math.max(1, maxCount); // Dynamically adapt to actual number of attendees per shift
};

const filteredList = computed(() => {
  let list = activeDataList.value;
  const kw = (props.historyFilter?.keyword || '').trim().toLowerCase();
  const st = (props.historyFilter?.shiftType || '').trim();

  if (st) {
    list = list.filter(item => item.shiftType === st);
  }
  if (kw) {
    list = list.filter(item => {
      const mName = props.getMemberName(item.memberId).toLowerCase();
      const mId = String(item.memberId).toLowerCase();
      const page = String(item.pageNo || '');
      const num = String(item.sttNo || '');
      return mName.includes(kw) || mId.includes(kw) || page.includes(kw) || num.includes(kw);
    });
  }
  return list;
});
</script>
