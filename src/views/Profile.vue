<template>
  <div class="profile">
    <div v-if="profileStore.loading" class="profile__loading">
      <div class="spinner"></div>
    </div>

    <div v-else-if="profileStore.userNotFound" class="profile__empty">
      <h1>Profile not found</h1>
      <p>The user <strong>"{{ routeUsername }}"</strong> doesn't exist.</p>
      <router-link to="/" class="btn btn-ghost">← Back</router-link>
    </div>

    <template v-else>

      <header class="hero">
        <div
          class="hero__bg"
          :style="heroBgStyle"
        ></div>
        <div class="hero__vignette"></div>

        <div class="hero__content">
          <div class="hero__avatar-wrap">
            <img
              :src="profileStore.profile?.avatar_url || defaultAvatar"
              :alt="profileStore.profile?.username"
              class="hero__avatar"
            />
            <span v-if="profileStore.profile?.steam_id" class="hero__badge" title="Steam linked">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.936 3.592 9.042 8.3 9.85l4.065-5.845a3.5 3.5 0 114.134-4.134L22 8.3C20.98 4.757 16.807 2 12 2z"/></svg>
            </span>
          </div>

          <div class="hero__info">
            <h1 class="hero__username">{{ profileStore.profile?.username }}</h1>
            <p v-if="profileStore.profile?.bio" class="hero__bio">{{ profileStore.profile.bio }}</p>
            <span class="hero__meta">
              Member since {{ formatDate(profileStore.profile?.created_at) }}
            </span>
          </div>

          <div class="hero__actions">
            <template v-if="isOwner">
              <button class="btn btn-ghost" @click="showEditProfile = true">Edit Profile</button>
              <button class="btn btn-steam" @click="showSteamModal = true">
                {{ profileStore.profile?.steam_id ? 'Steam Linked' : 'Link Steam' }}
              </button>
              <button class="btn btn-ghost" @click="authStore.signOut">Sign Out</button>
            </template>
            <template v-else>
              <button class="btn btn-accent">Follow</button>
              <button class="btn btn-ghost">Compare</button>
            </template>
          </div>
        </div>
      </header>

      <section class="stats fade-in-up" style="animation-delay: 0.1s">
        <div class="stats__inner">
          <div class="stats__item" v-for="stat in statsData" :key="stat.label">
            <span class="stats__value">{{ stat.display.value }}</span>
            <span class="stats__label">{{ stat.label }}</span>
          </div>
        </div>
      </section>

      <section class="library fade-in-up" style="animation-delay: 0.2s">
        <div class="library__toolbar">
          <nav class="library__tabs">
            <button
              v-for="tab in filterOptions"
              :key="tab.value"
              class="library__tab"
              :class="{ active: activeFilter === tab.value }"
              @click="activeFilter = tab.value"
            >
              {{ tab.label }}
              <span class="library__tab-count">{{ getFilterCount(tab.value) }}</span>
            </button>
          </nav>

          <div class="library__controls">
            <select v-model="sortBy" class="field-select library__sort">
              <option value="updated_at">Recent</option>
              <option value="rating">Rating</option>
              <option value="title">Title</option>
              <option value="playtime">Playtime</option>
            </select>

            <button v-if="isOwner" class="btn btn-accent" @click="showAddModal = true">
              + Add Game
            </button>
          </div>
        </div>

        <div v-if="libraryStore.isLoading" class="library__loading">
          <div class="spinner"></div>
        </div>

        <div v-else-if="filteredGames.length === 0" class="library__empty">
          <p>No games yet.</p>
          <button v-if="isOwner" class="btn btn-ghost" @click="showAddModal = true">
            Add your first game
          </button>
        </div>

        <div v-else class="library__grid stagger">
          <GameCard
            v-for="game in filteredGames"
            :key="game.id"
            :game="game"
            :is-owner="isOwner"
            @click="openGameDetail(game)"
          />
        </div>
      </section>

      <section v-if="recentReviews.length > 0" class="reviews fade-in-up" style="animation-delay: 0.3s">
        <h2 class="reviews__heading">Recent Reviews</h2>
        <div class="reviews__list">
          <article v-for="review in recentReviews" :key="review.id" class="review">
            <img
              :src="review.games?.cover_url || '/placeholder-game.png'"
              :alt="review.games?.title"
              class="review__cover"
            />
            <div class="review__body">
              <div class="review__top">
                <h4 class="review__game">{{ review.games?.title }}</h4>
                <div class="review__stars">
                  <span v-for="i in 5" :key="i" class="review__star" :class="{ active: i <= (review.rating || 0) }">★</span>
                </div>
              </div>
              <p class="review__text">{{ review.review }}</p>
              <span class="review__date">{{ formatDate(review.updated_at) }}</span>
            </div>
          </article>
        </div>
      </section>

    </template>

    <AddGameModal
      :is-open="showAddModal"
      @close="showAddModal = false"
      @added="handleGameAdded"
    />

    <GameDetailModal
      :is-open="showDetailModal"
      :game="selectedGame"
      @close="closeGameDetail"
      @saved="handleGameSaved"
      @deleted="handleGameDeleted"
    />

    <Teleport to="body">
      <div v-if="showEditProfile" class="modal-backdrop" @click.self="showEditProfile = false">
        <div class="modal-panel modal-panel-sm">
          <button class="modal-close" @click="showEditProfile = false">✕</button>
          <div class="modal-body">
            <h2 class="modal-title">Edit Profile</h2>
            <form @submit.prevent="saveProfile" class="form-stack">
              <div>
                <label class="field-label">Bio</label>
                <textarea
                  v-model="editForm.bio"
                  placeholder="A few words about yourself…"
                  rows="4"
                  class="field-textarea"
                ></textarea>
              </div>
              <div>
                <label class="field-label">Avatar URL</label>
                <input
                  type="url"
                  v-model="editForm.avatar_url"
                  placeholder="https://..."
                  class="field-input"
                />
              </div>
              <div class="form-actions">
                <button type="button" class="btn btn-ghost" @click="showEditProfile = false">Cancel</button>
                <button type="submit" class="btn btn-accent">Save</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showSteamModal" class="modal-backdrop" @click.self="showSteamModal = false">
        <div class="modal-panel modal-panel-sm">
          <button class="modal-close" @click="showSteamModal = false">✕</button>
          <div class="modal-body">
            <h2 class="modal-title">Steam Integration</h2>

            <div v-if="profileStore.profile?.steam_id" class="steam-linked-view">
              <p class="steam-linked-view__status">
                <span class="steam-linked-view__dot"></span>
                Connected · <code>{{ profileStore.profile.steam_id }}</code>
              </p>
              <div class="steam-linked-view__actions">
                <button
                  class="btn btn-steam"
                  @click="syncLibrary"
                  :disabled="profileStore.steamSyncLoading"
                >
                  {{ profileStore.steamSyncLoading ? 'Syncing…' : 'Sync Library' }}
                </button>
                <button class="btn btn-danger" @click="unlinkSteam">Unlink</button>
              </div>
            </div>

            <div v-else class="form-stack">
              <p class="steam-intro">
                Link your Steam account to automatically import your game library.
              </p>
              <div>
                <label class="field-label">Steam ID (64-bit)</label>
                <input
                  type="text"
                  v-model="steamIdInput"
                  placeholder="76561198xxxxxxxxx"
                  maxlength="17"
                  class="field-input"
                />
                <small class="field-hint">
                  Find yours at <a href="https://steamid.io" target="_blank">steamid.io</a>
                </small>
              </div>
              <p v-if="profileStore.steamSyncError" class="field-error">
                {{ profileStore.steamSyncError }}
              </p>
              <button
                class="btn btn-steam"
                style="width: 100%; justify-content: center"
                @click="linkSteam"
                :disabled="profileStore.steamSyncLoading || steamIdInput.length !== 17"
              >
                {{ profileStore.steamSyncLoading ? 'Linking…' : 'Link Steam Account' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, reactive } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useProfileStore } from '@/stores/profileStore';
import { useLibraryStore, type LibraryItem } from '@/stores/libraryStore';
import { useCountUp } from '@/composables/useCountUp';
import GameCard from '@/components/GameCard.vue';
import GameDetailModal from '@/components/GameDetailModal.vue';
import AddGameModal from '@/components/AddGameModal.vue';

const route = useRoute();
const authStore = useAuthStore();
const profileStore = useProfileStore();
const libraryStore = useLibraryStore();

const routeUsername = computed(() => route.params.username as string);
const loggedUsername = computed(() => authStore.user?.user_metadata?.username);
const isOwner = computed(() => routeUsername.value === loggedUsername.value);

const showAddModal = ref(false);
const showDetailModal = ref(false);
const showEditProfile = ref(false);
const showSteamModal = ref(false);
const selectedGame = ref<LibraryItem | null>(null);
const activeFilter = ref('all');
const sortBy = ref('updated_at');
const steamIdInput = ref('');

const editForm = reactive({ bio: '', avatar_url: '' });

const defaultAvatar = computed(() =>
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=' + routeUsername.value
);

const heroBgStyle = computed(() => {
  const items = libraryStore.libraryItems;
  const featured = items.find(i => i.status === 'PLAYING') || items.find(i => i.status === 'COMPLETED') || items[0];
  const url = featured?.games?.cover_url;
  if (!url) return {};
  return { backgroundImage: `url(${url})` };
});

const totalCount = useCountUp(() => libraryStore.stats.total);
const completedCount = useCountUp(() => libraryStore.stats.completed);
const playingCount = useCountUp(() => libraryStore.stats.playing);
const hoursCount = useCountUp(() => Math.floor(libraryStore.stats.totalPlaytime / 60));
const avgRating = computed(() => libraryStore.stats.averageRating.toFixed(1));

const statsData = computed(() => [
  { label: 'Games', display: totalCount },
  { label: 'Completed', display: completedCount },
  { label: 'Playing', display: playingCount },
  { label: 'Hours', display: hoursCount },
  { label: 'Avg ★', display: avgRating },
]);

const filterOptions = [
  { value: 'all', label: 'All' },
  { value: 'PLAYING', label: 'Playing' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'BACKLOG', label: 'Backlog' },
  { value: 'WISHLIST', label: 'Wishlist' },
  { value: 'DROPPED', label: 'Dropped' },
];

const filteredGames = computed(() => {
  let games = [...libraryStore.libraryItems];
  if (activeFilter.value !== 'all') {
    games = games.filter(g => g.status === activeFilter.value);
  }
  switch (sortBy.value) {
    case 'rating': games.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
    case 'title': games.sort((a, b) => (a.games?.title || '').localeCompare(b.games?.title || '')); break;
    case 'playtime': games.sort((a, b) => (b.playtime_minutes || 0) - (a.playtime_minutes || 0)); break;
    default: games.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }
  return games;
});

const recentReviews = computed(() =>
  libraryStore.libraryItems
    .filter(g => g.review && g.review.trim().length > 0)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 3)
);

const getFilterCount = (f: string) =>
  f === 'all' ? libraryStore.libraryItems.length : libraryStore.libraryItems.filter(g => g.status === f).length;

const formatDate = (d: string | undefined) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
};

const openGameDetail = (game: LibraryItem) => {
  if (!isOwner.value) return;
  selectedGame.value = game;
  showDetailModal.value = true;
};

const closeGameDetail = () => { showDetailModal.value = false; selectedGame.value = null; };
const handleGameAdded = () => {};
const handleGameSaved = () => {};
const handleGameDeleted = () => { closeGameDetail(); };

const saveProfile = async () => {
  const success = await profileStore.updateProfile({
    bio: editForm.bio || null,
    avatar_url: editForm.avatar_url || null,
  });
  if (success) showEditProfile.value = false;
};

const linkSteam = async () => {
  const success = await profileStore.linkSteamAccount(steamIdInput.value);
  if (success) steamIdInput.value = '';
};

const unlinkSteam = async () => {
  if (confirm('Unlink your Steam account?')) await profileStore.unlinkSteamAccount();
};

const syncLibrary = async () => {
  await profileStore.syncSteamLibrary();
  if (profileStore.profile?.id) await libraryStore.fetchLibrary(profileStore.profile.id);
};

watch(() => route.params.username, async (u) => {
  if (u) {
    await profileStore.fetchProfile(u as string);
    if (profileStore.profile?.id) await libraryStore.fetchLibrary(profileStore.profile.id);
  }
});

watch(() => profileStore.profile, (p) => {
  if (p) { editForm.bio = p.bio || ''; editForm.avatar_url = p.avatar_url || ''; }
}, { immediate: true });

onMounted(async () => {
  await profileStore.fetchProfile(routeUsername.value);
  if (profileStore.profile?.id) await libraryStore.fetchLibrary(profileStore.profile.id);
});
</script>

<style scoped>

.profile {
  min-height: 100vh;
}

.profile__loading,
.profile__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: var(--space-md);
  color: var(--text-secondary);
}

.profile__empty h1 { font-family: var(--font-display); font-size: 22px; color: var(--text-primary); }
.profile__empty p  { color: var(--text-muted); }

.spinner {
  width: 32px;
  height: 32px;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.hero {
  position: relative;
  padding: 0 0 var(--space-xl);
  overflow: hidden;
}

.hero__bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center 20%;
  filter: blur(50px) saturate(0.5) brightness(0.35);
  transform: scale(1.3); 
  z-index: 0;
}

.hero__vignette {
  position: absolute;
  inset: 0;
  z-index: 1;
  background:
    radial-gradient(ellipse at 30% 0%, transparent 0%, var(--bg-base) 70%),
    linear-gradient(to bottom, transparent 30%, var(--bg-base) 100%);
}

.hero__content {
  position: relative;
  z-index: 2;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 80px var(--space-lg) 0;
  display: flex;
  align-items: flex-end;
  gap: var(--space-lg);
  flex-wrap: wrap;
  animation: fadeInUp 0.6s var(--ease) both;
}

.hero__avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.hero__avatar {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--bg-base);
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.06),
    0 12px 40px -8px rgba(0,0,0,0.5);
}

.hero__badge {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 24px;
  height: 24px;
  background: #1b2838;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--bg-base);
  color: #66c0f4;
}

.hero__info {
  flex: 1;
  min-width: 220px;
  padding-bottom: 4px;
}

.hero__username {
  font-family: var(--font-display);
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.1;
  margin: 0 0 6px;
}

.hero__bio {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 4px;
  max-width: 480px;
}

.hero__meta {
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.hero__actions {
  display: flex;
  gap: var(--space-sm);
  flex-wrap: wrap;
  padding-bottom: 4px;
}

.stats {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: var(--space-lg) var(--space-lg) 0;
}

.stats__inner {
  display: flex;
  align-items: center;
}

.stats__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--space-md) 0;
  position: relative;
}

.stats__item + .stats__item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 20%;
  height: 60%;
  width: 1px;
  background: var(--border);
}

.stats__value {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.stats__label {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-top: 6px;
}

.library {
  max-width: var(--max-width);
  margin: var(--space-xl) auto 0;
  padding: 0 var(--space-lg) var(--space-2xl);
}

.library__toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
  border-bottom: 1px solid var(--border);
  padding-bottom: var(--space-md);
}

.library__tabs {
  display: flex;
  gap: var(--space-lg);
}

.library__tab {
  position: relative;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 500;
  padding: 0 0 var(--space-md);
  cursor: pointer;
  transition: color var(--duration) var(--ease);
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: -1px;
}

.library__tab::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--accent);
  border-radius: 1px;
  transform: scaleX(0);
  transition: transform var(--duration) var(--ease);
}

.library__tab:hover {
  color: var(--text-secondary);
}

.library__tab.active {
  color: var(--text-primary);
}

.library__tab.active::after {
  transform: scaleX(1);
}

.library__tab-count {
  font-size: 11px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

.library__tab.active .library__tab-count {
  color: var(--accent);
}

.library__controls {
  display: flex;
  gap: var(--space-sm);
  align-items: center;
}

.library__sort {
  max-width: 140px;
  padding: 8px 12px;
  font-size: 13px;
}

.library__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(155px, 1fr));
  gap: var(--space-lg);
}

.library__loading {
  display: flex;
  justify-content: center;
  padding: var(--space-2xl);
}

.library__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-2xl) 0;
  color: var(--text-muted);
}

.reviews {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 var(--space-lg) var(--space-2xl);
}

.reviews__heading {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0 0 var(--space-lg);
  color: var(--text-primary);
}

.reviews__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.review {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  transition: border-color var(--duration) var(--ease);
}

.review:hover {
  border-color: var(--border-hover);
}

.review__cover {
  width: 52px;
  height: 70px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.review__body {
  flex: 1;
  min-width: 0;
}

.review__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.review__game {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.review__stars {
  display: flex;
  gap: 1px;
}

.review__star {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1;
}

.review__star.active {
  color: var(--status-backlog);
}

.review__text {
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.55;
  margin: 0 0 6px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.review__date {
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.form-stack {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
  margin-top: var(--space-sm);
}

.field-hint {
  display: block;
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
}

.field-hint a { color: var(--accent); }

.field-error {
  font-size: 13px;
  color: var(--status-dropped);
  margin: 0;
}

.steam-intro {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

.steam-linked-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.steam-linked-view__status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-secondary);
}

.steam-linked-view__status code {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 12px;
  color: var(--text-muted);
}

.steam-linked-view__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--status-playing);
  box-shadow: 0 0 6px var(--status-playing);
  flex-shrink: 0;
}

.steam-linked-view__actions {
  display: flex;
  gap: var(--space-sm);
}

@media (max-width: 768px) {
  .hero__content {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding-top: 56px;
  }

  .hero__info { text-align: center; }
  .hero__actions { justify-content: center; }

  .stats__inner {
    flex-wrap: wrap;
  }

  .stats__item {
    flex: 0 0 33.33%;
  }

  .stats__item + .stats__item::before {
    display: none;
  }

  .library__toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .library__tabs {
    overflow-x: auto;
    gap: var(--space-md);
    padding-bottom: var(--space-sm);
  }

  .library__controls {
    justify-content: space-between;
  }

  .library__grid {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: var(--space-md);
  }
}

@media (max-width: 480px) {
  .stats__item {
    flex: 0 0 50%;
  }

  .library__tabs {
    gap: var(--space-sm);
  }
}
</style>