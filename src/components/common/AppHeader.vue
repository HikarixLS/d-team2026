<template>
  <header class="bg-indigo-950 text-white shadow-lg sticky top-0 z-30 border-b border-indigo-800/50 pt-[env(safe-area-inset-top,0px)]">
    <div class="w-full px-3 sm:px-6 lg:px-8 py-2">
      <!-- Desktop & Tablet Layout (sm and up) -->
      <div class="hidden sm:flex items-center justify-between gap-3">
        <!-- Title & Branding -->
        <div class="flex items-center gap-2.5 cursor-pointer shrink-0">
          <img src="/logo.jpg" alt="Logo" class="w-10 h-10 rounded-xl object-contain shadow-md border border-indigo-400/30 shrink-0 bg-white/95 p-0.5">
          <div class="flex flex-col justify-center">
            <h1 class="font-black text-sm sm:text-base tracking-tight leading-tight text-white uppercase">
              HỆ THỐNG QUẢN LÝ ĐIỆN TỬ
            </h1>
            <h2 class="font-bold text-xs tracking-tight leading-tight text-indigo-200 uppercase">
              ĐỘI VĂN PHÒNG ĐOÀN - HỘI TDTU
            </h2>
          </div>
        </div>

        <!-- Desktop Action Buttons -->
        <div class="flex items-center gap-2 shrink-0">
          <!-- Bell -->
          <button @click="$emit('open-notifications')" 
                  class="relative flex items-center justify-center bg-indigo-900/80 hover:bg-indigo-800 px-2.5 py-1.5 rounded-xl text-xs font-bold border border-indigo-700/50 transition cursor-pointer text-indigo-200 hover:text-white shadow-xs" 
                  title="Trung tâm Thông Báo &amp; Nhắc Ca">
            <i class="fa-solid fa-bell text-amber-300"></i>
            <span v-if="unreadNotificationCount > 0"
                  class="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center border-2 border-indigo-950 animate-pulse shadow-sm">
              {{ unreadNotificationCount > 9 ? '9+' : unreadNotificationCount }}
            </span>
          </button>

          <!-- Theme -->
          <button @click="$emit('toggle-theme')" 
                  class="flex items-center justify-center bg-indigo-900/80 hover:bg-indigo-800 px-2.5 py-1.5 rounded-xl text-xs font-bold border border-indigo-700/50 transition cursor-pointer" 
                  title="Chuyển đổi Giao diện Sáng / Tối">
            <i class="fa-solid" :class="isDarkMode ? 'fa-sun text-amber-300' : 'fa-moon text-sky-200'"></i>
          </button>

          <!-- Cloud status -->
          <button v-if="currentUserRole === 'admin'" @click="$emit('open-config')" class="flex items-center gap-1.5 bg-indigo-900/90 hover:bg-indigo-800 px-3 py-1.5 rounded-xl text-xs border border-indigo-700/60 transition cursor-pointer shadow-sm">
            <span class="w-2.5 h-2.5 rounded-full" :class="isCloudConnected ? 'bg-emerald-400 animate-pulse' : (hasFirebaseConfig ? 'bg-amber-400 animate-ping' : 'bg-rose-500')"></span>
            <span class="text-indigo-100 font-semibold text-xs whitespace-nowrap">{{ cloudStatusText }}</span>
          </button>
          <div v-else class="flex items-center gap-1.5 bg-indigo-900/40 px-2.5 py-1.5 rounded-xl text-xs border border-indigo-800/40 select-none">
            <span class="w-2.5 h-2.5 rounded-full" :class="isCloudConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'"></span>
            <span class="text-indigo-200 font-medium text-xs whitespace-nowrap">{{ cloudStatusText }}</span>
          </div>

          <!-- Role Badge -->
          <div class="px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 shadow-sm border shrink-0 whitespace-nowrap" 
               :class="currentUserRole === 'admin' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-sky-500/20 text-sky-300 border-sky-500/40'">
            <i class="fa-solid" :class="currentUserRole === 'admin' ? 'fa-crown text-amber-400' : 'fa-user text-sky-400'"></i>
            <span>{{ userRoleBadgeText }}</span>
          </div>

          <!-- Logout -->
          <button @click="$emit('logout')" class="px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0" title="Đăng Xuất">
            <i class="fa-solid fa-right-from-bracket"></i>
            <span>Thoát</span>
          </button>
        </div>
      </div>

      <!-- Mobile Layout (sm:hidden) - Tối ưu chống tràn cho màn hình điện thoại -->
      <div class="sm:hidden space-y-1.5">
        <!-- Mobile Top Row: Logo + Brand & Essential Actions -->
        <div class="flex items-center justify-between gap-1.5">
          <div class="flex items-center gap-2 min-w-0">
            <img src="/logo.jpg" alt="Logo" class="w-8 h-8 rounded-lg object-contain shadow-sm border border-indigo-400/30 shrink-0 bg-white/95 p-0.5">
            <div class="flex flex-col min-w-0">
              <h1 class="font-black text-xs tracking-tight leading-tight text-white uppercase truncate">
                HỆ THỐNG QUẢN LÝ ĐVP
              </h1>
              <h2 class="font-bold text-[9px] tracking-tight leading-tight text-indigo-300 uppercase truncate">
                ĐỘI VP ĐOÀN - HỘI TDTU
              </h2>
            </div>
          </div>

          <!-- Top Right Action Icons -->
          <div class="flex items-center gap-1 shrink-0">
            <!-- Bell -->
            <button @click="$emit('open-notifications')" 
                    class="relative w-8 h-8 flex items-center justify-center bg-indigo-900/80 active:bg-indigo-800 rounded-lg text-xs font-bold border border-indigo-700/50 text-indigo-200 shadow-xs" 
                    title="Thông Báo">
              <i class="fa-solid fa-bell text-amber-300"></i>
              <span v-if="unreadNotificationCount > 0"
                    class="absolute -top-1 -right-1 min-w-3.5 h-3.5 px-0.5 bg-rose-500 text-white rounded-full text-[8px] font-black flex items-center justify-center border border-indigo-950 animate-pulse">
                {{ unreadNotificationCount > 9 ? '9+' : unreadNotificationCount }}
              </span>
            </button>

            <!-- Theme Toggle -->
            <button @click="$emit('toggle-theme')" 
                    class="w-8 h-8 flex items-center justify-center bg-indigo-900/80 active:bg-indigo-800 rounded-lg text-xs font-bold border border-indigo-700/50 text-indigo-200" 
                    title="Giao diện">
              <i class="fa-solid" :class="isDarkMode ? 'fa-sun text-amber-300' : 'fa-moon text-sky-200'"></i>
            </button>

            <!-- Logout -->
            <button @click="$emit('logout')" 
                    class="w-8 h-8 flex items-center justify-center bg-rose-600/80 active:bg-rose-600 text-white rounded-lg text-xs font-bold shadow-xs shrink-0" 
                    title="Đăng Xuất">
              <i class="fa-solid fa-right-from-bracket"></i>
            </button>
          </div>
        </div>

        <!-- Mobile Second Row: User Info & Cloud Status (Fits perfectly without overflow) -->
        <div class="flex items-center justify-between gap-1.5 pt-1 border-t border-indigo-900/60 text-[10px]">
          <!-- User info (Truncated gracefully with MSSV/Name) -->
          <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-lg border min-w-0 max-w-[65%]"
               :class="currentUserRole === 'admin' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-sky-500/20 text-sky-300 border-sky-500/30'">
            <i class="fa-solid shrink-0 text-[10px]" :class="currentUserRole === 'admin' ? 'fa-crown text-amber-400' : 'fa-user text-sky-400'"></i>
            <span class="font-bold truncate">{{ userRoleBadgeText }}</span>
          </div>

          <!-- Cloud status button / badge -->
          <button v-if="currentUserRole === 'admin'" @click="$emit('open-config')" 
                  class="flex items-center gap-1 bg-indigo-900/90 active:bg-indigo-800 px-2 py-0.5 rounded-lg border border-indigo-700/60 shrink-0 text-[10px] text-indigo-100 font-semibold shadow-xs">
            <span class="w-2 h-2 rounded-full shrink-0" :class="isCloudConnected ? 'bg-emerald-400 animate-pulse' : (hasFirebaseConfig ? 'bg-amber-400 animate-ping' : 'bg-rose-500')"></span>
            <span>{{ cloudStatusText }}</span>
          </button>
          <div v-else class="flex items-center gap-1 bg-indigo-900/40 px-2 py-0.5 rounded-lg border border-indigo-800/40 shrink-0 text-[10px] text-indigo-200 font-medium">
            <span class="w-2 h-2 rounded-full shrink-0" :class="isCloudConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'"></span>
            <span>{{ cloudStatusText }}</span>
          </div>
        </div>
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
  unreadNotificationCount: {
    type: Number,
    default: 0
  }
});

defineEmits(['toggle-theme', 'open-config', 'open-notifications', 'logout']);
</script>
