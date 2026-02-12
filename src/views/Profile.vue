<template>
    <div v-if="profileStore.loading">
        Carregando...
    </div>
    <div v-else-if="profileStore.userNotFound"> Perfil não encontrado</div>
    <div v-else>
        <h1>{{ profileStore.profile.username}}</h1>
        <div v-if="isOwner">
            <button>Editar Perfil</button>
            <button>Sincronizar Steam</button>
            <button @click="authStore.signOut">Log Out</button>
        </div>
        <div v-else>
            <button>Seguir Perfil</button>
            <button>Comparar Jogos</button>
        </div>
        <p>{{ profileStore.profile.bio }}</p>
    </div>

</template>

<script setup>
import { ref, onMounted, computed, watch} from 'vue'
import { useAuthStore } from '@/stores/authStore';
import { useRoute } from 'vue-router';
import { supabase } from '@/utils/supabase';
import { useProfileStore } from '@/stores/profileStore';

const profileStore = useProfileStore();
const authStore = useAuthStore();
const route = useRoute();

const routeUsername = route.params.username;
const loggedUsername = authStore.user?.user_metadata?.username;

const isOwner = computed(() => {
    return routeUsername === loggedUsername;
});

watch(() => route.params.username, () => {
  if (route.params.username) fetchProfile(routeUsername);
});

onMounted(async () => {
   profileStore.fetchProfile(routeUsername);
});

</script>

<style scoped></style>