<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Explorar archivos</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="refreshFiles" fill="clear">
            <ion-icon :icon="refreshOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- Estado vacío -->
      <div v-if="!loading && multimedia.length === 0" class="empty-state">
        <ion-icon :icon="documentOutline" size="large"></ion-icon>
        <ion-text color="medium">
          <p>No hay archivos disponibles</p>
        </ion-text>
      </div>

      <!-- Lista de archivos -->
      <ion-list lines="none" v-else>
        <ion-item 
          v-for="item in multimedia" 
          :key="item.id"
          @click="$router.push({ name: 'show', params: { id: item.id } })"
          button
          detail
        >
          <ion-thumbnail slot="start">
            <img 
              v-if="item.type === 'photo'"
              :src="item.file_url"
              class="media-thumbnail"
              loading="lazy"
            />
            <video 
              v-else
              :poster="item.thumbnail_url"
              class="media-thumbnail"
              preload="metadata"
            >
              <source :src="item.file_url" type="video/mp4">
            </video>
          </ion-thumbnail>

          <ion-label>
            <h2>{{ item.title }}</h2>
            <p>{{ item.description }}</p>
            <p>
              <ion-chip :color="item.type === 'photo' ? 'primary' : 'secondary'">
                {{ item.type === 'photo' ? 'Foto' : 'Video' }}
              </ion-chip>
              <ion-text color="medium">
                <small>{{ formatDate(item.created_at) }}</small>
              </ion-text>
            </p>
          </ion-label>
        </ion-item>
      </ion-list>

      <!-- Botón flotante -->
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button router-link="/upload">
          <ion-icon :icon="addOutline"></ion-icon>
        </ion-fab-button>
      </ion-fab>

      <!-- Loader optimizado -->
      <ion-loading 
        :is-open="loading" 
        message="Cargando..."
        :duration="3000"
        @didDismiss="loading = false"
      ></ion-loading>
    </ion-content>
  </ion-page>
</template>

<script>
import { 
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonList,
  IonItem,
  IonThumbnail,
  IonLabel,
  IonChip,
  IonText,
  IonFab,
  IonFabButton,
  IonLoading,
  toastController
} from '@ionic/vue';
import { 
  addOutline,
  refreshOutline,
  documentOutline
} from 'ionicons/icons';
import api from '@/services/api';

export default {
  name: 'HomeView',
  components: { 
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonList,
    IonItem,
    IonThumbnail,
    IonLabel,
    IonChip,
    IonText,
    IonFab,
    IonFabButton,
    IonLoading
  },
  data() {
    return {
      multimedia: [],
      loading: false,
      error: null,
      addOutline,
      refreshOutline,
      documentOutline
    };
  },
  methods: {
    async refreshFiles() {
      await this.loadFiles();
      this.showToast('Archivos actualizados', 'success');
    },
    
    async loadFiles() {
      try {
        this.loading = true;
        const response = await api.get('/multimedia');
        
        this.multimedia = response.data.map(item => ({
          ...item,
          file_url: this.getMediaUrl(item.file_path),
          thumbnail_url: item.thumbnail_path ? this.getMediaUrl(item.thumbnail_path) : null
        }));
        
      } catch (error) {
        console.error('Error:', error);
        this.showToast('Error cargando archivos', 'danger');
      } finally {
        // Timeout para asegurar la actualización visual
        setTimeout(() => this.loading = false, 100);
      }
    },

    getMediaUrl(path) {
      const baseUrl = process.env.VITE_API_URL || 'http://localhost:8000';
      return `${baseUrl}/storage/${path}`;
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },

    async showToast(message, color = 'success') {
      const toast = await toastController.create({
        message,
        duration: 2000,
        color,
        position: 'top'
      });
      await toast.present();
    }
  },
  async mounted() {
    await this.loadFiles();
  }
};
</script>

<style scoped>
/* Tema general */
ion-content {
  --background: linear-gradient(
    to bottom, 
    rgba(26, 26, 46, 0.95) 0%, 
    rgba(26, 26, 46, 0.98) 100%
  );
}

/* Header personalizado */
ion-toolbar {
  --background: rgba(26, 26, 46, 0.9);
  --border-width: 0;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.3);
}

ion-title {
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: var(--light);
}

/* Lista de archivos mejorada */
ion-list {
  padding: 0 15px;
  background: transparent;
}

ion-item {
  --background: rgba(255, 255, 255, 0.03);
  --border-radius: 12px;
  --padding-start: 10px;
  --padding-end: 10px;
  --inner-padding-end: 10px;
  margin-bottom: 15px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

ion-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  border-color: var(--primary);
}

/* Thumbnail profesional */
ion-thumbnail {
  --size: 100px;
  --border-radius: 8px;
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease;
}

.media-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform-origin: center;
}

ion-item:hover .media-thumbnail {
  transform: scale(1.05);
}

/* Etiquetas y texto */
ion-label h2 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--light);
  margin-bottom: 5px;
}

ion-label p {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
  margin-bottom: 8px;
}

/* Chips modernos */
ion-chip {
  --background: rgba(110, 0, 245, 0.2);
  --color: var(--primary);
  border: 1px solid var(--primary);
  font-size: 0.75rem;
  font-weight: 600;
  height: 26px;
  margin-right: 8px;
}

ion-chip[color="secondary"] {
  --background: rgba(255, 62, 157, 0.2);
  --color: var(--secondary);
  border-color: var(--secondary);
}

/* Estado vacío mejorado */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 70vh;
  text-align: center;
  padding: 20px;
  opacity: 0;
  animation: fadeIn 0.5s ease-in forwards;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 15px;
  margin: 20px;
  border: 2px dashed rgba(255, 255, 255, 0.1);
}

.empty-state ion-icon {
  font-size: 4rem;
  color: var(--primary);
  margin-bottom: 20px;
  animation: pulse 2s infinite;
}

.empty-state p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.1rem;
  max-width: 300px;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
}

/* Botón flotante mejorado */
ion-fab-button {
  --background: var(--primary);
  --background-activated: var(--primary-dark);
  --box-shadow: 0 4px 15px rgba(110, 0, 245, 0.4);
  --transition: all 0.3s ease;
}

ion-fab-button:hover {
  transform: scale(1.1) rotate(90deg);
}

/* Loader personalizado */
ion-loading {
  --backdrop-opacity: 0.8;
  --spinner-color: var(--primary);
  --height: 50px;
  --width: 50px;
}

/* Responsive design */
@media (min-width: 768px) {
  ion-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 20px;
    padding: 20px;
  }

  ion-item {
    margin-bottom: 0;
  }
}

@media (max-width: 480px) {
  ion-thumbnail {
    --size: 80px;
  }
  
  ion-label h2 {
    font-size: 1rem;
  }
  
  ion-label p {
    font-size: 0.8rem;
  }
}
</style>