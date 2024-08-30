<template>
    <UCard>
        <UForm :state="logbookEntry" :disabled="loading" class="logbook-form" @submit="saveLogbook">
            <h3 class="text-lg font-bold mb-4">Log Entry for {{ formatDate(date) }}</h3>
            <UFormGroup class="mb-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label :for="`start-fuel-${date}`" class="block mb-2">Starting Fuel:</label>
                        <FuelSlider v-model="logbookEntry.startFuel" :disabled="loading" />
                    </div>
                    <div>
                        <label :for="`end-fuel-${date}`" class="block mb-2">Ending Fuel:</label>
                        <FuelSlider v-model="logbookEntry.endFuel" :disabled="loading" />
                    </div>
                </div>
            </UFormGroup>
            <UFormGroup class="mb-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label :for="`start-engine-hours-${date}`" class="block mb-2">Starting Engine Hours:</label>
                        <UInput type="number" :id="`start-engine-hours-${date}`" v-model.number="logbookEntry.startEngineHours" :min="0" step="0.1" :disabled="loading" />
                    </div>
                    <div>
                        <label :for="`end-engine-hours-${date}`" class="block mb-2">Ending Engine Hours:</label>
                        <UInput type="number" :id="`end-engine-hours-${date}`" v-model.number="logbookEntry.endEngineHours" :min="0" step="0.1" :disabled="loading" />
                    </div>
                </div>
            </UFormGroup>
            <UFormGroup class="mb-4">
                <URadioGroup v-model="logbookEntry.addFuel" :options="fuelOptions" legend="Did you add fuel?" :disabled="loading" />
            </UFormGroup>
            <UFormGroup v-if="logbookEntry.addFuel === 'yes'" class="mb-4">
                <label :for="`fuel-amount-${date}`" class="block mb-2">Total Money Spent on Fuel:</label>
                <UInput type="number" :id="`fuel-amount-${date}`" v-model.number="logbookEntry.fuelAmount" :min="0" step="0.01" placeholder="Enter amount in dollars" :disabled="loading" />
            </UFormGroup>
            <UFormGroup class="mb-4">
                <label :for="`comments-${date}`" class="block mb-2">Comments:</label>
                <UTextarea :id="`comments-${date}`" v-model="logbookEntry.comments" :disabled="loading" />
            </UFormGroup>
            <UButton type="submit" :label="buttonLabel" :disabled="loading" icon="i-heroicons-save" color="primary" variant="solid" size="lg" block />
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
    fuelAmount?: number;  // Add fuelAmount property
    comments: string;
}

const props = defineProps<{ date: string, event: any, lastLogEntry: LogBookEntry | null }>();
const emit = defineEmits(['logbookSaved']);
const loading = ref(false);
const buttonLabel = ref('Save Logbook');

const logbookEntry = ref<LogBookEntry>({
    date: props.date,
    startFuel: props.lastLogEntry ? props.lastLogEntry.endFuel : 0,
    endFuel: 0,
    startEngineHours: props.lastLogEntry ? props.lastLogEntry.endEngineHours : 0,
    endEngineHours: 0,
    addFuel: '',
    fuelAmount: undefined,  // Initialize fuelAmount
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

const isJSON = (str: string) => {
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
    logbookEntry.value.fuelAmount = undefined;  // Initialize fuelAmount
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
            if (logData.fuelAmount !== undefined) {
                logbookEntry.value.fuelAmount = logData.fuelAmount;  // Set fuelAmount value
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
    loading.value = true;
    buttonLabel.value = 'Saving...';

    const logData = {
        startFuel: logbookEntry.value.startFuel,
        endFuel: logbookEntry.value.endFuel,
        startEngineHours: logbookEntry.value.startEngineHours,
        endEngineHours: logbookEntry.value.endEngineHours,
        addFuel: logbookEntry.value.addFuel,
        fuelAmount: logbookEntry.value.fuelAmount,  // Include fuelAmount in saved data
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

        buttonLabel.value = 'Logbook Saved';
        emit('logbookSaved', props.date);
        console.log('Logbook entry saved:', logbookEntry.value);
    } catch (error) {
        buttonLabel.value = 'Error Saving Logbook';
        console.error('Error saving logbook entry', error);
    } finally {
        setTimeout(() => {
            buttonLabel.value = 'Save Logbook';
            loading.value = false;
        }, 2000); // Add a slight delay before enabling the form again
    }
};

onMounted(loadLogbookEntry);
</script>
