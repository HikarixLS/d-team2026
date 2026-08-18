<template>
  <Transition name="modal-fade">
    <div v-if="show" class="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-indigo-100 dark:border-slate-800 my-auto text-slate-800 dark:text-slate-100 relative overflow-hidden">
        <!-- Top Gradient Glow Banner -->
        <div class="absolute -top-12 -right-12 w-36 h-36 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"></div>
        <div class="absolute -bottom-12 -left-12 w-36 h-36 bg-amber-500/20 rounded-full blur-2xl pointer-events-none"></div>

        <!-- Header with Icon & Version Info -->
        <div class="flex items-start gap-3.5 relative">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white text-xl shadow-lg shrink-0">
            <i class="fa-solid fa-cloud-arrow-down animate-bounce"></i>
          </div>
          <div class="flex-grow">
            <div class="flex items-center gap-2">
              <h3 class="font-black text-base tracking-tight text-slate-900 dark:text-white">
                Bản Cập Nhật Mới Có Sẵn!
              </h3>
              <span v-if="updateInfo.forceUpdate" class="px-2 py-0.5 text-[9px] font-black bg-rose-500 text-white rounded-full uppercase tracking-wider animate-pulse">
                Bắt buộc
              </span>
            </div>
            <div class="flex items-center gap-1.5 mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span class="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md font-mono text-[11px]">v{{ currentVersion }}</span>
              <i class="fa-solid fa-arrow-right text-[10px] text-indigo-500"></i>
              <span class="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold rounded-md font-mono text-[11px]">v{{ updateInfo.latestVersion }}</span>
              <span v-if="updateInfo.releaseDate" class="text-[10px] text-slate-400">({{ updateInfo.releaseDate }})</span>
            </div>
          </div>
          <button v-if="!updateInfo.forceUpdate" @click="$emit('close')" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <!-- Release Notes Section -->
        <div class="space-y-2 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 text-xs">
          <div class="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <i class="fa-solid fa-sparkles text-amber-500"></i> Có gì mới trong bản cập nhật này:
          </div>
          <div class="text-slate-600 dark:text-slate-300 space-y-1 text-[11px] leading-relaxed max-h-44 overflow-y-auto pr-1">
            <p v-for="(line, idx) in formattedNotes" :key="idx" class="flex items-start gap-1.5">
              <span class="text-indigo-500 font-black">•</span>
              <span>{{ line }}</span>
            </p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2 pt-1">
          <button v-if="!updateInfo.forceUpdate" @click="$emit('close')"
                  class="w-1/3 py-2.5 px-3 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer text-center">
            Để sau
          </button>
          <button @click="$emit('update')"
                  class="flex-grow py-2.5 px-4 text-xs font-black text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl shadow-lg shadow-indigo-500/25 transition cursor-pointer flex items-center justify-center gap-2">
            <i class="fa-solid fa-download"></i> Cập Nhật Ngay
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  currentVersion: {
    type: String,
    default: '1.2.0'
  },
  updateInfo: {
    type: Object,
    default: () => ({
      latestVersion: '1.2.0',
      releaseNotes: '',
      downloadUrl: '',
      forceUpdate: false,
      releaseDate: ''
    })
  }
});

defineEmits(['close', 'update']);

const formattedNotes = computed(() => {
  const notes = props.updateInfo?.releaseNotes || '';
  if (!notes) return ['Cải thiện hiệu năng và trải nghiệm người dùng.'];
  return notes
    .split('\n')
    .map(line => line.trim().replace(/^[-*•]\s*/, ''))
    .filter(line => line.length > 0);
});
</script>
