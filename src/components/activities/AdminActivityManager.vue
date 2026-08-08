<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  activities: Array,
  semesters: {
    type: Array,
    default: () => []
  },
  adminActivitySummaryStats: Object,
  computeActivityDerivedFields: Function,
  getActivityStats: Function,
  formatDate: Function
});

const emit = defineEmits([
  'create-activity',
  'delete-activity',
  'open-detail',
  'add-semester',
  'delete-semester',
  'toggle-training-points',
  'update-submit-date',
  'export-excel'
]);

const getTodayStr = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const addDays = (dateStr, days) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  d.setDate(d.getDate() + days);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const form = ref({
  name: '',
  location: '',
  date: getTodayStr(),
  endDate: getTodayStr(),
  submitDate: '',
  semester: '',
  description: ''
});

const computedDeadline = computed(() => {
  return addDays(form.value.endDate || form.value.date, 3);
});

const summaryStats = computed(() => {
  if (props.adminActivitySummaryStats) return props.adminActivitySummaryStats;
  return {
    totalExecuted: props.activities ? props.activities.length : 0,
    submittedOnTimeCount: 0,
    overdueCount: 0
  };
});

const getDerived = (act) => {
  if (props.computeActivityDerivedFields) {
    return props.computeActivityDerivedFields(act);
  }
  return {
    codeId: act.codeId || 1,
    startDate: act.date || getTodayStr(),
    endDate: act.endDate || act.date || getTodayStr(),
    deadlineDate: act.deadlineDate || getTodayStr(),
    location: act.location || 'Trường ĐH',
    contentVN: `Tham gia ${act.name}`,
    contentEN: `Participating in ${act.name}`,
    submitDate: act.submitDate || '',
    progressStatus: 'Chưa gửi',
    conclusionStatus: 'Chưa có',
    excelFileName: `${act.name}.xlsx`
  };
};

const handleUpdateSubmitDate = (actId, newDate) => {
  emit('update-submit-date', actId, newDate);
};

const showAddSemesterModal = ref(false);
const newSemesterName = ref('');

const handleAddSemester = () => {
  if (!newSemesterName.value || !newSemesterName.value.trim()) return;
  emit('add-semester', newSemesterName.value.trim());
  newSemesterName.value = '';
};

const handleDeleteSemester = (semName) => {
  if (confirm(`Bạn có chắc muốn xóa học kỳ "${semName}"?`)) {
    emit('delete-semester', semName);
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
  form.value.location = '';
  form.value.submitDate = '';
  form.value.description = '';
};

const confirmDelete = (act) => {
  if (confirm(`Bạn có chắc chắn muốn xóa hoạt động "${act.name}"?`)) {
    emit('delete-activity', act.id);
  }
};

const showExportModal = ref(false);
const selectedExportAct = ref(null);

const openExportModal = (act) => {
  selectedExportAct.value = act;
  showExportModal.value = true;
};

const triggerExport = (exportType) => {
  if (selectedExportAct.value) {
    emit('export-excel', selectedExportAct.value, exportType);
  }
  showExportModal.value = false;
};

const googleDriveFolderUrl = 'https://drive.google.com/drive/folders/1zbUHwDzxXVfYK_kTIdQvVZXYJ2sVMBsd';

const filteredActivities = computed(() => {
  return props.activities.filter(act => {
    const matchSearch = !searchQuery.value ||
      act.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      String(act.codeId || act.code).includes(searchQuery.value);
    const matchSem = selectedSemester.value === 'all' || act.semester === selectedSemester.value;
    return matchSearch && matchSem;
  });
});
</script>

<template>
  <div class="space-y-6">
    <!-- Admin Hero Header with 3 Summary Stats Cards -->
    <div class="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl border border-indigo-700/40 relative overflow-hidden">
      <div class="relative z-10 space-y-4">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black mb-1.5 border border-amber-400/30">
              <i class="fa-solid fa-crown"></i> Quyền Quản Trị Viên
            </div>
            <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight">Quản Lý &amp; Theo Dõi Hoạt Động</h2>
            <p class="text-xs sm:text-sm text-indigo-200 mt-0.5">Quản lý hạn gửi hồ sơ (3 ngày), tự động tính tiến độ, kết luận và xuất Excel chuẩn MSSV.</p>
          </div>

          <a :href="googleDriveFolderUrl" target="_blank" rel="noopener noreferrer"
             class="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-extrabold rounded-2xl shadow-md transition flex items-center gap-2 text-xs border border-sky-400/40 cursor-pointer shrink-0">
            <i class="fa-brands fa-google-drive text-base text-amber-300"></i> Mở Thư Mục Google Drive
          </a>
        </div>

        <!-- 3 Stats Columns Cards (Hoạt động thực hiện, Đã đi điểm <= 3 ngày, Trễ hạn > 3 ngày) -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <!-- Col 1: Hoạt động thực hiện -->
          <div class="bg-indigo-950/70 backdrop-blur-md p-3.5 rounded-2xl border border-indigo-700/50 flex items-center justify-between shadow-sm">
            <div>
              <div class="text-[11px] font-extrabold uppercase tracking-wider text-indigo-200">Hoạt Động Thực Hiện</div>
              <div class="text-2xl font-black text-white mt-0.5">{{ summaryStats.totalExecuted }}</div>
              <div class="text-[10px] text-indigo-300">Tổng số hoạt động</div>
            </div>
            <div class="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 font-black text-lg flex items-center justify-center border border-indigo-500/30">
              <i class="fa-solid fa-calendar-check"></i>
            </div>
          </div>

          <!-- Col 2: Hoạt động đã đi điểm (trong vòng 3 ngày) -->
          <div class="bg-emerald-950/60 backdrop-blur-md p-3.5 rounded-2xl border border-emerald-700/50 flex items-center justify-between shadow-sm">
            <div>
              <div class="text-[11px] font-extrabold uppercase tracking-wider text-emerald-200">Đã Đi Điểm (Trong 3 ngày)</div>
              <div class="text-2xl font-black text-emerald-300 mt-0.5">{{ summaryStats.submittedOnTimeCount }}</div>
              <div class="text-[10px] text-emerald-200/80">Hoàn thành đúng hạn</div>
            </div>
            <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 font-black text-lg flex items-center justify-center border border-emerald-500/30">
              <i class="fa-solid fa-circle-check"></i>
            </div>
          </div>

          <!-- Col 3: Hoạt động trễ hạn (> 3 ngày) -->
          <div class="bg-rose-950/60 backdrop-blur-md p-3.5 rounded-2xl border border-rose-700/50 flex items-center justify-between shadow-sm">
            <div>
              <div class="text-[11px] font-extrabold uppercase tracking-wider text-rose-200">Hoạt Động Trễ Hạn (> 3 ngày)</div>
              <div class="text-2xl font-black text-rose-300 mt-0.5">{{ summaryStats.overdueCount }}</div>
              <div class="text-[10px] text-rose-200/80">Quá hạn gửi hồ sơ</div>
            </div>
            <div class="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-300 font-black text-lg flex items-center justify-center border border-rose-500/30">
              <i class="fa-solid fa-triangle-exclamation"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Layout 2 Columns: Form Create (Left) & Activity List (Right) -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Create Activity Form -->
      <div class="lg:col-span-1 bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 h-fit">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
              <i class="fa-solid fa-plus"></i>
            </div>
            <h3 class="font-extrabold text-slate-800 dark:text-white text-base">Tạo Hoạt Động Mới</h3>
          </div>
        </div>

        <form @submit.prevent="handleCreate" class="space-y-3 text-xs">
          <!-- 1. Activity Name -->
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Tên hoạt động <span class="text-rose-500">*</span>
            </label>
            <input type="text" v-model="form.name" required
                   placeholder="VD: Tập huấn Kỹ năng Quản trò &amp; Sinh hoạt"
                   class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold" />
          </div>

          <!-- 2. Location -->
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Địa điểm tổ chức <span class="text-rose-500">*</span>
            </label>
            <input type="text" v-model="form.location" required
                   placeholder="VD: Hội trường A / Sân trung tâm"
                   class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium" />
          </div>

          <!-- 3. Start Date (Thời gian bắt đầu hoạt động) -->
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Thời gian bắt đầu hoạt động <span class="text-rose-500">*</span>
            </label>
            <input type="date" v-model="form.date" required
                   class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold" />
          </div>

          <!-- 4. End Date (Thời gian kết thúc hoạt động) -->
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Thời gian kết thúc hoạt động <span class="text-rose-500">*</span>
            </label>
            <input type="date" v-model="form.endDate" :min="form.date" required
                   class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-extrabold text-indigo-700 dark:text-indigo-400" />
            <p v-if="form.endDate" class="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
              💡 Hạn gửi hồ sơ (+3 ngày): {{ formatDate(computedDeadline) }}
            </p>
          </div>

          <!-- 5. Submit Date (Ngày gửi - optional) -->
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Ngày gửi (Có thể để trống)
            </label>
            <input type="date" v-model="form.submitDate"
                   class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium" />
          </div>

          <!-- 6. Synced Semester Field -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="font-bold text-slate-700 dark:text-slate-300">
                Học kỳ <span class="text-rose-500">*</span>
              </label>
              <button type="button" @click="showAddSemesterModal = true" class="text-[11px] text-rose-600 dark:text-rose-400 font-extrabold hover:underline cursor-pointer">
                ⚙️ Quản lý học kỳ
              </button>
            </div>

            <select v-model="form.semester" @change="onFormSemesterSelectChange" required
                    class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold">
              <option v-for="s in semesters" :key="s" :value="s">🎓 {{ s }}</option>
              <option value="__manage__">⚙️ [Thêm / Xóa học kỳ...]</option>
            </select>
          </div>

          <!-- 7. Description -->
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
                  class="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2 text-sm">
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
            <input type="text" v-model="searchQuery" placeholder="Tìm theo tên hoạt động hoặc mã..."
                   class="w-full bg-slate-50 dark:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium" />
          </div>

          <div class="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end flex-wrap">
            <span class="font-extrabold text-slate-700 dark:text-slate-300 shrink-0">Học kỳ:</span>
            <select v-model="selectedSemester" @change="syncFormSemester"
                    class="bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-extrabold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
              <option value="all">🌐 Tất cả học kỳ ({{ activities.length }})</option>
              <option v-for="s in semesters" :key="s" :value="s">🎓 {{ s }}</option>
              <option value="__manage__">⚙️ [Quản lý &amp; Xóa học kỳ...]</option>
            </select>

            <button type="button" @click="showAddSemesterModal = true"
                    class="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-extrabold rounded-xl shadow-sm transition cursor-pointer flex items-center gap-1.5 shrink-0">
              <i class="fa-solid fa-gear"></i> Quản Lý Học Kỳ
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

        <div v-else class="space-y-4">
          <div v-for="act in filteredActivities" :key="act.id"
               class="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition space-y-3">
            
            <!-- Computed Derived Object -->
            <div class="flex items-start justify-between gap-2 flex-wrap">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="px-2.5 py-1 rounded-xl text-xs font-black bg-indigo-900 text-amber-300 border border-indigo-700">
                  Mã #{{ getDerived(act).codeId }}
                </span>
                <span class="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {{ act.semester }}
                </span>
              </div>

              <!-- Badges for Progress & Conclusion -->
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="px-2.5 py-1 rounded-xl text-[11px] font-black border"
                      :class="getDerived(act).progressStatus === 'Đã xử lý' ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300' : (getDerived(act).progressStatus === 'Đã quá hạn' ? 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950 dark:text-rose-300' : 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300')">
                  Tiến độ: {{ getDerived(act).progressStatus }}
                </span>

                <span class="px-2.5 py-1 rounded-xl text-[11px] font-black border"
                      :class="getDerived(act).conclusionStatus === 'Gửi sớm hạn' ? 'bg-emerald-500 text-white border-emerald-600' : (getDerived(act).conclusionStatus === 'Gửi đúng hạn' ? 'bg-sky-600 text-white border-sky-700' : (getDerived(act).conclusionStatus === 'Gửi trễ hạn' ? 'bg-rose-600 text-white border-rose-700' : 'bg-slate-200 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300'))">
                  Kết luận: {{ getDerived(act).conclusionStatus }}
                </span>
              </div>
            </div>

            <!-- Title & Location -->
            <div>
              <h4 class="font-black text-slate-900 dark:text-white text-base leading-snug">{{ act.name }}</h4>
              <p class="text-xs text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-1 font-semibold">
                <i class="fa-solid fa-location-dot text-rose-500"></i> Địa điểm: {{ getDerived(act).location }}
              </p>
            </div>

            <!-- Auto Generated Content VN & EN Preview Box -->
            <div class="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800 text-xs space-y-1">
              <div class="text-slate-700 dark:text-slate-300 font-medium">
                <span class="font-black text-indigo-600 dark:text-indigo-400">Nội dung (VN):</span> "{{ getDerived(act).contentVN }}"
              </div>
              <div class="text-slate-500 dark:text-slate-400 italic">
                <span class="font-black text-indigo-400">Content (EN):</span> "{{ getDerived(act).contentEN }}"
              </div>
            </div>

            <!-- Timeline & Submit Date Info -->
            <div class="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-indigo-50/50 dark:bg-indigo-950/30 p-2.5 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 text-xs">
              <div>
                <span class="block text-[10px] font-bold uppercase text-slate-500">Ngày bắt đầu:</span>
                <span class="font-extrabold text-slate-800 dark:text-slate-200">🚩 {{ formatDate(getDerived(act).startDate) }}</span>
              </div>

              <div>
                <span class="block text-[10px] font-bold uppercase text-slate-500">Thời gian kết thúc:</span>
                <span class="font-extrabold text-indigo-900 dark:text-indigo-200">🗓️ {{ formatDate(getDerived(act).endDate) }}</span>
              </div>

              <div>
                <span class="block text-[10px] font-bold uppercase text-slate-500">Hạn gửi HS (+3 ngày):</span>
                <span class="font-extrabold text-amber-700 dark:text-amber-300">⏳ {{ formatDate(getDerived(act).deadlineDate) }}</span>
              </div>

              <div>
                <span class="block text-[10px] font-bold uppercase text-slate-500">Ngày gửi thực tế:</span>
                <input type="date" :value="act.submitDate" @change="handleUpdateSubmitDate(act.id, $event.target.value)"
                       class="w-full bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 font-bold text-slate-800 dark:text-white focus:outline-none text-xs" />
              </div>
            </div>

            <!-- Action Buttons: Export Excel, Details, Delete -->
            <div class="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex-wrap">
              <button @click="openExportModal(act)"
                      class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold rounded-xl text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer">
                <i class="fa-solid fa-file-excel"></i> Xuất Excel (DSSV)
              </button>

              <div class="flex items-center gap-2">
                <button @click="$emit('open-detail', act)"
                        class="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:hover:bg-indigo-900/60 dark:text-indigo-300 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1">
                  <i class="fa-solid fa-users-viewfinder"></i> Điểm danh ({{ getActivityStats(act.id).totalCheckIns }})
                </button>

                <button @click="confirmDelete(act)"
                        class="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400 font-bold rounded-xl text-xs transition cursor-pointer"
                        title="Xóa hoạt động">
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
            <i class="fa-solid fa-graduation-cap text-indigo-600"></i> Quản Lý &amp; Xóa Học Kỳ Thủ Công
          </h3>
          <button @click="showAddSemesterModal = false" class="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <!-- Add New Semester Form -->
        <form @submit.prevent="handleAddSemester" class="space-y-3 text-xs bg-indigo-50/50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-indigo-100 dark:border-slate-700">
          <label class="block font-black text-indigo-900 dark:text-indigo-200">
            ➕ Thêm học kỳ mới
          </label>
          <div class="flex items-center gap-2">
            <input type="text" v-model="newSemesterName" required placeholder="VD: Học kỳ 1 (2027-2028)"
                   class="flex-grow px-3 py-2 rounded-xl border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
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

    <!-- Modal Chọn Loại File Excel Muốn Xuất -->
    <div v-if="showExportModal" class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div class="flex items-center gap-2">
            <div class="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-base font-bold shadow-md">
              <i class="fa-solid fa-file-excel"></i>
            </div>
            <div>
              <h3 class="font-extrabold text-slate-900 dark:text-white text-base">Tùy Chọn Xuất File Excel</h3>
              <p class="text-xs text-slate-500 truncate max-w-xs">{{ selectedExportAct ? selectedExportAct.name : '' }}</p>
            </div>
          </div>
          <button @click="showExportModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg cursor-pointer">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="space-y-3">
          <!-- Option 1: Danh sách điểm danh (Dùng nộp ĐRL) -->
          <button @click="triggerExport('checkin')"
                  class="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition text-left space-y-1 group cursor-pointer">
            <div class="flex items-center justify-between">
              <span class="font-extrabold text-slate-800 dark:text-white text-sm group-hover:text-emerald-700 dark:group-hover:text-emerald-400 flex items-center gap-2">
                <i class="fa-solid fa-clipboard-user text-emerald-600"></i> 1. Danh Sách Điểm Danh (Nộp Điểm Rèn Luyện)
              </span>
              <i class="fa-solid fa-chevron-right text-slate-400 text-xs group-hover:translate-x-1 transition"></i>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Xuất danh sách các sinh viên đã điểm danh (Bảng dọc 8 cột: STT, MSSV, Họ tên, Nội dung, Content, Thời gian điểm danh, Minh chứng thẻ SV, Trạng thái).
            </p>
          </button>

          <!-- Option 2: Danh sách đăng ký ca (Dạng ma trận Ngày/Ca) -->
          <button @click="triggerExport('registration')"
                  class="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-sky-500 bg-slate-50 dark:bg-slate-800/60 hover:bg-sky-50/50 dark:hover:bg-sky-950/30 transition text-left space-y-1 group cursor-pointer">
            <div class="flex items-center justify-between">
              <span class="font-extrabold text-slate-800 dark:text-white text-sm group-hover:text-sky-700 dark:group-hover:text-sky-400 flex items-center gap-2">
                <i class="fa-solid fa-table-cells text-sky-600"></i> 2. Danh Sách Đăng Ký Ca (Mẫu Ma Trận Ngày/Ca)
              </span>
              <i class="fa-solid fa-chevron-right text-slate-400 text-xs group-hover:translate-x-1 transition"></i>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Xuất danh sách phân chia ca trực đăng ký ngang theo từng Ngày &amp; Ca (Ca 1, Ca 2, Ca 3) giống mẫu thiết kế.
            </p>
          </button>
        </div>

        <div class="flex justify-end pt-2">
          <button @click="showExportModal = false" type="button" class="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-300 transition cursor-pointer">
            Đóng
          </button>
        </div>
       </div>
    </div>
  </div>
</template>
