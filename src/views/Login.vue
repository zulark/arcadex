<template>
  <form @submit.prevent="authStore.loginUser(form.email, form.password)">
    <div>
      <label for="email">Email: </label>
      <input v-model="form.email" type="email" name="email" id="email" autocomplete="username" required>
    </div>
    <div>

      <label for="password">Senha: </label>
      <input v-model="form.password" type="password" name="password" id="password" autocomplete="current-password" required>
    </div>
    <div>
      <button type="submit">Logar Usuário</button>
      <RouterLink to="/register"><button>Registrar-se</button></RouterLink>
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
  email: '',
  password: ''
})




</script>
