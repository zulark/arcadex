<template>
  <div 
    class="card" 
    :class="{ 'card--interactive': isOwner }"
    @click="$emit('click')"
  >
    <div class="card__cover">
      <img 
        :src="game.games?.cover_url || '/placeholder-game.png'" 
        :alt="game.games?.title" 
        class="card__img"
        loading="lazy"
      />

      <span class="card__status" :style="{ '--status-color': statusColor }">
        {{ statusLabel }}
      </span>

      <div class="card__overlay">
        <div class="card__overlay-inner">
          <div v-if="game.rating" class="card__rating">
            <span v-for="i in 5" :key="i" class="card__star" :class="{ active: i <= game.rating }">★</span>
          </div>
          <span v-if="game.playtime_minutes" class="card__playtime">
            {{ formatPlaytime(game.playtime_minutes) }}
          </span>
          <span v-if="game.platform" class="card__platform">{{ game.platform }}</span>
        </div>
      </div>
    </div>

    <p class="card__title">{{ game.games?.title || '…' }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { STATUS_OPTIONS, type LibraryItem } from '@/stores/libraryStore';

const props = defineProps<{
  game: LibraryItem;
  isOwner?: boolean;
}>();

defineEmits(['click']);

const statusOption = computed(() =>
  STATUS_OPTIONS.find(s => s.value === props.game.status) || STATUS_OPTIONS[0]
);

const statusColor = computed(() => statusOption.value.color);
const statusLabel = computed(() => statusOption.value.label);

const formatPlaytime = (minutes: number) => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h`;
};
</script>

<style scoped>
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card--interactive {
  cursor: pointer;
}

.card__cover {
  position: relative;
  aspect-ratio: 3 / 4;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--bg-surface);
}

.card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s var(--ease), filter 0.5s var(--ease);
  will-change: transform;
}

.card:hover .card__img {
  transform: scale(1.04);
}

.card__cover::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: var(--radius-md);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06);
  transition: box-shadow 0.4s var(--ease);
  pointer-events: none;
  z-index: 2;
}

.card:hover .card__cover::after {
  box-shadow:
    inset 0 0 0 1px rgba(255,255,255,0.1),
    0 8px 40px -8px rgba(167, 139, 250, 0.15);
}

.card__status {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 3;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-primary);
  background: rgba(13, 13, 20, 0.75);
  backdrop-filter: blur(8px);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  border-left: 2px solid var(--status-color);
  line-height: 1;
}

.card__overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: flex-end;
  opacity: 0;
  transition: opacity 0.35s var(--ease);
  pointer-events: none;
  background: linear-gradient(
    0deg,
    rgba(13, 13, 20, 0.9) 0%,
    rgba(13, 13, 20, 0.3) 40%,
    transparent 70%
  );
}

.card:hover .card__overlay {
  opacity: 1;
}

.card__overlay-inner {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.card__rating {
  display: flex;
  gap: 1px;
}

.card__star {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1;
}

.card__star.active {
  color: var(--status-backlog);
}

.card__playtime {
  font-size: 11px;
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
}

.card__platform {
  font-size: 10px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.card__title {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color var(--duration) var(--ease);
  line-height: 1.3;
}

.card:hover .card__title {
  color: var(--text-primary);
}
</style>
