<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 flex items-center justify-center p-4">
    <div class="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 max-w-md w-full text-white shadow-2xl space-y-6">
      <div class="text-center space-y-2">
        <img src="/logo.jpg" alt="Logo" class="w-16 h-16 rounded-2xl mx-auto object-cover shadow-lg border border-indigo-400/40">
        <h1 class="text-base sm:text-lg font-black tracking-tight text-white uppercase leading-snug">
          HỆ THỐNG QUẢN LÝ ĐIỆN TỬ<br>
          ĐỘI VĂN PHÒNG ĐOÀN - HỘI TDTU
        </h1>
        <p class="text-xs text-indigo-200">Quản lý Ca trực, Hoạt động & Đồng bộ Cloud</p>
        <div class="mt-2 inline-flex flex-wrap items-center justify-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-400/40 rounded-full text-[11px] font-semibold text-amber-300">
          <i class="fa-solid fa-shield-halved"></i>
          <span>Đăng nhập theo danh sách trên Cloud</span>
        </div>

        <div class="flex items-center justify-center gap-2 pt-1 text-xs font-semibold">
          <span class="w-2.5 h-2.5 rounded-full" :class="isCloudConnected ? 'bg-emerald-400 animate-pulse' : (hasFirebaseConfig ? 'bg-amber-400 animate-ping' : 'bg-rose-500')"></span>
          <span :class="isCloudConnected ? 'text-emerald-300' : 'text-amber-300'">
            {{ isCloudConnected ? '🟢 Đã kết nối Cloud Firestore' : (hasFirebaseConfig ? '🟡 Đang kết nối Cloud...' : '🔴 Chưa kết nối Cloud') }}
          </span>
          <button v-if="!isCloudConnected" @click="$emit('retry-cloud')" type="button" class="text-[11px] text-sky-300 hover:text-white underline font-bold ml-1 cursor-pointer">
            [Thử lại]
          </button>
        </div>
      </div>

      <div class="grid grid-cols-2 p-1 bg-slate-950/70 rounded-2xl border border-indigo-500/30 text-xs font-bold">
        <button @click="$emit('update:loginRole', 'member')" class="py-2.5 rounded-xl transition flex items-center justify-center gap-2"
                :class="loginRole === 'member' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'">
          <i class="fa-solid fa-user"></i> Thành Viên
        </button>
        <button @click="$emit('update:loginRole', 'admin')" class="py-2.5 rounded-xl transition flex items-center justify-center gap-2"
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
            <input type="password" v-model="loginForm.password" required placeholder="Nhập mật khẩu quản trị..."
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
