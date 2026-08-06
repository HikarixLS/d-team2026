<template>
  <div class="space-y-4 sm:space-y-6">
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
      <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 sm:mb-6">
        <div>
          <h2 class="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
            <i class="fa-solid fa-pen-to-square text-indigo-600"></i> Ghi Nhận Ca Trực Đã Hoàn Thành (Sổ Gốc)
          </h2>
          <p class="text-xs text-slate-500 mt-1">Ghi nhận thông tin trực từ sổ giấy vào hệ thống để theo dõi chỉ tiêu ca trực</p>
        </div>
        <span class="text-xs font-bold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200 hidden sm:inline-block">
          Sổ Gốc Ca Trực
        </span>
      </div>

      <form @submit.prevent="$emit('save-shift')" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div class="sm:col-span-2">
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Thành Viên Trực <span class="text-red-500">*</span>
            </label>
            <select v-model="shiftForm.memberId" required :disabled="currentUserRole !== 'admin'"
                    class="w-full border border-slate-300 rounded-lg p-3 text-base sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white min-h-[44px]">
              <option value="" disabled>-- Chọn thành viên theo MSSV/Họ tên --</option>
              <option v-for="m in members" :key="m.id" :value="m.id">
                [{{ m.id }}] {{ m.name }} - {{ m.department || 'Ban chưa đặt' }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Ngày Trực (Điểm Danh) <span class="text-red-500">*</span>
            </label>
            <input type="date" v-model="shiftForm.date" :min="todayDate" :max="todayDate" required
                   class="w-full border border-slate-300 rounded-lg p-2.5 text-base sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[44px] font-bold text-slate-800 bg-amber-50/50">
            <p class="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-300 mt-1.5 font-bold flex items-center gap-1.5 leading-snug">
              <i class="fa-solid fa-lock text-amber-600 shrink-0"></i> Quy định điểm danh: Chỉ được điểm danh trong ngày hôm nay ({{ formatDate(todayDate) }}), chỉ điểm danh cho ca ĐÃ ĐĂNG KÝ TRƯỚC. Không cho phép điểm danh trước hoặc điểm danh trễ.
            </p>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Ca Trực <span class="text-red-500">*</span>
            </label>
            <select v-model="shiftForm.shiftType" required
                    class="w-full border border-slate-300 rounded-lg p-2.5 text-base sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white min-h-[44px]">
              <option value="Ca 1">Ca 1 (7h30 - 9h20)</option>
              <option value="Ca 2">Ca 2 (9h20 - 11h30)</option>
              <option value="Ca 3">Ca 3 (13h00 - 15h20)</option>
              <option value="Ca 4">Ca 4 (15h20 - 17h00)</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1 flex items-center justify-between">
              <span>Trang Số <span class="text-red-500">*</span></span>
              <span class="text-[10px] text-indigo-600 normal-case">(Trong sổ giấy)</span>
            </label>
            <input type="number" min="1" v-model="shiftForm.pageNo" required placeholder="VD: 12"
                   class="w-full border border-slate-300 rounded-lg p-2.5 text-base sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[44px]">
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1 flex items-center justify-between">
              <span>STT Trang <span class="text-red-500">*</span></span>
              <span class="text-[10px] text-indigo-600 normal-case">(Trong sổ giấy)</span>
            </label>
            <input type="number" min="1" v-model="shiftForm.sttNo" required placeholder="VD: 5"
                   class="w-full border border-slate-300 rounded-lg p-2.5 text-base sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[44px]">
          </div>

          <div class="sm:col-span-2">
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Trạng Thái Ca Trực</label>
            <select v-model="shiftForm.status" class="w-full border border-slate-300 rounded-lg p-2.5 text-base sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white min-h-[44px]">
              <option value="Đúng giờ">Đúng giờ</option>
              <option value="Đi trễ">Đi trễ</option>
              <option value="Về sớm">Về sớm</option>
              <option value="Trực thay">Trực thay</option>
            </select>
          </div>

          <div class="sm:col-span-2">
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Ghi Chú / Bàn Giao Ca</label>
            <textarea v-model="shiftForm.notes" rows="2" placeholder="Ghi nhận bàn giao hoặc thông tin chú ý..."
                      class="w-full border border-slate-300 rounded-lg p-2.5 text-base sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[60px]"></textarea>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button type="button" @click="$emit('reset-form')" class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition active:scale-95 cursor-pointer">
            Làm Mới
          </button>
          <button type="submit" class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2 active:scale-95 cursor-pointer">
            <i class="fa-solid fa-cloud-arrow-up"></i> Lưu Đồng Bộ
          </button>
        </div>
      </form>
    </div>

    <!-- Recent Shifts Preview List -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-5">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-bold text-slate-800 flex items-center gap-2">
          <i class="fa-solid fa-clock-rotate-left text-indigo-600"></i> Ca Trực Mới Ghi Nhận
        </h3>
        <button @click="$emit('go-tab', 'history')" class="text-xs text-indigo-600 hover:underline font-semibold cursor-pointer">Xem tất cả</button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        <div v-for="s in shifts.slice(0, 6)" :key="s.id" class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
          <div class="flex items-center justify-between font-bold text-slate-800">
            <span>{{ getMemberName(s.memberId) }}</span>
            <span class="px-2 py-0.5 text-[10px] rounded-md font-extrabold"
                  :class="s.status === 'Đúng giờ' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'">
              {{ s.status }}
            </span>
          </div>
          <div class="text-slate-500 font-medium">
            🗓️ {{ formatDate(s.date) }} • {{ s.shiftType }}
          </div>
          <div class="text-[11px] text-indigo-600 font-semibold">
            Sổ gốc: Trang {{ s.pageNo }} - STT {{ s.sttNo }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps([
  'shiftForm',
  'members',
  'currentUserRole',
  'todayDate',
  'shifts',
  'getMemberName',
  'formatDate'
]);
defineEmits(['save-shift', 'reset-form', 'go-tab']);
</script>
