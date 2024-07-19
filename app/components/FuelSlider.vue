<template>
    <div class="fuel-slider">
        <input type="range" :min="0" :max="fuelLevels.length - 1" v-model="sliderValue" @input="updateFuel"
            class="w-full" />
        <div class="fuel-label">{{ fuelLabel }}</div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const props = defineProps<{ modelValue: number }>();
const emits = defineEmits(['update:modelValue']);

const fuelLevels = [
    { fraction: 'empty', decimal: 0 },
    { fraction: '1/8', decimal: 0.125 },
    { fraction: '3/16', decimal: 0.1875 },
    { fraction: '1/4', decimal: 0.25 },
    { fraction: '3/8', decimal: 0.375 },
    { fraction: '1/2', decimal: 0.5 },
    { fraction: '5/8', decimal: 0.625 },
    { fraction: '3/4', decimal: 0.75 },
    { fraction: '7/8', decimal: 0.875 },
    { fraction: 'full', decimal: 1 },
];

const sliderValue = ref(fuelLevels.findIndex(level => level.decimal === props.modelValue));

const updateFuel = () => {
    emits('update:modelValue', fuelLevels[sliderValue.value].decimal);
};

const fuelLabel = computed(() => fuelLevels[sliderValue.value].fraction);

watch(
    () => props.modelValue,
    newVal => {
        sliderValue.value = fuelLevels.findIndex(level => level.decimal === newVal);
    },
);
</script>

<style scoped>
.fuel-slider {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.fuel-label {
    margin-top: 0.5rem;
    font-weight: bold;
}
</style>