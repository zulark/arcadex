<template>
  <div v-if="isAuthenticated && user">
    <h1>Home Page</h1>

    <button @click="authStore.signOut">Log Out</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'; 
import { storeToRefs } from 'pinia';
const authStore = useAuthStore();
const { user, isAuthenticated } = storeToRefs(authStore);
</script>

<style scoped>
</style>