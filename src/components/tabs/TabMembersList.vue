<template>
  <div class="space-y-4 sm:space-y-6">
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h3 class="text-base font-bold text-slate-800 flex items-center gap-2">
          <i class="fa-solid fa-users text-indigo-600"></i> Quản Lý Danh Sách Thành Viên (MSSV)
        </h3>
        <p class="text-xs text-slate-500 mt-0.5">Danh sách thành viên chính thức được phép truy cập và trực ca</p>
      </div>
      <div class="flex flex-wrap items-center gap-2" v-if="currentUserRole === 'admin'">
        <button @click="$emit('push-cloud')" class="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer">
          <i class="fa-solid fa-cloud-arrow-up"></i> Đẩy Lên Cloud
        </button>
        <button @click="$emit('open-batch')" class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer">
          <i class="fa-solid fa-file-import"></i> Dán Hàng Loạt
        </button>
        <button @click="$emit('open-member-modal')" class="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer">
          <i class="fa-solid fa-user-plus"></i> Thêm Thành Viên
        </button>
      </div>
    </div>

    <!-- Toolbar Filters -->
    <div class="bg-white p-3.5 sm:p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-center w-full md:w-auto flex-grow">
        <div class="relative">
          <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><i class="fa-solid fa-magnifying-glass text-xs"></i></span>
          <input type="text" :value="memberFilterSearch" @input="$emit('update:memberFilterSearch', $event.target.value)" placeholder="Tìm theo tên hoặc MSSV..."
                 class="w-full border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50 min-h-[38px]">
        </div>

        <select :value="memberFilterDept" @change="$emit('update:memberFilterDept', $event.target.value)"
                class="border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50 min-h-[38px] cursor-pointer">
          <option value="all">🏛️ Tất cả các Ban ({{ members.length }})</option>
          <option value="Ban Điều hành">Ban Điều hành</option>
          <option value="Ban Hành chính">Ban Hành chính</option>
          <option value="Ban Nhân sự">Ban Nhân sự</option>
          <option value="Ban Truyền thông">Ban Truyền thông</option>
        </select>

        <select :value="memberFilterTarget" @change="$emit('update:memberFilterTarget', $event.target.value)"
                class="border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50 min-h-[38px] cursor-pointer">
          <option value="all">🎯 Tất cả chỉ tiêu (10 ca/tháng)</option>
          <option value="pass">✅ Đã đạt chỉ tiêu (≥ 10 ca)</option>
          <option value="pending">⏳ Chưa đạt chỉ tiêu (< 10 ca)</option>
        </select>
      </div>

      <div class="flex items-center justify-between md:justify-end gap-2 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
        <span class="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-extrabold border border-indigo-200">
          Hiển thị {{ filteredMembersList.length }} / {{ members.length }} Thành Viên
        </span>
        <button v-if="memberFilterSearch || memberFilterDept !== 'all' || memberFilterTarget !== 'all'"
                @click="$emit('reset-filters')" class="text-xs text-rose-600 hover:text-rose-800 font-bold underline cursor-pointer">
          Đặt lại bộ lọc
        </button>
      </div>
    </div>

    <!-- Member Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="m in filteredMembersList" :key="m.id"
           class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
        <div class="space-y-3">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-2xl bg-indigo-600 text-amber-300 font-black text-sm flex items-center justify-center shadow-md shrink-0 border border-indigo-400/30">
                {{ getInitials(m.name) }}
              </div>
              <div>
                <h4 class="font-bold text-slate-800 text-sm sm:text-base leading-tight">{{ m.name }}</h4>
                <div class="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span class="text-xs font-bold text-indigo-600">MSSV: {{ m.id }}</span>
                  <span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold border"
                        :class="m.role === 'admin' ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-slate-100 text-slate-600 border-slate-200'">
                    {{ m.role === 'admin' ? '👑 Admin' : '👤 User' }}
                  </span>
                </div>
              </div>
            </div>

            <span class="px-2.5 py-1 rounded-full text-[11px] font-black border shrink-0 shadow-2xs"
                  :class="getDeptColorClass(m.department)">
              {{ m.department || 'Chưa phân ban' }}
            </span>
          </div>

          <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
            <div class="flex items-center justify-between text-slate-600">
              <span class="font-medium">🎂 Ngày sinh:</span>
              <span class="font-bold text-slate-800">{{ m.dob ? formatDate(m.dob) : 'Chưa cập nhật' }}</span>
            </div>
            <div class="flex items-center justify-between text-slate-600">
              <span class="font-medium">📊 Đã thực hiện (Tháng {{ selectedMonth }}):</span>
              <span class="font-black" :class="m.actualCount >= 10 ? 'text-emerald-600' : 'text-indigo-600'">
                {{ m.actualCount }} / 10 ca
              </span>
            </div>

            <div class="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-1">
              <div class="h-full transition-all duration-500 rounded-full"
                   :class="m.actualCount >= 10 ? 'bg-emerald-500' : 'bg-indigo-600'"
                   :style="{ width: m.progressPercent + '%' }"></div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-slate-100">
          <span class="text-[11px] font-bold" :class="m.actualCount >= 10 ? 'text-emerald-600' : 'text-amber-600'">
            {{ m.actualCount >= 10 ? '🎉 Đã đạt chỉ tiêu' : `⏳ Còn thiếu ${10 - m.actualCount} ca` }}
          </span>

          <div class="flex items-center gap-1.5" v-if="currentUserRole === 'admin'">
            <button @click="$emit('open-member-modal', m)" class="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-lg text-xs font-bold border border-slate-200 transition cursor-pointer flex items-center gap-1" title="Chỉnh sửa thành viên">
              <i class="fa-solid fa-pen"></i> Sửa
            </button>
            <button @click="$emit('confirm-delete-member', m)" class="px-2.5 py-1 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-lg text-xs font-bold border border-slate-200 transition cursor-pointer flex items-center gap-1" title="Xóa thành viên">
              <i class="fa-solid fa-trash-can"></i> Xóa
            </button>
          </div>
        </div>
      </div>

      <div v-if="filteredMembersList.length === 0" class="col-span-full bg-white rounded-2xl p-10 text-center text-slate-400 border border-slate-200 space-y-2">
        <i class="fa-solid fa-user-slash text-3xl text-slate-300"></i>
        <p class="text-sm font-semibold text-slate-600">Không tìm thấy thành viên nào phù hợp với bộ lọc hiện tại.</p>
        <button @click="$emit('reset-filters')" class="text-xs text-indigo-600 font-bold underline cursor-pointer">Bấm vào đây để đặt lại bộ lọc</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps([
  'currentUserRole',
  'members',
  'memberFilterSearch',
  'memberFilterDept',
  'memberFilterTarget',
  'filteredMembersList',
  'selectedMonth',
  'getInitials',
  'getDeptColorClass',
  'formatDate'
]);
defineEmits([
  'push-cloud',
  'open-batch',
  'open-member-modal',
  'confirm-delete-member',
  'reset-filters',
  'update:memberFilterSearch',
  'update:memberFilterDept',
  'update:memberFilterTarget'
]);
</script>
