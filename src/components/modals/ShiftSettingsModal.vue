<template>
  <Transition name="modal-fade">
    <div v-if="show" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800 my-auto">
        <div class="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 class="font-extrabold text-slate-800 dark:text-white text-base flex items-center gap-2">
              <i class="fa-solid fa-sliders text-indigo-600 dark:text-indigo-400"></i> Cấu Hình Ca Trực &amp; Số Lượng Người
            </h3>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Tùy chỉnh số lượng người trực mỗi ca và quản lý danh sách ca không giới hạn</p>
          </div>
          <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <div class="space-y-4 max-h-[60vh] overflow-y-auto pr-1 text-xs">
          <!-- 0. Bật / Tắt Cổng Đăng Ký Ca Trực -->
          <div class="p-3.5 rounded-2xl border transition-all"
               :class="localSettings.isRegistrationOpen !== false ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60' : 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60'">
            <div class="flex items-center justify-between gap-3">
              <div>
                <label class="font-bold flex items-center gap-1.5 text-xs"
                       :class="localSettings.isRegistrationOpen !== false ? 'text-emerald-900 dark:text-emerald-200' : 'text-rose-900 dark:text-rose-200'">
                  <i class="fa-solid" :class="localSettings.isRegistrationOpen !== false ? 'fa-door-open text-emerald-600 dark:text-emerald-400' : 'fa-door-closed text-rose-600 dark:text-rose-400'"></i>
                  Trạng Thái Cổng Đăng Ký Ca Trực (Admin)
                </label>
                <p class="text-[11px] mt-0.5"
                   :class="localSettings.isRegistrationOpen !== false ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'">
                  {{ localSettings.isRegistrationOpen !== false ? '🟢 Đang MỞ: Thành viên được phép đăng ký ca.' : '🔴 Đang ĐÓNG: Tạm khóa đăng ký với thành viên.' }}
                </p>
              </div>

              <button type="button" @click="localSettings.isRegistrationOpen = !(localSettings.isRegistrationOpen !== false)"
                      class="px-3.5 py-1.5 rounded-xl font-black text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
                      :class="localSettings.isRegistrationOpen !== false ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-rose-600 hover:bg-rose-700 text-white'">
                <i class="fa-solid" :class="localSettings.isRegistrationOpen !== false ? 'fa-toggle-on text-sm' : 'fa-toggle-off text-sm'"></i>
                <span>{{ localSettings.isRegistrationOpen !== false ? 'Đang Mở' : 'Đang Khóa' }}</span>
              </button>
            </div>
          </div>

          <!-- 1. Cấu hình số người trực tối đa mỗi ca -->
          <div class="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/60 space-y-2.5">
            <label class="font-bold text-slate-800 dark:text-indigo-200 flex items-center gap-1.5 text-xs">
              <i class="fa-solid fa-users-gear text-indigo-600 dark:text-indigo-400"></i> 1. Số Lượng Người Trực Tối Đa Mỗi Ca:
            </label>
            
            <div class="flex flex-wrap items-center gap-4 pt-1">
              <label class="flex items-center gap-2 cursor-pointer select-none font-semibold text-slate-700 dark:text-slate-300">
                <input type="radio" :value="true" v-model="isUnlimitedPerShift" class="text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer">
                <span>🟢 Không giới hạn số người</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer select-none font-semibold text-slate-700 dark:text-slate-300">
                <input type="radio" :value="false" v-model="isUnlimitedPerShift" class="text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer">
                <span>🔢 Giới hạn cụ thể</span>
              </label>
            </div>

            <div v-if="!isUnlimitedPerShift" class="flex items-center gap-2 pt-1.5">
              <span class="text-slate-600 dark:text-slate-400 font-medium">Tối đa:</span>
              <input type="number" min="1" max="100" v-model.number="localSettings.maxPerShift"
                     class="w-24 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl px-3 py-1.5 font-black text-center focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              <span class="text-slate-600 dark:text-slate-400 font-medium">người / ca trực</span>
            </div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 italic">
              {{ isUnlimitedPerShift ? '✓ Bất kỳ thành viên nào cũng có thể đăng ký ca mà không bị báo đầy (không giới hạn).' : `✓ Mỗi ca sẽ khóa khi đạt đủ ${localSettings.maxPerShift || 1} người đăng ký.` }}
            </p>
          </div>

          <!-- 2. Cấu hình số ca trực tối đa mỗi người/ngày -->
          <div class="p-3.5 bg-sky-50/70 dark:bg-sky-950/40 rounded-2xl border border-sky-100 dark:border-sky-900/60 space-y-2.5">
            <label class="font-bold text-slate-800 dark:text-sky-200 flex items-center gap-1.5 text-xs">
              <i class="fa-solid fa-calendar-day text-sky-600 dark:text-sky-400"></i> 2. Số Ca Trực Tối Đa Mỗi Người Được Đăng Ký / Ngày:
            </label>
            
            <div class="flex flex-wrap items-center gap-4 pt-1">
              <label class="flex items-center gap-2 cursor-pointer select-none font-semibold text-slate-700 dark:text-slate-300">
                <input type="radio" :value="true" v-model="isUnlimitedPerDay" class="text-sky-600 focus:ring-sky-500 w-4 h-4 cursor-pointer">
                <span>🟢 Không giới hạn số ca/ngày</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer select-none font-semibold text-slate-700 dark:text-slate-300">
                <input type="radio" :value="false" v-model="isUnlimitedPerDay" class="text-sky-600 focus:ring-sky-500 w-4 h-4 cursor-pointer">
                <span>🔢 Giới hạn số ca/ngày</span>
              </label>
            </div>

            <div v-if="!isUnlimitedPerDay" class="flex items-center gap-2 pt-1.5">
              <span class="text-slate-600 dark:text-slate-400 font-medium">Tối đa:</span>
              <input type="number" min="1" max="20" v-model.number="localSettings.maxPerDay"
                     class="w-24 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl px-3 py-1.5 font-black text-center focus:ring-2 focus:ring-sky-500 focus:outline-none" />
              <span class="text-slate-600 dark:text-slate-400 font-medium">ca / ngày</span>
            </div>
          </div>

          <!-- 3. Danh sách các Ca trực (Thêm / Sửa / Xóa không giới hạn) -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <i class="fa-solid fa-list-ol text-amber-500"></i> 3. Danh Sách Ca Trực (Không Giới Hạn Số Ca):
              </label>
              <button type="button" @click="addNewShiftRow" class="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-xs cursor-pointer">
                <i class="fa-solid fa-plus"></i> Thêm Ca
              </button>
            </div>

            <div class="space-y-2">
              <div v-for="(st, idx) in localSettings.shiftTypes" :key="idx"
                   class="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                <span class="w-6 text-center font-bold text-slate-400 text-[11px]">#{{ idx + 1 }}</span>
                <input type="text" v-model="st.name" placeholder="Tên ca (VD: Ca 1, Ca Sáng)"
                       class="w-32 sm:w-36 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg px-2.5 py-1.5 font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs" />
                <input type="text" v-model="st.time" placeholder="Khung giờ (VD: 7h30 - 9h20)"
                       class="flex-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg px-2.5 py-1.5 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs" />
                <button type="button" @click="removeShiftRow(idx)"
                        :disabled="localSettings.shiftTypes.length <= 1"
                        class="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Xóa ca này">
                  <i class="fa-solid fa-trash-can text-xs"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
          <button @click="handleResetDefault" class="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer">
            ⚡ Khôi Phục Mặc Định
          </button>
          <div class="flex gap-2">
            <button @click="$emit('close')" class="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl cursor-pointer">
              Đóng
            </button>
            <button @click="handleSave" class="px-5 py-2 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md cursor-pointer transition flex items-center gap-1.5">
              <i class="fa-solid fa-floppy-disk"></i> Lưu &amp; Đồng Bộ Cloud
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps(['show', 'shiftSettings']);
const emit = defineEmits(['close', 'save', 'reset-default']);

const localSettings = ref({
  maxPerShift: 0,
  maxPerDay: 0,
  shiftTypes: []
});

const isUnlimitedPerShift = ref(true);
const isUnlimitedPerDay = ref(true);

const syncFromProps = () => {
  if (props.shiftSettings) {
    localSettings.value = JSON.parse(JSON.stringify(props.shiftSettings));
    isUnlimitedPerShift.value = !localSettings.value.maxPerShift || localSettings.value.maxPerShift <= 0;
    isUnlimitedPerDay.value = !localSettings.value.maxPerDay || localSettings.value.maxPerDay <= 0;
    if (!Array.isArray(localSettings.value.shiftTypes) || localSettings.value.shiftTypes.length === 0) {
      localSettings.value.shiftTypes = [
        { id: 'Ca 1', name: 'Ca 1', time: '7h30 - 9h20' },
        { id: 'Ca 2', name: 'Ca 2', time: '9h20 - 11h30' },
        { id: 'Ca 3', name: 'Ca 3', time: '13h00 - 15h20' },
        { id: 'Ca 4', name: 'Ca 4', time: '15h20 - 17h00' }
      ];
    }
  }
};

watch(() => props.show, (newVal) => {
  if (newVal) syncFromProps();
});

watch(() => isUnlimitedPerShift.value, (isUnlim) => {
  if (isUnlim) {
    localSettings.value.maxPerShift = 0;
  } else if (!localSettings.value.maxPerShift || localSettings.value.maxPerShift <= 0) {
    localSettings.value.maxPerShift = 3;
  }
});

watch(() => isUnlimitedPerDay.value, (isUnlim) => {
  if (isUnlim) {
    localSettings.value.maxPerDay = 0;
  } else if (!localSettings.value.maxPerDay || localSettings.value.maxPerDay <= 0) {
    localSettings.value.maxPerDay = 3;
  }
});

const addNewShiftRow = () => {
  const nextNum = localSettings.value.shiftTypes.length + 1;
  localSettings.value.shiftTypes.push({
    id: `Ca ${nextNum}`,
    name: `Ca ${nextNum}`,
    time: ''
  });
};

const removeShiftRow = (idx) => {
  if (localSettings.value.shiftTypes.length > 1) {
    localSettings.value.shiftTypes.splice(idx, 1);
  }
};

const handleResetDefault = () => {
  emit('reset-default');
  syncFromProps();
};

const handleSave = () => {
  const payload = {
    isRegistrationOpen: localSettings.value.isRegistrationOpen !== false,
    maxPerShift: isUnlimitedPerShift.value ? 0 : Math.max(1, Number(localSettings.value.maxPerShift) || 3),
    maxPerDay: isUnlimitedPerDay.value ? 0 : Math.max(1, Number(localSettings.value.maxPerDay) || 3),
    shiftTypes: localSettings.value.shiftTypes.filter(st => st.name && st.name.trim()).map(st => ({
      id: st.name.trim(),
      name: st.name.trim(),
      time: (st.time || '').trim()
    }))
  };
  emit('save', payload);
};
</script>
