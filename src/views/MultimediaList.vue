<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Multimedia</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="loadMultimedia" fill="clear">
            <ion-icon slot="icon-only" :icon="refreshOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding" :scroll-y="!loading">
      <!-- Estado de carga -->
      <div v-if="loading" class="ion-text-center empty-state">
        <ion-spinner name="dots" color="primary"></ion-spinner>
        <p>Cargando contenido...</p>
      </div>

      <!-- Mensaje de error -->
      <div v-else-if="error" class="ion-text-center error-state">
        <ion-icon :icon="alertCircleOutline" size="large" color="danger"></ion-icon>
        <p class="ion-margin-top">{{ error }}</p>
        <ion-button @click="loadMultimedia" fill="outline" class="ion-margin-top">
          Reintentar
        </ion-button>
      </div>

      <!-- Estado vacío -->
      <div v-else-if="!multimedia.length" class="ion-text-center empty-state">
        <ion-icon :icon="folderOpenOutline" size="large" color="medium"></ion-icon>
        <p class="ion-margin-top">No tienes archivos multimedia aún</p>
        <ion-button router-link="/upload" fill="solid" color="primary" class="ion-margin-top">
          <ion-icon slot="start" :icon="cloudUploadOutline"></ion-icon>
          Subir mi primer archivo
        </ion-button>
      </div>

      <!-- Lista de multimedia -->
      <ion-list lines="full" v-else>
        <ion-item v-for="item in multimedia" :key="item.id" detail>
          <!-- Visualización de medios -->
          <ion-thumbnail slot="start">
            <img 
              v-if="item.type === 'photo'"
              :src="item.file_url" 
              :alt="item.title"
              class="media-thumbnail"
              loading="lazy"
            />
            <img
              v-else
              :src="item.thumbnail_url || placeholderImage"
              :alt="'Miniatura de ' + item.title"
              class="media-thumbnail"
            />
          </ion-thumbnail>

          <!-- Información del item -->
          <ion-label class="ion-text-wrap">
            <h2 class="ion-text-capitalize">{{ item.title }}</h2>
            <p class="ion-text-wrap">{{ item.description || 'Sin descripción' }}</p>
            <ion-chip :color="item.type === 'photo' ? 'primary' : 'secondary'">
              {{ formatMediaType(item.type) }}
            </ion-chip>
            <p class="file-size" v-if="item.file_size">{{ formatFileSize(item.file_size) }}</p>
          </ion-label>

          <!-- Menú de opciones -->
          <ion-button 
            slot="end" 
            fill="clear" 
            color="medium"
            @click.stop="openOptions(item)"
          >
            <ion-icon :icon="ellipsisVerticalOutline"></ion-icon>
          </ion-button>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script>
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonList, 
  IonItem, 
  IonThumbnail, 
  IonLabel,
  IonChip,
  IonSpinner,
  IonIcon,
  IonButton,
  IonButtons
} from '@ionic/vue';
import { 
  alertCircleOutline, 
  cloudUploadOutline, 
  ellipsisVerticalOutline, 
  folderOpenOutline, 
  refreshOutline 
} from 'ionicons/icons';
import api from '@/services/api';
import placeholderImage from '@/assets/default-media-placeholder.jpg';

export default {
  components: { 
    IonPage, 
    IonHeader, 
    IonToolpackage, 
    IonTitle, 
    IonContent, 
    IonList, 
    IonItem, 
    IonThumbnail, 
    IonLabel,
    IonChip,
    IonSpinner,
    IonIcon,
    IonButton,
    IonButtons
  },
  data() {
    return {
      multimedia: [],
      loading: true,
      error: '',
      placeholderImage,
      alertCircleOutline, 
      cloudUploadOutline, 
      ellipsisVerticalOutline, 
      folderOpenOutline, 
      refreshOutline
    };
  },
  async ionViewWillEnter() {
    await this.loadMultimedia();
  },
  methods: {
    async loadMultimedia() {
      this.loading = true;
      this.error = '';
      
      try {
        const response = await api.get('/user/files');
        this.multimedia = response.data.map(item => {
          const isVideo = item.type === 'video';
          return {
            ...item,
            file_url: this.getMediaUrl(item.file_path),
            thumbnail_url: isVideo && item.thumbnail_path 
              ? this.getMediaUrl(item.thumbnail_path)
              : null
          };
        });
      } catch (error) {
        this.handleLoadError(error);
      } finally {
        this.loading = false;
      }
    },
    getMediaUrl(path) {
      if (!path) return null;
      return `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${path}`;
    },
    handleLoadError(error) {
      console.error('Error loading media:', error);
      
      if (error.response?.status === 404 || error.response?.status === 500) {
        this.multimedia = [];
        this.error = 'No se encontraron archivos multimedia.';
      } else if (error.response?.status === 401) {
        this.error = 'Debes iniciar sesión para ver tus archivos.';
        this.$router.push('/login');
      } else {
        this.error = 'Error al cargar los archivos. ' + 
          (error.response?.data?.message || 'Inténtalo más tarde.');
      }
    },
    formatMediaType(type) {
      return type === 'photo' ? 'Imagen' : 'Video';
    },
    formatFileSize(bytes) {
      if (!bytes) return '';
      if (bytes < 1024) return `${bytes} B`;
      if  (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / 1048576).toFixed(1)} MB`;
    },
    openOptions(item) {
      // Implementar acciones como eliminar, compartir, etc.
      console.log('Options for:', item);
    }
  }
};
</script>

<style scoped>
.empty-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  color: var(--ion-color-medium);
}

.media-thumbnail {
  border-radius: 8px;
  object-fit: cover;
  height: 80px;
  width: 80px;
  background-color: #f4f4f4;
}

.file-size {
  font-size: 0.8rem;
  color: var(--ion-color-medium);
  margin-top: 4px;
}

ion-list {
  background: transparent;
}

ion-item {
  --padding-start: 0;
  --inner-padding-end: 0;
  margin-bottom: 12px;
  --background: var(--ion-color-light);
  border-radius: 8px;
}

ion-spinner {
  width: 48px;
  height: 48px;
}
</style>