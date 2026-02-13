<template>
  <div class="p-4 border rounded shadow bg-white">
    <h3 class="font-bold text-lg mb-4">Adicionar Jogo</h3>

    <form @submit.prevent="submitGame" class="space-y-4">
      <GameSearch @game-selected="(game) => form.game_id = game.id" />

      <div class="grid grid-cols-2 gap-4">
        <select v-model="form.status" class="border p-2 rounded">
           <option value="PLAYING">Jogando</option>
           <option value="COMPLETED">Zerado</option>
           </select>
        <select v-model="form.platform" class="border p-2 rounded">
           <option value="PC">PC</option>
           <option value="PS5">PS5</option>
           </select>
      </div>

      <button 
        type="submit" 
        :disabled="libraryStore.isLoading || !form.game_id"
        class="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-50"
      >
        {{ libraryStore.isLoading ? 'Salvando...' : 'Adicionar' }}
      </button>

      <p v-if="libraryStore.error" class="text-red-500 text-sm">
        {{ libraryStore.error }}
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useLibraryStore } from '@/stores/libraryStore';
import { useAuthStore } from '@/stores/authStore';
import GameSearch from '@/components/GameSearch.vue';

const libraryStore = useLibraryStore();
const authStore = useAuthStore();

const form = ref({
  game_id: null,
  status: 'PLAYING',
  platform: 'PC'
});

const submitGame = async () => {
  const success = await libraryStore.addGameToLibrary(
    authStore.user.id,
    form.value.game_id,
    form.value.status,
    form.value.platform
  );

  if (success) {
    alert('Jogo adicionado!');
    form.value.game_id = null; 
  }
};
</script>