import { supabase } from '@/utils/supabase'
import { createRouter, createWebHistory } from 'vue-router'

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
  const { data: { session } } = await supabase.auth.getSession()
  if (to.meta.guestOnly && session) return next('/');
  if (to.meta.requiresAuth && !session) return next('/login');
  if((to.path === '/login' || to.path === '/register') && session) return next('/');
  
  next()
})


export default router
