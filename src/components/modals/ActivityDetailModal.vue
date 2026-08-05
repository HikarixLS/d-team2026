<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
    <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full p-6 border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <span class="px-2.5 py-1 text-[11px] font-black rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
            {{ activity?.semester }}
          </span>
          <h3 class="font-extrabold text-slate-800 dark:text-white text-lg mt-1">{{ activity?.name }}</h3>
          <p class="text-xs text-slate-500 font-medium flex items-center gap-2 mt-0.5">
            <span><i class="fa-solid fa-calendar-days text-indigo-500"></i> {{ formatDate(activity?.date) }}</span>
            <span>•</span>
            <span><i class="fa-solid fa-location-dot text-rose-500"></i> {{ activity?.location || 'Trường ĐH' }}</span>
          </p>
        </div>
        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 p-2 rounded-xl cursor-pointer">
          <i class="fa-solid fa-xmark text-xl"></i>
        </button>
      </div>

      <!-- Stats Quick Bar -->
      <div class="grid grid-cols-2 gap-3 py-3 my-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl px-4 border border-slate-100 dark:border-slate-800">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-lg">
            <i class="fa-solid fa-user-check"></i>
          </div>
          <div>
            <div class="text-xl font-black text-emerald-600 dark:text-emerald-400">{{ stats?.totalCheckIns || 0 }}</div>
            <div class="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Đã điểm danh</div>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-lg">
            <i class="fa-solid fa-user-xmark"></i>
          </div>
          <div>
            <div class="text-xl font-black text-amber-600 dark:text-amber-400">{{ stats?.totalLeaves || 0 }}</div>
            <div class="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Đã xin nghỉ</div>
          </div>
        </div>
      </div>

      <!-- Admin Check-In On Behalf Form -->
      <div class="mb-4 p-3.5 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200/70 dark:border-indigo-900/60 space-y-2">
        <div class="text-xs font-black text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5 uppercase">
          <i class="fa-solid fa-user-shield text-indigo-600"></i> Quản Trị Viên Điểm Danh Hộ / Điểm Danh Bù
        </div>
        <div class="flex flex-col sm:flex-row items-center gap-2">
          <select v-model="selectedAdminMemberId"
                  class="w-full text-xs border border-indigo-200 dark:border-indigo-800 rounded-xl px-3 py-2 bg-white dark:bg-slate-900 font-bold text-slate-800 dark:text-white focus:outline-none">
            <option value="">-- Chọn thành viên để điểm danh hộ/bù --</option>
            <option v-for="m in members" :key="m.id" :value="m.id">
              [{{ m.id }}] {{ m.name }} - {{ m.department }}
            </option>
          </select>
          <button @click="handleAdminCheckIn"
                  :disabled="!selectedAdminMemberId"
                  class="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap">
            <i class="fa-solid fa-plus-circle"></i> Điểm Danh Hộ
          </button>
        </div>
      </div>

      <!-- Detail Lists Tabs -->
      <div class="flex-grow overflow-y-auto pr-1 space-y-4">
        <!-- Present List -->
        <div>
          <h4 class="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <i class="fa-solid fa-circle-check text-emerald-500"></i> Danh sách thành viên điểm danh ({{ stats?.presentList?.length || 0 }})
          </h4>

          <div v-if="!stats?.presentList?.length" class="text-center py-6 text-xs text-slate-400 font-medium italic bg-slate-50 dark:bg-slate-800/40 rounded-xl">
            Chưa có lượt điểm danh nào.
          </div>

          <div v-else class="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
            <div v-for="item in stats.presentList" :key="item.id" class="p-3 flex items-center justify-between bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center">
                  {{ item.memberName ? item.memberName.charAt(0).toUpperCase() : 'U' }}
                </div>
                <div>
                  <div class="text-xs font-bold text-slate-800 dark:text-white">{{ item.memberName }}</div>
                  <div class="text-[11px] text-slate-400 font-medium">MSSV: {{ item.memberId }}</div>
                </div>
              </div>
              <div class="text-right">
                <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center gap-1 justify-end">
                  <i class="fa-solid fa-check"></i> {{ item.adminCheckedIn ? 'Admin Điểm Danh Hộ' : 'Có Mặt' }}
                </span>
                <div class="text-[10px] text-slate-400 mt-0.5">{{ formatTime(item.timestamp) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Leave Requests List -->
        <div>
          <h4 class="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <i class="fa-solid fa-envelope-open-text text-amber-500"></i> Danh sách xin nghỉ ({{ stats?.leaveList?.length || 0 }})
          </h4>

          <div v-if="!stats?.leaveList?.length" class="text-center py-6 text-xs text-slate-400 font-medium italic bg-slate-50 dark:bg-slate-800/40 rounded-xl">
            Chưa có thành viên nào gửi đơn xin nghỉ.
          </div>

          <div v-else class="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
            <div v-for="item in stats.leaveList" :key="item.id" class="p-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-black text-xs flex items-center justify-center">
                    {{ item.memberName ? item.memberName.charAt(0).toUpperCase() : 'U' }}
                  </div>
                  <div>
                    <div class="text-xs font-bold text-slate-800 dark:text-white">{{ item.memberName }}</div>
                    <div class="text-[11px] text-slate-400 font-medium">MSSV: {{ item.memberId }}</div>
                  </div>
                </div>
                <div class="text-right">
                  <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    <i class="fa-solid fa-clock"></i> Vắng có lý do
                  </span>
                  <div class="text-[10px] text-slate-400 mt-0.5">{{ formatTime(item.timestamp) }}</div>
                </div>
              </div>
              <div v-if="item.leaveReason" class="mt-2 text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 p-2 rounded-xl border border-amber-200/50">
                <span class="font-bold">Lý do:</span> {{ item.leaveReason }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="pt-4 border-t border-slate-100 dark:border-slate-800 text-right">
        <button @click="$emit('close')" class="px-5 py-2 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer">
          Đóng lại
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  show: Boolean,
  activity: Object,
  stats: Object,
  members: Array,
  formatDate: Function
});

const emit = defineEmits(['close', 'admin-checkin']);

const selectedAdminMemberId = ref('');

const handleAdminCheckIn = () => {
  if (!selectedAdminMemberId.value || !props.activity) return;
  emit('admin-checkin', {
    activityId: props.activity.id,
    memberId: selectedAdminMemberId.value
  });
  selectedAdminMemberId.value = '';
};

const formatTime = (ts) => {
  if (!ts) return '';
  return new Date(ts).toLocaleString('vi-VN');
};
</script>
