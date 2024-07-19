<template>
    <div>
        <p>Booked by: {{ email }}</p>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{ email: string }>();
</script>