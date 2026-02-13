<template>
  <div class="relative">
    <label class="block text-sm font-medium mb-1">Buscar Jogo</label>
    <div class="relative">
        <input 
        type="text" 
        v-model="query" 
        @input="handleInput"
        placeholder="Ex: Elden Ring..."
        class="w-full p-2 border rounded"
        />
        <span v-if="libraryStore.searchLoading" class="absolute right-3 top-2 text-gray-400">
             ...
        </span>
    </div>

    <ul v-if="libraryStore.searchResults.length > 0" class="absolute z-10 w-full bg-white border mt-1 shadow-lg max-h-60 overflow-y-auto">
      <li 
        v-for="game in libraryStore.searchResults" 
        :key="game.id" 
        @click="selectGame(game)"
        class="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
      >
        <img :src="game.cover_url" class="w-8 h-10 object-cover" />
        <div class="flex flex-col">
            <span class="font-medium">{{ game.title }}</span>
            <span class="text-xs text-gray-500">{{ game.release_date?.split('-')[0] || 'N/A' }}</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useLibraryStore } from '@/stores/libraryStore';

const emit = defineEmits(['game-selected']);
const libraryStore = useLibraryStore(); 
const query = ref('');
let debounceTimeout = null;

const handleInput = () => {
  if (query.value.length < 2) {
    libraryStore.clearSearch();
    return;
  }
  
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    libraryStore.searchGames(query.value);
  }, 300);
};

const selectGame = (game) => {
  emit('game-selected', game);
  libraryStore.clearSearch(); 
  query.value = game.title;
};
</script>