<!-- ========================================
// FILE: components/ErrorMessage.vue
======================================== -->
<script setup lang="ts">
defineProps<{
  message: string
}>()
</script>

<template>
  <p style="color: red;">
    {{ message }}
  </p>
</template>

<!-- ========================================
// END FILE: components/ErrorMessage.vue
======================================== -->