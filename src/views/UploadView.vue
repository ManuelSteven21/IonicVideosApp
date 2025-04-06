<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="gradient-header">
        <ion-title class="catalan-text">Pujar Contingut</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$router.go(-1)" class="close-btn">
            <ion-icon :icon="closeOutline" class="close-icon"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="upload-content">
      <div class="centered-container">
        <div class="upload-card glassmorphic-card">
          <file-pond
            name="file"
            ref="pond"
            label-idle="<div class='drop-zone'><ion-icon :icon='cloudUploadOutline' class='upload-icon'></ion-icon><div class='drop-text'>Arrossega arxius aquí</div><div class='subtext'>Formats acceptats: imatges i vídeos</div></div>"
            accepted-file-types="image/*, video/*"
            :instant-upload="false"
            @addfile="handleFileAdded"
            class="custom-filepond"
          />

          <div v-if="localFile" class="metadata-form">
            <div class="preview-section neon-border">
              <img 
                v-if="fileType === 'photo'"
                :src="filePreview"
                class="preview-media"
              />
              <video 
                v-else
                ref="videoPreview"
                controls
                class="preview-media"
                @loadeddata="captureFirstFrame"
              >
                <source :src="filePreview" :type="localFile.type">
              </video>
              <img v-if="videoThumbnail" :src="videoThumbnail" class="preview-media">
            </div>

            <ion-item class="custom-input">
              <ion-label position="floating" class="input-label">
                <ion-icon :icon="textOutline" class="input-icon"></ion-icon>
                Títol *
              </ion-label>
              <ion-input v-model="title" required></ion-input>
            </ion-item>

            <ion-item class="custom-input">
              <ion-label position="floating" class="input-label">
                <ion-icon :icon="documentTextOutline" class="input-icon"></ion-icon>
                Descripció
              </ion-label>
              <ion-textarea v-model="description" rows="3"></ion-textarea>
            </ion-item>

            <ion-button 
              class="upload-btn"
              expand="block" 
              @click="confirmUpload"
              :disabled="!title || isSubmitting">
              <ion-spinner v-if="isSubmitting" name="crescent"></ion-spinner>
              {{ isSubmitting ? 'Pujant...' : 'Publicar ara' }}
              <ion-icon :icon="sendOutline" slot="end"></ion-icon>
            </ion-button>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script>
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonIcon, IonContent, IonItem, IonLabel, IonInput, IonTextarea, IonSpinner
} from '@ionic/vue';
import { closeOutline } from 'ionicons/icons';
import vueFilePond from 'vue-filepond';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import 'filepond/dist/filepond.min.css';
import api from '@/services/api';
import { useRouter } from 'vue-router';

const FilePond = vueFilePond(FilePondPluginFileValidateType);

export default {
  components: { 
    IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonIcon, IonContent, IonItem, IonLabel, IonInput, IonTextarea, IonSpinner,
    FilePond
  },
  data() {
    return {
      title: '',
      description: '',
      localFile: null,
      filePreview: null,
      fileType: 'photo',
      videoThumbnail: null,
      isSubmitting: false,
      closeOutline,
      router: useRouter()
    };
  },
  methods: {
    handleFileAdded(error, file) {
      if (error) {
        console.error('Error en afegir arxiu:', error);
        this.showError('Error en carregar arxiu');
        this.resetFilePond();
        return;
      }
      
      this.localFile = file.file;
      this.fileType = this.localFile.type.startsWith('video/') ? 'video' : 'photo';
      
      const reader = new FileReader();
      reader.onload = (e) => {
        this.filePreview = e.target.result;
      };
      reader.readAsDataURL(this.localFile);
    },

    captureFirstFrame() {
      const video = this.$refs.videoPreview;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
      this.videoThumbnail = canvas.toDataURL();
      video.style.display = 'block';
    },

    async confirmUpload() {
      if (!this.localFile || !this.title.trim()) {
        this.showError('Omple tots els camps requerits');
        return;
      }

      this.isSubmitting = true;
      
      try {
        const formData = new FormData();
        formData.append('file', this.localFile);
        formData.append('title', this.title);
        formData.append('description', this.description);

        const response = await api.post('/multimedia', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (response.status === 201) {
          this.showSuccess('Arxiu pujat correctament');
          this.router.push({ name: 'home' });
        }
      } catch (error) {
        console.error('Error en pujar:', error);
        const errorMsg = error.response?.data?.message || 
                        error.response?.data?.error || 
                        'Error en pujar arxiu';
        this.showError(errorMsg);
      } finally {
        this.isSubmitting = false;
      }
    },

    resetFilePond() {
      this.localFile = null;
      this.filePreview = null;
      this.videoThumbnail = null;
      this.title = '';
      this.description = '';
      if (this.$refs.pond) {
        this.$refs.pond.removeFiles();
      }
    },

    showError(message) {
      alert(`Error: ${message}`);
    },

    showSuccess(message) {
      alert(`Èxit: ${message}`);
    }
  }
};
</script>

<style scoped>
.gradient-header {
  --background: linear-gradient(45deg, var(--primary), var(--secondary));
  --color: white;
  box-shadow: 0 2px 15px rgba(110, 0, 245, 0.3);
  padding: 0 4vw; /* Margen lateral responsivo */
}

.upload-content {
  --background: var(--dark);
  --color: var(--light);
  padding: 2vh 4vw; /* Padding vertical y horizontal responsivo */
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
  margin: 0 2vw; /* Margen responsivo */
  padding: 2vh 3vw; /* Padding interno responsivo */
}

.custom-filepond {
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  margin: 2vh 0; /* Margen vertical */
  background: rgba(255, 255, 255, 0.05);
  width: calc(100% - 40px); /* Ancho ajustado con margen */
}

.metadata-form {
  display: flex;
  flex-direction: column;
  gap: 20px; /* Espaciado uniforme entre elementos */
  padding: 20px 0;
}

.neon-border {
  border: 2px solid rgba(110, 0, 245, 0.3);
  border-radius: 15px;
  box-shadow: 0 0 15px rgba(110, 0, 245, 0.1);
  overflow: hidden;
  margin: 2vh 0;
}

.preview-media {
  width: 100%;
  max-height: 50vh; /* Altura basada en viewport */
  min-height: 200px;
  object-fit: contain;
  background: #000;
  border-radius: 12px;
  margin: 10px 0;
}

.custom-input {
  --background: rgba(255, 255, 255, 0.08);
  --border-radius: 12px;
  --padding-start: 16px;
  margin: 10px 0;
  width: 100%;
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

/* Media Queries para ajustes específicos */
@media (max-width: 1024px) {
  .centered-container {
    max-width: 90%;
  }
  
  .glassmorphic-card {
    padding: 15px;
  }
}

@media (max-width: 768px) {
  .gradient-header {
    padding: 0 2vw;
  }
  
  .upload-content {
    padding: 2vh 2vw;
  }
  
  .preview-media {
    max-height: 40vh;
    min-height: 150px;
  }
  
  .drop-text {
    font-size: 1rem;
  }
  
  .subtext {
    font-size: 0.8rem;
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
  
  .custom-filepond {
    margin: 10px 0;
    width: 100%;
  }
  
  .upload-icon {
    font-size: 2rem;
  }
  
  .drop-text {
    font-size: 0.9rem;
  }
  
  .preview-media {
    max-height: 30vh;
    min-height: 120px;
  }
  
  .upload-btn {
    --padding: 14px 20px;
    font-size: 0.9rem;
  }
}

@media (hover: none) {
  .upload-btn:hover {
    transform: none;
    --box-shadow: 0 4px 20px rgba(110, 0, 245, 0.3);
  }
}
</style>