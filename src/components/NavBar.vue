<template>
  <ion-header class="mega-header" :class="{'authenticated': isAuthenticated}">
    <ion-toolbar class="mega-toolbar">
      <ion-title @click="goToHome" class="mega-title">
        <span class="title-content">
          <span class="mega-text">Mega</span>
          <span class="media-text">MediaCloud</span>
          <span class="pulse-dot"></span>
        </span>
      </ion-title>
      <ion-buttons slot="end" class="mega-buttons">
        <ion-button 
          v-if="!isAuthenticated" 
          router-link="/login" 
          class="mega-button login"
        >
          <span class="button-text">Login</span>
          <span class="button-icon">🔐</span>
        </ion-button>
        <ion-button 
          v-if="!isAuthenticated" 
          router-link="/register" 
          class="mega-button register"
        >
          <span class="button-text">Registre</span>
          <span class="button-icon">🚀</span>
        </ion-button>
        <ion-button 
          v-if="isAuthenticated" 
          router-link="/user" 
          class="mega-button account"
        >
          <span class="button-text">El meu compte</span>
          <span class="button-icon">💾</span>
        </ion-button>
        <ion-button 
          v-if="isAuthenticated" 
          @click="logout" 
          class="mega-button logout"
        >
          <span class="button-text">Sortir</span>
          <span class="button-icon">✕</span>
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
</template>

<script>
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton } from '@ionic/vue';
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';

export default {
  components: { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton },
  setup() {
    const router = useRouter();
    const isAuthenticated = ref(!!localStorage.getItem('token'));

    watch(() => localStorage.getItem('token'), (newVal) => {
      isAuthenticated.value = !!newVal;
      if (newVal) window.location.reload();
    });

    const logout = async () => {
      try {
        await api.post('/logout');
      localStorage.removeItem('token');
        localStorage.removeItem('user_id');
        window.location.href = '/';
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
      }
    };

    const goToHome = () => router.push('/');

    return { isAuthenticated, logout, goToHome };
  }
};
</script>

<style scoped>
.mega-header {
  background: var(--dark);
  border-bottom: 2px solid var(--primary);
  box-shadow: var(--neon-shadow);
  transition: var(--transition);
}

.mega-header.authenticated {
  border-bottom-color: var(--secondary);
}

.mega-toolbar {
  --background: transparent;
  --border-width: 0;
  padding: 0 15px;
}

/* Modifica los estilos CSS */
.mega-title {
  font-size: 1.8rem;
  font-weight: 800;
  letter-spacing: -1px;
  display: flex;
  align-items: center;
  cursor: pointer;
  color: var(--light);
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
  padding: 0 16px; /* Añade padding para espacio consistente */
}

.title-content {
  display: inline-flex;
  align-items: center;
  transition: var(--transition);
  transform-origin: left center; /* Ancla la transformación a la izquierda */
}

.mega-title:hover .title-content {
  transform: scale(1.02);
  text-shadow: 0 0 15px rgba(255, 255, 000, 0.5);
}


.mega-text {
  color: var(--primary);
  font-weight: 900;
  text-transform: uppercase;
  margin-right: 5px;
}

.media-text {
  background: var(--gradient);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 700;
}

.pulse-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  background: var(--secondary);
  border-radius: 50%;
  margin-left: 8px;
  animation: pulse 2s infinite;
  box-shadow: 0 0 5px var(--secondary);
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
}

.mega-buttons {
  margin-right: 10px;
}

.mega-button {
  --background: rgba(255, 255, 255, 0.1);
  --border-radius: 20px;
  --padding-start: 15px;
  --padding-end: 15px;
  --padding-top: 10px;
  --padding-bottom: 10px;
  margin: 0 5px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  font-size: 0.8rem;
  transition: var(--transition);
  overflow: hidden;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.mega-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: 0.5s;
}

.mega-button:hover::before {
  left: 100%;
}

.mega-button.login {
  --background: rgba(110, 0, 245, 0.2);
  --color: #a166ff;
}

.mega-button.register {
  --background: rgba(255, 62, 157, 0.2);
  --color: #ff8cbc;
}

.mega-button.account {
  --background: rgba(0, 200, 255, 0.2);
  --color: #00c8ff;
}

.mega-button.logout {
  --background: rgba(255, 0, 0, 0.2);
  --color: #ff5e5e;
}

.button-icon {
  margin-left: 8px;
  font-size: 0.9rem;
  transition: var(--transition);
}

.mega-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.mega-button:hover .button-icon {
  transform: scale(1.2);
}

@media (max-width: 768px) {
  .mega-title {
    font-size: 1.4rem;
  }
  
  .mega-button {
    --padding-start: 10px;
    --padding-end: 10px;
    font-size: 0.7rem;
  }
  
  .button-text {
    display: none;
  }
  
  .button-icon {
    margin-left: 0;
    font-size: 1.1rem;
  }
}
</style>