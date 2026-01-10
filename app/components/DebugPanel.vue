<!-- ========================================
// FILE: components/DebugPanel.vue
======================================== -->
<script setup lang="ts">
import type { BackendStatus } from '~/scripts/useBackendAuth';

const props = defineProps<{
  enabled: boolean
  backendStatus: BackendStatus | null
  procoreContext: any
  error: string | null
}>()

const emit = defineEmits<{
  'update:enabled': [value: boolean]
}>()

const enabledModel = computed({
  get: () => props.enabled,
  set: (value) => emit('update:enabled', value)
})
</script>

<template>
  <section style="margin-top: 2rem;">
    <label>
      <input type="checkbox" v-model="enabledModel" />
      Show debug info
    </label>
  </section>

  <section v-if="enabled" style="margin-top: 1rem;">
    <h3>Backend Auth Status</h3>
    <pre v-if="backendStatus">{{ backendStatus }}</pre>
    <pre v-else>{{ error }}</pre>
    
    <h3>Procore Context</h3>
    <pre v-if="procoreContext">{{ procoreContext }}</pre>
    <pre v-else>No Procore context received yet.</pre>
  </section>
</template>

<!-- ========================================
// END FILE: components/DebugPanel.vue
======================================== -->