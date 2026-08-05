<template>
  <header class="bg-indigo-950 text-white shadow-lg sticky top-0 z-30 min-h-[64px] border-b border-indigo-800/50">
    <div class="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2.5">
      <!-- Title & Branding -->
      <div class="flex items-center gap-3 cursor-pointer">
        <div class="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md border border-indigo-400/30 shrink-0">
          <i class="fa-solid fa-book-bookmark text-xl text-amber-300"></i>
        </div>
        <div>
          <h1 class="font-black text-sm sm:text-base tracking-tight leading-none text-white">SỔ CA TRỰC ĐIỆN TỬ</h1>
          <p class="text-[10px] text-indigo-300 mt-1 font-medium hidden sm:block">Đồng Bộ Realtime • Chuẩn Hóa Phân Ban</p>
        </div>
      </div>

      <!-- Action Buttons & Badges -->
      <div class="flex items-center gap-1.5 sm:gap-2">
        <button @click="$emit('toggle-theme')" 
                class="flex items-center gap-1 sm:gap-1.5 bg-indigo-900/80 hover:bg-indigo-800 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold border border-indigo-700/50 transition cursor-pointer" 
                title="Chuyển đổi Giao diện Sáng / Tối">
          <i class="fa-solid" :class="isDarkMode ? 'fa-sun text-amber-300' : 'fa-moon text-sky-200'"></i>
        </button>

        <button v-if="currentUserRole === 'admin'" @click="$emit('open-config')" class="flex items-center gap-1.5 sm:gap-2 bg-indigo-900/90 hover:bg-indigo-800 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs border border-indigo-700/60 transition cursor-pointer shadow-sm">
          <span class="w-2.5 h-2.5 rounded-full" :class="isCloudConnected ? 'bg-emerald-400 animate-pulse' : (hasFirebaseConfig ? 'bg-amber-400 animate-ping' : 'bg-rose-500')"></span>
          <span class="text-indigo-100 font-semibold text-[11px] sm:text-xs">{{ cloudStatusText }}</span>
        </button>
        <div v-else class="flex items-center gap-1.5 bg-indigo-900/40 px-2.5 py-1.5 rounded-xl text-xs border border-indigo-800/40 select-none">
          <span class="w-2.5 h-2.5 rounded-full" :class="isCloudConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'"></span>
          <span class="text-indigo-200 font-medium text-[11px] sm:text-xs">{{ cloudStatusText }}</span>
        </div>

        <div class="px-2.5 sm:px-3.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-extrabold flex items-center gap-1 sm:gap-1.5 shadow-sm border shrink-0" 
             :class="currentUserRole === 'admin' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-sky-500/20 text-sky-300 border-sky-500/40'">
          <i class="fa-solid" :class="currentUserRole === 'admin' ? 'fa-crown text-amber-400' : 'fa-user text-sky-400'"></i>
          <span>{{ userRoleBadgeText }}</span>
        </div>

        <button @click="$emit('logout')" class="p-1.5 sm:px-3 sm:py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer" title="Đăng Xuất">
          <i class="fa-solid fa-right-from-bracket"></i>
          <span class="hidden sm:inline">Thoát</span>
        </button>

        <button @click="$emit('toggle-mobile-menu')" class="md:hidden p-2 text-indigo-200 hover:text-white transition">
          <i class="fa-solid text-lg" :class="showMobileMenu ? 'fa-xmark' : 'fa-bars'"></i>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
defineProps([
  'isDarkMode',
  'currentUserRole',
  'loggedInMemberId',
  'isCloudConnected',
  'hasFirebaseConfig',
  'cloudStatusText',
  'userRoleBadgeText',
  'showMobileMenu'
]);
defineEmits(['toggle-theme', 'open-config', 'logout', 'toggle-mobile-menu']);
</script>
