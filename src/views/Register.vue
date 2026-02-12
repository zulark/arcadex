<template>
  <form @submit.prevent="authStore.registerUser(form.username, form.email, form.password)">
    <div>
      <label for="username">Nome de Usuário</label>
      <input v-model="form.username" type="text" @blur="checkUsername" :class="{'border-red-500': usernameError}">
      <span v-if="usernameError" style="color: red;">
        {{ usernameError }}
      </span>
      <span v-else-if="isChecking">
          ...
      </span>
      <span v-else-if="isAvailable" style="color: green;">
        Nome de usuário disponivel
      </span>
    </div>
    <div>
      <label for="email">Email: </label>
      <input v-model="form.email" type="email" name="email" id="email" autocomplete="username" required>
    </div>
    <div>

      <label for="password">Senha: </label>
      <input v-model="form.password" type="password" name="password" id="password" autocomplete="current-password"
        required>
    </div>
    <div>
      <button type="submit">Registrar Usuário</button>
      <RouterLink to="/login"><button>Já tenho uma conta</button></RouterLink>
    </div>
    <div>
      <p>{{ authStore.errorMessage }}</p>
    </div>
  </form>
</template>

<script setup>
import { ref } from 'vue';
import { useSupabase } from '@/stores/supabaseStore';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/utils/supabase';

const authStore = useAuthStore();
const usernameError = ref('');
const isChecking = ref(false);
const isAvailable = ref(false);

const form = ref({
  username: '',
  email: '',
  password: ''
});

const checkUsername = async () => {
  if (!form.value.username || form.value.username.length < 3) { usernameError.value = "Mínimo 3 caractéres"; return }

  isChecking.value = true;
  usernameError.value = '';

  try {
    const { data, error } = await supabase
      .rpc('check_username_availability', {
        username_input: form.value.username
      })
    if (data) isAvailable.value = true;
    else {
      isAvailable.value = false
      usernameError.value = 'Nome de usuário já está em uso'
    }
  } catch (error) {
    authStore.errorMessage = error;
  } finally {
    isChecking.value = false;
  } 

}

</script>

<style scoped>
.border-red-500{
  border: 1px solid red;
}

.text-error{
  color: red,
}
</style>