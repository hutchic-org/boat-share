<template>
  <UContainer>
    <UCard class="mt-10">
      <UAccordion :items="accordionItems" multiple size="lg">
        <template #item="{ item }">
          <component :is="item.component" :date="item.date" :email="item.email" :event="item.event" :lastLogEntry="lastLogEntry" @dayBooked="handleDayBooked" @bookingDeleted="handleBookingDeleted" />
        </template>
      </UAccordion>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
import { isFuture, addMonths, startOfMonth, endOfMonth, format } from 'date-fns';
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

interface LogBookEntry {
  date: string;
  startFuel: number;
  endFuel: number;
  startEngineHours: number;
  endEngineHours: number;
  addFuel: string;
  comments: string;
}

const loading = ref(true);
const events = ref<CalendarEvent[]>([]);
const calendarDays = ref<CalendarDay[]>([]);
const userEmail = ref<string>('');
const lastLogEntry = ref<LogBookEntry | null>(null); // Store the last log entry
const router = useRouter();
const config = useRuntimeConfig();

const listCalendarEvents = async () => {
  const accessToken = sessionStorage.getItem('googleAccessToken');
  if (!accessToken) {
    console.error('No access token found');
    router.push('/');
    return;
  }

  const today = new Date();
  const startOfPrevMonth = startOfMonth(addMonths(today, -1));
  const endOfNextMonth = endOfMonth(addMonths(today, 1));

  const timeMin = format(startOfPrevMonth, "yyyy-MM-dd'T'00:00:00'Z'");
  const timeMax = format(endOfNextMonth, "yyyy-MM-dd'T'23:59:59'Z'");

  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${config.public.googleCalendarId}/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

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
  const startOfPrevMonth = startOfMonth(addMonths(new Date(), -1));
  const endOfNextMonth = endOfMonth(addMonths(new Date(), 1));
  
  calendarDays.value = [];
  
  for (let d = new Date(startOfPrevMonth); d <= endOfNextMonth; d.setDate(d.getDate() + 1)) {
    const date = new Date(d).toISOString().split('T')[0];
    calendarDays.value.push({ date, isBooked: false, isUserBooking: false, tooltipText: '' });
  }

  events.value.forEach((event: { start: { date: string | number | Date; }; end: { date: string | number | Date; }; creator: { email: any; }; }) => {
    const startDate = new Date(event.start.date);
    const endDate = new Date(event.end.date);
    if (startDate.getTime() === endDate.getTime()) {
      endDate.setDate(endDate.getDate() + 1);
    }

    for (let d = new Date(startDate); d < endDate; d.setDate(d.getDate() + 1)) {
      const adjustedDate = new Date(d).toISOString().split('T')[0];
      const day = calendarDays.value.find((day: { date: string; }) => day.date === adjustedDate);
      if (day) {
        day.isBooked = true;
        day.isUserBooking = event.creator.email === userEmail.value;
        day.email = event.creator.email;
        day.tooltipText = `Booked by: ${event.creator.email}`;
        day.event = event;
      }
    }
  });

  createAccordionItems();
};

const accordionItems = shallowRef([]);

const createAccordionItems = () => {
  accordionItems.value = calendarDays.value.map((day: { date: string; isBooked: any; isUserBooking: any; email: any; event: any; }) => {
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
      lastLogEntry: lastLogEntry.value, // Pass the last log entry to the component
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
  const day = calendarDays.value.find((day: { date: string; }) => day.date === bookedDate);
  if (day) {
    day.isBooked = true;
    day.isUserBooking = true;
    day.tooltipText = `Booked by: ${userEmail.value}`;
    createAccordionItems();  // Ensure the accordion items are updated
  }
};

const handleBookingDeleted = (deletedDate: string) => {
  const day = calendarDays.value.find((day: { date: string; }) => day.date === deletedDate);
  if (day) {
    day.isBooked = false;
    day.isUserBooking = false;
    day.tooltipText = '';
    day.event = undefined; // Clear the event object
    createAccordionItems();  // Ensure the accordion items are updated
  }
};

const isJSON = (str: string) => {
  try {
    JSON.parse(str);
    return true;
  } catch (error) {
    return false;
  }
};

onMounted(async () => {
  await fetchUserProfile();
  await listCalendarEvents();
});
</script>
