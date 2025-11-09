import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/auth'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import MapView from '../views/MapView.vue'
import Reports from '../views/Reports.vue'
import CollectionPointForm from '../views/CollectionPointForm.vue'
import SubscriberForm from '../views/SubscriberForm.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/map',
    name: 'MapView',
    component: MapView,
    meta: { requiresAuth: true }
  },
  {
    path: '/reports',
    name: 'Reports',
    component: Reports,
    meta: { requiresAuth: true }
  },
  {
    path: '/collection-points/new',
    name: 'NewCollectionPoint',
    component: CollectionPointForm,
    meta: { requiresAuth: true }
  },
  {
    path: '/collection-points/:id/edit',
    name: 'EditCollectionPoint',
    component: CollectionPointForm,
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/subscribers/new',
    name: 'NewSubscriber',
    component: SubscriberForm,
    meta: { requiresAuth: true }
  },
  {
    path: '/subscribers/:id/edit',
    name: 'EditSubscriber',
    component: SubscriberForm,
    meta: { requiresAuth: true },
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router