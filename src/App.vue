<template>
  <RouterView/>
</template>

<script setup>
import { RouterView } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { onMounted } from 'vue';

const authStore = useAuthStore();

onMounted(() => {
  authStore.initialize();
})


</script>
