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

const { login } = useTokenClient({
    client_id: '753759858538-nufcl1qbhf9gpc7v9qs4seramd7ni2rm.apps.googleusercontent.com',
    scope: 'profile email https://www.googleapis.com/auth/calendar',
    prompt: 'consent',
    onSuccess: handleOnSuccess,
    onError: handleOnError,
});

</script>
