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
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
              <i class="fa-solid fa-plus"></i>
            </div>
            <h3 class="font-extrabold text-slate-800 dark:text-white text-base">Tạo Hoạt Động Mới</h3>
          </div>
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

          <!-- Date Range (From Date -> To Date) -->
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Từ ngày <span class="text-rose-500">*</span>
              </label>
              <input type="date" v-model="form.date" required
                     class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium">
            </div>

            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Đến ngày <span class="text-slate-400 font-normal">(Nhiều ngày)</span>
              </label>
              <input type="date" v-model="form.endDate" :min="form.date"
                     class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium">
            </div>
          </div>

          <!-- Synced Semester Field -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="font-bold text-slate-700 dark:text-slate-300">
                Học kỳ <span class="text-rose-500">*</span>
              </label>
              <button type="button" @click="showAddSemesterModal = true" class="text-[11px] text-rose-600 dark:text-rose-400 font-extrabold hover:underline cursor-pointer">
                ⚙️ Quản lý / Xóa học kỳ
              </button>
            </div>

            <select v-model="form.semester" @change="onFormSemesterSelectChange" required
                    class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold">
              <option v-for="s in semesters" :key="s" :value="s">🎓 {{ s }}</option>
              <option value="__manage__">⚙️ [Thêm / Xóa học kỳ...]</option>
            </select>
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

          <!-- Training Points Checkbox -->
          <div class="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200/80 dark:border-amber-900/50 flex items-center gap-2">
            <input type="checkbox" id="trainingPointsCheck" v-model="form.submittedTrainingPoints" class="w-4 h-4 text-indigo-600 rounded cursor-pointer">
            <label for="trainingPointsCheck" class="text-xs font-bold text-amber-900 dark:text-amber-200 cursor-pointer">
              Đã gửi điểm rèn luyện (ĐRL)
            </label>
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
        <!-- Unified Central Semester & Search Filter Header -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs">
          <div class="flex items-center gap-2 w-full sm:w-auto flex-grow max-w-sm">
            <i class="fa-solid fa-magnifying-glass text-slate-400"></i>
            <input type="text" v-model="searchQuery" placeholder="Tìm theo tên hoạt động..."
                   class="w-full bg-slate-50 dark:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium">
          </div>

          <div class="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end flex-wrap">
            <span class="font-extrabold text-slate-700 dark:text-slate-300 shrink-0">Học kỳ:</span>
            <select v-model="selectedSemester" @change="syncFormSemester"
                    class="bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-extrabold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
              <option value="all">🌐 Tất cả học kỳ ({{ activities.length }})</option>
              <option v-for="s in semesters" :key="s" :value="s">🎓 {{ s }}</option>
              <option value="__manage__">⚙️ [Quản lý & Xóa học kỳ...]</option>
            </select>

            <button type="button" @click="showAddSemesterModal = true"
                    class="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-extrabold rounded-xl shadow-sm transition cursor-pointer flex items-center gap-1.5 shrink-0">
              <i class="fa-solid fa-gear"></i> Quản Lý & Xóa Học Kỳ
            </button>
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
              <div class="flex items-center justify-between mb-2 flex-wrap gap-1">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200/50">
                  {{ act.semester }}
                </span>
                <span class="text-[11px] font-bold text-slate-400">
                  <i class="fa-solid fa-calendar-day text-indigo-500"></i>
                  {{ formatDate(act.date) }} {{ act.endDate && act.endDate !== act.date ? '➜ ' + formatDate(act.endDate) : '' }}
                </span>
              </div>

              <h4 class="font-extrabold text-slate-800 dark:text-white text-base leading-snug">{{ act.name }}</h4>

              <p v-if="act.location" class="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 font-medium">
                <i class="fa-solid fa-location-dot text-rose-500"></i> {{ act.location }}
              </p>

              <!-- Training Score Checkbox / Status Badge -->
              <div class="mt-2.5 flex items-center justify-between p-2 rounded-xl text-xs font-bold border transition cursor-pointer"
                   :class="act.submittedTrainingPoints ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900' : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'"
                   @click="$emit('toggle-training-points', act.id)">
                <div class="flex items-center gap-1.5">
                  <i class="fa-solid" :class="act.submittedTrainingPoints ? 'fa-circle-check text-emerald-600' : 'fa-circle-notch text-slate-400'"></i>
                  <span>{{ act.submittedTrainingPoints ? '🟢 Đã gửi điểm rèn luyện' : '⚪ Chưa gửi điểm rèn luyện' }}</span>
                </div>
                <span class="text-[10px] underline hover:text-indigo-600">[Đổi]</span>
              </div>

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

    <!-- Modal Quản Lý & Xóa Học Kỳ Thủ Công -->
    <div v-if="showAddSemesterModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 max-w-md w-full shadow-2xl space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 class="font-extrabold text-slate-800 dark:text-white text-base flex items-center gap-2">
            <i class="fa-solid fa-graduation-cap text-indigo-600"></i> Quản Lý & Xóa Học Kỳ Thủ Công
          </h3>
          <button @click="showAddSemesterModal = false" class="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <!-- Add New Semester Form -->
        <form @submit.prevent="handleAddNewSemester" class="space-y-3 text-xs bg-indigo-50/50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-indigo-100 dark:border-slate-700">
          <label class="block font-black text-indigo-900 dark:text-indigo-200">
            ➕ Thêm học kỳ mới
          </label>
          <div class="flex items-center gap-2">
            <input type="text" v-model="newSemesterName" required placeholder="VD: Học kỳ 1 (2027-2028)"
                   class="flex-grow px-3 py-2 rounded-xl border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none">
            <button type="submit" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shadow-xs cursor-pointer shrink-0">
              Thêm
            </button>
          </div>
        </form>

        <!-- Current Semesters List with Delete Buttons -->
        <div class="space-y-2 text-xs">
          <label class="block font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
            📋 Danh sách các học kỳ hiện tại (Bấm Nút Xóa để xóa):
          </label>
          <div class="max-h-56 overflow-y-auto pr-1 divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <div v-for="s in semesters" :key="s" class="p-3 flex items-center justify-between bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <span class="font-bold text-slate-800 dark:text-slate-200 text-xs">🎓 {{ s }}</span>
              <button @click="handleDeleteSemester(s)"
                      class="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl shadow-xs transition cursor-pointer text-[11px] flex items-center gap-1 shrink-0"
                      title="Xóa học kỳ này khỏi hệ thống">
                <i class="fa-solid fa-trash-can"></i> Xóa
              </button>
            </div>
          </div>
        </div>

        <div class="pt-2 text-right">
          <button type="button" @click="showAddSemesterModal = false" class="px-5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-xs cursor-pointer">
            Đóng lại
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  activities: Array,
  semesters: {
    type: Array,
    default: () => ['Học kỳ 1 (2026-2027)', 'Học kỳ 2 (2026-2027)', 'Học kỳ 3 (2026-2027)', 'Học kỳ Hè (2026-2027)']
  },
  getActivityStats: Function,
  formatDate: Function
});

const emit = defineEmits(['create-activity', 'delete-activity', 'open-detail', 'add-semester', 'delete-semester', 'toggle-training-points']);

const getTodayStr = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const form = ref({
  name: '',
  date: getTodayStr(),
  endDate: '',
  semester: 'Học kỳ 1 (2026-2027)',
  location: '',
  submittedTrainingPoints: false,
  description: ''
});

const showAddSemesterModal = ref(false);
const newSemesterName = ref('');

const handleAddNewSemester = () => {
  if (newSemesterName.value.trim()) {
    const semName = newSemesterName.value.trim();
    emit('add-semester', semName);
    form.value.semester = semName;
    selectedSemester.value = semName;
    newSemesterName.value = '';
  }
};

const handleDeleteSemester = (semName) => {
  if (confirm(`Bạn có chắc chắn muốn xóa học kỳ "${semName}" khỏi hệ thống?`)) {
    emit('delete-semester', semName);
    if (form.value.semester === semName && props.semesters.length > 1) {
      const remaining = props.semesters.filter(s => s !== semName);
      form.value.semester = remaining[0] || '';
    }
    if (selectedSemester.value === semName) {
      selectedSemester.value = 'all';
    }
  }
};

const searchQuery = ref('');
const selectedSemester = ref('all');

const syncFormSemester = () => {
  if (selectedSemester.value === '__manage__') {
    selectedSemester.value = 'all';
    showAddSemesterModal.value = true;
    return;
  }
  if (selectedSemester.value !== 'all') {
    form.value.semester = selectedSemester.value;
  }
};

const onFormSemesterSelectChange = () => {
  if (form.value.semester === '__manage__') {
    form.value.semester = props.semesters[0] || '';
    showAddSemesterModal.value = true;
  }
};

const handleCreate = () => {
  emit('create-activity', { ...form.value });
  form.value.name = '';
  form.value.endDate = '';
  form.value.location = '';
  form.value.submittedTrainingPoints = false;
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
