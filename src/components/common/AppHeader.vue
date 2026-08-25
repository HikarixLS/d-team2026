<template>
  <header class="bg-indigo-950 text-white shadow-lg sticky top-0 z-30 min-h-[60px] border-b border-indigo-800/50 pt-[env(safe-area-inset-top,0px)]">
    <div class="w-full px-3 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-2">
      <!-- Title & Branding -->
      <div class="flex items-center gap-2 sm:gap-2.5 cursor-pointer shrink-0">
        <img src="/logo.jpg" alt="Logo" class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-contain shadow-md border border-indigo-400/30 shrink-0 bg-white/95 p-0.5">
        <div class="flex flex-col justify-center">
          <h1 class="font-black text-xs sm:text-base tracking-tight leading-tight text-white uppercase">
            HỆ THỐNG QUẢN LÝ ĐIỆN TỬ
          </h1>
          <h2 class="font-bold text-[10px] sm:text-xs tracking-tight leading-tight text-indigo-200 uppercase">
            ĐỘI VĂN PHÒNG ĐOÀN - HỘI TDTU
          </h2>
        </div>
      </div>

      <!-- Action Buttons & Badges -->
      <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <!-- Nút Thông Báo & Nhắc Ca -->
        <button @click="$emit('open-notifications')" 
                class="relative flex items-center justify-center bg-indigo-900/80 hover:bg-indigo-800 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-bold border border-indigo-700/50 transition cursor-pointer text-indigo-200 hover:text-white shadow-xs" 
                title="Trung tâm Thông Báo &amp; Nhắc Ca">
          <i class="fa-solid fa-bell text-amber-300"></i>
        </button>

        <!-- Nút Kiểm Tra Cập Nhật Phiên Bản -->
        <button @click="$emit('check-update')" 
                class="flex items-center gap-1 bg-indigo-900/80 hover:bg-indigo-800 px-2 sm:px-2.5 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold border border-indigo-700/50 transition cursor-pointer text-indigo-200 hover:text-white shadow-xs" 
                title="Kiểm tra Cập nhật Phiên bản">
          <i class="fa-solid fa-arrows-rotate text-emerald-300" :class="{ 'animate-spin': isCheckingUpdate }"></i>
          <span class="font-mono">v{{ currentAppVersion }}</span>
        </button>

        <!-- Chuyển Đổi Dark / Light Mode -->
        <button @click="$emit('toggle-theme')" 
                class="flex items-center justify-center bg-indigo-900/80 hover:bg-indigo-800 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-bold border border-indigo-700/50 transition cursor-pointer" 
                title="Chuyển đổi Giao diện Sáng / Tối">
          <i class="fa-solid" :class="isDarkMode ? 'fa-sun text-amber-300' : 'fa-moon text-sky-200'"></i>
        </button>

        <!-- Trạng thái Cloud (Admin có thể click mở Cấu hình) -->
        <button v-if="currentUserRole === 'admin'" @click="$emit('open-config')" class="flex items-center gap-1.5 bg-indigo-900/90 hover:bg-indigo-800 px-2 sm:px-3 py-1.5 rounded-xl text-xs border border-indigo-700/60 transition cursor-pointer shadow-sm">
          <span class="w-2.5 h-2.5 rounded-full" :class="isCloudConnected ? 'bg-emerald-400 animate-pulse' : (hasFirebaseConfig ? 'bg-amber-400 animate-ping' : 'bg-rose-500')"></span>
          <span class="text-indigo-100 font-semibold text-[10px] sm:text-xs whitespace-nowrap">{{ cloudStatusText }}</span>
        </button>
        <div v-else class="flex items-center gap-1.5 bg-indigo-900/40 px-2 py-1.5 rounded-xl text-xs border border-indigo-800/40 select-none">
          <span class="w-2.5 h-2.5 rounded-full" :class="isCloudConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'"></span>
          <span class="text-indigo-200 font-medium text-[10px] sm:text-xs whitespace-nowrap">{{ cloudStatusText }}</span>
        </div>

        <!-- Role Badge -->
        <div class="px-2 sm:px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-extrabold flex items-center gap-1 shadow-sm border shrink-0 whitespace-nowrap" 
             :class="currentUserRole === 'admin' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-sky-500/20 text-sky-300 border-sky-500/40'">
          <i class="fa-solid" :class="currentUserRole === 'admin' ? 'fa-crown text-amber-400' : 'fa-user text-sky-400'"></i>
          <span>{{ userRoleBadgeText }}</span>
        </div>

        <!-- Đăng Xuất -->
        <button @click="$emit('logout')" class="p-1.5 sm:px-3 sm:py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0" title="Đăng Xuất">
          <i class="fa-solid fa-right-from-bracket"></i>
          <span class="hidden sm:inline">Thoát</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
defineProps({
  isDarkMode: Boolean,
  currentUserRole: String,
  loggedInMemberId: String,
  isCloudConnected: Boolean,
  hasFirebaseConfig: Boolean,
  cloudStatusText: String,
  userRoleBadgeText: String,
  currentAppVersion: {
    type: String,
    default: '1.2.0'
  },
  isCheckingUpdate: Boolean
});

defineEmits(['toggle-theme', 'open-config', 'open-notifications', 'check-update', 'logout']);
</script>
