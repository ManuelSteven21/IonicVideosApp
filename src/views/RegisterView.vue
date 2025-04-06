<template>
  <ion-page>
    <ion-content class="register-content">
      <div class="centered-container">
        <div class="auth-card">
          <div class="card-header">
            <h1 class="title gradient-text">MegaMediaCloud</h1>
            <div class="pulse-dot"></div>
            <h2 class="subtitle">Crear compte nou</h2>
          </div>

          <div class="form-container">
            <form @submit.prevent="register">
              <ion-item class="custom-input">
                <ion-label position="floating">
                  <ion-icon :icon="personOutline" class="input-icon"></ion-icon>
                  Nom complet *
                </ion-label>
                <ion-input
                  v-model="name"
                  type="text"
                  required
                ></ion-input>
              </ion-item>

              <ion-item class="custom-input">
                <ion-label position="floating">
                  <ion-icon :icon="mailOutline" class="input-icon"></ion-icon>
                  Correu electrònic *
                </ion-label>
                <ion-input
                  v-model="email"
                  type="email"
                  required
                ></ion-input>
              </ion-item>

              <ion-item class="custom-input">
                <ion-label position="floating">
                  <ion-icon :icon="lockClosedOutline" class="input-icon"></ion-icon>
                  Contrasenya *
                </ion-label>
                <ion-input
                  v-model="password"
                  type="password"
                  required
                ></ion-input>
              </ion-item>

              <ion-item class="custom-input">
                <ion-label position="floating">
                  <ion-icon :icon="lockClosedOutline" class="input-icon"></ion-icon>
                  Confirmar contrasenya *
                </ion-label>
                <ion-input
                  v-model="passwordConfirmation"
                  type="password"
                  required
                ></ion-input>
              </ion-item>

              <div v-if="errorMessage" class="error-message">
                {{ errorMessage }}
              </div>

              <ion-button 
                type="submit"
                class="auth-button"
                expand="block" 
                :disabled="loading || !formValid">
                <ion-spinner v-if="loading" name="crescent"></ion-spinner>
                {{ loading ? 'Registrant...' : 'Registrar-se' }}
                <ion-icon :icon="arrowForwardCircle" slot="end"></ion-icon>
              </ion-button>
            </form>

            <div class="login-link">
              <p>Ja tens compte?</p>
              <ion-button 
                fill="clear" 
                @click="router.push('/login')"
                class="login-link-button">
                Inicia sessió
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
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonSpinner,
  IonRouterLink
} from '@ionic/vue';
import { ref } from 'vue';
import { 
  personOutline,
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
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonSpinner,
    IonRouterLink
  },
  setup() {
    const name = ref('');
    const email = ref('');
    const password = ref('');
    const passwordConfirmation = ref('');
    const loading = ref(false);
    const errorMessage = ref('');
    const router = useRouter();

    const formValid = () => {
      return (
        name.value.length > 0 &&
        email.value.includes('@') &&
        password.value.length >= 8 &&
        password.value === passwordConfirmation.value
      );
    };

    const register = async () => {
      errorMessage.value = '';
      loading.value = true;

      try {
        if (password.value !== passwordConfirmation.value) {
          throw new Error('Les contrasenyes no coincideixen');
        }

        const response = await api.post('/register', {
          name: name.value,
          email: email.value,
          password: password.value,
          password_confirmation: passwordConfirmation.value
        });

        router.push('/login');
        
      } catch (error) {
        errorMessage.value = error.response?.data?.message || 
          error.message || 
          'Error en el registre. Torna a provar.';
      } finally {
        loading.value = false;
      }
    };

    return { 
      name,
      email,
      password,
      passwordConfirmation,
      loading,
      errorMessage,
      formValid,
      register,
      router, // Añade esto para que esté disponible en la plantilla
      personOutline,
      mailOutline,
      lockClosedOutline,
      arrowForwardCircle
    };
  }
};
</script>

<style scoped>
.register-content {
  --background: var(--dark);
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.register-content::part(scroll) {
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
  padding: 30px 30px 15px;
  text-align: center;
  position: relative;
}

.title {
  font-size: 2.2rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.5px;
}

.subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 10px 0 0;
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
  padding: 20px 30px 30px;
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

.input-icon {
  color: rgba(255, 255, 255, 0.6);
  margin-right: 12px;
  font-size: 1.2rem;
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

.login-link {
  text-align: center;
  margin-top: 25px;
  color: rgba(255, 255, 255, 0.7);
}

.login-link p {
  margin-bottom: 5px;
}

.login-link-button {
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
    padding: 15px 20px 20px;
  }
}
</style>