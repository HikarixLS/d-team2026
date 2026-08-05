<template>
  <nav class="bg-indigo-900 border-b border-indigo-800 text-xs font-bold no-print hidden md:block">
    <div class="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto">
      <button v-for="tab in tabs" :key="tab.id" @click="$emit('select-tab', tab.id)"
              class="px-4 py-3 flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer"
              :class="currentTab === tab.id ? 'border-amber-400 text-amber-300 bg-indigo-800/60 font-black' : 'border-transparent text-indigo-200 hover:text-white hover:bg-indigo-800/30'">
        <i :class="tab.icon"></i> {{ tab.label }}
        <span v-if="tab.badge" class="px-1.5 py-0.5 text-[10px] bg-rose-500 text-white rounded-full font-black animate-pulse">{{ tab.badge }}</span>
      </button>
    </div>
  </nav>

  <!-- Sticky Bottom Navigation for Mobile -->
  <div class="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-2xl px-2 py-1.5 no-print">
    <div class="grid grid-cols-6 gap-1 text-center">
      <button v-for="tab in tabs" :key="tab.id" @click="$emit('select-tab', tab.id)"
              class="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition cursor-pointer relative"
              :class="currentTab === tab.id ? 'bg-indigo-600 text-white font-extrabold shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'">
        <i :class="[tab.icon, 'text-sm mb-0.5']"></i>
        <span class="text-[10px] truncate max-w-full">{{ tab.shortLabel }}</span>
        <span v-if="tab.badge" class="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border border-white">{{ tab.badge }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps(['currentTab', 'tabs']);
defineEmits(['select-tab']);
</script>
