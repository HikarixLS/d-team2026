<template>
  <Transition name="slide-down">
    <div v-if="!isOnline"
         class="fixed top-0 left-0 right-0 z-50 bg-rose-600/95 dark:bg-rose-900/95 text-white px-3 py-2 text-xs font-bold shadow-xl backdrop-blur-md flex items-center justify-between gap-2 border-b border-rose-500/50">
      <div class="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
        <div class="flex items-center gap-2">
          <span class="flex h-2.5 w-2.5 relative">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-300"></span>
          </span>
          <span>⚠️ Bạn đang ngoại tuyến (Offline) • Chế độ xem cục bộ được kích hoạt</span>
        </div>
        <button @click="$emit('retry')"
                class="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-[11px] font-black transition cursor-pointer flex items-center gap-1 shrink-0">
          <i class="fa-solid fa-rotate" :class="{ 'animate-spin': isChecking }"></i> Thử lại
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  isOnline: {
    type: Boolean,
    default: true
  },
  isChecking: {
    type: Boolean,
    default: false
  }
});

defineEmits(['retry']);
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
