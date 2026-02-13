<template>
    <Teleport to="body">
        <div v-if="isOpen && game" class="modal-backdrop" @click.self="$emit('close')">
            <div class="modal-container">
                <button class="close-btn" @click="$emit('close')">✕</button>

                <div class="modal-content">
                    <div class="game-header">
                        <img :src="game.games?.cover_url || '/placeholder-game.png'" :alt="game.games?.title"
                            class="game-cover" />
                        <div class="game-info">
                            <h2 class="game-title">{{ game.games?.title }}</h2>
                            <p class="game-year" v-if="game.games?.release_date">
                                {{ game.games.release_date.split('-')[0] }}
                            </p>

                            <div v-if="game.games?.steam_app_id" class="steam-badge">
                                <span class="steam-icon">🎮</span>
                                <span>Disponível na Steam</span>
                            </div>
                        </div>
                    </div>

                    <div class="section">
                        <label class="section-label">Sua Avaliação</label>
                        <div class="rating-input">
                            <button v-for="i in 5" :key="i" class="star-btn"
                                :class="{ filled: i <= (form.rating || 0), hovered: i <= hoverRating }"
                                @click="form.rating = form.rating === i ? null : i" @mouseenter="hoverRating = i"
                                @mouseleave="hoverRating = 0">
                                ★
                            </button>
                            <span class="rating-text" v-if="form.rating">{{ ratingLabels[form.rating - 1] }}</span>
                        </div>
                    </div>

                    <div class="section grid-2">
                        <div>
                            <label class="section-label">Status</label>
                            <select v-model="form.status" class="select-input">
                                <option v-for="s in STATUS_OPTIONS" :key="s.value" :value="s.value">
                                    {{ s.label }}
                                </option>
                            </select>
                        </div>
                        <div>
                            <label class="section-label">Plataforma</label>
                            <select v-model="form.platform" class="select-input">
                                <option v-for="p in PLATFORM_OPTIONS" :key="p.value" :value="p.value">
                                    {{ p.label }}
                                </option>
                            </select>
                        </div>
                    </div>

                    <div class="section">
                        <label class="section-label">Tempo de Jogo</label>
                        <div class="playtime-input">
                            <div class="time-field">
                                <input type="number" v-model.number="playtimeHours" min="0" class="number-input"
                                    placeholder="0" />
                                <span class="time-label">horas</span>
                            </div>
                            <div class="time-field">
                                <input type="number" v-model.number="playtimeMinutes" min="0" max="59"
                                    class="number-input" placeholder="0" />
                                <span class="time-label">minutos</span>
                            </div>
                        </div>
                    </div>

                    <div class="section grid-2">
                        <div>
                            <label class="section-label">Começou em</label>
                            <input type="date" v-model="form.started_at" class="date-input" />
                        </div>
                        <div>
                            <label class="section-label">Terminou em</label>
                            <input type="date" v-model="form.finished_at" class="date-input" />
                        </div>
                    </div>

                    <div class="section">
                        <label class="section-label">Review</label>
                        <textarea v-model="form.review" class="review-input"
                            placeholder="O que você achou do jogo? (opcional)" rows="4"></textarea>
                    </div>

                    <div class="actions">
                        <button class="btn btn-danger" @click="handleDelete">
                            🗑️ Remover
                        </button>
                        <div class="actions-right">
                            <button class="btn btn-secondary" @click="$emit('close')">
                                Cancelar
                            </button>
                            <button class="btn btn-primary" @click="handleSave" :disabled="isLoading">
                                {{ isLoading ? 'Salvando...' : '💾 Salvar' }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue';
import { useLibraryStore, STATUS_OPTIONS, PLATFORM_OPTIONS, type LibraryItem } from '@/stores/libraryStore';

const props = defineProps<{
    isOpen: boolean;
    game: LibraryItem | null;
}>();

const emit = defineEmits(['close', 'saved', 'deleted']);

const libraryStore = useLibraryStore();
const isLoading = ref(false);
const hoverRating = ref(0);

const ratingLabels = ['Terrível', 'Ruim', 'Ok', 'Bom', 'Excelente'];

const form = reactive({
    status: 'PLAYING' as string,
    platform: 'PC' as string,
    rating: null as number | null,
    review: '' as string,
    started_at: '' as string,
    finished_at: '' as string,
    playtime_minutes: 0 as number,
});

const playtimeHours = computed({
    get: () => Math.floor((form.playtime_minutes || 0) / 60),
    set: (val) => {
        form.playtime_minutes = (val || 0) * 60 + (form.playtime_minutes % 60);
    }
});

const playtimeMinutes = computed({
    get: () => (form.playtime_minutes || 0) % 60,
    set: (val) => {
        form.playtime_minutes = Math.floor((form.playtime_minutes || 0) / 60) * 60 + (val || 0);
    }
});

watch(() => props.game, (newGame) => {
    if (newGame) {
        form.status = newGame.status;
        form.platform = newGame.platform;
        form.rating = newGame.rating;
        form.review = newGame.review || '';
        form.started_at = newGame.started_at || '';
        form.finished_at = newGame.finished_at || '';
        form.playtime_minutes = newGame.playtime_minutes || 0;
    }
}, { immediate: true });

const handleSave = async () => {
    if (!props.game) return;

    isLoading.value = true;
    const success = await libraryStore.updateLibraryItem(props.game.id, {
        status: form.status,
        platform: form.platform,
        rating: form.rating,
        review: form.review || null,
        started_at: form.started_at || null,
        finished_at: form.finished_at || null,
        playtime_minutes: form.playtime_minutes,
        updated_at: new Date().toISOString(),
    });
    isLoading.value = false;

    if (success) {
        emit('saved');
        emit('close');
    }
};

const handleDelete = async () => {
    if (!props.game) return;

    const confirmed = window.confirm(`Tem certeza que deseja remover "${props.game.games?.title}" da sua biblioteca?`);
    if (!confirmed) return;

    isLoading.value = true;
    const success = await libraryStore.removeLibraryItem(props.game.id);
    isLoading.value = false;

    if (success) {
        emit('deleted');
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
    max-width: 600px;
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

.game-header {
    display: flex;
    gap: var(--space-lg);
    margin-bottom: var(--space-lg);
}

.game-cover {
    width: 120px;
    height: 160px;
    object-fit: cover;
    border-radius: var(--radius-md);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    flex-shrink: 0;
}

.game-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.game-title {
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 4px 0;
    letter-spacing: -0.02em;
}

.game-year {
    font-size: 13px;
    color: var(--text-muted);
    margin: 0 0 12px 0;
}

.steam-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(102, 192, 244, 0.08);
    border: 1px solid rgba(102, 192, 244, 0.15);
    padding: 5px 10px;
    border-radius: var(--radius-sm);
    font-size: 11px;
    font-weight: 500;
    color: #66c0f4;
    width: fit-content;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

.section {
    margin-bottom: var(--space-lg);
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

.grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-md);
}

.rating-input {
    display: flex;
    align-items: center;
    gap: 4px;
}

.star-btn {
    background: none;
    border: none;
    font-size: 26px;
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.15s var(--ease);
    padding: 0;
    line-height: 1;
}

.star-btn.filled,
.star-btn.hovered {
    color: var(--status-backlog);
    transform: scale(1.1);
}

.rating-text {
    margin-left: 12px;
    font-size: 13px;
    color: var(--status-backlog);
    font-weight: 500;
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
    padding: 7px 12px;
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

.select-input,
.date-input {
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

.select-input:focus,
.date-input:focus {
    outline: none;
    border-color: var(--accent);
}

.playtime-input {
    display: flex;
    gap: var(--space-md);
}

.time-field {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
}

.number-input {
    width: 80px;
    padding: 10px 12px;
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    background: var(--bg-base);
    color: var(--text-primary);
    font-family: var(--font-body);
    font-size: 14px;
    text-align: center;
    transition: border-color var(--duration) var(--ease);
}

.number-input:focus {
    outline: none;
    border-color: var(--accent);
}

.time-label {
    color: var(--text-muted);
    font-size: 13px;
}

.review-input {
    width: 100%;
    padding: 12px 14px;
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    background: var(--bg-base);
    color: var(--text-primary);
    font-family: var(--font-body);
    font-size: 14px;
    resize: vertical;
    min-height: 100px;
    line-height: 1.55;
    transition: border-color var(--duration) var(--ease);
}

.review-input:focus {
    outline: none;
    border-color: var(--accent);
}

.review-input::placeholder {
    color: var(--text-muted);
}

.actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: var(--space-lg);
    padding-top: var(--space-lg);
    border-top: 1px solid var(--border);
}

.actions-right {
    display: flex;
    gap: var(--space-sm);
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

.btn-danger {
    background: transparent;
    color: var(--status-dropped);
    border-color: rgba(248, 113, 113, 0.3);
}

.btn-danger:hover {
    background: var(--status-dropped);
    color: white;
    border-color: var(--status-dropped);
}

@media (max-width: 480px) {
    .game-header {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .grid-2 {
        grid-template-columns: 1fr;
    }

    .actions {
        flex-direction: column-reverse;
        gap: var(--space-sm);
    }

    .actions-right {
        width: 100%;
        justify-content: flex-end;
    }
}
</style>
