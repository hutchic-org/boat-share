<template>
    <UForm :state="logbookEntry" class="logbook-form">
        <h3 class="text-lg font-bold mb-2">Log Entry for {{ formatDate(date) }}</h3>
        <UFormGroup>
            <label :for="`start-fuel-${date}`" class="block">Starting Fuel:</label>
            <UInput type="number" :id="`start-fuel-${date}`" v-model="logbookEntry.startFuel" />
        </UFormGroup>
        <UFormGroup>
            <label :for="`end-fuel-${date}`" class="block">Ending Fuel:</label>
            <UInput type="number" :id="`end-fuel-${date}`" v-model="logbookEntry.endFuel" />
        </UFormGroup>
        <UFormGroup>
            <label :for="`start-engine-hours-${date}`" class="block">Starting Engine Hours:</label>
            <UInput type="number" :id="`start-engine-hours-${date}`" v-model="logbookEntry.startEngineHours" />
        </UFormGroup>
        <UFormGroup>
            <label :for="`end-engine-hours-${date}`" class="block">Ending Engine Hours:</label>
            <UInput type="number" :id="`end-engine-hours-${date}`" v-model="logbookEntry.endEngineHours" />
        </UFormGroup>
        <UFormGroup>
            <label :for="`add-fuel-${date}`" class="block">Did you add fuel?</label>
            <USelect :id="`add-fuel-${date}`" v-model="logbookEntry.addFuel">
                <option value="yes">Yes</option>
                <option value="no">No</option>
            </USelect>
        </UFormGroup>
        <UFormGroup>
            <label :for="`comments-${date}`" class="block">Comments:</label>
            <UTextarea :id="`comments-${date}`" v-model="logbookEntry.comments" />
        </UFormGroup>
    </UForm>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { format } from 'date-fns';

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

const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return format(date, 'PPP');
};
</script>

<style scoped>
.logbook-form {
    padding: 1rem;
}
</style>
