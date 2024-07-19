<template>
  <UContainer>
    <UCard class="mt-10">
      <UAccordion :items="accordionItems" color="primary" variant="soft" size="sm" multiple />
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
import { useRuntimeConfig } from '#app';
import { useRouter } from 'vue-router';
import { format } from 'date-fns';

interface CalendarEvent {
  start: { date: string };
  end: { date: string };
  creator: { email: string };
}

interface CalendarDay {
  date: string;
  isBooked: boolean;
  isUserBooking: boolean;
  tooltipText: string;
}

interface AccordionItem {
  label: string;
  content: string;
  icon: string;
  slot: string;
}

const loading = ref(true);
const events = ref<CalendarEvent[]>([]);
const calendarDays = ref<CalendarDay[]>([]);
const accordionItems = ref<AccordionItem[]>([]);
const userEmail = ref<string>('');
const router = useRouter();
const config = useRuntimeConfig();

const listCalendarEvents = async () => {
  const accessToken = sessionStorage.getItem('googleAccessToken');
  if (!accessToken) {
    console.error('No access token found');
    router.push('/');
    return;
  }

  try {
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${config.public.googleCalendarId}/events`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (response.status === 401) {
      sessionStorage.removeItem('googleAccessToken');
      router.push('/');
      return;
    }

    if (!response.ok) {
      throw new Error('Failed to fetch calendar events');
    }

    const data = await response.json();
    events.value = data.items;
    generateCalendarDays();
    createAccordionItems();
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
    router.push('/');
    return;
  }

  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (response.status === 401) {
      sessionStorage.removeItem('googleAccessToken');
      router.push('/');
      return;
    }

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    const data = await response.json();
    userEmail.value = data.email;
  } catch (error) {
    console.error('Error fetching user profile', error);
  }
};

const generateCalendarDays = () => {
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  calendarDays.value = Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(today.getFullYear(), today.getMonth(), i + 1).toISOString().split('T')[0];
    return { date, isBooked: false, isUserBooking: false, tooltipText: '' };
  });

  events.value.forEach(event => {
    const startDate = new Date(event.start.date);
    const endDate = new Date(event.end.date);
    for (let d = startDate; d < endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const day = calendarDays.value.find(day => day.date === dateStr);
      if (day) {
        day.isBooked = true;
        day.isUserBooking = event.creator.email === userEmail.value;
        day.tooltipText = `Booked by: ${event.creator.email}`;
      }
    }
  });
};

const createAccordionItems = () => {
  accordionItems.value = calendarDays.value.map((day) => ({
    label: formatDate(day.date),
    content: day.isBooked
      ? `<div>
           <p>${day.tooltipText}</p>
           <UIcon name="${day.isUserBooking ? 'i-heroicons-user-circle' : 'i-heroicons-x-circle'}" dynamic class="${day.isUserBooking ? 'icon-user-booked' : 'icon-booked'}" />
         </div>`
      : '<UIcon name="i-heroicons-check-circle" dynamic class="icon-available" />',
    icon: day.isBooked
      ? (day.isUserBooking ? 'i-heroicons-user-circle' : 'i-heroicons-x-circle')
      : 'i-heroicons-check-circle',
    slot: 'item'
  }));
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return format(date, 'EEE, MMM d');
};

onMounted(async () => {
  await fetchUserProfile();
  await listCalendarEvents();
});
</script>

<style>
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
