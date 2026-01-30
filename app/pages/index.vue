<!-- ========================================
// FILE: pages/index.vue
======================================== -->
<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useProcoreContext } from '~/scripts/useProcoreContext'
import { useBackendAuth } from '~/scripts/useBackendAuth'

const { procoreContext, initializeProcoreListener } = useProcoreContext()
const { backendStatus, error, fetchBackendStatus } = useBackendAuth()

const isLoadedInProcore = computed(() => {
  return procoreContext.value && 
         document.referrer
})

onMounted(() => {
  console.log('--- Signiflow app mounted ---')
  try {
    console.log('window.parent.location:', window.parent.location.href)
  } catch {
    console.log('window.parent.location: [blocked by browser]')
  }

  fetchBackendStatus()
  initializeProcoreListener()
})
</script>

<template>
  <main style="padding: 1rem; font-family: system-ui;">
    <UserView 
      v-if="isLoadedInProcore" 
      :procore-context="procoreContext"
      :backend-status="backendStatus"
      :error="error"
    />
    
    <AdminView 
      v-else
      :backend-status="backendStatus"
      :error="error"
    />
  </main>
</template>

<!-- ========================================
// END FILE: pages/index.vue
======================================== -->