<template>
  <!-- Desktop Navigation Bar -->
  <nav class="bg-indigo-900 border-b border-indigo-800 text-xs font-bold no-print hidden md:block">
    <div class="w-full px-3 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto">
      <button v-for="tab in tabs" :key="tab.id" @click="$emit('select-tab', tab.id)"
              class="px-4 py-3 flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer"
              :class="currentTab === tab.id ? 'border-amber-400 text-amber-300 bg-indigo-800/60 font-black' : 'border-transparent text-indigo-200 hover:text-white hover:bg-indigo-800/30'">
        <i :class="tab.icon"></i> {{ tab.label }}
        <span v-if="tab.badge" class="px-1.5 py-0.5 text-[10px] bg-rose-500 text-white rounded-full font-black animate-pulse">{{ tab.badge }}</span>
      </button>
    </div>
  </nav>

  <!-- Sticky Bottom Navigation for Mobile (Cố định ở đáy màn hình khi cuộn trang) -->
  <div class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-2xl px-1 pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] no-print">
    <!-- Trường hợp Thành viên (<= 5 tabs): Dàn đều toàn màn hình dạng Grid 5 cột -->
    <div v-if="tabs.length <= 5" class="w-full grid grid-cols-5 gap-0.5">
      <button v-for="tab in tabs" :key="tab.id" @click="$emit('select-tab', tab.id)"
              class="flex flex-col items-center justify-center py-1 px-1 rounded-xl transition cursor-pointer relative active:scale-95"
              :class="currentTab === tab.id ? 'bg-indigo-600 text-white font-black shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'">
        <i :class="[tab.icon, 'text-sm mb-0.5']"></i>
        <span class="text-[9px] tracking-tight font-bold truncate max-w-full text-center">{{ tab.shortLabel }}</span>
        <span v-if="tab.badge" class="absolute -top-1 right-1 px-1 min-w-[15px] h-3.5 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border border-white">{{ tab.badge }}</span>
      </button>
    </div>

    <!-- Trường hợp Quản trị viên (> 5 tabs): Cuộn ngang mượt mà -->
    <div v-else class="flex items-center justify-start gap-1 overflow-x-auto px-1 no-scrollbar min-w-max">
      <button v-for="tab in tabs" :key="tab.id" @click="$emit('select-tab', tab.id)"
              class="flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition cursor-pointer relative shrink-0 active:scale-95"
              :class="currentTab === tab.id ? 'bg-indigo-600 text-white font-extrabold shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'">
        <i :class="[tab.icon, 'text-xs mb-0.5']"></i>
        <span class="text-[10px] whitespace-nowrap font-bold">{{ tab.shortLabel }}</span>
        <span v-if="tab.badge" class="absolute -top-1 -right-0.5 px-1 min-w-[16px] h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border border-white">{{ tab.badge }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps(['currentTab', 'tabs']);
defineEmits(['select-tab']);
</script>
