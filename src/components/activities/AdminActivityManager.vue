<template>
  <div class="space-y-6">
    <!-- Admin Hero Header -->
    <div class="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-6 text-white shadow-xl border border-indigo-700/40 relative overflow-hidden">
      <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black mb-2 border border-amber-400/30">
            <i class="fa-solid fa-crown"></i> Quyền Quản Trị Viên
          </div>
          <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight">Quản Lý & Tạo Hoạt Động</h2>
          <p class="text-xs sm:text-sm text-indigo-200 mt-1">Tạo mới hoạt động theo học kỳ & xem thống kê tổng số lượt điểm danh chi tiết.</p>
        </div>
        <div class="flex items-center gap-3 bg-indigo-950/60 backdrop-blur-md px-4 py-3 rounded-2xl border border-indigo-700/50">
          <div class="w-10 h-10 rounded-xl bg-amber-500 text-slate-900 font-black text-lg flex items-center justify-center shadow-md">
            {{ activities.length }}
          </div>
          <div>
            <div class="text-xs font-bold text-indigo-200">Tổng Hoạt Động</div>
            <div class="text-[11px] text-indigo-300">Đã được thiết lập</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Layout 2 Columns: Form Create (Left) & Activity List (Right) -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Create Activity Form -->
      <div class="lg:col-span-1 bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div class="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div class="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
            <i class="fa-solid fa-plus"></i>
          </div>
          <h3 class="font-extrabold text-slate-800 dark:text-white text-base">Tạo Hoạt Động Mới</h3>
        </div>

        <form @submit.prevent="handleCreate" class="space-y-3 text-xs">
          <!-- Activity Name -->
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Tên hoạt động <span class="text-rose-500">*</span>
            </label>
            <input type="text" v-model="form.name" required
                   placeholder="VD: Tập huấn Kỹ năng Quản trò"
                   class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium">
          </div>

          <!-- Date & Semester Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Ngày diễn ra <span class="text-rose-500">*</span>
              </label>
              <input type="date" v-model="form.date" required
                     class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium">
            </div>

            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Học kỳ <span class="text-rose-500">*</span>
              </label>
              <select v-model="form.semester" required
                      class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold">
                <option value="Học kỳ 1 (2026-2027)">Học kỳ 1 (2026-2027)</option>
                <option value="Học kỳ 2 (2026-2027)">Học kỳ 2 (2026-2027)</option>
                <option value="Học kỳ 3 (2026-2027)">Học kỳ 3 (2026-2027)</option>
                <option value="Học kỳ Hè (2026-2027)">Học kỳ Hè (2026-2027)</option>
              </select>
            </div>
          </div>

          <!-- Location -->
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Địa điểm tổ chức
            </label>
            <input type="text" v-model="form.location"
                   placeholder="VD: Hội trường A / Sân trung tâm"
                   class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium">
          </div>

          <!-- Description -->
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Ghi chú / Mô tả chi tiết
            </label>
            <textarea v-model="form.description" rows="2"
                      placeholder="Mô tả nội dung, trang phục hoặc lưu ý..."
                      class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"></textarea>
          </div>

          <!-- Submit Button -->
          <button type="submit"
                  class="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2">
            <i class="fa-solid fa-plus-circle"></i> Đăng Tạo Hoạt Động
          </button>
        </form>
      </div>

      <!-- Activity List & Stats (Right) -->
      <div class="lg:col-span-2 space-y-4">
        <!-- Filter Controls -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-2 flex-grow max-w-xs">
            <i class="fa-solid fa-magnifying-glass text-slate-400"></i>
            <input type="text" v-model="searchQuery" placeholder="Tìm theo tên hoạt động..."
                   class="w-full bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none">
          </div>

          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-500">Học kỳ:</span>
            <select v-model="selectedSemester"
                    class="bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 focus:outline-none">
              <option value="all">Tất cả học kỳ</option>
              <option value="Học kỳ 1 (2026-2027)">Học kỳ 1 (2026-2027)</option>
              <option value="Học kỳ 2 (2026-2027)">Học kỳ 2 (2026-2027)</option>
              <option value="Học kỳ 3 (2026-2027)">Học kỳ 3 (2026-2027)</option>
            </select>
          </div>
        </div>

        <!-- Activities Grid Cards -->
        <div v-if="filteredActivities.length === 0"
             class="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 text-center text-slate-400">
          <i class="fa-solid fa-calendar-xmark text-4xl mb-2 text-slate-300"></i>
          <p class="font-bold text-sm">Chưa có hoạt động nào được tạo.</p>
          <p class="text-xs mt-1">Hãy sử dụng form bên trái để bắt đầu tạo hoạt động cho học kỳ.</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="act in filteredActivities" :key="act.id"
               class="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4">
            <!-- Card Header -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200/50">
                  {{ act.semester }}
                </span>
                <span class="text-[11px] font-bold text-slate-400">
                  <i class="fa-solid fa-calendar-day text-indigo-500"></i> {{ formatDate(act.date) }}
                </span>
              </div>

              <h4 class="font-extrabold text-slate-800 dark:text-white text-base leading-snug">{{ act.name }}</h4>

              <p v-if="act.location" class="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 font-medium">
                <i class="fa-solid fa-location-dot text-rose-500"></i> {{ act.location }}
              </p>

              <p v-if="act.description" class="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 italic">
                "{{ act.description }}"
              </p>
            </div>

            <!-- Attendance Stats Badge (Admin requirement) -->
            <div class="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div class="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl text-center">
                <div class="border-r border-slate-200 dark:border-slate-700 pr-1">
                  <div class="text-base font-black text-emerald-600 dark:text-emerald-400">
                    {{ getActivityStats(act.id).totalCheckIns }}
                  </div>
                  <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Lượt Điểm Danh</div>
                </div>

                <div>
                  <div class="text-base font-black text-amber-600 dark:text-amber-400">
                    {{ getActivityStats(act.id).totalLeaves }}
                  </div>
                  <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Lượt Xin Nghỉ</div>
                </div>
              </div>

              <!-- Admin Action Buttons -->
              <div class="flex items-center justify-between gap-2 text-xs">
                <button @click="$emit('open-detail', act)"
                        class="flex-grow py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 dark:text-indigo-300 font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5">
                  <i class="fa-solid fa-users-viewfinder"></i> Chi tiết điểm danh
                </button>

                <button @click="confirmDelete(act)"
                        class="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 dark:text-rose-400 font-bold rounded-xl transition cursor-pointer"
                        title="Xóa hoạt động này">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  activities: Array,
  getActivityStats: Function,
  formatDate: Function
});

const emit = defineEmits(['create-activity', 'delete-activity', 'open-detail']);

const form = ref({
  name: '',
  date: new Date().toISOString().split('T')[0],
  semester: 'Học kỳ 1 (2026-2027)',
  location: '',
  description: ''
});

const searchQuery = ref('');
const selectedSemester = ref('all');

const handleCreate = () => {
  emit('create-activity', { ...form.value });
  form.value.name = '';
  form.value.location = '';
  form.value.description = '';
};

const confirmDelete = (act) => {
  if (confirm(`Bạn có chắc chắn muốn xóa hoạt động "${act.name}"?`)) {
    emit('delete-activity', act.id);
  }
};

const filteredActivities = computed(() => {
  return props.activities.filter(act => {
    const matchSearch = !searchQuery.value || act.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchSem = selectedSemester.value === 'all' || act.semester === selectedSemester.value;
    return matchSearch && matchSem;
  });
});
</script>
