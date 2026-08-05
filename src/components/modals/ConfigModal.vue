<template>
  <div v-if="show" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
      <div class="flex justify-between items-center border-b border-slate-100 pb-3">
        <h3 class="font-bold text-slate-800 text-base flex items-center gap-2">
          <i class="fa-solid fa-fire text-amber-500"></i> Cấu Hình Firebase Cloud
        </h3>
        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600"><i class="fa-solid fa-xmark text-lg"></i></button>
      </div>
      <div class="text-xs text-slate-600 space-y-2">
        <p>Nhập mã cấu hình Firebase từ Console để kết nối Cloud đồng bộ cho tất cả mọi thiết bị.</p>
        <textarea :value="configInput" @input="$emit('update:configInput', $event.target.value)" rows="5"
                  placeholder='{"apiKey": "AIza...", "projectId": "my-project"}'
                  class="w-full border border-slate-300 rounded-xl p-3 font-mono text-[11px] focus:ring-2 focus:ring-indigo-500 focus:outline-none"></textarea>
      </div>
      <div class="flex justify-between items-center pt-2">
        <button @click="$emit('reset-default')" class="text-xs text-indigo-600 font-bold hover:underline">Nạp Cấu Hình Mặc Định</button>
        <div class="flex gap-2">
          <button @click="$emit('close')" class="px-4 py-2 text-xs text-slate-600 bg-slate-100 rounded-xl">Đóng</button>
          <button @click="$emit('save')" class="px-5 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl shadow">Lưu & Kết Nối</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps(['show', 'configInput']);
defineEmits(['close', 'save', 'reset-default', 'update:configInput']);
</script>
