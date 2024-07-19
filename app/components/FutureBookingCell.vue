<template>
    <UCard>
      <div class="p-4">
        <h3 class="text-lg font-bold mb-4">Future Booking</h3>
        <p>You have the boat booked on {{ formatDate(date) }}.</p>
      </div>
    </UCard>
  </template>

  <script setup lang="ts">
  import { format } from 'date-fns';

  const props = defineProps<{ date: string }>();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return format(date, 'PPP');
  };
  </script>
