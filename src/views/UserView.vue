<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="gradient-header">
        <ion-title class="catalan-text">El Meu Perfil</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="refreshUserData" fill="clear" class="refresh-btn">
            <ion-icon :icon="refreshOutline" class="refresh-icon"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="profile-content">
      <!-- Sección de perfil -->
      <div class="profile-card glassmorphic-card">
        <div class="profile-header">
          <ion-avatar class="profile-avatar">
            <img :src="user.avatar || 'https://ionicframework.com/docs/img/demos/avatar.svg'" />
            <div class="online-status" :class="{ 'active': user.is_online }"></div>
          </ion-avatar>
          
          <div class="user-info">
            <h2 class="user-name">{{ user.name }}</h2>
            <p class="user-email">{{ user.email }}</p>
            <ion-text color="medium">
              <small class="member-since">Membre des de {{ formatDate(user.created_at) }}</small>
            </ion-text>
          </div>
        </div>

        <!-- Estadísticas -->
        <div class="stats-container">
          <div class="stat-item">
            <div class="stat-value">{{ userStats.totalFiles }}</div>
            <div class="stat-label">Fitxers</div>
            <div class="stat-icon">
              <ion-icon :icon="folderOutline"></ion-icon>
            </div>
          </div>
          
          <div class="stat-item">
            <div class="stat-value">{{ userStats.totalPhotos }}</div>
            <div class="stat-label">Fotos</div>
            <div class="stat-icon">
              <ion-icon :icon="imageOutline"></ion-icon>
            </div>
          </div>
          
          <div class="stat-item">
            <div class="stat-value">{{ userStats.totalVideos }}</div>
            <div class="stat-label">Vídeos</div>
            <div class="stat-icon">
              <ion-icon :icon="videocamOutline"></ion-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- Mis archivos -->
      <div class="files-section">
        <ion-list-header class="section-header">
          <ion-label>Els Meus Fitxers</ion-label>
          <ion-button 
            router-link="/upload" 
            fill="clear" 
            size="small"
            class="upload-btn"
          >
            <ion-icon :icon="cloudUploadOutline" slot="start"></ion-icon>
            Pujar
          </ion-button>
        </ion-list-header>

        <!-- Estado vacío -->
        <div v-if="!loading && userFiles.length === 0" class="empty-state">
          <div class="empty-content">
            <ion-icon :icon="documentOutline" class="empty-icon"></ion-icon>
            <h3>Encara no tens fitxers</h3>
            <p>Comença a pujar el teu primer fitxer</p>
            <ion-button 
              router-link="/upload" 
              fill="solid" 
              class="primary-btn"
            >
              Pujar Ara
            </ion-button>
          </div>
        </div>

        <!-- Lista de archivos -->
        <ion-grid v-else class="files-grid">
          <ion-row>
            <ion-col 
              size="6" 
              size-md="4" 
              size-lg="3"
              v-for="item in userFiles" 
              :key="item.id"
            >
              <div 
                class="file-card"
                @click="$router.push({ name: 'show', params: { id: item.id } })"
              >
                <div class="file-thumbnail">
                  <img 
                    v-if="item.type === 'photo'"
                    :src="getMediaUrl(item.file_path)"
                    class="media-thumbnail"
                    loading="lazy"
                  />
                  <video
                    v-else-if="item.thumbnail_path"
                    :poster="getMediaUrl(item.thumbnail_path)"
                    class="media-thumbnail"
                    preload="metadata"
                  >
                    <source :src="getMediaUrl(item.file_path)" type="video/mp4">
                  </video>
                  <div v-else class="video-placeholder">
                    <ion-icon :icon="videocamOutline"></ion-icon>
                  </div>
                  <div class="file-type" :class="item.type">
                    {{ item.type === 'photo' ? 'Foto' : 'Vídeo' }}
                  </div>
                </div>
                
                <div class="file-info">
                  <h3 class="file-title">{{ item.title }}</h3>
                  <p class="file-date">{{ formatDate(item.created_at, true) }}</p>
                </div>
              </div>
            </ion-col>
          </ion-row>
        </ion-grid>

        <!-- Loader -->
        <div v-if="loading" class="loading-state">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Carregant...</p>
        </div>
      </div>
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
  IonAvatar,
  IonText,
  IonListHeader,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
  IonSpinner
} from '@ionic/vue';
import { 
  refreshOutline, 
  documentOutline,
  videocamOutline,
  cloudUploadOutline,
  folderOutline,
  imageOutline
} from 'ionicons/icons';
import api from '@/services/api';

export default {
  components: { 
    IonPage, 
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonButtons, 
    IonButton,
    IonIcon,
    IonContent,
    IonAvatar,
    IonText,
    IonListHeader,
    IonLabel,
    IonGrid,
    IonRow,
    IonCol,
    IonSpinner
  },
  data() {
    return {
      user: {
        name: '',
        email: '',
        avatar: '',
        created_at: '',
        is_online: false
      },
      userStats: {
        totalFiles: 0,
        totalPhotos: 0,
        totalVideos: 0
      },
      userFiles: [],
      loading: true,
      refreshOutline,
      documentOutline,
      videocamOutline,
      cloudUploadOutline,
      folderOutline,
      imageOutline
    };
  },
  async created() {
    await this.loadUserData();
    await this.loadUserFiles();
  },
  methods: {
    async loadUserData() {
      try {
        const response = await api.get('/user/profile');
        this.user = {
          ...response.data.user,
          is_online: Math.random() > 0.5 // Simular estado online
        };
        this.userStats = response.data.stats;
      } catch (error) {
        console.error("Error cargando datos de usuario:", error);
      }
    },

    async loadUserFiles() {
      this.loading = true;
      try {
        const response = await api.get('/user/files');
        this.userFiles = response.data;
      } catch (error) {
        console.error("Error cargando archivos:", error);
      } finally {
        this.loading = false;
      }
    },

    async refreshUserData() {
      await Promise.all([this.loadUserData(), this.loadUserFiles()]);
    },

    getMediaUrl(path) {
      const baseUrl = process.env.VITE_API_URL || 'http://localhost:8000';
      return `${baseUrl}/storage/${path}`;
    },

    formatDate(dateString, short = false) {
      if (!dateString) return '';
      const date = new Date(dateString);
      
      if (short) {
        return date.toLocaleDateString('es-ES', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        });
      }
      
      return date.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  }
};
</script>

<style scoped>
/* Estilos base */
.profile-content {
  --background: var(--dark);
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 16px;
  --padding-bottom: 16px;
  --color: var(--light);
}

.gradient-header {
  --background: linear-gradient(45deg, var(--primary), var(--secondary));
  --color: white;
  box-shadow: 0 2px 15px rgba(110, 0, 245, 0.3);
}

.refresh-btn {
  --color: white;
}

/* Tarjeta de perfil */
.profile-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
  overflow: hidden;
}

.profile-header {
  display: flex;
  align-items: center;
  padding: 20px;
  position: relative;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  margin-right: 16px;
  position: relative;
}

.profile-avatar img {
  border: 3px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.online-status {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ccc;
  border: 2px solid white;
}

.online-status.active {
  background: #4caf50;
}

.user-info {
  flex: 1;
}

.user-name {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
  color: #333;
}

.user-email {
  margin: 4px 0;
  font-size: 0.9rem;
  color: #666;
}

.member-since {
  font-size: 0.8rem;
  color: #888;
}

/* Estadísticas */
.stats-container {
  display: flex;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding: 12px 0;
}

.stat-item {
  flex: 1;
  text-align: center;
  position: relative;
}

.stat-item:not(:last-child)::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 40px;
  width: 1px;
  background: rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 6px;
}

.stat-icon {
  color: var(--primary);
  font-size: 1.2rem;
}

/* Sección de archivos */
.files-section {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.section-header {
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.upload-btn {
  --color: var(--primary);
  font-weight: 500;
}

/* Grid de archivos */
.files-grid {
  padding: 8px;
}

.file-card {
  margin: 8px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.file-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.file-thumbnail {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  background: #f0f0f0;
  overflow: hidden;
}

.media-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #999;
  font-size: 2rem;
}

.file-type {
  position: absolute;
  bottom: 8px;
  right: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
  color: white;
}

.file-type.photo {
  background: var(--primary);
}

.file-type.video {
  background: var(--secondary);
}

.file-info {
  padding: 12px;
}

.file-title {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-date {
  margin: 4px 0 0;
  font-size: 0.7rem;
  color: #888;
}

/* Estados */
.empty-state {
  padding: 40px 20px;
  text-align: center;
}

.empty-content {
  max-width: 300px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 3rem;
  color: #ccc;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px;
  color: #555;
}

.empty-state p {
  margin: 0 0 16px;
  color: #888;
}

.primary-btn {
  --background: var(--primary);
  --box-shadow: 0 4px 12px rgba(110, 0, 245, 0.2);
  --padding-top: 16px;
  --padding-bottom: 16px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #666;
}

/* Responsive */
@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
  }
  
  .profile-avatar {
    margin-right: 0;
    margin-bottom: 16px;
  }
  
  .user-name {
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .profile-card,
  .files-section {
    border-radius: 12px;
  }
  
  .stat-value {
    font-size: 1.2rem;
  }
  
  .file-card {
    margin: 4px;
  }
}
</style>