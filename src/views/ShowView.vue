<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button 
            :default-href="defaultBackLink"
            @click="handleBack"
          ></ion-back-button>
        </ion-buttons>
        <ion-title>{{ item?.title || 'Detalle' }}</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="ion-padding">
      <!-- Estado de carga -->
      <div v-if="loading" class="ion-text-center">
        <ion-spinner></ion-spinner>
        <p>Cargando contenido...</p>
      </div>
      
      <!-- Estado de error -->
      <div v-else-if="error" class="ion-text-center error-state">
        <ion-icon :icon="alertCircleOutline" size="large"></ion-icon>
        <p>{{ error }}</p>
        <ion-button @click="retryLoading" fill="outline">
          Reintentar
        </ion-button>
      </div>
      
      <!-- Contenido cargado -->
      <div v-else-if="item" class="content-wrapper">
        <div class="media-container">
          <img 
            v-if="item.type === 'photo'"
            :src="item.file_url"
            class="media-detail"
          />
          
          <video 
            v-else
            controls
            class="media-detail"
          >
            <source :src="item.file_url" type="video/mp4">
          </video>
        </div>
        
        <ion-list>
          <ion-item>
            <ion-label class="ion-text-wrap">
              <h2>Descripción</h2>
              <p>{{ item.description || 'Sin descripción' }}</p>
            </ion-label>
          </ion-item>
          
          <ion-item>
            <ion-label>
              <h2>Subido por:</h2>
              <p>{{ item.user?.name || 'Usuario desconocido' }}</p>
            </ion-label>
          </ion-item>
          
          <ion-item>
            <ion-label>
              <h2>Fecha de subida:</h2>
              <p>{{ formattedDate }}</p>
            </ion-label>
          </ion-item>
        </ion-list>

        <div class="action-buttons" v-if="isOwner">
          <ion-button expand="block" @click="editItem" color="primary">
            <ion-icon slot="start" :icon="createOutline"></ion-icon>
            Editar
          </ion-button>
          
          <ion-button expand="block" @click="confirmDelete" color="danger">
            <ion-icon slot="start" :icon="trashOutline"></ion-icon>
            Eliminar
          </ion-button>
        </div>
      </div>
      
      <!-- Estado vacío -->
      <div v-else class="ion-text-center empty-state">
        <ion-icon :icon="documentOutline" size="large"></ion-icon>
        <p>Contenido no encontrado</p>
        <ion-button @click="$router.push('/')" fill="outline">
          Volver al inicio
        </ion-button>
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
  IonContent, 
  IonBackButton, 
  IonButtons,
  IonSpinner,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  alertController,
  toastController
} from '@ionic/vue';
import {  
  alertCircleOutline,
  documentOutline,
  createOutline,
  trashOutline
} from 'ionicons/icons';
import api from '@/services/api'
import { format } from 'date-fns'

export default {
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonBackButton,
    IonButtons,
    IonSpinner,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon
  },
  props: ['id'],
  data() {
    return {
      item: null,
      loading: true,
      error: null,
      alertCircleOutline,
      documentOutline,
      createOutline,
      trashOutline
    }
  },
  computed: {
    formattedDate() {
      if (!this.item?.created_at) return 'Fecha desconocida'
      return format(new Date(this.item.created_at), 'dd/MM/yyyy HH:mm')
    },
    isOwner() {
      // Verifica que haya un usuario logueado y un item cargado
      if (!this.item || !localStorage.getItem('user_id')) return false;
      
      // Obtiene los IDs como strings para comparar
      const userId = localStorage.getItem('user_id');
      const ownerId = this.item.user_id?.toString();
      
      console.log('Comparando IDs:', {
        userId,
        ownerId,
        item: this.item
      });
      
      // Comparación estricta
      return userId === ownerId;
    },
    defaultBackLink() {
      // Si venimos de la vista de usuario, volvemos ahí
      if (this.$route.query.from === 'user') {
        return '/user';
      }
      // Si no, volvemos al inicio
      return '/';
    }
  },
  async mounted() {
    // Verificar que el user_id existe en localStorage
    console.log('User ID en localStorage:', localStorage.getItem('user_id'));
    await this.loadData();
  },
  methods: {
      handleBack() {
      // Lógica personalizada para manejar el retroceso
      if (this.$route.query.from === 'edit') {
        // Si venimos de editar, volvemos a show sin el query param
        this.$router.replace({ 
          name: 'show', 
          params: { id: this.id }
        });
      } else {
        // Comportamiento normal
        this.$router.push(this.defaultBackLink);
      }
    },
    async loadData() {
      this.loading = true;
      try {
        const response = await api.get(`/multimedia/${this.id}`);
        this.item = {
          ...response.data,
          file_url: this.getMediaUrl(response.data.file_path)
        };
      } catch (error) {
        console.error('Error:', error);
        this.error = 'Error al cargar el contenido';
      } finally {
        this.loading = false;
      }
    },
    
    getMediaUrl(path) {
      const baseUrl = process.env.VITE_API_URL || 'http://localhost:8000';
      return `${baseUrl}/storage/${path}`;
    },
    
    async editItem() {
      try {
        console.log('Datos antes de editar:', {
          id: this.id,
          isOwner: this.isOwner,
          routes: this.$router.getRoutes()
        });

        if (!this.id) {
          throw new Error('ID del contenido no definido');
        }

        if (!this.isOwner) {
          throw new Error('No tienes permisos para editar este contenido');
        }

        // Opción 1: Usando nombre de ruta
        await this.$router.push({
          name: 'edit',
          params: { id: this.id },
          query: { from: 'show' } // <-- Añade esto
        });

        // Opción alternativa: Usando path directo
        // await this.$router.push(`/multimedia/${this.id}/edit`);
        
      } catch (error) {
        console.error('Error en editItem:', error);
        this.showToast(error.message, 'danger');
      }
    },
    async confirmDelete() {
      const alert = await alertController.create({
        header: 'Confirmar',
        message: '¿Estás seguro de eliminar este contenido?',
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          { text: 'Eliminar', handler: () => this.deleteItem() }
        ]
      });
      await alert.present();
    },
    
    async deleteItem() {
    try {
      this.loading = true;
      await api.delete(`/multimedia/${this.id}`);
      
      // Mostrar confirmación
      await this.showToast('Contenido eliminado correctamente');
      
      // Redirigir según el origen
      const redirectTo = this.$route.query.from === 'user' ? '/user' : '/';
      await this.$router.replace(redirectTo);
    } catch (error) {
      console.error('Error al eliminar:', error);
      this.showToast(error.response?.data?.message || 'Error al eliminar', 'danger');
    } finally {
      this.loading = false;
    }
  },
  async showToast(message, color = 'success') {
    const toast = await toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  },
    
    async retryLoading() {
      await this.loadData();
    }
  }
}
</script>

<style scoped>
/* Fondo oscuro como en upload-view */
.ion-padding {
  --background: var(--dark);
  --color: var(--light);
  padding: 16px;
}

/* Header con gradiente igual que upload */
ion-toolbar {
  --background: linear-gradient(45deg, var(--primary), var(--secondary));
  --color: white;
  --box-shadow: 0 2px 15px rgba(110, 0, 245, 0.3);
}

/* Contenedor principal con efecto glassmorfismo */
.content-wrapper {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin: 16px 0;
}

/* Media container con borde neon */
.media-container {
  border: 2px solid rgba(110, 0, 245, 0.3);
  border-radius: 15px;
  box-shadow: 0 0 15px rgba(110, 0, 245, 0.1);
  overflow: hidden;
  margin-bottom: 24px;
}

.media-detail {
  width: 100%;
  max-height: 60vh;
  min-height: 200px;
  object-fit: contain;
  background: #000;
  display: block;
}

/* Lista de metadatos con estilo moderno */
ion-list {
  background: transparent;
}

ion-item {
  --background: rgba(255, 255, 255, 0.08);
  --border-radius: 12px;
  --padding-start: 16px;
  --padding-end: 16px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

ion-item:hover {
  --background: rgba(255, 255, 255, 0.12);
}

/* Títulos con gradiente como en upload */
ion-label h2 {
  background: linear-gradient(45deg, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 1.1rem;
}

/* Descripción en blanco con transparencia */
ion-label p {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
}

/* Botones de acción con estilo igual a upload */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}

.action-buttons ion-button {
  --border-radius: 12px;
  --padding-top: 18px;
  --padding-bottom: 18px;
  --box-shadow: 0 4px 20px rgba(110, 0, 245, 0.3);
  font-weight: 600;
  transition: all 0.3s ease;
}

.action-buttons ion-button:hover {
  transform: translateY(-2px);
  --box-shadow: 0 6px 25px rgba(110, 0, 245, 0.4);
}

.action-buttons ion-button[color="primary"] {
  --background: linear-gradient(45deg, var(--primary), var(--secondary));
}

.action-buttons ion-button[color="danger"] {
  --background: linear-gradient(45deg, var(--ion-color-danger), #ff6b6b);
}

/* Estados de carga/error con estilo consistente */
.error-state, .empty-state {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  padding: 40px 20px;
  margin: 20px;
  text-align: center;
}

.error-state ion-icon, .empty-state ion-icon {
  font-size: 3rem;
  color: var(--primary);
  margin-bottom: 16px;
  filter: drop-shadow(0 0 5px rgba(110, 0, 245, 0.3));
}

.error-state p, .empty-state p {
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 20px;
}

/* Responsive design */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 16px;
    margin: 12px 0;
  }
  
  .media-detail {
    max-height: 50vh;
    min-height: 180px;
  }
  
  ion-item {
    --padding-start: 12px;
    --padding-end: 12px;
    margin-bottom: 12px;
  }
  
  .action-buttons {
    margin-top: 20px;
  }
}

@media (max-width: 480px) {
  .ion-padding {
    padding: 12px;
  }
  
  .content-wrapper {
    padding: 12px;
    border-radius: 16px;
  }
  
  .media-detail {
    max-height: 40vh;
    min-height: 150px;
  }
  
  ion-label h2 {
    font-size: 1rem;
  }
  
  ion-label p {
    font-size: 0.9rem;
  }
  
  .action-buttons ion-button {
    --padding-top: 16px;
    --padding-bottom: 16px;
    font-size: 0.9rem;
  }
}

@media (hover: none) {
  .action-buttons ion-button:hover {
    transform: none;
    --box-shadow: 0 4px 20px rgba(110, 0, 245, 0.3);
  }
  
  ion-item:hover {
    --background: rgba(255, 255, 255, 0.08);
  }
}
</style>