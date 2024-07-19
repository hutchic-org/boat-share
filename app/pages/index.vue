<template>
    <UContainer>
        <UCard class="mt-10">
            <UButton @click="login">Login with Google</UButton>
        </UCard>
    </UContainer>
</template>

<script setup lang="ts">
import { useTokenClient, type AuthCodeFlowSuccessResponse, type AuthCodeFlowErrorResponse } from 'vue3-google-signin';
import { useRouter } from 'vue-router';

const router = useRouter();

const handleOnSuccess = (response: AuthCodeFlowSuccessResponse) => {
    console.log('Access Token: ', response.access_token);
    sessionStorage.setItem('googleAccessToken', response.access_token);
    router.push('/secure');
};

const handleOnError = (errorResponse: AuthCodeFlowErrorResponse) => {
    console.log('Error: ', errorResponse);
};

const config = useRuntimeConfig()

const { login } = useTokenClient({
    client_id: config.public.oauthClientId,
    scope: 'profile email https://www.googleapis.com/auth/calendar',
    prompt: 'consent',
    onSuccess: handleOnSuccess,
    onError: handleOnError,
});

</script>
