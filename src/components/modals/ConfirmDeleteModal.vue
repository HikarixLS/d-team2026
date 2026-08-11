<template>
  <Transition name="modal-fade">
    <div v-if="deleteModal.show" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4 text-center">
        <div class="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
          <i class="fa-solid fa-triangle-exclamation"></i>
        </div>
        <h3 class="font-bold text-slate-800 text-base">{{ deleteModal.title }}</h3>
        <p class="text-xs text-slate-600">{{ deleteModal.message }}</p>
        <div class="flex justify-center gap-3 pt-2">
          <button @click="deleteModal.show = false" class="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl">Hủy</button>
          <button @click="executeDelete" class="px-5 py-2 text-xs font-bold text-white bg-rose-600 rounded-xl shadow">Xác Nhận Xóa</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
const props = defineProps(['deleteModal']);

const executeDelete = async () => {
  if (props.deleteModal.action) {
    await props.deleteModal.action();
  }
  props.deleteModal.show = false;
};
</script>
