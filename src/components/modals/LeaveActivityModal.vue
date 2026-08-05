<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
    <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-100 dark:border-slate-800 transition-all transform scale-100">
      <!-- Header -->
      <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <i class="fa-solid fa-file-pen text-lg"></i>
          </div>
          <div>
            <h3 class="font-extrabold text-slate-800 dark:text-white text-base">Xin Nghỉ Hoạt Động</h3>
            <p class="text-xs text-slate-500 font-medium truncate max-w-[220px]">{{ activity?.name }}</p>
          </div>
        </div>
        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 p-2 rounded-xl">
          <i class="fa-solid fa-xmark text-lg"></i>
        </button>
      </div>

      <!-- Body Form -->
      <div class="py-4 space-y-4">
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
      <div class="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button @click="$emit('close')"
                class="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer">
          Hủy bỏ
        </button>
        <button @click="handleConfirm"
                class="px-5 py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-white transition shadow-md cursor-pointer flex items-center gap-1.5">
          <i class="fa-solid fa-paper-plane"></i> Gửi Đơn Xin Nghỉ
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  show: Boolean,
  activity: Object
});

const emit = defineEmits(['close', 'confirm']);

const reason = ref('');

watch(() => props.show, (newVal) => {
  if (newVal) {
    reason.value = '';
  }
});

const handleConfirm = () => {
  if (!reason.value.trim()) return;
  emit('confirm', reason.value);
  emit('close');
};
</script>
