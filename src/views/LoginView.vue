<template>
  <ion-page>
    <ion-content class="login-content">
      <div class="centered-container">
        <div class="auth-card">
          <div class="card-header">
            <h1 class="title gradient-text">MegaMediaCloud</h1>
            <div class="pulse-dot"></div>
          </div>

          <div class="form-container">
            <div class="input-group">
              <ion-item class="custom-input">
                <ion-label position="floating">Email</ion-label>
                <ion-input 
                  v-model="form.email" 
                  type="email"
                  class="custom-field"
                  placeholder="tucorreo@ejemplo.com"
                ></ion-input>
                <ion-icon :icon="mailOutline" slot="start"></ion-icon>
              </ion-item>

              <ion-item class="custom-input">
                <ion-label position="floating">Contraseña</ion-label>
                <ion-input 
                  v-model="form.password" 
                  type="password"
                  class="custom-field"
                  placeholder="••••••••"
                ></ion-input>
                <ion-icon :icon="lockClosedOutline" slot="start"></ion-icon>
              </ion-item>
            </div>

            <div v-if="errorMessage" class="error-message">
              {{ errorMessage }}
            </div>

            <ion-button 
              class="auth-button"
              expand="block" 
              @click="login"
              :disabled="!form.email || !form.password"
            >
              Acceder
              <ion-icon :icon="arrowForwardCircle" slot="end"></ion-icon>
            </ion-button>
            <div class="register-link">
              <p>No tens compte?</p>
              <ion-button 
                fill="clear" 
                @click="router.push('/register')"
                class="register-link-button">
                Crea un compte
              </ion-button>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script>
import { 
  IonPage, 
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon
} from '@ionic/vue';
import { ref } from 'vue';
import { 
  mailOutline, 
  lockClosedOutline, 
  arrowForwardCircle 
} from 'ionicons/icons';
import api from '@/services/api';
import { useRouter } from 'vue-router';

export default {
  components: {
    IonPage,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon
  },
  setup() {
    const router = useRouter();
    const form = ref({
      email: '',
      password: ''
    });
    const errorMessage = ref('');

    const login = async () => {
      errorMessage.value = '';
      try {
        const response = await api.post('/login', {
          email: form.value.email,
          password: form.value.password
        });
        
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user_id', response.data.user.id.toString());
        window.location.href = '/user';
        
      } catch (error) {
        errorMessage.value = error.response?.data?.message || 
          'Error de conexión. Intenta nuevamente.';
      }
    };

    return { 
      form, 
      errorMessage, 
      login,
      mailOutline,
      lockClosedOutline,
      arrowForwardCircle,
      router
    };
  }
};
</script>

<style scoped>
.login-content {
  --background: var(--dark);
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.login-content::part(scroll) {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.centered-container {
  width: 100%;
  max-width: 440px;
  padding: 20px;
}

.auth-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
}

.card-header {
  padding: 40px 30px 20px;
  text-align: center;
  position: relative;
}

.title {
  font-size: 2.2rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.5px;
}

.gradient-text {
  background: linear-gradient(45deg, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: var(--secondary);
  border-radius: 50%;
  margin: 12px auto 0;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
}

.form-container {
  padding: 30px;
}

.input-group {
  margin-bottom: 25px;
}

.custom-input {
  --background: rgba(255, 255, 255, 0.08);
  --border-radius: 12px;
  --padding-start: 16px;
  --padding-end: 16px;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.custom-input:hover {
  --background: rgba(255, 255, 255, 0.12);
}

.custom-input ion-icon {
  color: rgba(255, 255, 255, 0.6);
  margin-right: 12px;
  font-size: 1.2rem;
}

.custom-field {
  --color: var(--light);
  --padding-top: 14px;
  --padding-bottom: 14px;
  font-size: 1rem;
}

.error-message {
  background: rgba(255, 0, 0, 0.1);
  color: #ff5e5e;
  padding: 12px;
  border-radius: 8px;
  margin: 20px 0;
  border-left: 4px solid #ff5e5e;
  font-size: 0.9rem;
  text-align: center;
}

.auth-button {
  --background: linear-gradient(45deg, var(--primary), var(--secondary));
  --border-radius: 12px;
  --padding-top: 18px;
  --padding-bottom: 18px;
  --box-shadow: 0 4px 20px rgba(110, 0, 245, 0.3);
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.auth-button:hover {
  --background: linear-gradient(45deg, var(--primary-dark), var(--secondary));
  transform: translateY(-2px);
  --box-shadow: 0 6px 25px rgba(110, 0, 245, 0.4);
}

.auth-button ion-icon {
  margin-left: 8px;
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.auth-button:hover ion-icon {
  transform: translateX(3px);
}

.register-link {
  text-align: center;
  margin-top: 25px;
  color: rgba(255, 255, 255, 0.7);
}

.register-link p {
  margin-bottom: 5px;
}

.register-link-button {
  --color: var(--primary);
  --background: transparent;
  --box-shadow: none;
  margin: 0;
  height: auto;
  display: inline;
}

@media (max-width: 480px) {
  .centered-container {
    padding: 10px;
  }
  
  .auth-card {
    border-radius: 16px;
  }
  
  .title {
    font-size: 1.8rem;
  }
  
  .form-container {
    padding: 20px;
  }
}
</style>