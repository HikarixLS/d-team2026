<template>
  <div v-if="show" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
    <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800 my-auto">
      <div class="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
        <h3 class="font-extrabold text-slate-800 dark:text-white text-base flex items-center gap-2">
          <i class="fa-solid fa-cloud-bolt text-indigo-600"></i> Cấu Hình Cloud &amp; Google Drive
        </h3>
        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
          <i class="fa-solid fa-xmark text-lg"></i>
        </button>
      </div>

      <!-- Firebase Cloud Config -->
      <div class="text-xs space-y-1.5">
        <label class="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <i class="fa-solid fa-fire text-amber-500"></i> 1. Cấu Hình Firebase Firestore Cloud:
        </label>
        <textarea :value="configInput" @input="$emit('update:configInput', $event.target.value)" rows="4"
                  placeholder='{"apiKey": "AIza...", "projectId": "sctdt-a6bf9"}'
                  class="w-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl p-3 font-mono text-[11px] text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"></textarea>
      </div>

      <!-- Google Drive Apps Script URL -->
      <div class="text-xs space-y-1.5">
        <label class="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <i class="fa-brands fa-google-drive text-sky-500"></i> 2. Google Apps Script Web App URL (Tự động lưu vào Drive):
        </label>
        <input type="url" v-model="driveScriptUrlInput"
               placeholder="https://script.google.com/macros/s/.../exec"
               class="w-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl p-2.5 font-mono text-[11px] text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none" />
        <p class="text-[10px] text-slate-400">Dán link Google Apps Script Web App để ảnh điểm danh tự động tạo folder theo ngày &amp; lưu trực tiếp vào Drive.</p>
      </div>

      <div class="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
        <button @click="$emit('reset-default')" class="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer">
          ⚡ Nạp Cấu Hình Mặc Định
        </button>
        <div class="flex gap-2">
          <button @click="$emit('close')" class="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl cursor-pointer">
            Đóng
          </button>
          <button @click="handleSaveAll" class="px-5 py-2 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md cursor-pointer transition">
            Lưu &amp; Kết Nối
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

defineProps(['show', 'configInput']);
const emit = defineEmits(['close', 'save', 'reset-default', 'update:configInput']);

const driveScriptUrlInput = ref(localStorage.getItem('google_drive_script_url') || '');

onMounted(() => {
  driveScriptUrlInput.value = localStorage.getItem('google_drive_script_url') || '';
});

const handleSaveAll = () => {
  if (driveScriptUrlInput.value) {
    localStorage.setItem('google_drive_script_url', driveScriptUrlInput.value.trim());
  } else {
    localStorage.removeItem('google_drive_script_url');
  }
  emit('save');
};
</script>
