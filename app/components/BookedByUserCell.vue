<template>
    <UCard>
        <UForm :state="logbookEntry" class="logbook-form" @submit="saveLogbook">
            <h3 class="text-lg font-bold mb-4">Log Entry for {{ formatDate(date) }}</h3>
            <UFormGroup class="mb-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label :for="`start-fuel-${date}`" class="block mb-2">Starting Fuel:</label>
                        <FuelSlider v-model="logbookEntry.startFuel" />
                    </div>
                    <div>
                        <label :for="`end-fuel-${date}`" class="block mb-2">Ending Fuel:</label>
                        <FuelSlider v-model="logbookEntry.endFuel" />
                    </div>
                </div>
            </UFormGroup>
            <UFormGroup class="mb-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label :for="`start-engine-hours-${date}`" class="block mb-2">Starting Engine Hours:</label>
                        <UInput type="number" :id="`start-engine-hours-${date}`" v-model="logbookEntry.startEngineHours" :min="0" />
                    </div>
                    <div>
                        <label :for="`end-engine-hours-${date}`" class="block mb-2">Ending Engine Hours:</label>
                        <UInput type="number" :id="`end-engine-hours-${date}`" v-model="logbookEntry.endEngineHours" :min="0" />
                    </div>
                </div>
            </UFormGroup>
            <UFormGroup class="mb-4">
                <URadioGroup v-model="logbookEntry.addFuel" :options="fuelOptions" legend="Did you add fuel?" />
            </UFormGroup>
            <UFormGroup class="mb-4">
                <label :for="`comments-${date}`" class="block mb-2">Comments:</label>
                <UTextarea :id="`comments-${date}`" v-model="logbookEntry.comments" />
            </UFormGroup>
            <UButton type="submit" label="Save Logbook" icon="i-heroicons-save" color="primary" variant="solid" size="lg" block />
        </UForm>
    </UCard>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { format } from 'date-fns';
import FuelSlider from './FuelSlider.vue'; // Importing the custom FuelSlider component

interface LogBookEntry {
    date: string;
    startFuel: number;
    endFuel: number;
    startEngineHours: number;
    endEngineHours: number;
    addFuel: string;
    comments: string;
}

const props = defineProps<{ date: string, event: any, lastLogEntry: LogBookEntry | null }>();
const emit = defineEmits(['logbookSaved']);

const logbookEntry = ref<LogBookEntry>({
    date: props.date,
    startFuel: props.lastLogEntry ? props.lastLogEntry.endFuel : 0,
    endFuel: 0,
    startEngineHours: props.lastLogEntry ? props.lastLogEntry.endEngineHours : 0,
    endEngineHours: 0,
    addFuel: '',
    comments: '',
});

const fuelOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
];

const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return format(date, 'PPP');
};

const isJSON = (str) => {
    try {
        JSON.parse(str);
        return true;
    } catch (error) {
        return false;
    }
};

const loadLogbookEntry = () => {
    // Initialize default values
    logbookEntry.value.startFuel = props.lastLogEntry ? props.lastLogEntry.endFuel : 0;
    logbookEntry.value.startEngineHours = props.lastLogEntry ? props.lastLogEntry.endEngineHours : 0;
    logbookEntry.value.endFuel = 0;
    logbookEntry.value.endEngineHours = 0;
    logbookEntry.value.addFuel = '';
    logbookEntry.value.comments = '';

    // Attempt to parse and override with event description
    if (props.event && props.event.description && isJSON(props.event.description)) {
        try {
            const logData = JSON.parse(props.event.description);

            if (isFinite(logData.startFuel) && logData.startFuel >= 0) {
                logbookEntry.value.startFuel = logData.startFuel;
            }
            if (isFinite(logData.endFuel) && logData.endFuel >= 0) {
                logbookEntry.value.endFuel = logData.endFuel;
            }
            if (isFinite(logData.startEngineHours) && logData.startEngineHours >= 0) {
                logbookEntry.value.startEngineHours = logData.startEngineHours;
            }
            if (isFinite(logData.endEngineHours) && logData.endEngineHours >= 0) {
                logbookEntry.value.endEngineHours = logData.endEngineHours;
            }
            if (typeof logData.addFuel === 'string') {
                logbookEntry.value.addFuel = logData.addFuel;
            }
            if (typeof logData.comments === 'string') {
                logbookEntry.value.comments = logData.comments;
            }
        } catch (error) {
            console.error('Error parsing logbook entry from event description:', error);
        }
    }
};

const saveLogbook = async () => {
    const logData = {
        startFuel: logbookEntry.value.startFuel,
        endFuel: logbookEntry.value.endFuel,
        startEngineHours: logbookEntry.value.startEngineHours,
        endEngineHours: logbookEntry.value.endEngineHours,
        addFuel: logbookEntry.value.addFuel,
        comments: logbookEntry.value.comments,
    };

    try {
        const accessToken = sessionStorage.getItem('googleAccessToken');
        const config = useRuntimeConfig();

        // Update the event with the logbook entry JSON in the description
        const updatedEvent = {
            ...props.event,
            description: JSON.stringify(logData),
        };

        const updateResponse = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${config.public.googleCalendarId}/events/${props.event.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(updatedEvent),
        });

        if (!updateResponse.ok) {
            throw new Error('Failed to update calendar event');
        }

        emit('logbookSaved', props.date);
        console.log('Logbook entry saved:', logbookEntry.value);
    } catch (error) {
        console.error('Error saving logbook entry', error);
    }
};

onMounted(loadLogbookEntry);
</script>
