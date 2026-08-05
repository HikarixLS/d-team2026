<template>
  <div class="space-y-4 sm:space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
      <!-- Form Nộp Đơn Xin Nghỉ Phép -->
      <div class="md:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-5 space-y-4">
        <div class="border-b border-slate-100 pb-3">
          <h3 class="text-base font-bold text-slate-800 flex items-center gap-2">
            <i class="fa-solid fa-file-pen text-amber-600"></i> Nộp Đơn Xin Nghỉ Phép
          </h3>
          <p class="text-xs text-slate-500 mt-0.5">Chỉ được xin nghỉ đối với các ca trực bạn đã đăng ký trước đó</p>
        </div>

        <form @submit.prevent="$emit('save-leave-request')" class="space-y-3.5">
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Thành Viên Xin Nghỉ <span class="text-red-500">*</span></label>
            <select v-model="leaveForm.memberId" required :disabled="currentUserRole !== 'admin'" @change="$emit('member-change')"
                    class="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white font-medium">
              <option value="" disabled>-- Chọn thành viên --</option>
              <option v-for="m in members" :key="m.id" :value="m.id">[{{ m.id }}] {{ m.name }} ({{ m.department || 'Ban chưa đặt' }})</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Ban Hoạt Động</label>
            <input type="text" v-model="leaveForm.department" readonly placeholder="Tự động điền theo thành viên..."
                   class="w-full border border-slate-300 rounded-lg p-2 text-xs bg-slate-100 text-slate-600 font-semibold cursor-not-allowed">
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Chọn Ca Trực Đã Đăng Ký Xin Nghỉ <span class="text-red-500">*</span></label>
            <select v-model="leaveForm.selectedRegId" required @change="$emit('reg-select')"
                    class="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white font-medium">
              <option value="" disabled>{{ availableRegisteredShifts.length > 0 ? '-- Chọn ca trực đã đăng ký để xin nghỉ --' : '-- Chưa có ca trực nào đã đăng ký sắp tới --' }}</option>
              <option v-for="r in availableRegisteredShifts" :key="r.id" :value="r.id">
                🗓️ Ngày {{ formatDate(r.date) }} • {{ r.shiftType }} {{ r.notes ? `(${r.notes})` : '' }}
              </option>
            </select>
            <p v-if="availableRegisteredShifts.length === 0" class="text-[11px] text-rose-600 mt-1.5 flex items-center gap-1 font-semibold">
              <i class="fa-solid fa-triangle-exclamation"></i> Thành viên chưa có lịch đăng ký ca trực sắp tới để xin nghỉ phép.
            </p>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Lý Do Xin Nghỉ Phép <span class="text-red-500">*</span></label>
            <textarea v-model="leaveForm.reason" rows="3" required placeholder="Bận lịch học đột xuất / ốm đau / việc gia đình..."
                      class="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"></textarea>
          </div>

          <button type="submit" :disabled="availableRegisteredShifts.length === 0"
                  class="w-full py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  :class="availableRegisteredShifts.length === 0 ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20'">
            <i class="fa-solid fa-paper-plane"></i> Nộp Đơn Xin Nghỉ Phép
          </button>
        </form>
      </div>

      <!-- Danh Sách Đơn Xin Nghỉ Phép -->
      <div class="md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-5 space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 class="text-base font-bold text-slate-800 flex items-center gap-2">
              <i class="fa-solid fa-clipboard-check text-amber-600"></i> {{ leaveListTitle }}
            </h3>
            <p class="text-xs text-slate-500 mt-0.5">Admin sẽ duyệt hoặc từ chối các đơn xin nghỉ phép của thành viên</p>
          </div>
          <span v-if="pendingLeaveCount > 0 && currentUserRole === 'admin'"
                class="px-3 py-1 bg-amber-100 text-amber-800 border border-amber-300 text-xs font-black rounded-full animate-bounce">
            ⏳ Có {{ pendingLeaveCount }} đơn chờ duyệt
          </span>
        </div>

        <!-- Filter Status Tabs -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
          <button @click="$emit('update:leaveStatusFilter', 'all')" class="px-3 py-1.5 rounded-xl transition cursor-pointer"
                  :class="leaveStatusFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'">Tất Cả</button>
          <button @click="$emit('update:leaveStatusFilter', 'Chờ duyệt')" class="px-3 py-1.5 rounded-xl transition cursor-pointer"
                  :class="leaveStatusFilter === 'Chờ duyệt' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'">⏳ Chờ Duyệt</button>
          <button @click="$emit('update:leaveStatusFilter', 'Đã duyệt')" class="px-3 py-1.5 rounded-xl transition cursor-pointer"
                  :class="leaveStatusFilter === 'Đã duyệt' ? 'bg-emerald-600 text-white font-black' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'">✅ Đã Duyệt</button>
          <button @click="$emit('update:leaveStatusFilter', 'Từ chối')" class="px-3 py-1.5 rounded-xl transition cursor-pointer"
                  :class="leaveStatusFilter === 'Từ chối' ? 'bg-rose-600 text-white font-black' : 'bg-rose-50 text-rose-800 hover:bg-rose-100'">✕ Từ Chối</button>
        </div>

        <div class="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          <div v-for="l in filteredLeaveRequests" :key="l.id"
               class="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 hover:bg-slate-100/80 transition">
            <div class="flex items-start justify-between gap-3">
              <div>
                <h4 class="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <span>{{ l.memberName || getMemberName(l.memberId) }}</span>
                  <span class="text-xs font-semibold text-indigo-600">[{{ l.memberId }}]</span>
                </h4>
                <p class="text-xs text-slate-500 font-medium mt-0.5">
                  🏛️ {{ l.department || getMemberDept(l.memberId) }} • 🗓️ Nghỉ ca: <b class="text-slate-700">{{ l.shiftType }} (Ngày {{ formatDate(l.shiftDate) }})</b>
                </p>
              </div>

              <span class="px-2.5 py-1 rounded-xl text-xs font-black border shadow-2xs shrink-0"
                    :class="{
                      'bg-amber-100 text-amber-800 border-amber-300': l.status === 'Chờ duyệt',
                      'bg-emerald-100 text-emerald-800 border-emerald-300': l.status === 'Đã duyệt',
                      'bg-rose-100 text-rose-800 border-rose-300': l.status === 'Từ chối'
                    }">
                <span>{{ getLeaveStatusBadgeText(l.status) }}</span>
              </span>
            </div>

            <p class="text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200/80 font-medium">
              📝 <b>Lý do:</b> "{{ l.reason }}"
            </p>

            <div class="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/50">
              <span>⏰ Nộp lúc: {{ formatCreatedAt(l.createdAt) }}</span>
              <div v-if="currentUserRole === 'admin' && l.status === 'Chờ duyệt'" class="flex items-center gap-1.5">
                <button @click="$emit('update-leave-status', l, 'Đã duyệt')" class="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-2xs transition cursor-pointer">✓ Duyệt Đơn</button>
                <button @click="$emit('update-leave-status', l, 'Từ chối')" class="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs shadow-2xs transition cursor-pointer">✕ Từ Chối</button>
              </div>
            </div>
          </div>

          <div v-if="filteredLeaveRequests.length === 0" class="p-8 text-center text-slate-400 text-xs">
            Chưa có đơn xin nghỉ phép nào.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps([
  'leaveForm',
  'members',
  'currentUserRole',
  'availableRegisteredShifts',
  'leaveListTitle',
  'pendingLeaveCount',
  'leaveStatusFilter',
  'filteredLeaveRequests',
  'getMemberName',
  'getMemberDept',
  'formatDate',
  'getLeaveStatusBadgeText',
  'formatCreatedAt'
]);
defineEmits([
  'save-leave-request',
  'member-change',
  'reg-select',
  'update:leaveStatusFilter',
  'update-leave-status'
]);
</script>
