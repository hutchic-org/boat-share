<template>
    <UCard>
      <div class="p-4">
        <h3 class="text-lg font-bold mb-4">Future Booking</h3>
        <p>You have the boat booked on {{ formatDate(date) }}.</p>
        <UButton color="red" variant="solid" size="lg" @click="deleteBooking">Cancel Booking</UButton>
      </div>
    </UCard>
  </template>

<script setup lang="ts">
import { format } from 'date-fns';

const props = defineProps<{ date: string, event: any }>();
const emit = defineEmits(['bookingDeleted']);

const formatDate = (dateString: string) => {
  const date = new Date(dateString + 'T00:00:00');
  return format(date, 'PPP');
};

const deleteBooking = async () => {
  try {
    const accessToken = sessionStorage.getItem('googleAccessToken');
    const config = useRuntimeConfig();

    const deleteResponse = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${config.public.googleCalendarId}/events/${props.event.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      }
    });

    if (!deleteResponse.ok) {
      throw new Error('Failed to delete calendar event');
    }

    emit('bookingDeleted', props.date);
    console.log('Booking deleted for:', props.date);
  } catch (error) {
    console.error('Error deleting booking:', error);
  }
};
</script>