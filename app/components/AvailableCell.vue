<template>
    <div class="flex justify-between items-center">
        <span>{{ formatDate(date) }}</span>
        <UButton @click="bookDay" label="Book" icon="i-heroicons-bookmark" color="primary" variant="solid" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRuntimeConfig } from '#app';
import { useRouter } from 'vue-router';
import { defineProps, defineEmits } from 'vue';

const props = defineProps<{ date: string }>();
const emit = defineEmits(['dayBooked']);
const config = useRuntimeConfig();
const router = useRouter();
const isBooking = ref(false);

const bookDay = async () => {
    const accessToken = sessionStorage.getItem('googleAccessToken');
    if (!accessToken) {
        console.error('No access token found');
        router.push('/');
        return;
    }

    isBooking.value = true;
    try {
        const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${config.public.googleCalendarId}/events`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                summary: 'Boat Booking',
                description: 'Booked by user',
                start: {
                    date: props.date,
                },
                end: {
                    date: props.date,
                },
            }),
        });

        if (response.status === 401) {
            sessionStorage.removeItem('googleAccessToken');
            router.push('/');
            return;
        }

        if (response.ok) {
            emit('dayBooked', props.date);
        } else {
            throw new Error('Failed to book the day');
        }
    } catch (error) {
        console.error('Error booking day:', error);
    } finally {
        isBooking.value = false;
    }
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toDateString();
};
</script>
