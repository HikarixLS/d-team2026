<template>
  <div v-if="show" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
      <div class="flex justify-between items-center border-b border-slate-100 pb-3">
        <h3 class="font-bold text-slate-800 text-base flex items-center gap-2">
          <i class="fa-solid fa-user-gear text-indigo-600"></i> {{ editingMember ? 'Chỉnh Sửa Thành Viên' : 'Thêm Thành Viên Mới' }}
        </h3>
        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600"><i class="fa-solid fa-xmark text-lg"></i></button>
      </div>

      <form @submit.prevent="$emit('save')" class="space-y-3.5">
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Mã Số Sinh Viên (MSSV - ID) <span class="text-red-500">*</span></label>
          <input type="text" v-model="memberForm.id" :disabled="!!editingMember" required placeholder="VD: 20210001"
                 class="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold"
                 :class="editingMember ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white'">
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Họ Và Tên <span class="text-red-500">*</span></label>
          <input type="text" v-model="memberForm.name" required placeholder="VD: Nguyễn Văn An"
                 class="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none">
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Ban Hoạt Động <span class="text-red-500">*</span></label>
          <select v-model="memberForm.department" required class="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium">
            <option value="" disabled>-- Chọn Ban --</option>
            <option value="Ban Điều hành">Ban Điều hành</option>
            <option value="Ban Hành chính">Ban Hành chính</option>
            <option value="Ban Nhân sự">Ban Nhân sự</option>
            <option value="Ban Truyền thông">Ban Truyền thông</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Vai Trò Hệ Thống <span class="text-red-500">*</span></label>
          <select v-model="memberForm.role" required class="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold"
                  :class="memberForm.role === 'admin' ? 'bg-amber-50 text-amber-900 border-amber-400' : 'bg-indigo-50 text-indigo-900 border-indigo-300'">
            <option value="member">👤 Thành Viên (User)</option>
            <option value="admin">👑 Quản Trị Viên (Admin)</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Ngày Tháng Năm Sinh</label>
          <input type="date" v-model="memberForm.dob" class="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none">
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button type="button" @click="$emit('close')" class="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl">Hủy</button>
          <button type="submit" class="px-5 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl shadow">Lưu Thành Viên</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
defineProps(['show', 'editingMember', 'memberForm']);
defineEmits(['close', 'save']);
</script>
