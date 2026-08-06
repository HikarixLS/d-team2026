<template>
  <div class="space-y-4 sm:space-y-6">
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-5 space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
        <div>
          <h3 class="text-base font-bold text-slate-800 flex items-center gap-2">
            <i class="fa-solid fa-history text-indigo-600"></i> Tra Cứu & Lịch Sử Nhật Ký Ca Trực
          </h3>
          <p class="text-xs text-slate-500 mt-0.5">{{ historySubtitle }}</p>
        </div>
        <div class="flex items-center gap-2">
          <button @click="$emit('export-excel')" class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer">
            <i class="fa-solid fa-file-excel"></i> Xuất Excel
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <input type="text" v-model="historyFilter.keyword" placeholder="Tìm tên, MSSV, trang số, STT..."
                 class="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50">
        </div>
        <div>
          <select v-model="historyFilter.memberId" class="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50 font-medium">
            <option value="">-- Tất cả thành viên --</option>
            <option v-for="m in members" :key="m.id" :value="m.id">[{{ m.id }}] {{ m.name }}</option>
          </select>
        </div>
        <div>
          <select v-model="historyFilter.shiftType" class="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50 font-medium">
            <option value="">-- Tất cả ca (1-4) --</option>
            <option value="Ca 1">Ca 1 (7h30 - 9h20)</option>
            <option value="Ca 2">Ca 2 (9h20 - 11h30)</option>
            <option value="Ca 3">Ca 3 (13h00 - 15h20)</option>
            <option value="Ca 4">Ca 4 (15h20 - 17h00)</option>
          </select>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 font-extrabold border-b border-slate-700 uppercase tracking-wider whitespace-nowrap">
              <th class="p-3 whitespace-nowrap">Thành Viên</th>
              <th class="p-3 whitespace-nowrap">Ban Hoạt Động</th>
              <th class="p-3 whitespace-nowrap">Ngày Trực</th>
              <th class="p-3 whitespace-nowrap">Ca Trực</th>
              <th class="p-3 whitespace-nowrap">Sổ Gốc</th>
              <th class="p-3 whitespace-nowrap">Trạng Thái</th>
              <th class="p-3 whitespace-nowrap">Ghi Chú</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
            <tr v-for="s in searchedShifts" :key="s.id" class="hover:bg-slate-100 dark:hover:bg-slate-800/50 transition">
              <td class="p-3 font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
                {{ getMemberName(s.memberId) }} <span class="text-slate-600 dark:text-slate-400 font-bold">[{{ s.memberId }}]</span>
              </td>
              <td class="p-3 font-bold text-slate-800 dark:text-slate-300 whitespace-nowrap">{{ getMemberDept(s.memberId) }}</td>
              <td class="p-3 font-bold text-slate-900 dark:text-slate-200 whitespace-nowrap">🗓️ {{ formatDate(s.date) }}</td>
              <td class="p-3 whitespace-nowrap"><span class="px-2.5 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-extrabold rounded-lg border border-indigo-300 dark:border-indigo-800 whitespace-nowrap">{{ s.shiftType }}</span></td>
              <td class="p-3 font-mono text-indigo-700 dark:text-indigo-400 font-black whitespace-nowrap">Trang {{ s.pageNo }} - STT {{ s.sttNo }}</td>
              <td class="p-3 whitespace-nowrap"><span class="px-2.5 py-1 rounded-lg font-black text-[11px] whitespace-nowrap inline-block" :class="s.status === 'Đúng giờ' ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300' : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'">{{ s.status }}</span></td>
              <td class="p-3 text-slate-700 dark:text-slate-400 italic font-medium min-w-[120px]">{{ s.notes || '—' }}</td>
            </tr>
            <tr v-if="searchedShifts.length === 0">
              <td colspan="7" class="p-8 text-center text-slate-500 font-bold text-xs">Không tìm thấy ca trực nào phù hợp.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps([
  'historySubtitle',
  'historyFilter',
  'members',
  'searchedShifts',
  'getMemberName',
  'getMemberDept',
  'formatDate'
]);
defineEmits(['export-excel']);
</script>
