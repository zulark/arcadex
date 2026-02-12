<template>
  <form @submit.prevent="authStore.registerUser(form.username, form.email, form.password)">
    <div>
        <label for="username">Nome de Usuário</label>
        <input v-model="form.username">
    </div>
    <div>
      <label for="email">Email: </label>
      <input v-model="form.email" type="email" name="email" id="email" autocomplete="username" required>
    </div>
    <div>

      <label for="password">Senha: </label>
      <input v-model="form.password" type="password" name="password" id="password" autocomplete="current-password" required>
    </div>
    <div>
      <button type="submit">Registrar Usuário</button>
      <RouterLink to="/login"><button>Já tenho uma conta</button></RouterLink>
    </div>
    <div> 
      <p>{{authStore.errorMessage }}</p>
    </div>
  </form>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';
const authStore = useAuthStore();

const form = ref({
  username: '',
  email: '',
  password: ''
})



</script>
