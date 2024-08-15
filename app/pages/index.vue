<template>
    <UContainer>
      <UCard class="mt-10">
        <UButton @click="login">Login with Google</UButton>
      </UCard>
    </UContainer>

    <UModal v-model="showInstallPrompt" prevent-close>
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              Install Boat Sharing App
            </h3>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="dismissInstallPrompt" />
          </div>
        </template>
        <div class="p-4">
          <p>Install the Boat Sharing App for a better experience!</p>
          <div class="mt-4 flex justify-end">
            <UButton @click="installPWA" color="primary" variant="solid" size="sm">Install</UButton>
          </div>
        </div>
      </UCard>
    </UModal>
  </template>

  <script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useTokenClient, type AuthCodeFlowSuccessResponse, type AuthCodeFlowErrorResponse } from 'vue3-google-signin';
  import { useRouter } from 'vue-router';
  import { useNuxtApp } from '#app';

  const router = useRouter();
  const { $pwa } = useNuxtApp();
  const showInstallPrompt = ref(false);
  let deferredPrompt: Event | null;

  const handleOnSuccess = (response: AuthCodeFlowSuccessResponse) => {
      sessionStorage.setItem('googleAccessToken', response.access_token);
      router.push('/secure');
  };

  const handleOnError = (errorResponse: AuthCodeFlowErrorResponse) => {
      console.log('Error: ', errorResponse);
  };

  const { login } = useTokenClient({
      client_id: '753759858538-nufcl1qbhf9gpc7v9qs4seramd7ni2rm.apps.googleusercontent.com',
      scope: 'profile email https://www.googleapis.com/auth/calendar',
      prompt: 'consent',
      onSuccess: handleOnSuccess,
      onError: handleOnError,
  });

  onMounted(() => {
    // Check if the user is on a mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) return;

    // Show the install prompt if it hasn't been dismissed
    if (!localStorage.getItem('installPromptDismissed')) {
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        showInstallPrompt.value = true;
      });
    }
  });

  const installPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      deferredPrompt = null;
      showInstallPrompt.value = false;
    }
  };

  const dismissInstallPrompt = () => {
    showInstallPrompt.value = false;
    localStorage.setItem('installPromptDismissed', 'true');
  };
  </script>
