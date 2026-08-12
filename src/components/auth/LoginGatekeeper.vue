<template>
  <div class="min-h-screen bg-gradient-to-br from-[#0c1222] via-[#161f38] to-[#0c1222] flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Ambient background glow elements -->
    <div class="absolute -top-32 -left-32 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-32 -right-32 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

    <div class="bg-slate-900/75 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-8 max-w-md w-full text-white shadow-2xl space-y-6 relative z-10">
      <div class="text-center space-y-2.5">
        <img src="/logo.jpg" alt="Logo" class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl mx-auto object-cover shadow-xl border border-indigo-400/30">
        
        <div class="space-y-0.5 pt-1">
          <h1 class="text-lg sm:text-xl font-black tracking-tight text-white uppercase leading-snug">
            HỆ THỐNG QUẢN LÝ ĐIỆN TỬ
          </h1>
          <h2 class="text-base sm:text-lg font-black tracking-tight text-white uppercase leading-snug">
            ĐỘI VĂN PHÒNG ĐOÀN - HỘI TDTU
          </h2>
        </div>

        <p class="text-xs sm:text-sm text-indigo-200/90 font-medium">Quản lý Ca trực, Hoạt động & Đồng bộ Cloud</p>
        
        <div class="pt-0.5">
          <div class="inline-flex flex-wrap items-center justify-center gap-1.5 px-4 py-1.5 bg-amber-500/10 border border-amber-400/40 rounded-full text-xs font-semibold text-amber-300 shadow-sm">
            <i class="fa-solid fa-shield-halved text-amber-400"></i>
            <span>Đăng nhập theo danh sách trên Cloud</span>
          </div>
        </div>

        <div class="flex items-center justify-center gap-2 pt-1 text-xs font-semibold">
          <span class="w-2.5 h-2.5 rounded-full" :class="isCloudConnected ? 'bg-emerald-400 animate-pulse' : (hasFirebaseConfig ? 'bg-amber-400 animate-ping' : 'bg-rose-500')"></span>
          <span class="flex items-center gap-1.5" :class="isCloudConnected ? 'text-emerald-400' : 'text-amber-300'">
            <i v-if="isCloudConnected" class="fa-solid fa-globe text-emerald-400"></i>
            <span>{{ isCloudConnected ? 'Đã kết nối Cloud Firestore' : (hasFirebaseConfig ? 'Đang kết nối Cloud...' : 'Chưa kết nối Cloud') }}</span>
          </span>
          <button v-if="!isCloudConnected" @click="$emit('retry-cloud')" type="button" class="text-[11px] text-sky-300 hover:text-white underline font-bold ml-1 cursor-pointer">
            [Thử lại]
          </button>
        </div>
      </div>

      <div class="grid grid-cols-2 p-1 bg-slate-950/70 rounded-2xl border border-indigo-500/30 text-xs font-bold">
        <button @click="$emit('update:loginRole', 'member')" class="py-2.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                :class="loginRole === 'member' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'">
          <i class="fa-solid fa-user"></i> Thành Viên
        </button>
        <button @click="$emit('update:loginRole', 'admin')" class="py-2.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                :class="loginRole === 'admin' ? 'bg-amber-500 text-slate-900 shadow-md' : 'text-slate-400 hover:text-white'">
          <i class="fa-solid fa-crown"></i> Quản Trị Viên
        </button>
      </div>

      <form @submit.prevent="$emit('login')" class="space-y-4">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-indigo-200 mb-1.5">Mã Số Sinh Viên (MSSV - Tối đa 8 ký tự) <span class="text-rose-400">*</span></label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-indigo-300"><i class="fa-solid fa-id-card"></i></span>
            <input type="text" v-model="loginForm.memberId" required maxlength="8" placeholder="Nhập MSSV (Tối đa 8 ký tự, VD: C2300023)"
                   class="w-full bg-slate-950/60 border border-indigo-500/40 rounded-xl py-3 pl-10 pr-4 text-sm font-bold uppercase tracking-wider text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400">
          </div>
        </div>

        <div v-if="loginRole === 'admin'">
          <label class="block text-xs font-bold uppercase tracking-wider text-amber-200 mb-1.5">Mật Khẩu Quản Trị <span class="text-rose-400">*</span></label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-amber-400"><i class="fa-solid fa-lock"></i></span>
            <input type="password" v-model="loginForm.password" required placeholder="Nhập mật khẩu..."
                   class="w-full bg-slate-950/60 border border-amber-500/40 rounded-xl py-3 pl-10 pr-4 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400">
          </div>
        </div>

        <button type="submit" class="w-full py-3.5 rounded-xl font-extrabold text-sm shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                :class="loginRole === 'admin' ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/30' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'">
          <i class="fa-solid" :class="loginRole === 'admin' ? 'fa-right-to-bracket' : 'fa-arrow-right-to-bracket'"></i>
          <span>Xác Nhận Đăng Nhập {{ loginRole === 'admin' ? 'Quản Trị' : 'Thành Viên' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
defineProps(['loginRole', 'loginForm', 'isCloudConnected', 'hasFirebaseConfig']);
defineEmits(['update:loginRole', 'login', 'retry-cloud']);
</script>
