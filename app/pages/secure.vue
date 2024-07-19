<template>
  <UContainer>
    <UCard class="mt-10">
      <div v-if="loading">
        <p>Loading calendar events...</p>
      </div>
      <div v-else>
        <UAccordion :items="accordionItems" multiple size="lg">
          <template #item="{ item }">
            <div v-if="item.isBookedByUser">
              <BookedByUserCell :date="item.date" />
            </div>
            <div v-else-if="item.isBookedByOthers">
              <BookedByOthersCell :email="item.email" />
            </div>
            <div v-else>
              <AvailableCell />
            </div>
          </template>
        </UAccordion>
      </div>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRuntimeConfig } from '#app';
import { useRouter } from 'vue-router';
import { format, isBefore, isToday } from 'date-fns';

import BookedByOthersCell from '~/components/BookedByOthersCell.vue';
import BookedByUserCell from '~/components/BookedByUserCell.vue';
import AvailableCell from '~/components/AvailableCell.vue';

interface CalendarEvent {
  start: { date: string };
  end: { date: string };
  creator: { email: string };
}

interface CalendarDay {
  date: string;
  isBooked: boolean;
  isUserBooking: boolean;
  email: string;
}

interface AccordionItem {
  label: string;
  icon: string;
  iconClass: string;
  color: string;
  variant: string;
  disabled: boolean;
  isBookedByUser: boolean;
  isBookedByOthers: boolean;
  email?: string;
  date: string;
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
    return { date, isBooked: false, isUserBooking: false, email: '' };
  });

  events.value.forEach(event => {
    const startDate = new Date(event.start.date + 'T00:00:00'); // Ensure time part is set to avoid timezone issues
    const endDate = new Date(event.end.date + 'T00:00:00');
    for (let d = startDate; d < endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const day = calendarDays.value.find(day => day.date === dateStr);
      if (day) {
        day.isBooked = true;
        day.isUserBooking = event.creator.email === userEmail.value;
        day.email = event.creator.email;
      }
    }
  });
};

const createAccordionItems = () => {
  const today = new Date();
  accordionItems.value = calendarDays.value.map(day => {
    const dayDate = new Date(day.date + 'T00:00:00');
    const isPast = isBefore(dayDate, today) && !isToday(dayDate);
    const color = isPast ? 'gray' : day.isBooked ? (day.isUserBooking ? 'blue' : 'red') : 'green';
    const variant = isPast ? 'ghost' : 'solid';
    const disabled = isPast && !day.isBooked;

    return {
      label: formatDate(day.date),
      icon: day.isBooked ? (day.isUserBooking ? 'i-heroicons-user-circle' : 'i-heroicons-x-circle') : 'i-heroicons-check-circle',
      iconClass: day.isBooked ? (day.isUserBooking ? 'text-blue-600' : 'text-red-600') : 'text-green-600',
      color,
      variant,
      disabled,
      isBookedByUser: day.isBooked && day.isUserBooking,
      isBookedByOthers: day.isBooked && !day.isUserBooking,
      email: day.email,
      date: day.date
    };
  });
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString + 'T00:00:00');
  return format(date, 'EEE, MMM d');
};

onMounted(async () => {
  await fetchUserProfile();
  await listCalendarEvents();
});
</script>

<style>
.text-blue-600 {
  color: #2563EB;
}

.text-red-600 {
  color: #DC2626;
}

.text-green-600 {
  color: #16A34A;
}
</style>
