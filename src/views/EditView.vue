<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="gradient-header">
        <ion-buttons slot="start">
          <ion-back-button 
            :default-href="defaultBackLink"
            @click="handleBack"
            class="close-btn"
          ></ion-back-button>
        </ion-buttons>
        <ion-title class="catalan-text">Editar Contingut</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="saveChanges" :disabled="!formValid || isSaving" class="save-btn">
            <ion-spinner v-if="isSaving" name="crescent"></ion-spinner>
            {{ isSaving ? 'Desant...' : 'Desar' }}
            <ion-icon :icon="saveOutline" slot="end"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="edit-content">
      <div class="centered-container">
        <div class="edit-card glassmorphic-card">
          <!-- Estado de carga -->
          <div v-if="loading" class="ion-text-center loading-state">
            <ion-spinner name="dots"></ion-spinner>
            <p>Carregant contingut...</p>
          </div>

          <!-- Formulario de edición -->
          <div v-else-if="item" class="metadata-form">
            <!-- Vista previa del archivo actual -->
            <div class="preview-section neon-border">
              <h3 class="section-title">Fitxer Actual</h3>
              <div class="preview-container">
                <img 
                  v-if="item.type === 'photo'"
                  :src="currentFileUrl"
                  class="preview-media"
                />
                <video 
                  v-else
                  :src="currentFileUrl"
                  controls
                  class="preview-media"
                ></video>
              </div>
              <div class="file-info">
                <p>Tipo: {{ item.type === 'photo' ? 'Imatge' : 'Vídeo' }}</p>
                <p>Mida: {{ formatFileSize(item.file_size) }}</p>
              </div>
            </div>

            <!-- Campos de metadatos -->
            <ion-item class="custom-input">
              <ion-label position="floating" class="input-label">
                <ion-icon :icon="textOutline" class="input-icon"></ion-icon>
                Títol *
              </ion-label>
              <ion-input v-model="item.title" required></ion-input>
            </ion-item>

            <ion-item class="custom-input">
              <ion-label position="floating" class="input-label">
                <ion-icon :icon="documentTextOutline" class="input-icon"></ion-icon>
                Descripció
              </ion-label>
              <ion-textarea v-model="item.description" rows="3"></ion-textarea>
            </ion-item>

            <!-- Sección para reemplazar archivo -->
            <div class="preview-section neon-border">
              <h3 class="section-title">Reemplaçar Fitxer</h3>
              <div class="filepond-container">
                <file-pond
                  name="replacementFile"
                  ref="pond"
                  label-idle="<div class='drop-zone'><ion-icon :icon='cloudUploadOutline' class='upload-icon'></ion-icon><div class='drop-text'>Arrossega un nou fitxer aquí</div><div class='subtext'>Formats acceptats: imatges i vídeos</div></div>"
                  accepted-file-types="image/*, video/*"
                  :max-file-size="maxFileSize"
                  :instant-upload="false"
                  @addfile="handleFileAdded"
                  @removefile="handleFileRemoved"
                  class="custom-filepond"
                />
              </div>

              <!-- Vista previa del nuevo archivo -->
              <div v-if="newFilePreview" class="new-file-preview">
                <h4 class="preview-title">Vista prèvia del nou fitxer</h4>
                <div class="preview-container">
                  <img 
                    v-if="newFileType === 'photo'"
                    :src="newFilePreview"
                    class="preview-media"
                  />
                  <video 
                    v-else
                    :src="newFilePreview"
                    controls
                    class="preview-media"
                    ref="videoPreview"
                    @loadeddata="captureFirstFrame"
                  ></video>
                  <img 
                    v-if="newVideoThumbnail" 
                    :src="newVideoThumbnail" 
                    class="preview-media"
                  />
                </div>
                <div class="file-info">
                  <p>Tipo: {{ newFileType === 'photo' ? 'Imatge' : 'Vídeo' }}</p>
                  <p>Mida: {{ formatFileSize(newFileSize) }}</p>
                </div>
              </div>
            </div>

            <ion-button 
              class="upload-btn"
              expand="block" 
              @click="saveChanges"
              :disabled="!formValid || isSaving">
              <ion-spinner v-if="isSaving" name="crescent"></ion-spinner>
              {{ isSaving ? 'Desant...' : 'Desar canvis' }}
              <ion-icon :icon="sendOutline" slot="end"></ion-icon>
            </ion-button>
          </div>
        </div>
      </div>

      <!-- Notificaciones -->
      <ion-toast
        :is-open="!!error"
        :message="error"
        color="danger"
        @didDismiss="error = null"
        :duration="3000"
      ></ion-toast>
      
      <ion-toast
        :is-open="!!successMessage"
        :message="successMessage"
        color="success"
        @didDismiss="successMessage = null"
        :duration="2000"
      ></ion-toast>
    </ion-content>
  </ion-page>
</template>


<script>
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, 
  IonButtons, IonButton, IonSpinner, IonItem, IonLabel, IonInput, 
  IonTextarea, IonToast, IonText
} from '@ionic/vue';
import vueFilePond from 'vue-filepond';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import 'filepond/dist/filepond.min.css';
import api from '@/services/api';

const FilePond = vueFilePond(
  FilePondPluginFileValidateType,
  FilePondPluginFileValidateSize
);

export default {
  components: {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, 
    IonButtons, IonButton, IonSpinner, IonItem, IonLabel, IonInput, 
    IonTextarea, IonToast, IonText,
    FilePond
  },
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      item: null,
      loading: true,
      isSaving: false,
      error: null,
      successMessage: null,
      newFile: null,
      newFilePreview: null,
      newFileType: null,
      newFileSize: 0,
      newVideoThumbnail: null,
      maxFileSize: '100MB'
    };
  },
  computed: {
    formValid() {
      return this.item?.title?.trim();
    },
    defaultBackLink() {
      // Si venimos de la vista de show, volvemos ahí
      if (this.$route.query.from === 'show') {
        return `/multimedia/${this.id}`;
      }
      // Si venimos de la vista de usuario, volvemos ahí
      if (this.$route.query.from === 'user') {
        return '/user';
      }
      // Por defecto, volvemos al inicio
      return '/';
    },
    currentFileUrl() {
      if (!this.item) return '';
      const baseUrl = process.env.VITE_API_URL || 'http://localhost:8000';
      return `${baseUrl}/storage/${this.item.file_path}`;
    }
  },
  async mounted() {
    await this.loadData();
  },
  methods: {
    handleBack() {
      // Lógica personalizada para manejar el retroceso
      this.$router.push(this.defaultBackLink);
    },
    async loadData() {
      try {
        this.loading = true;
        const response = await api.get(`/multimedia/${this.id}`);
        this.item = response.data;
      } catch (error) {
        console.error('Error al cargar datos:', error);
        this.error = this.getErrorMessage(error);
      } finally {
        this.loading = false;
      }
    },

    handleFileAdded(error, file) {
      if (error) {
        console.error('Error al agregar archivo:', error);
        this.error = this.getFilePondErrorMessage(error);
        this.$refs.pond.removeFiles();
        return;
      }
      
      this.newFile = file.file;
      this.newFileType = file.file.type.startsWith('video/') ? 'video' : 'photo';
      this.newFileSize = file.file.size;
      
      // Crear vista previa
      const reader = new FileReader();
      reader.onload = (e) => {
        this.newFilePreview = e.target.result;
      };
      reader.readAsDataURL(file.file);
    },

    handleFileRemoved() {
      this.newFile = null;
      this.newFilePreview = null;
      this.newFileType = null;
      this.newFileSize = 0;
      this.newVideoThumbnail = null;
    },

    captureFirstFrame() {
      if (this.newFileType !== 'video') return;
      
      const video = this.$refs.videoPreview;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
      this.newVideoThumbnail = canvas.toDataURL();
    },

    async saveChanges() {
      if (!this.formValid || this.isSaving) return;
      
      this.isSaving = true;
      this.error = null;
      this.successMessage = null;
      
      try {
        // 1. Actualizar metadatos
        const updateResponse = await api.put(`/multimedia/${this.id}`, {
          title: this.item.title,
          description: this.item.description
        });

        // 2. Si hay un nuevo archivo, reemplazarlo
        if (this.newFile) {
          const formData = new FormData();
          formData.append('file', this.newFile);
          
          // Si es video y tenemos thumbnail generado, añadirlo
          if (this.newFileType === 'video' && this.newVideoThumbnail) {
            const blob = await fetch(this.newVideoThumbnail).then(r => r.blob());
            formData.append('thumbnail', blob, 'thumbnail.jpg');
          }
          
          await api.post(`/multimedia/${this.id}/replace`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
        }

        this.successMessage = 'Cambios guardados correctamente';
        setTimeout(() => {
          this.$router.push({ 
            path: '/',
            query: { refreshed: Date.now() } 
          });
        }, 1500);
        
      } catch (error) {
        console.error('Error al guardar:', error);
        this.error = this.getErrorMessage(error);
      } finally {
        this.isSaving = false;
      }
    },

    formatFileSize(bytes) {
      if (!bytes) return '0 B';
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / 1048576).toFixed(1)} MB`;
    },

    getErrorMessage(error) {
      if (error.response) {
        if (error.response.status === 404) {
          return 'El archivo no fue encontrado';
        } else if (error.response.status === 422) {
          return 'Datos inválidos: ' + 
            Object.values(error.response.data.errors).flat().join(', ');
        } else {
          return error.response.data?.message || 
                 `Error del servidor (${error.response.status})`;
        }
      }
      return 'Error de conexión. Intenta nuevamente.';
    },

    getFilePondErrorMessage(error) {
      if (error.code === 1) return 'El archivo es demasiado grande';
      if (error.code === 2) return 'Tipo de archivo no permitido';
      return 'Error al cargar el archivo';
    }
  }
};
</script>

<style scoped>
/* Estilos consistentes con upload view */
.gradient-header {
  --background: linear-gradient(45deg, var(--primary), var(--secondary));
  --color: white;
  box-shadow: 0 2px 15px rgba(110, 0, 245, 0.3);
  padding: 0 4vw;
}

.edit-content {
  --background: var(--dark);
  --color: var(--light);
  padding: 2vh 4vw;
}

.centered-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px 0;
}

.glassmorphic-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin: 0 2vw;
  padding: 2vh 3vw;
}

/* Textos en negro */
.section-title,
.preview-title,
.file-info p {
  color: #000 !important;
}

.input-label {
  color: #fff !important; /* Mantenemos labels en blanco */
}

.custom-input {
  --background: rgba(255, 255, 255, 0.08);
  --border-radius: 12px;
  --padding-start: 16px;
  margin: 10px 0;
  width: 100%;
}

.preview-section {
  border: 2px solid rgba(110, 0, 245, 0.3);
  border-radius: 15px;
  box-shadow: 0 0 15px rgba(110, 0, 245, 0.1);
  overflow: hidden;
  margin: 2vh 0;
  padding: 15px;
}

.preview-media {
  width: 100%;
  max-height: 50vh;
  min-height: 200px;
  object-fit: contain;
  background: #000;
  border-radius: 12px;
  margin: 10px 0;
}

.file-info {
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  margin-top: 15px;
}

.upload-btn {
  --background: linear-gradient(45deg, var(--primary), var(--secondary));
  --border-radius: 12px;
  --padding: 18px 24px;
  --box-shadow: 0 4px 20px rgba(110, 0, 245, 0.3);
  margin: 20px 0;
  width: 100%;
  max-width: 400px;
  align-self: center;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 15px;
}

/* Media Queries consistentes */
@media (max-width: 768px) {
  .gradient-header {
    padding: 0 2vw;
  }
  
  .edit-content {
    padding: 2vh 2vw;
  }
  
  .preview-media {
    max-height: 40vh;
    min-height: 150px;
  }
}

@media (max-width: 480px) {
  .centered-container {
    padding: 10px 0;
  }
  
  .glassmorphic-card {
    margin: 0;
    border-radius: 15px;
  }
  
  .upload-btn {
    --padding: 14px 20px;
    font-size: 0.9rem;
  }
}
</style>