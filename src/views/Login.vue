<template>
  <div class="auth-page">
    <!-- Infinite scrolling game cover rows background -->
    <div class="auth-bg">
      <div class="auth-bg__rows">
        <div
          v-for="(row, ri) in coverRows"
          :key="ri"
          class="auth-bg__row"
          :class="{ 'auth-bg__row--reverse': ri % 2 === 1 }"
          :style="{ animationDuration: `${40 + ri * 8}s` }"
        >
          <img
            v-for="(cover, ci) in row"
            :key="ci"
            :src="cover"
            alt=""
            class="auth-bg__cover"
          />
          <!-- Duplicate for seamless loop -->
          <img
            v-for="(cover, ci) in row"
            :key="'dup-' + ci"
            :src="cover"
            alt=""
            class="auth-bg__cover"
          />
        </div>
      </div>
      <div class="auth-bg__blur"></div>
    </div>

    <!-- Login Card -->
    <div class="auth-card fade-in-up">
      <div class="auth-card__header">
        <h1 class="auth-card__logo">Arcadex</h1>
        <p class="auth-card__subtitle">Sign in to your account</p>
      </div>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="auth-field">
          <label for="email" class="field-label">Email</label>
          <input
            v-model="form.email"
            type="email"
            name="email"
            id="email"
            autocomplete="username"
            required
            class="field-input"
          />
        </div>

        <div class="auth-field">
          <label for="password" class="field-label">Password</label>
          <input
            v-model="form.password"
            type="password"
            name="password"
            id="password"
            autocomplete="current-password"
            required
            placeholder="••••••••"
            class="field-input"
          />
        </div>

        <button type="submit" class="btn btn-accent auth-submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Signing in…' : 'Sign In' }}
        </button>

        <p v-if="authStore.errorMessage" class="auth-error">
          {{ authStore.errorMessage }}
        </p>
      </form>

      <div class="auth-card__footer">
        <span class="auth-card__footer-text">Don't have an account?</span>
        <RouterLink to="/register" class="auth-card__footer-link">Create one</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();
const isSubmitting = ref(false);

const form = ref({
  email: '',
  password: '',
});

const handleLogin = async () => {
  isSubmitting.value = true;
  await authStore.loginUser(form.value.email, form.value.password);
  isSubmitting.value = false;
};

// 30 curated game covers for the background mosaic
const allCovers = [
  'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.webp',
  'https://images.igdb.com/igdb/image/upload/t_cover_big/co5s5v.webp',
  'https://images.igdb.com/igdb/image/upload/t_cover_big/co1tmu.webp',
  'https://images.igdb.com/igdb/image/upload/t_cover_big/co2ed4.webp',
  'https://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.webp',
  'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.webp',
  'https://images.igdb.com/igdb/image/upload/t_cover_big/co5w3k.webp',
  'https://images.igdb.com/igdb/image/upload/t_cover_big/co2t98.webp',
  'https://images.igdb.com/igdb/image/upload/t_cover_big/co3p2d.webp',
  'https://images.igdb.com/igdb/image/upload/t_cover_big/co1rgi.webp',
  'https://images.igdb.com/igdb/image/upload/t_cover_big/co4walz.webp',
  'https://images.igdb.com/igdb/image/upload/t_cover_big/co49wj.webp',
  'https://images.igdb.com/igdb/image/upload/t_cover_big/co1rcb.webp',
  'https://images.igdb.com/igdb/image/upload/t_cover_big/co2t7t.webp',
  'https://images.igdb.com/igdb/image/upload/t_cover_big/co1rs4.webp',
  'https://images.igdb.com/igdb/image/upload/t_cover_big/co4hk0.webp',
  'https://images.igdb.com/igdb/image/upload/t_cover_big/co4gss.webp',
  'https://images.igdb.com/igdb/image/upload/t_cover_big/co6boo.webp',
  'https://images.igdb.com/igdb/image/upload/t_cover_big/co20g3.webp',
  'https://images.igdb.com/igdb/image/upload/t_cover_big/co3wk3.webp',
  'https://images.igdb.com/igdb/image/upload/t_cover_big/co2mjs.webp',
  'https://images.igdb.com/igdb/image/upload/t_cover_big/co5vst.webp',
  'https://images.igdb.com/igdb/image/upload/t_cover_big/co7kni.webp',
  'https://images.igdb.com/igdb/image/upload/t_cover_big/co1nmk.webp',
  'https://images.igdb.com/igdb/image/upload/t_cover_big/co2iyn.webp',
  'https://images.igdb.com/igdb/image/upload/t_cover_big/co3khj.webp',
  'https://images.igdb.com/igdb/image/upload/t_cover_big/co5tcl.webp',
  'https://images.igdb.com/igdb/image/upload/t_cover_big/co5xex.webp',
  'https://images.igdb.com/igdb/image/upload/t_cover_big/co2dw1.webp',
  'https://images.igdb.com/igdb/image/upload/t_cover_big/co1rrw.webp',
];

// Split covers into 8 rows of 6 each (cycling through the pool)
const coverRows = computed(() => {
  const rows: string[][] = [];
  const perRow = 6;
  const totalRows = 8;
  for (let i = 0; i < totalRows; i++) {
    const row: string[] = [];
    for (let j = 0; j < perRow; j++) {
      row.push(allCovers[(i * perRow + j) % allCovers.length]!);
    }
    rows.push(row);
  }
  return rows;
});
</script>

<style scoped>
.auth-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg);
  overflow: hidden;
}

/* ============================================================
   BACKGROUND — infinite horizontal scrolling cover rows
   ============================================================ */
.auth-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}

.auth-bg__rows {
  position: absolute;
  inset: -200px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  justify-content: center;
  transform: rotate(-4deg) scale(1.35);
}

.auth-bg__row {
  display: flex;
  gap: 6px;
  width: max-content;
  animation: scrollLeft 50s linear infinite;
}

.auth-bg__row--reverse {
  animation-name: scrollRight;
}

.auth-bg__cover {
  height: 160px;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  border-radius: var(--radius-sm);
  opacity: 0.55;
  flex-shrink: 0;
}

@keyframes scrollLeft {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

@keyframes scrollRight {
  0% { transform: translateX(-50%); }
  100% { transform: translateX(0); }
}

.auth-bg__blur {
  position: absolute;
  inset: 0;
  backdrop-filter: blur(10px) saturate(0.35) brightness(0.5);
  -webkit-backdrop-filter: blur(10px) saturate(0.35) brightness(0.5);
  z-index: 1;
}

/* ============================================================
   AUTH CARD
   ============================================================ */
.auth-card {
  position: relative;
  z-index: 3;
  background: var(--bg-raised);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  width: 100%;
  max-width: 400px;
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.3),
    0 24px 80px -12px rgba(0, 0, 0, 0.6);
}

.auth-card__header {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.auth-card__logo {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.04em;
  margin: 0 0 var(--space-sm);
}

.auth-card__subtitle {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.auth-field {
  display: flex;
  flex-direction: column;
}

.auth-submit {
  width: 100%;
  justify-content: center;
  padding: 12px;
  font-size: 14px;
  font-weight: 600;
  margin-top: var(--space-sm);
}

.auth-error {
  background: rgba(248, 113, 113, 0.08);
  border: 1px solid rgba(248, 113, 113, 0.25);
  color: var(--status-dropped);
  padding: 10px 14px;
  border-radius: var(--radius-md);
  font-size: 13px;
  text-align: center;
  margin: 0;
}

.auth-card__footer {
  text-align: center;
  margin-top: var(--space-lg);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
}

.auth-card__footer-text {
  font-size: 13px;
  color: var(--text-muted);
}

.auth-card__footer-link {
  font-size: 13px;
  font-weight: 500;
  color: var(--accent);
}

.auth-card__footer-link:hover {
  color: var(--text-primary);
}

@media (max-width: 480px) {
  .auth-card {
    padding: var(--space-lg);
  }

  .auth-bg__rows {
    transform: rotate(-4deg) scale(1.5);
  }
}
</style>
