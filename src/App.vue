<template>
  <RouterView/>
</template>

<script setup>
import { RouterView } from 'vue-router';
import { useAuthStore } from './composable/useAuth';
import { onMounted } from 'vue';

const authStore = useAuthStore();

onMounted(() => {
  authStore.initialize();
})


</script>
