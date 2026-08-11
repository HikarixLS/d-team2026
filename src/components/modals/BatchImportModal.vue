<template>
  <Transition name="modal-fade">
    <div v-if="show" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
        <div class="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 class="font-bold text-slate-800 text-base flex items-center gap-2">
            <i class="fa-solid fa-file-import text-emerald-600"></i> Dán Danh Sách Thành Viên Hàng Loạt
          </h3>
          <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600"><i class="fa-solid fa-xmark text-lg"></i></button>
        </div>
        <div class="text-xs text-slate-600 space-y-2">
          <p class="font-semibold text-slate-800">Định dạng mỗi dòng (MSSV [Tab/Dấu phẩy] Họ tên [Tab/Dấu phẩy] Ban):</p>
          <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-700">
            20210001 Nguyễn Văn An Ban Hành chính<br>
            20210002 Trần Thị Bình Ban Nhân sự<br>
            20210003 Lê Hoàng Cường Ban Truyền thông
          </div>
          <textarea :value="batchText" @input="$emit('update:batchText', $event.target.value)" rows="6" placeholder="Dán danh sách từ Excel hoặc Word tại đây..."
                    class="w-full border border-slate-300 rounded-xl p-3 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"></textarea>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button @click="$emit('close')" class="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl">Hủy</button>
          <button @click="$emit('save')" class="px-5 py-2 text-xs font-bold text-white bg-emerald-600 rounded-xl shadow">Thêm Hàng Loạt</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps(['show', 'batchText']);
defineEmits(['close', 'save', 'update:batchText']);
</script>
