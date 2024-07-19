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
                        <UInput type="number" :id="`start-engine-hours-${date}`" v-model="logbookEntry.startEngineHours"
                            :min="0" />
                    </div>
                    <div>
                        <label :for="`end-engine-hours-${date}`" class="block mb-2">Ending Engine Hours:</label>
                        <UInput type="number" :id="`end-engine-hours-${date}`" v-model="logbookEntry.endEngineHours"
                            :min="0" />
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
            <UButton type="submit" label="Save Logbook" icon="i-heroicons-save" color="primary" variant="solid"
                size="lg" block />
        </UForm>
    </UCard>
</template>

<script setup lang="ts">
import { ref } from 'vue';
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

const props = defineProps<{ date: string }>();

const logbookEntry = ref<LogBookEntry>({
    date: props.date,
    startFuel: 0,
    endFuel: 0,
    startEngineHours: 0,
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

const saveLogbook = () => {
    console.log('Logbook entry saved:', logbookEntry.value);
    // Logic to save the logbook entry can be added here
};
</script>
