<template>
  <div v-if="toast.show" 
       class="fixed bottom-20 sm:bottom-6 right-4 z-50 px-4 py-3 rounded-xl shadow-xl text-white text-xs font-bold flex items-center gap-2 transition-all duration-300"
       :class="toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'">
    <i class="fa-solid" :class="toast.type === 'error' ? 'fa-circle-xmark' : 'fa-circle-check'"></i>
    <span>{{ toast.message }}</span>
  </div>
</template>

<script setup>
defineProps(['toast']);
</script>
