<template>
  <Transition name="modal-fade">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-5 sm:p-6 border border-slate-100 dark:border-slate-800 transition-all transform scale-100 space-y-4">
        <!-- Header -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <i class="fa-solid fa-file-pen text-lg"></i>
            </div>
            <div>
              <h3 class="font-extrabold text-slate-800 dark:text-white text-base">Xin Nghỉ Hoạt Động</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-[220px]">{{ activity?.name }}</p>
            </div>
          </div>
          <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 p-2 rounded-xl cursor-pointer">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <!-- Body Form -->
        <div class="space-y-4">
          <!-- Chọn Ca Xin Nghỉ -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Chọn Ca Xin Nghỉ <span class="text-rose-500">*</span>
              </label>
              <button v-if="registeredShifts && registeredShifts.length > 1"
                      type="button" @click="toggleSelectAll"
                      class="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">
                {{ isAllSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả ca' }}
              </button>
            </div>

            <!-- Trường hợp 1: Có ca đã đăng ký cụ thể -->
            <div v-if="registeredShifts && registeredShifts.length > 0" class="space-y-2 max-h-48 overflow-y-auto pr-1">
              <label v-for="r in registeredShifts" :key="r.id"
                     class="flex items-center justify-between p-2.5 rounded-2xl border transition cursor-pointer"
                     :class="selectedShiftIds.includes(r.id)
                       ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-200 shadow-2xs'
                       : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'">
                <div class="flex items-center gap-2.5">
                  <input type="checkbox" :value="r.id" v-model="selectedShiftIds"
                         class="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer">
                  <div>
                    <div class="text-xs font-bold flex items-center gap-1.5">
                      <span>🗓️ {{ formatDate ? formatDate(r.date) : r.date }}</span>
                      <span class="text-indigo-600 dark:text-indigo-400 font-extrabold">• {{ r.shiftType }}</span>
                    </div>
                    <div v-if="r.notes" class="text-[10px] text-slate-400 italic">
                      {{ r.notes }}
                    </div>
                  </div>
                </div>
                <span v-if="selectedShiftIds.includes(r.id)" class="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 dark:bg-amber-900 dark:text-amber-200">
                  Nghỉ ca này
                </span>
              </label>

              <p v-if="selectedShiftIds.length === 0" class="text-[11px] text-rose-500 font-semibold mt-1 flex items-center gap-1">
                <i class="fa-solid fa-triangle-exclamation"></i> Vui lòng chọn ít nhất 1 ca để xin nghỉ phép!
              </p>
            </div>

            <!-- Trường hợp 2: Chưa đăng ký ca cụ thể -> Xin nghỉ cả hoạt động -->
            <div v-else class="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
              <div class="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <i class="fa-solid fa-calendar-check text-sky-500"></i> Xin nghỉ toàn bộ hoạt động:
              </div>
              <div class="text-slate-500 dark:text-slate-400 mt-0.5">
                {{ activity?.name }} (Ngày {{ formatDate ? formatDate(activity?.date) : activity?.date }})
              </div>
            </div>
          </div>

          <!-- Lý do xin nghỉ -->
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Lý do xin nghỉ <span class="text-rose-500">*</span>
            </label>
            <textarea v-model="reason"
                      rows="3"
                      placeholder="Nhập lý do cụ thể (vd: Trùng lịch thi, việc gia đình đột xuất...)"
                      class="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none dark:text-white font-medium"></textarea>
          </div>
        </div>

        <!-- Footer Buttons -->
        <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button @click="$emit('close')"
                  class="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer">
            Hủy bỏ
          </button>
          <button @click="handleConfirm"
                  :disabled="!isFormValid"
                  class="px-5 py-2.5 rounded-xl font-bold text-xs text-white transition shadow-md flex items-center gap-1.5"
                  :class="isFormValid ? 'bg-amber-500 hover:bg-amber-600 cursor-pointer shadow-amber-500/20' : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'">
            <i class="fa-solid fa-paper-plane"></i> Gửi Đơn Xin Nghỉ
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  show: Boolean,
  activity: Object,
  registeredShifts: {
    type: Array,
    default: () => []
  },
  formatDate: Function
});

const emit = defineEmits(['close', 'confirm']);

const reason = ref('');
const selectedShiftIds = ref([]);

watch(() => props.show, (newVal) => {
  if (newVal) {
    reason.value = '';
    if (props.registeredShifts && props.registeredShifts.length > 0) {
      selectedShiftIds.value = props.registeredShifts.map(r => r.id);
    } else {
      selectedShiftIds.value = [];
    }
  }
});

const isAllSelected = computed(() => {
  if (!props.registeredShifts || props.registeredShifts.length === 0) return false;
  return selectedShiftIds.value.length === props.registeredShifts.length;
});

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedShiftIds.value = [];
  } else {
    selectedShiftIds.value = (props.registeredShifts || []).map(r => r.id);
  }
};

const isFormValid = computed(() => {
  if (!reason.value.trim()) return false;
  if (props.registeredShifts && props.registeredShifts.length > 0 && selectedShiftIds.value.length === 0) {
    return false;
  }
  return true;
});

const handleConfirm = () => {
  if (!isFormValid.value) return;
  const selectedShifts = (props.registeredShifts || []).filter(r => selectedShiftIds.value.includes(r.id));
  emit('confirm', {
    reason: reason.value.trim(),
    selectedShiftIds: selectedShiftIds.value,
    selectedShifts: selectedShifts
  });
  emit('close');
};
</script>
