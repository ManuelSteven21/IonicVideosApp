<template>
  <ion-footer class="mega-footer">
    <ion-toolbar class="footer-toolbar">
      <div class="footer-content">
        <div class="footer-title" @click="scrollToTop">
          <span class="mega-logo">Mega</span>MediaCloud
          <span class="copyright">&copy; {{ new Date().getFullYear() }}</span>
        </div>
        
        <div class="footer-stats" v-if="isAuthenticated">
          <span class="stat">
            <span class="stat-icon">💾</span> 1.2TB
          </span>
          <span class="stat">
            <span class="stat-icon">🚀</span> UltraRápido
          </span>
        </div>
      </div>
    </ion-toolbar>
  </ion-footer>
</template>

<script>
import { IonFooter, IonToolbar } from '@ionic/vue';
import { ref, onMounted } from 'vue';

export default {
  name: 'AppFooter',
  components: { IonFooter, IonToolbar },
  setup() {
    const isAuthenticated = ref(!!localStorage.getItem('token'));
    
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    };
    
    return {
      isAuthenticated,
      scrollToTop
    };
  }
};
</script>

<style scoped>
.mega-footer {
  background: var(--dark);
  border-top: 2px solid var(--primary);
  box-shadow: 0 -5px 20px rgba(110, 0, 245, 0.2);
  z-index: 1000;
}

.footer-toolbar {
  --background: transparent;
  --border-width: 0;
  --padding-top: 10px;
  --padding-bottom: 10px;
  --padding-start: 20px;
  --padding-end: 20px;
}

.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 10px 0;
}

.footer-title {
  color: var(--light);
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: var(--transition);
}

.footer-title:hover {
  transform: scale(1.02);
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

.mega-logo {
  color: var(--primary);
  font-weight: 900;
  margin-right: 5px;
  text-transform: uppercase;
}

.copyright {
  margin-left: 8px;
  font-size: 0.9rem;
  opacity: 0.8;
  color: var(--light);
}

@media (max-width: 768px) {
  .footer-links {
    gap: 10px;
  }
  
  .footer-link {
    font-size: 0.8rem;
    padding: 3px 8px;
  }
  
  .footer-title {
    font-size: 1rem;
  }
  
  .copyright {
    font-size: 0.8rem;
  }
}
</style>