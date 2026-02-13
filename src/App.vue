<template>
  <RouterView/>
</template>

<script setup>
import { RouterView } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { onMounted } from 'vue';

const authStore = useAuthStore();

onMounted(() => {
  authStore.initialize();
})
</script>

<style>
:root {
  --bg-base: #0d0d14;
  --bg-raised: #131320;
  --bg-surface: #1a1a2e;
  --bg-overlay: rgba(13, 13, 20, 0.85);

  --text-primary: #e8e6f0;
  --text-secondary: #8a8a9a;
  --text-muted: #9292b9;

  --accent: #a78bfa;
  --accent-dim: rgba(167, 139, 250, 0.15);
  --accent-glow: rgba(167, 139, 250, 0.3);

  --status-playing: #34d399;
  --status-completed: #60a5fa;
  --status-backlog: #fbbf24;
  --status-dropped: #f87171;
  --status-wishlist: #c084fc;

  --border: rgba(255, 255, 255, 0.06);
  --border-hover: rgba(255, 255, 255, 0.12);

  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;

  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 40px;
  --space-2xl: 64px;

  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-display: 'Space Grotesk', 'Inter', sans-serif;

  --max-width: 1080px;

  --ease: cubic-bezier(0.4, 0, 0.2, 1);
  --duration: 0.25s;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-body);
  background-color: var(--bg-base);
  color: var(--text-primary);
  line-height: 1.55;
  min-height: 100vh;
  overflow-x: hidden;
  position: relative;
}

body::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  opacity: 0.035;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 200px 200px;
}

a {
  color: var(--accent);
  text-decoration: none;
  transition: color var(--duration) var(--ease);
}

a:hover {
  color: var(--text-primary);
}

button {
  font-family: inherit;
  cursor: pointer;
}

img {
  display: block;
  max-width: 100%;
}

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--border-hover);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}

::selection {
  background: var(--accent);
  color: var(--bg-base);
}

:focus-visible {
  outline: 1.5px solid var(--accent);
  outline-offset: 2px;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.fade-in-up {
  animation: fadeInUp 0.5s var(--ease) both;
}

.fade-in {
  animation: fadeIn 0.4s var(--ease) both;
}

.stagger > * {
  animation: fadeInUp 0.4s var(--ease) both;
}
.stagger > *:nth-child(1) { animation-delay: 0.04s; }
.stagger > *:nth-child(2) { animation-delay: 0.08s; }
.stagger > *:nth-child(3) { animation-delay: 0.12s; }
.stagger > *:nth-child(4) { animation-delay: 0.16s; }
.stagger > *:nth-child(5) { animation-delay: 0.20s; }
.stagger > *:nth-child(6) { animation-delay: 0.24s; }
.stagger > *:nth-child(7) { animation-delay: 0.28s; }
.stagger > *:nth-child(8) { animation-delay: 0.32s; }
.stagger > *:nth-child(9) { animation-delay: 0.36s; }
.stagger > *:nth-child(10) { animation-delay: 0.40s; }

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

.modal-panel {
  position: relative;
  background: var(--bg-raised);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  max-width: 560px;
  width: 100%;
  max-height: 88vh;
  overflow-y: auto;
  box-shadow:
    0 0 0 1px rgba(0,0,0,0.3),
    0 24px 80px -12px rgba(0,0,0,0.6);
  animation: fadeInUp 0.3s var(--ease);
}

.modal-panel-sm {
  max-width: 440px;
}

.modal-close {
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

.modal-close:hover {
  border-color: var(--border-hover);
  color: var(--text-primary);
  background: rgba(255,255,255,0.04);
}

.modal-body {
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

.field-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: var(--space-sm);
}

.field-input,
.field-select,
.field-textarea {
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

.field-input:focus,
.field-select:focus,
.field-textarea:focus {
  outline: none;
  border-color: var(--accent);
}

.field-input::placeholder,
.field-textarea::placeholder {
  color: var(--text-muted);
}

.field-textarea {
  resize: vertical;
  min-height: 88px;
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
  text-decoration: none;
  line-height: 1;
}

.btn-accent {
  background: var(--accent);
  color: var(--bg-base);
  border-color: var(--accent);
}

.btn-accent:hover:not(:disabled) {
  background: #b89dfc;
  box-shadow: 0 0 20px var(--accent-glow);
}

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border-color: var(--border);
}

.btn-ghost:hover {
  border-color: var(--border-hover);
  color: var(--text-primary);
  background: rgba(255,255,255,0.03);
}

.btn-danger {
  background: transparent;
  color: var(--status-dropped);
  border-color: rgba(248,113,113,0.3);
}

.btn-danger:hover {
  background: var(--status-dropped);
  color: white;
  border-color: var(--status-dropped);
}

.btn-steam {
  background: rgba(102, 192, 244, 0.08);
  color: #66c0f4;
  border-color: rgba(102, 192, 244, 0.2);
}

.btn-steam:hover {
  background: rgba(102, 192, 244, 0.15);
  border-color: rgba(102, 192, 244, 0.4);
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
