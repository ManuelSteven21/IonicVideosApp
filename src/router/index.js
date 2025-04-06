import { createRouter, createWebHistory } from 'vue-router'
import api from '@/services/api'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import UserView from '@/views/UserView.vue'
import UploadView from '@/views/UploadView.vue'
import ShowView from '@/views/ShowView.vue'
import EditView from '@/views/EditView.vue';


const routes = [
  { 
    path: '/', 
    name: 'home',
    component: HomeView,
    meta: { title: 'Inicio' }
  },
  { 
    path: '/login', 
    name: 'login',
    component: LoginView,
    meta: { title: 'Iniciar sesión', guestOnly: true } 
  },
  { 
    path: '/register', 
    name: 'register',
    component: RegisterView,
    meta: { title: 'Registro', guestOnly: true } 
  },
  { 
    path: '/user', 
    name: 'user',
    component: UserView, 
    meta: { 
      title: 'Perfil de usuario',
      requiresAuth: true 
    } 
  },
  { 
    path: '/upload', 
    name: 'upload',
    component: UploadView, 
    meta: { 
      title: 'Subir contenido',
      requiresAuth: true 
    } 
  },
  { 
    path: '/multimedia/:id', 
    name: 'show',
    component: ShowView, 
    meta: { 
      title: 'Detalle multimedia'
    },
    props: true
  },
  { 
    path: '/multimedia/:id/edit', 
    name: 'edit',
    component: EditView, 
    meta: { 
      title: 'Editar contenido',
      requiresAuth: true,
      requiresOwner: true
    },
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL || '/'),
  routes
})

// Middleware de navegación global
router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token')
  const userId = localStorage.getItem('user_id')
  const isAuthenticated = !!token
  
  // Verificar autenticación
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }
  
  // Verificar si es dueño del contenido (para rutas de edición)
  if (to.meta.requiresOwner) {
    try {
      const response = await api.get(`/multimedia/${to.params.id}`);
      
      console.log('Datos de verificación de propiedad:', {
        contentUserId: response.data.user_id,
        loggedUserId: userId
      });
  
      if (response.data.user_id.toString() !== userId) {
        console.warn('Acceso no autorizado a edición');
        return next({ name: 'home' });
      }
    } catch (error) {
      console.error('Error verificando propiedad:', error);
      return next({ name: 'home' });
    }
  }
  
  next()
})

export default router