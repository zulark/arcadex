<template>
    <Teleport to="body">
        <div v-if="isOpen" class="modal-backdrop" @click.self="$emit('close')">
            <div class="modal-container">
                <button class="close-btn" @click="$emit('close')">✕</button>

                <div class="modal-content">
                    <h2 class="modal-title">Adicionar Jogo</h2>

                    <form @submit.prevent="submitGame" class="form">
                        <div class="section">
                            <label class="section-label">Buscar Jogo</label>
                            <div class="search-container">
                                <input type="text" v-model="searchQuery" @input="handleSearch"
                                    placeholder="Ex: Elden Ring, The Last of Us..." class="search-input" />
                                <span v-if="libraryStore.searchLoading" class="search-spinner">⟳</span>
                            </div>

                            <ul v-if="libraryStore.searchResults.length > 0" class="search-results">
                                <li v-for="game in libraryStore.searchResults" :key="game.id" @click="selectGame(game)"
                                    class="search-result-item">
                                    <img :src="game.cover_url || '/placeholder-game.png'" :alt="game.title"
                                        class="result-cover" />
                                    <div class="result-info">
                                        <span class="result-title">{{ game.title }}</span>
                                        <span class="result-year">{{ game.release_date?.split('-')[0] || 'N/A' }}</span>
                                    </div>
                                </li>
                            </ul>

                            <div v-if="selectedGame" class="selected-game">
                                <img :src="selectedGame.cover_url || '/placeholder-game.png'" :alt="selectedGame.title"
                                    class="selected-cover" />
                                <div class="selected-info">
                                    <span class="selected-title">{{ selectedGame.title }}</span>
                                    <span class="selected-year">{{ selectedGame.release_date?.split('-')[0] }}</span>
                                </div>
                                <button type="button" class="remove-selected" @click="clearSelection">✕</button>
                            </div>
                        </div>

                        <div class="section">
                            <label class="section-label">Status</label>
                            <div class="status-grid">
                                <button v-for="status in STATUS_OPTIONS" :key="status.value" type="button"
                                    class="status-btn" :class="{ active: form.status === status.value }"
                                    :style="form.status === status.value ? { backgroundColor: status.color } : {}"
                                    @click="form.status = status.value">
                                    <span>{{ status.label }}</span>
                                </button>
                            </div>
                        </div>

                        <div class="section">
                            <label class="section-label">Plataforma</label>
                            <div class="platform-grid">
                                <button v-for="platform in PLATFORM_OPTIONS" :key="platform.value" type="button"
                                    class="platform-btn" :class="{ active: form.platform === platform.value }"
                                    @click="form.platform = platform.value">
                                    <span class="platform-label">{{ platform.label }}</span>
                                </button>
                            </div>
                        </div>

                        <div class="actions">
                            <button type="button" class="btn btn-secondary" @click="$emit('close')">
                                Cancelar
                            </button>
                            <button type="submit" :disabled="libraryStore.isLoading || !selectedGame"
                                class="btn btn-primary">
                                {{ libraryStore.isLoading ? 'Adicionando...' : '➕ Adicionar à Biblioteca' }}
                            </button>
                        </div>

                        <p v-if="libraryStore.error" class="error-message">
                            {{ libraryStore.error }}
                        </p>
                    </form>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useLibraryStore, STATUS_OPTIONS, PLATFORM_OPTIONS } from '@/stores/libraryStore';
import { useAuthStore } from '@/stores/authStore';

defineProps<{
    isOpen: boolean;
}>();

const emit = defineEmits(['close', 'added']);

const libraryStore = useLibraryStore();
const authStore = useAuthStore();

const searchQuery = ref('');
const selectedGame = ref<any>(null);
let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

const form = reactive({
    status: 'PLAYING' as string,
    platform: 'PC' as string,
});

const handleSearch = () => {
    if (searchQuery.value.length < 2) {
        libraryStore.clearSearch();
        return;
    }

    if (debounceTimeout) clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        libraryStore.searchGames(searchQuery.value);
    }, 300);
};

const selectGame = (game: any) => {
    selectedGame.value = game;
    searchQuery.value = '';
    libraryStore.clearSearch();
};

const clearSelection = () => {
    selectedGame.value = null;
};

const submitGame = async () => {
    if (!selectedGame.value || !authStore.user) return;

    const success = await libraryStore.addGameToLibrary(
        authStore.user.id,
        selectedGame.value.id,
        form.status,
        form.platform
    );

    if (success) {
        selectedGame.value = null;
        form.status = 'PLAYING';
        form.platform = 'PC';
        emit('added');
        emit('close');
    }
};
</script>

<style scoped>
.modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(6, 6, 12, 0.88);
    backdrop-filter: blur(12px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: var(--space-lg);
    animation: fadeIn 0.2s var(--ease);
}

.modal-container {
    position: relative;
    background: var(--bg-raised);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    max-width: 550px;
    width: 100%;
    max-height: 88vh;
    overflow-y: auto;
    box-shadow:
        0 0 0 1px rgba(0, 0, 0, 0.3),
        0 24px 80px -12px rgba(0, 0, 0, 0.6);
    animation: fadeInUp 0.3s var(--ease);
}

.close-btn {
    position: absolute;
    top: var(--space-md);
    right: var(--space-md);
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text-muted);
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--duration) var(--ease);
    z-index: 10;
}

.close-btn:hover {
    border-color: var(--border-hover);
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.04);
}

.modal-content {
    padding: var(--space-lg);
}

.modal-title {
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 var(--space-lg) 0;
    letter-spacing: -0.02em;
}

.form {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
}

.section {
    position: relative;
}

.section-label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: var(--space-sm);
}

.search-container {
    position: relative;
}

.search-input {
    width: 100%;
    padding: 10px 14px;
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    background: var(--bg-base);
    color: var(--text-primary);
    font-family: var(--font-body);
    font-size: 14px;
    transition: border-color var(--duration) var(--ease);
}

.search-input:focus {
    outline: none;
    border-color: var(--accent);
}

.search-input::placeholder {
    color: var(--text-muted);
}

.search-spinner {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    animation: spin 1s linear infinite;
    color: var(--accent);
    font-size: 16px;
}

.search-results {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: var(--space-sm);
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    list-style: none;
    padding: var(--space-xs);
    max-height: 240px;
    overflow-y: auto;
    z-index: 20;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
}

.search-result-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: var(--space-sm) 10px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: background var(--duration) var(--ease);
}

.search-result-item:hover {
    background: var(--accent-dim);
}

.result-cover {
    width: 38px;
    height: 52px;
    object-fit: cover;
    border-radius: var(--radius-sm);
    flex-shrink: 0;
}

.result-info {
    display: flex;
    flex-direction: column;
}

.result-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
}

.result-year {
    font-size: 12px;
    color: var(--text-muted);
}

.selected-game {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: var(--accent-dim);
    border: 1px solid rgba(167, 139, 250, 0.25);
    border-radius: var(--radius-md);
    margin-top: var(--space-sm);
}

.selected-cover {
    width: 46px;
    height: 62px;
    object-fit: cover;
    border-radius: var(--radius-sm);
    flex-shrink: 0;
}

.selected-info {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.selected-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
}

.selected-year {
    font-size: 12px;
    color: var(--text-muted);
}

.remove-selected {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    border: 1px solid rgba(248, 113, 113, 0.3);
    background: transparent;
    color: var(--status-dropped);
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all var(--duration) var(--ease);
    flex-shrink: 0;
}

.remove-selected:hover {
    background: var(--status-dropped);
    color: white;
    border-color: var(--status-dropped);
}

.status-grid {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
}

.status-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text-secondary);
    font-size: 13px;
    cursor: pointer;
    transition: all var(--duration) var(--ease);
}

.status-btn:hover {
    border-color: var(--border-hover);
    color: var(--text-primary);
}

.status-btn.active {
    border-color: transparent;
    color: white;
}

.platform-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-sm);
}

.platform-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 12px var(--space-sm);
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all var(--duration) var(--ease);
}

.platform-btn:hover {
    border-color: var(--accent);
    color: var(--text-primary);
}

.platform-btn.active {
    border-color: var(--accent);
    background: var(--accent-dim);
    color: var(--text-primary);
}

.platform-icon {
    font-size: 20px;
}

.platform-label {
    font-size: 11px;
    text-align: center;
}

.actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-sm);
    margin-top: var(--space-sm);
}

.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 9px 18px;
    border-radius: var(--radius-md);
    font-size: 13px;
    font-weight: 500;
    border: 1px solid transparent;
    transition: all var(--duration) var(--ease);
    white-space: nowrap;
    line-height: 1;
}

.btn-primary {
    background: var(--accent);
    color: var(--bg-base);
    border-color: var(--accent);
}

.btn-primary:hover:not(:disabled) {
    background: #b89dfc;
    box-shadow: 0 0 20px var(--accent-glow);
}

.btn-primary:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.btn-secondary {
    background: transparent;
    color: var(--text-secondary);
    border-color: var(--border);
}

.btn-secondary:hover {
    border-color: var(--border-hover);
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.03);
}

.error-message {
    background: rgba(248, 113, 113, 0.08);
    border: 1px solid rgba(248, 113, 113, 0.3);
    color: var(--status-dropped);
    padding: 12px;
    border-radius: var(--radius-md);
    font-size: 13px;
    text-align: center;
}

@media (max-width: 480px) {
    .platform-grid {
        grid-template-columns: repeat(3, 1fr);
    }

    .actions {
        flex-direction: column;
    }

    .actions .btn {
        width: 100%;
    }
}
</style>
