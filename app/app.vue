<template>
  <UContainer>
    <NuxtPwaAssets />
    <UCard class="mt-10">
      <UButton @click="login">Login with Google</UButton>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
import { useTokenClient, type AuthCodeFlowSuccessResponse, type AuthCodeFlowErrorResponse } from 'vue3-google-signin';

const handleOnSuccess = (response: AuthCodeFlowSuccessResponse) => {
  console.log('Access Token: ', response.access_token);
  // Use the access token to interact with Google Calendar API
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
</script>
