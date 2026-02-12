import { supabase } from '@/utils/supabase'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore';

const routes = [
  {
    path: '/login',
    component: () => import('@/views/Login.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    component: () => import('@/views/Register.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/user/:username',
    component: () => import('@/views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/',
    component: () => import('@/views/Home.vue'),
    meta: { requiresAuth: true }
  }

]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  // Ensure the store is initialized (checked session at least once)
  if (!authStore.isInitialized) {
    await authStore.initialize();
  }

  const user = authStore.user;

  if (to.meta.guestOnly && user) return next('/');
  if (to.meta.requiresAuth && !user) return next('/login');
  if ((to.path === '/login' || to.path === '/register') && user) return next('/');

  next()
})

export default router
