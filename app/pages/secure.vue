<template>
  <UContainer>
    <UCard class="mt-10">
      <UAccordion :items="accordionItems" multiple size="lg">
        <template #item="{ item }">
          <component :is="item.component" :date="item.date" :email="item.email" :event="item.event" @dayBooked="handleDayBooked" />
        </template>
      </UAccordion>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
import { ref, onMounted, shallowRef, markRaw } from 'vue';
import { useRuntimeConfig } from '#app';
import { useRouter } from 'vue-router';
import { isBefore, isToday, isFuture } from 'date-fns';
import BookedByUserCell from '~/components/BookedByUserCell.vue';
import BookedByOthersCell from '~/components/BookedByOthersCell.vue';
import AvailableCell from '~/components/AvailableCell.vue';
import FutureBookingCell from '~/components/FutureBookingCell.vue';

interface CalendarEvent {
  start: { date: string };
  end: { date: string };
  creator: { email: string };
  id: string;
  description: string;
}

interface CalendarDay {
  date: string;
  isBooked: boolean;
  isUserBooking: boolean;
  email?: string;
  tooltipText: string;
  event?: CalendarEvent; // Add event property to store event data
}

const loading = ref(true);
const events = ref<CalendarEvent[]>([]);
const calendarDays = ref<CalendarDay[]>([]);
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

    // Adjust for single-day events that end on the same day they start
    if (startDate.getTime() === endDate.getTime()) {
      endDate.setDate(endDate.getDate() + 1);
    }

    // Ensure the event spans the correct date range, adding one day
    for (let d = new Date(startDate); d < endDate; d.setDate(d.getDate() + 1)) {
      const adjustedDate = new Date(d);
      adjustedDate.setDate(adjustedDate.getDate() + 1); // Adding one day
      const dayIndex = adjustedDate.getDate() - 1;
      if (calendarDays.value[dayIndex]) {
        calendarDays.value[dayIndex].isBooked = true;
        calendarDays.value[dayIndex].isUserBooking = event.creator.email === userEmail.value;
        calendarDays.value[dayIndex].email = event.creator.email;
        calendarDays.value[dayIndex].tooltipText = `Booked by: ${event.creator.email}`;
        calendarDays.value[dayIndex].event = event; // Store the event object
      }
    }
  });

  createAccordionItems();
};

const accordionItems = shallowRef([]);

const createAccordionItems = () => {
  accordionItems.value = calendarDays.value.map(day => {
    const dayDate = new Date(day.date + 'T00:00:00');
    const isFutureDate = isFuture(dayDate);

    let component;
    let icon;
    let iconClass;
    let color;

    if (day.isBooked) {
      if (day.isUserBooking) {
        if (isFutureDate) {
          component = markRaw(FutureBookingCell);
        } else {
          component = markRaw(BookedByUserCell);
        }
        icon = 'i-heroicons-user-circle';
        iconClass = 'text-blue-600';
        color = 'blue';
      } else {
        component = markRaw(BookedByOthersCell);
        icon = 'i-heroicons-x-circle';
        iconClass = 'text-red-600';
        color = 'red';
      }
    } else {
      component = markRaw(AvailableCell);
      icon = 'i-heroicons-check-circle';
      iconClass = 'text-green-600';
      color = 'green';
    }

    return {
      label: formatDate(day.date),
      date: day.date,
      email: day.isBooked && !day.isUserBooking ? day.email : undefined,
      event: day.event, // Pass the event object to the component
      component,
      icon,
      iconClass,
      color,
      variant: isPastDay(day.date) ? 'ghost' : 'solid',
      disabled: isPastDay(day.date) && !day.isBooked,
    };
  });
};

const isPastDay = (date: string) => {
  const today = new Date().toISOString().split('T')[0];
  return date < today;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString + 'T00:00:00');
  return date.toDateString();
};

const handleDayBooked = (bookedDate: string) => {
  const day = calendarDays.value.find(day => day.date === bookedDate);
  if (day) {
    day.isBooked = true;
    day.isUserBooking = true;
    day.tooltipText = `Booked by: ${userEmail.value}`;
    createAccordionItems();  // Ensure the accordion items are updated
  }
};

onMounted(async () => {
  await fetchUserProfile();
  await listCalendarEvents();
});
</script>
