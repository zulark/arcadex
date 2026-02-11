<template>
  <form @submit.prevent="loginUser">
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
    </div>
  </form>
</template>

<script setup>
import { ref } from 'vue';
import { useSupabase } from '@/composable/useSupabase';
import { useAuthStore } from '@/composable/useAuth';

const supabase = useSupabase();

const form = ref({
  email: '',
  password: ''
})

const loginUser = async () => {
  const { user, session, error } = await supabase.auth.signInWithPassword({
    email: form.value.email,      
    password: form.value.password 
  });
  
  if (error) console.error('Erro:', error.message);
  else console.log('Sucesso:', user, session);
}

</script>
