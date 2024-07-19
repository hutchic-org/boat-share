<template>
    <UContainer>
      <UCard class="mt-10">
        <h1>Boat Bookings</h1>
        <p>Boat Availability Calendar:</p>
        <div v-if="loading">
          <p>Loading calendar events...</p>
        </div>
        <div v-else>
          <div class="calendar">
            <div class="day" v-for="day in calendarDays" :key="day.date">
              <span :class="{ booked: day.isBooked }">{{ day.date }}</span>
              <template v-if="day.isBooked">
                <UIcon v-if="day.isUserBooking" name="i-heroicons-user-circle" dynamic class="icon-user-booked" />
                <UIcon v-else name="i-heroicons-x-circle" dynamic class="icon-booked" />
              </template>
              <UIcon v-else name="i-heroicons-check-circle" dynamic class="icon-available" />
            </div>
          </div>
        </div>
      </UCard>
    </UContainer>
  </template>

  <script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRuntimeConfig } from '#app';

  const loading = ref(true);
  const events = ref([]);
  const calendarDays = ref([]);
  const userEmail = ref('');

  const config = useRuntimeConfig();

  const listCalendarEvents = async () => {
    const accessToken = sessionStorage.getItem('googleAccessToken');
    if (!accessToken) {
      console.error('No access token found');
      return;
    }

    try {
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${config.public.googleCalendarId}/events`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch calendar events');
      }

      const data = await response.json();
      events.value = data.items;
      generateCalendarDays();
      console.log('Calendar Events:', data.items);
    } catch (error) {
      console.error('Error fetching calendar events', error);
    } finally {
      loading.value = false;
    }
  };

  const fetchUserProfile = async () => {
    const accessToken = sessionStorage.getItem('googleAccessToken');
    if (!accessToken) {
      console.error('No access token found');
      return;
    }

    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const data = await response.json();
      userEmail.value = data.email;
      console.log('User Email:', userEmail.value);
    } catch (error) {
      console.error('Error fetching user profile', error);
    }
  };

  const generateCalendarDays = () => {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    calendarDays.value = Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(today.getFullYear(), today.getMonth(), i + 1).toISOString().split('T')[0];
      const isBooked = events.value.some(event => event.start.date === date);
      const isUserBooking = events.value.some(event => event.start.date === date && event.creator.email === userEmail.value);
      return { date: i + 1, isBooked, isUserBooking };
    });
  };

  onMounted(async () => {
    await fetchUserProfile();
    listCalendarEvents();
  });
  </script>

  <style>
  .calendar {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1rem;
  }
  .day {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .icon-booked {
    color: red;
  }
  .icon-user-booked {
    color: blue;
  }
  .icon-available {
    color: green;
  }
  </style>
