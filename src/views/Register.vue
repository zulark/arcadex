<template>
  <form @submit.prevent="registerUser">
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
    </div>
  </form>
</template>

<script setup>
import { ref } from 'vue';
import { useSupabase } from '@/composable/useSupabase';

const supabase = useSupabase();

const form = ref({
  username: '',
  email: '',
  password: ''
})

const registerUser = async () => {
  const { data, error } = await supabase.auth.signUp({
    email: form.value.email,      
    password: form.value.password,
    options: { 
        data: {
            username: form.value.username,
        }
    }
  });
  
  if (error) console.error('Erro:', error.message);
  else console.log('Sucesso:', data);
}

</script>
