<template>
  <ion-app>
    <ion-header>
      <NavBar />
    </ion-header>

    <ion-content class="main-content">
      <router-view />
    </ion-content>

    <ion-footer>
      <AppFooter />
    </ion-footer>
  </ion-app>
</template>

<script setup>
import { 
  IonApp, 
  IonHeader, 
  IonContent, 
  IonFooter
} from '@ionic/vue';
import NavBar from '@/components/NavBar.vue';
import AppFooter from '@/components/AppFooter.vue';
</script>

<style>
/* Variables de tema */
:root {
  --primary: #6e00f5;
  --primary-dark: #4a00a8;
  --secondary: #ff3e9d;
  --dark: #1a1a2e;
  --light: #f1f1f1;
  --gradient: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
}

/* Estructura principal */
ion-app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Header fijo */
ion-header {
  position: sticky;
  top: 0;
  z-index: 1000;
}

/* Contenido principal ajustado */
.main-content {
  flex: 1;
  --background: linear-gradient(
      rgba(26, 26, 46, 0.95),
      rgba(26, 26, 46, 0.98)
    ),
    url('https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2565&auto=format&fit=crop');
  background-size: cover;
  background-position: center;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

/* Footer fijo */
ion-footer {
  position: sticky;
  bottom: 0;
  z-index: 500;
}

/* Corrección para el contenido scrollable */
ion-content::part(scroll) {
  padding-bottom: 60px; /* Espacio para el footer */
}

/* Mejoras de rendimiento para el fondo */
ion-content::part(background) {
  background-attachment: initial;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}
</style>